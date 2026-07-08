import { useEffect, useRef, useState } from "react";

export type Landmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

type PoseCanvasProps = {
  video: HTMLVideoElement | null;
  active: boolean;

  onLandmarks?: (landmarks: Landmark[] | null) => void;
};

type PoseResults = {
  poseLandmarks?: Landmark[];
};

type PoseInstance = {
  setOptions: (options: Record<string, unknown>) => void;

  onResults: (
    callback: (results: PoseResults) => void
  ) => void;

  initialize: () => Promise<void>;

  send: (input: {
    image: HTMLVideoElement;
  }) => Promise<void>;

  close: () => Promise<void>;
};

type PoseConstructor = new (config: {
  locateFile: (file: string) => string;
}) => PoseInstance;

declare global {
  interface Window {
    Pose?: PoseConstructor;

    POSE_CONNECTIONS?: Array<
      [number, number]
    >;
  }
}

const POSE_SCRIPT =
  "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js";

const POSE_ASSET_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404";

function loadPoseScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Pose) {
      resolve();

      return;
    }

    const existingScript =
      document.querySelector<HTMLScriptElement>(
        `script[src="${POSE_SCRIPT}"]`
      );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => resolve(),
        {
          once: true,
        }
      );

      existingScript.addEventListener(
        "error",
        () =>
          reject(
            new Error(
              "Failed to load MediaPipe Pose script."
            )
          ),
        {
          once: true,
        }
      );

      return;
    }

    const script =
      document.createElement("script");

    script.src = POSE_SCRIPT;

    script.async = true;

    script.crossOrigin = "anonymous";

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      reject(
        new Error(
          "Failed to load MediaPipe Pose script."
        )
      );
    };

    document.head.appendChild(script);
  });
}

