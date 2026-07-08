import type { Landmark } from "../components/PoseCanvas";

export type SquatPhase = "standing" | "squat" | "unknown";
export type LegPreference = "auto" | "left" | "right";
export type TrackedLeg = "left" | "right" | null;

type CandidatePhase = "standing" | "squat" | null;

export type SquatState = {
  phase: SquatPhase;
  reps: number;
  trackedLeg: TrackedLeg;
  lostFrames: number;

  smoothedAngle: number | null;

  candidatePhase: CandidatePhase;
  candidateFrames: number;

  validSquat: boolean;
};

export type SquatAnalysis = {
  angle: number | null;
  phase: SquatPhase;
  reps: number;

  feedback: string;
  tracking: boolean;

  trackedLeg: TrackedLeg;

  formValid: boolean;
};

type LegPoints = {
  hip: Landmark;
  knee: Landmark;
  ankle: Landmark;
};

const LEFT_HIP = 23;
const RIGHT_HIP = 24;

const LEFT_KNEE = 25;
const RIGHT_KNEE = 26;

const LEFT_ANKLE = 27;
const RIGHT_ANKLE = 28;

const MIN_VISIBILITY = 0.35;

/*
  Knee-angle thresholds.

  Standing:
  Knee nearly extended.

  Squat:
  Knee sufficiently bent.
*/

const STANDING_ANGLE = 160;
const SQUAT_ANGLE = 100;

/*
  Stable frames prevent jitter from
  creating false repetitions.
*/

const REQUIRED_STABLE_FRAMES = 4;

/*
  Angle smoothing.
*/

const ANGLE_SMOOTHING_ALPHA = 0.35;

/*
  Keep selected leg locked through
  temporary tracking loss.
*/

const MAX_LOST_FRAMES = 20;

function isUsable(
  landmark: Landmark | undefined
): landmark is Landmark {
  return Boolean(
    landmark &&
      Number.isFinite(landmark.x) &&
      Number.isFinite(landmark.y) &&
      (landmark.visibility ?? 1) >=
        MIN_VISIBILITY
  );
}

function getLegPoints(
  landmarks: Landmark[],
  side: "left" | "right"
): LegPoints | null {
  const hip =
    landmarks[
      side === "left"
        ? LEFT_HIP
        : RIGHT_HIP
    ];

  const knee =
    landmarks[
      side === "left"
        ? LEFT_KNEE
        : RIGHT_KNEE
    ];

  const ankle =
    landmarks[
      side === "left"
        ? LEFT_ANKLE
        : RIGHT_ANKLE
    ];

  if (
    !isUsable(hip) ||
    !isUsable(knee) ||
    !isUsable(ankle)
  ) {
    return null;
  }

  return {
    hip,
    knee,
    ankle,
  };
}

function getLegScore(
  leg: LegPoints
): number {
  return (
    (leg.hip.visibility ?? 1) +
    (leg.knee.visibility ?? 1) +
    (leg.ankle.visibility ?? 1)
  ) / 3;
}

function chooseBestLeg(
  landmarks: Landmark[]
): TrackedLeg {
  const left =
    getLegPoints(landmarks, "left");

  const right =
    getLegPoints(landmarks, "right");

  if (!left && !right) {
    return null;
  }

  if (left && !right) {
    return "left";
  }

  if (right && !left) {
    return "right";
  }

  return getLegScore(left!) >=
    getLegScore(right!)
    ? "left"
    : "right";
}

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

export function createInitialSquatState(
  preference: LegPreference = "auto"
): SquatState {
  return {
    phase: "unknown",

    reps: 0,

    trackedLeg:
      preference === "auto"
        ? null
        : preference,

    lostFrames: 0,

    smoothedAngle: null,

    candidatePhase: null,

    candidateFrames: 0,

    validSquat: false,
  };
}

