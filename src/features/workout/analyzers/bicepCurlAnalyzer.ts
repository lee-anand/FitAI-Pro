import type { Landmark } from "../components/PoseCanvas";

export type ArmPreference = "auto" | "left" | "right";
export type TrackedArm = "left" | "right" | null;
export type BicepCurlPhase = "down" | "up" | "unknown";

type CandidatePhase = "down" | "up" | null;

export type BicepCurlState = {
  phase: BicepCurlPhase;
  reps: number;
  trackedArm: TrackedArm;
  lostFrames: number;

  smoothedAngle: number | null;

  candidatePhase: CandidatePhase;
  candidateFrames: number;

  /*
    True when the user reached the UP position
    with acceptable form.

    Only a valid UP → DOWN cycle counts a rep.
  */
  validCurl: boolean;
};

export type BicepCurlAnalysis = {
  angle: number | null;
  phase: BicepCurlPhase;
  reps: number;
  feedback: string;
  tracking: boolean;
  trackedArm: TrackedArm;

  formValid: boolean;
};

type ArmPoints = {
  shoulder: Landmark;
  elbow: Landmark;
  wrist: Landmark;
};

const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;

const LEFT_ELBOW = 13;
const RIGHT_ELBOW = 14;

const LEFT_WRIST = 15;
const RIGHT_WRIST = 16;

const LEFT_HIP = 23;
const RIGHT_HIP = 24;

/*
  Side-view tracking needs a lower visibility
  threshold than front-facing tracking.
*/

const MIN_VISIBILITY = 0.3;

/*
  Rep thresholds.

  Hysteresis prevents rapid phase switching.
*/

const DOWN_ANGLE = 145;
const UP_ANGLE = 65;

/*
  Number of consecutive frames required before
  accepting a phase transition.
*/

const REQUIRED_STABLE_FRAMES = 3;

/*
  Exponential smoothing.

  Higher value = responds faster.
  Lower value = smoother.
*/

const ANGLE_SMOOTHING_ALPHA = 0.35;

/*
  Auto mode keeps the selected arm locked during
  short landmark losses.
*/

const MAX_LOST_FRAMES = 20;

/*
  Upper-arm movement threshold.

  We calculate the angle:

  Hip → Shoulder → Elbow

  When the elbow moves too far forward/backward,
  this angle changes significantly.

  A normal stable upper arm is usually close to
  the torso direction.
*/

const MAX_UPPER_ARM_DEVIATION = 35;

function isUsable(
  landmark: Landmark | undefined
): landmark is Landmark {
  return Boolean(
    landmark &&
      Number.isFinite(landmark.x) &&
      Number.isFinite(landmark.y) &&
      (landmark.visibility ?? 1) >= MIN_VISIBILITY
  );
}

function getArmPoints(
  landmarks: Landmark[],
  side: "left" | "right"
): ArmPoints | null {
  const shoulder =
    landmarks[
      side === "left"
        ? LEFT_SHOULDER
        : RIGHT_SHOULDER
    ];

  const elbow =
    landmarks[
      side === "left"
        ? LEFT_ELBOW
        : RIGHT_ELBOW
    ];

  const wrist =
    landmarks[
      side === "left"
        ? LEFT_WRIST
        : RIGHT_WRIST
    ];

  if (
    !isUsable(shoulder) ||
    !isUsable(elbow) ||
    !isUsable(wrist)
  ) {
    return null;
  }

  return {
    shoulder,
    elbow,
    wrist,
  };
}

function getHip(
  landmarks: Landmark[],
  side: "left" | "right"
): Landmark | null {
  const hip =
    landmarks[
      side === "left"
        ? LEFT_HIP
        : RIGHT_HIP
    ];

  return isUsable(hip)
    ? hip
    : null;
}

function getArmScore(
  arm: ArmPoints
): number {
  return (
    (arm.shoulder.visibility ?? 1) +
    (arm.elbow.visibility ?? 1) +
    (arm.wrist.visibility ?? 1)
  ) / 3;
}

function chooseBestArm(
  landmarks: Landmark[]
): TrackedArm {
  const left =
    getArmPoints(landmarks, "left");

  const right =
    getArmPoints(landmarks, "right");

  if (!left && !right) {
    return null;
  }

  if (left && !right) {
    return "left";
  }

  if (right && !left) {
    return "right";
  }

  return getArmScore(left!) >=
    getArmScore(right!)
    ? "left"
    : "right";
}

/*
  Calculate angle ABC.

  B is the middle joint.
*/