export default function PoseCanvas({
  video,
  active,
  onLandmarks,
}: PoseCanvasProps) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const poseRef =
    useRef<PoseInstance | null>(null);

  const animationFrameRef =
    useRef<number | null>(null);

  const processingRef =
    useRef(false);

  const onLandmarksRef =
    useRef(onLandmarks);

  const [tracking, setTracking] =
    useState(false);

  const [poseError, setPoseError] =
    useState("");

  /*
    Always keep the latest callback.

    This prevents the entire MediaPipe engine
    from restarting when the parent component
    creates a new callback function.
  */

  useEffect(() => {
    onLandmarksRef.current = onLandmarks;
  }, [onLandmarks]);

  useEffect(() => {
    if (!active || !video) {
      setTracking(false);

      onLandmarksRef.current?.(null);

      return;
    }

    const videoElement = video;

    let cancelled = false;

    function drawLine(
      context: CanvasRenderingContext2D,
      start: Landmark,
      end: Landmark,
      width: number,
      height: number
    ) {
      context.beginPath();

      context.moveTo(
        start.x * width,
        start.y * height
      );

      context.lineTo(
        end.x * width,
        end.y * height
      );

      context.stroke();
    }

    function drawPose(
      results: PoseResults
    ) {
      if (cancelled) {
        return;
      }

      const canvas =
        canvasRef.current;

      if (!canvas) {
        return;
      }

      const context =
        canvas.getContext("2d");

      if (!context) {
        return;
      }

      const width =
        videoElement.videoWidth;

      const height =
        videoElement.videoHeight;

      if (!width || !height) {
        return;
      }

      if (
        canvas.width !== width ||
        canvas.height !== height
      ) {
        canvas.width = width;

        canvas.height = height;
      }

      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const landmarks =
        results.poseLandmarks;

      if (!landmarks) {
        setTracking(false);

        onLandmarksRef.current?.(null);

        return;
      }

      setTracking(true);

      /*
        Send landmarks to CameraView.

        Later these landmarks will reach
        WorkoutSession and the exercise analyzer.
      */

      onLandmarksRef.current?.(
        landmarks
      );

      context.save();

      /*
        CameraView mirrors the video.

        Therefore we mirror the canvas
        drawing so skeleton and body align.
      */

      context.translate(
        canvas.width,
        0
      );

      context.scale(-1, 1);

      const connections =
        window.POSE_CONNECTIONS ?? [];

      context.strokeStyle =
        "#22c55e";

      context.lineWidth = 3;

      for (
        const [
          startIndex,
          endIndex,
        ] of connections
      ) {
        const start =
          landmarks[startIndex];

        const end =
          landmarks[endIndex];

        if (!start || !end) {
          continue;
        }

        if (
          (start.visibility ?? 1) <
            0.4 ||
          (end.visibility ?? 1) <
            0.4
        ) {
          continue;
        }

        drawLine(
          context,
          start,
          end,
          canvas.width,
          canvas.height
        );
      }

      context.fillStyle =
        "#ffffff";

      for (
        const landmark of landmarks
      ) {
        if (
          (landmark.visibility ?? 1) <
          0.4
        ) {
          continue;
        }

        context.beginPath();

        context.arc(
          landmark.x *
            canvas.width,
          landmark.y *
            canvas.height,
          4,
          0,
          Math.PI * 2
        );

        context.fill();
      }

      context.restore();
    }

    async function detectPose() {
      if (
        cancelled ||
        !poseRef.current
      ) {
        return;
      }

      if (videoElement.readyState < 2) {
        animationFrameRef.current =
          requestAnimationFrame(
            detectPose
          );

        return;
      }

      if (
        !processingRef.current
      ) {
        processingRef.current = true;

        try {
          await poseRef.current.send({
            image: videoElement,
          });
        } catch (error) {
          console.error(
            "POSE DETECTION ERROR:",
            error
          );
        } finally {
          processingRef.current = false;
        }
      }

      if (!cancelled) {
        animationFrameRef.current =
          requestAnimationFrame(
            detectPose
          );
      }
    }

    async function initializePose() {
      setPoseError("");

      try {
        await loadPoseScript();

        if (cancelled) {
          return;
        }

        const Pose =
          window.Pose;

        if (!Pose) {
          throw new Error(
            "MediaPipe Pose constructor was not loaded."
          );
        }

        const pose =
          new Pose({
            locateFile: (
              file: string
            ) =>
              `${POSE_ASSET_BASE}/${file}`,
          });

        pose.setOptions({
          modelComplexity: 2,

          smoothLandmarks: true,

          enableSegmentation: false,

          smoothSegmentation: false,

          minDetectionConfidence:
            0.7,

          minTrackingConfidence:
            0.7,
        });

        pose.onResults(
          drawPose
        );

        poseRef.current =
          pose;

        await pose.initialize();

        if (cancelled) {
          await pose.close();

          return;
        }

        detectPose();
      } catch (error) {
        console.error(
          "POSE INITIALIZATION ERROR:",
          error
        );

        setPoseError(
          error instanceof Error
            ? error.message
            : "Unable to initialize pose detection."
        );
      }
    }

    initializePose();

    return () => {
      cancelled = true;

      setTracking(false);

      onLandmarksRef.current?.(
        null
      );

      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current =
          null;
      }

      processingRef.current =
        false;

      const pose =
        poseRef.current;

      poseRef.current = null;

      if (pose) {
        void pose
          .close()
          .catch((error) => {
            console.error(
              "POSE CLOSE ERROR:",
              error
            );
          });
      }

      const canvas =
        canvasRef.current;

      const context =
        canvas?.getContext("2d");

      if (
        canvas &&
        context
      ) {
        context.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
    };
  }, [active, video]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {active && (
        <div className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold">
          {poseError ? (
            <span className="text-red-400">
              Pose Error
            </span>
          ) : tracking ? (
            <span className="text-green-400">
              Body Detected
            </span>
          ) : (
            <span className="text-yellow-400">
              Searching for Body
            </span>
          )}
        </div>
      )}
    </>
  );
}