export function analyzeSquat(
  landmarks: Landmark[] | null,
  previousState: SquatState,
  preference: LegPreference = "auto"
): {
  state: SquatState;
  analysis: SquatAnalysis;
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

    const trackedLeg =
      shouldUnlock
        ? null
        : previousState.trackedLeg;

    return {
      state: {
        ...previousState,

        trackedLeg,

        lostFrames,

        candidatePhase: null,

        candidateFrames: 0,
      },

      analysis: {
        angle:
          previousState.smoothedAngle ===
          null
            ? null
            : Math.round(
                previousState.smoothedAngle
              ),

        phase: previousState.phase,

        reps: previousState.reps,

        feedback: shouldUnlock
          ? "Leg lost. Keep your full body visible."
          : "Keep your hip, knee, and ankle visible.",

        tracking: false,

        trackedLeg,

        formValid: false,
      },
    };
  }

  /*
    DETERMINE TRACKED LEG
  */

  let trackedLeg =
    previousState.trackedLeg;

  if (preference !== "auto") {
    trackedLeg = preference;
  } else if (!trackedLeg) {
    trackedLeg =
      chooseBestLeg(landmarks);
  }

  if (!trackedLeg) {
    return {
      state: {
        ...previousState,

        trackedLeg: null,

        lostFrames:
          previousState.lostFrames + 1,

        candidatePhase: null,

        candidateFrames: 0,
      },

      analysis: {
        angle: null,

        phase: previousState.phase,

        reps: previousState.reps,

        feedback:
          "Step back until your hip, knee, and ankle are visible.",

        tracking: false,

        trackedLeg: null,

        formValid: false,
      },
    };
  }

  const leg =
    getLegPoints(
      landmarks,
      trackedLeg
    );

  /*
    SELECTED LEG LOST
  */

  if (!leg) {
    const lostFrames =
      previousState.lostFrames + 1;

    const shouldUnlock =
      preference === "auto" &&
      lostFrames >= MAX_LOST_FRAMES;

    const nextTrackedLeg =
      shouldUnlock
        ? null
        : trackedLeg;

    return {
      state: {
        ...previousState,

        trackedLeg:
          nextTrackedLeg,

        lostFrames,

        candidatePhase: null,

        candidateFrames: 0,
      },

      analysis: {
        angle:
          previousState.smoothedAngle ===
          null
            ? null
            : Math.round(
                previousState.smoothedAngle
              ),

        phase: previousState.phase,

        reps: previousState.reps,

        feedback:
          "Keep your full tracked leg visible.",

        tracking: false,

        trackedLeg:
          nextTrackedLeg,

        formValid: false,
      },
    };
  }

  /*
    CALCULATE KNEE ANGLE
  */

  const rawAngle =
    calculateAngle(
      leg.hip,
      leg.knee,
      leg.ankle
    );

  const smoothedAngle =
    smoothAngle(
      rawAngle,
      previousState.smoothedAngle
    );

  let phase =
    previousState.phase;

  let reps =
    previousState.reps;

  let candidatePhase =
    previousState.candidatePhase;

  let candidateFrames =
    previousState.candidateFrames;

  let validSquat =
    previousState.validSquat;

  let feedback =
    "Keep your movement controlled.";

  /*
    For this first version, formValid means
    the tracked hip/knee/ankle chain is visible
    and usable.

    Later we can add:
    knee-collapse detection,
    torso-angle validation,
    heel-rise detection.
  */

  const formValid = true;

  /*
    INITIAL STANDING POSITION
  */

  if (phase === "unknown") {
    validSquat = false;

    if (
      smoothedAngle >=
      STANDING_ANGLE
    ) {
      if (
        candidatePhase ===
        "standing"
      ) {
        candidateFrames += 1;
      } else {
        candidatePhase =
          "standing";

        candidateFrames = 1;
      }

      feedback =
        "Hold the standing position briefly.";

      if (
        candidateFrames >=
        REQUIRED_STABLE_FRAMES
      ) {
        phase = "standing";

        candidatePhase = null;

        candidateFrames = 0;

        feedback =
          "Ready. Lower into the squat.";
      }
    } else {
      candidatePhase = null;

      candidateFrames = 0;

      feedback =
        "Stand upright to begin.";
    }
  }

  /*
    STANDING → SQUAT
  */

  else if (
    phase === "standing"
  ) {
    if (
      smoothedAngle <=
      SQUAT_ANGLE
    ) {
      if (
        candidatePhase === "squat"
      ) {
        candidateFrames += 1;
      } else {
        candidatePhase = "squat";

        candidateFrames = 1;
      }

      feedback =
        "Hold the squat depth briefly.";

      if (
        candidateFrames >=
        REQUIRED_STABLE_FRAMES
      ) {
        phase = "squat";

        candidatePhase = null;

        candidateFrames = 0;

        validSquat = true;

        feedback =
          "Good depth. Stand back up.";
      }
    } else {
      candidatePhase = null;

      candidateFrames = 0;

      if (
        smoothedAngle <= 125
      ) {
        feedback =
          "Almost deep enough. Lower a little more.";
      } else {
        feedback =
          "Lower your hips under control.";
      }
    }
  }

  /*
    SQUAT → STANDING
  */

  else if (
    phase === "squat"
  ) {
    if (
      smoothedAngle >=
      STANDING_ANGLE
    ) {
      if (
        candidatePhase ===
        "standing"
      ) {
        candidateFrames += 1;
      } else {
        candidatePhase =
          "standing";

        candidateFrames = 1;
      }

      feedback =
        "Fully extend your legs.";

      if (
        candidateFrames >=
        REQUIRED_STABLE_FRAMES
      ) {
        phase = "standing";

        candidatePhase = null;

        candidateFrames = 0;

        if (validSquat) {
          reps += 1;

          feedback =
            "Squat completed. Go again.";
        }

        validSquat = false;
      }
    } else {
      candidatePhase = null;

      candidateFrames = 0;

      feedback =
        smoothedAngle >= 135
          ? "Almost standing. Keep driving upward."
          : "Stand up under control.";
    }
  }

  const state: SquatState = {
    phase,

    reps,

    trackedLeg,

    lostFrames: 0,

    smoothedAngle,

    candidatePhase,

    candidateFrames,

    validSquat,
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

      trackedLeg,

      formValid,
    },
  };
}