function calculateAngle(
  a: Landmark,
  b: Landmark,
  c: Landmark
): number {
  const radians =
    Math.atan2(
      c.y - b.y,
      c.x - b.x
    ) -
    Math.atan2(
      a.y - b.y,
      a.x - b.x
    );

  let angle =
    Math.abs(
      (radians * 180) /
        Math.PI
    );

  if (angle > 180) {
    angle = 360 - angle;
  }

  return angle;
}

function smoothAngle(
  currentAngle: number,
  previousAngle: number | null
): number {
  if (previousAngle === null) {
    return currentAngle;
  }

  return (
    ANGLE_SMOOTHING_ALPHA *
      currentAngle +
    (1 - ANGLE_SMOOTHING_ALPHA) *
      previousAngle
  );
}

/*
  Checks whether the upper arm stays
  reasonably close to the torso.

  Hip → Shoulder → Elbow.

  If the hip is temporarily unavailable,
  we do not reject the repetition.
*/

function checkUpperArmForm(
  landmarks: Landmark[],
  side: "left" | "right",
  arm: ArmPoints
): boolean {
  const hip =
    getHip(landmarks, side);

  if (!hip) {
    return true;
  }

  const upperArmAngle =
    calculateAngle(
      hip,
      arm.shoulder,
      arm.elbow
    );

  return (
    upperArmAngle <=
    MAX_UPPER_ARM_DEVIATION
  );
}

export function createInitialBicepCurlState(
  preference: ArmPreference = "auto"
): BicepCurlState {
  return {
    phase: "unknown",

    reps: 0,

    trackedArm:
      preference === "auto"
        ? null
        : preference,

    lostFrames: 0,

    smoothedAngle: null,

    candidatePhase: null,

    candidateFrames: 0,

    validCurl: false,
  };
}

