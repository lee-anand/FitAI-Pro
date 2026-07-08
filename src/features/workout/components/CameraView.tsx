import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import PoseCanvas, {
  type Landmark,
} from "./PoseCanvas";

export type CameraViewHandle = {
  startCamera: () => Promise<boolean>;
  stopCamera: () => void;
  getVideoElement: () => HTMLVideoElement | null;
};

type CameraViewProps = {
  active: boolean;

  onLandmarks?: (landmarks: Landmark[] | null) => void;
};

const CameraView = forwardRef<
  CameraViewHandle,
  CameraViewProps
>(function CameraView(
  {
    active,
    onLandmarks,
  },
  ref
) {
  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] =
    useState(false);

  const [cameraError, setCameraError] =
    useState("");

  async function startCamera(): Promise<boolean> {
    setCameraError("");

    if (streamRef.current) {
      return true;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Camera access is not supported in this browser."
      );

      return false;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",

            width: {
              ideal: 1280,
            },

            height: {
              ideal: 720,
            },
          },

          audio: false,
        });

      streamRef.current = stream;

      const video = videoRef.current;

      if (!video) {
        stream
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        streamRef.current = null;

        setCameraError(
          "Camera video element is unavailable."
        );

        return false;
      }

      video.srcObject = stream;

      await video.play();

      setCameraReady(true);

      return true;
    } catch (error) {
      console.error(
        "CAMERA START ERROR:",
        error
      );

      setCameraReady(false);

      if (error instanceof DOMException) {
        setCameraError(
          `${error.name}: ${error.message}`
        );
      } else {
        setCameraError(
          "Unable to start the camera."
        );
      }

      return false;
    }
  }

  function stopCamera() {
    streamRef.current
      ?.getTracks()
      .forEach((track) => {
        track.stop();
      });

    streamRef.current = null;

    const video = videoRef.current;

    if (video) {
      video.pause();

      video.srcObject = null;
    }

    setCameraReady(false);

    /*
      Clear old landmarks when camera stops.
    */

    onLandmarks?.(null);
  }

  useImperativeHandle(ref, () => ({
    startCamera,

    stopCamera,

    getVideoElement: () =>
      videoRef.current,
  }));

  useEffect(() => {
    if (!active) {
      stopCamera();
    }
  }, [active]);

  useEffect(() => {
    return () => {
      streamRef.current
        ?.getTracks()
        .forEach((track) => {
          track.stop();
        });
    };
  }, []);

  return (
    <div className="relative aspect-video overflow-hidden bg-zinc-950">
      {/* CAMERA */}

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`h-full w-full scale-x-[-1] object-cover ${
          cameraReady
            ? "block"
            : "hidden"
        }`}
      />

      {/* POSE DETECTION */}

      {cameraReady && (
        <PoseCanvas
          video={videoRef.current}
          active={active}
          onLandmarks={onLandmarks}
        />
      )}

      {/* CAMERA PLACEHOLDER */}

      {!cameraReady &&
        !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
            <div>
              <p className="text-xl font-semibold text-white">
                Camera Ready
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Start the workout session to enable your camera.
              </p>
            </div>
          </div>
        )}

      {/* CAMERA ERROR */}

      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <p className="text-lg font-semibold text-red-400">
              Camera unavailable
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {cameraError}
            </p>
          </div>
        </div>
      )}

      {/* CAMERA STATUS */}

      {cameraReady && (
        <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-green-400">
          Camera Active
        </div>
      )}
    </div>
  );
});

export default CameraView;