export function analyzeBicepCurl(
  landmarks: Landmark[] | null,
  previousState: BicepCurlState,
  preference: ArmPreference
): {
  state: BicepCurlState;
  analysis: BicepCurlAnalysis;
} {
  /*
    LANDMARKS LOST
  */

  if (!landmarks) {
    const lostFrames =
      previousState.lostFrames + 1;

    const shouldUnlock =
      preference === "auto" &&
      lostFrames >= MAX_LOST_FRAMES;

    const trackedArm =
      shouldUnlock
        ? null
        : previousState.trackedArm;

    return {
      state: {
        ...previousState,

        trackedArm,

        lostFrames,

        candidatePhase: null,

        candidateFrames: 0,
      },

      analysis: {
        angle:
          previousState.smoothedAngle === null
            ? null
            : Math.round(
                previousState.smoothedAngle
              ),

        phase:
          previousState.phase,

        reps:
          previousState.reps,

        feedback: shouldUnlock
          ? "Arm lost. Show one complete arm to the camera."
          : "Keep your shoulder, elbow, and wrist visible.",

        tracking: false,

        trackedArm,

        formValid: false,
      },
    };
  }

  /*
    DETERMINE TRACKED ARM
  */

  let trackedArm =
    previousState.trackedArm;

  if (preference !== "auto") {
    trackedArm = preference;
  } else if (!trackedArm) {
    trackedArm =
      chooseBestArm(landmarks);
  }

  if (!trackedArm) {
    return {
      state: {
        ...previousState,

        trackedArm: null,

        lostFrames:
          previousState.lostFrames + 1,

        candidatePhase: null,

        candidateFrames: 0,
      },

      analysis: {
        angle: null,

        phase:
          previousState.phase,

        reps:
          previousState.reps,

        feedback:
          "Show one complete arm clearly to the camera.",

        tracking: false,

        trackedArm: null,

        formValid: false,
      },
    };
  }

  const arm =
    getArmPoints(
      landmarks,
      trackedArm
    );

  /*
    SELECTED ARM TEMPORARILY LOST
  */

  if (!arm) {
    const lostFrames =
      previousState.lostFrames + 1;

    const shouldUnlock =
      preference === "auto" &&
      lostFrames >= MAX_LOST_FRAMES;

    const nextTrackedArm =
      shouldUnlock
        ? null
        : trackedArm;

    return {
      state: {
        ...previousState,

        trackedArm:
          nextTrackedArm,

        lostFrames,

        candidatePhase: null,

        candidateFrames: 0,
      },

      analysis: {
        angle:
          previousState.smoothedAngle === null
            ? null
            : Math.round(
                previousState.smoothedAngle
              ),

        phase:
          previousState.phase,

        reps:
          previousState.reps,

        feedback: shouldUnlock
          ? "Arm lost. Show one complete arm to the camera."
          : `Keep your ${trackedArm} arm visible.`,

        tracking: false,

        trackedArm:
          nextTrackedArm,

        formValid: false,
      },
    };
  }

  /*
    CALCULATE AND SMOOTH ELBOW ANGLE
  */

  const rawAngle =
    calculateAngle(
      arm.shoulder,
      arm.elbow,
      arm.wrist
    );

  const smoothedAngle =
    smoothAngle(
      rawAngle,
      previousState.smoothedAngle
    );

  /*
    FORM VALIDATION
  */

  const formValid =
    checkUpperArmForm(
      landmarks,
      trackedArm,
      arm
    );

  let phase =
    previousState.phase;

  let reps =
    previousState.reps;

  let candidatePhase =
    previousState.candidatePhase;

  let candidateFrames =
    previousState.candidateFrames;

  let validCurl =
    previousState.validCurl;

  let feedback =
    "Move slowly and keep your elbow stable.";

  /*
    INITIAL POSITION
  */

  if (phase === "unknown") {
    validCurl = false;

    if (
      smoothedAngle >= DOWN_ANGLE
    ) {
      if (
        candidatePhase === "down"
      ) {
        candidateFrames += 1;
      } else {
        candidatePhase = "down";
        candidateFrames = 1;
      }

      feedback =
        "Hold your arm straight for a moment.";

      if (
        candidateFrames >=
        REQUIRED_STABLE_FRAMES
      ) {
        phase = "down";

        candidatePhase = null;

        candidateFrames = 0;

        feedback =
          "Ready. Curl your forearm upward.";
      }
    } else {
      candidatePhase = null;

      candidateFrames = 0;

      feedback =
        "Straighten your arm to begin.";
    }
  }

  /*
    DOWN POSITION
  */

  else if (phase === "down") {
    if (!formValid) {
      candidatePhase = null;

      candidateFrames = 0;

      validCurl = false;

      feedback =
        "Keep your elbow close to your body. Avoid swinging your upper arm.";
    }

    else if (
      smoothedAngle <= UP_ANGLE
    ) {
      if (
        candidatePhase === "up"
      ) {
        candidateFrames += 1;
      } else {
        candidatePhase = "up";

        candidateFrames = 1;
      }

      feedback =
        "Hold the curl briefly.";

      if (
        candidateFrames >=
        REQUIRED_STABLE_FRAMES
      ) {
        phase = "up";

        candidatePhase = null;

        candidateFrames = 0;

        validCurl = true;

        feedback =
          "Good curl. Lower your arm slowly.";
      }
    }

    else {
      candidatePhase = null;

      candidateFrames = 0;

      if (
        smoothedAngle <= 100
      ) {
        feedback =
          "Almost there. Curl a little higher.";
      } else {
        feedback =
          "Curl your forearm upward.";
      }
    }
  }

  /*
    UP POSITION
  */

  else if (phase === "up") {
    if (!formValid) {
      candidatePhase = null;

      candidateFrames = 0;

      validCurl = false;

      feedback =
        "Keep your elbow stable while lowering.";
    }

    else if (
      smoothedAngle >= DOWN_ANGLE
    ) {
      if (
        candidatePhase === "down"
      ) {
        candidateFrames += 1;
      } else {
        candidatePhase = "down";

        candidateFrames = 1;
      }

      feedback =
        "Fully extend and hold briefly.";

      if (
        candidateFrames >=
        REQUIRED_STABLE_FRAMES
      ) {
        phase = "down";

        candidatePhase = null;

        candidateFrames = 0;

        if (validCurl) {
          reps += 1;

          feedback =
            "Clean rep completed. Curl again.";
        } else {
          feedback =
            "Rep not counted. Keep your elbow stable.";
        }

        validCurl = false;
      }
    }

    else {
      candidatePhase = null;

      candidateFrames = 0;

      feedback =
        smoothedAngle >= 105
          ? "Almost extended. Keep lowering."
          : "Lower your arm slowly.";
    }
  }

  const state: BicepCurlState = {
    phase,

    reps,

    trackedArm,

    lostFrames: 0,

    smoothedAngle,

    candidatePhase,

    candidateFrames,

    validCurl,
  };

  return {
    state,

    analysis: {
      angle:
        Math.round(smoothedAngle),

      phase,

      reps,

      feedback,

      tracking: true,

      trackedArm,

      formValid,
    },
  };
}