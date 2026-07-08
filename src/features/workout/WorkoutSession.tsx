import {
  ArrowLeft,
  Bot,
  CircleStop,
  Clock3,
  Dumbbell,
  Gauge,
  RotateCcw,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate, useParams } from "react-router-dom";

import { exercises } from "./data/exercises";

import CameraView, {
  type CameraViewHandle,
} from "./components/CameraView";

import WorkoutSetup from "./components/WorkoutSetup";
import WorkoutResults from "./components/WorkoutResults";

import type { Landmark } from "./components/PoseCanvas";

import { saveWorkoutSession } from "../../service/workoutService";

import {
  analyzeBicepCurl,
  createInitialBicepCurlState,
  type ArmPreference,
  type BicepCurlState,
} from "./analyzers/bicepCurlAnalyzer";

import {
  analyzeSquat,
  createInitialSquatState,
  type LegPreference,
  type SquatState,
} from "./analyzers/squatAnalyzer";

type SidePreference = "auto" | "left" | "right";

type WorkoutAnalysis = {
  angle: number | null;
  phase: string;
  reps: number;
  feedback: string;
  tracking: boolean;
  trackedSide: "left" | "right" | null;
  formValid: boolean;
};

const initialAnalysis: WorkoutAnalysis = {
  angle: null,
  phase: "unknown",
  reps: 0,
  feedback: "Start the session to begin tracking.",
  tracking: false,
  trackedSide: null,
  formValid: false,
};

export default function WorkoutSession() {
  const navigate = useNavigate();
  const { exerciseId } = useParams();

  const exercise = exercises.find(
    (item) => item.id === exerciseId
  );

  const isBicepCurl = exercise?.id === "bicep-curl";
  const isSquat = exercise?.id === "bodyweight-squat";

  const analyzerSupported = isBicepCurl || isSquat;

  const cameraRef =
    useRef<CameraViewHandle | null>(null);

  const countdownRunRef = useRef(0);

  const sessionStartedRef = useRef(false);

  const sidePreferenceRef =
    useRef<SidePreference>("auto");

  const bicepStateRef =
    useRef<BicepCurlState>(
      createInitialBicepCurlState("auto")
    );

  const squatStateRef =
    useRef<SquatState>(
      createInitialSquatState("auto")
    );

  const [sidePreference, setSidePreference] =
    useState<SidePreference>("auto");

  const [sessionStarted, setSessionStarted] =
    useState(false);

  const [seconds, setSeconds] = useState(0);

  const [reps, setReps] = useState(0);

  const [analysis, setAnalysis] =
    useState<WorkoutAnalysis>(initialAnalysis);

  const [sessionError, setSessionError] =
    useState("");

  const [showSetup, setShowSetup] = useState(true);

  const [cameraStarting, setCameraStarting] =
    useState(false);

  const [countdown, setCountdown] =
    useState<number | null>(null);

  /*
    RESULTS STATE
  */

  const [showResults, setShowResults] =
    useState(false);

  const [finalReps, setFinalReps] = useState(0);

  const [finalSeconds, setFinalSeconds] = useState(0);

  const [finalCalories, setFinalCalories] =
    useState(0);

  /*
    SAVE STATE
  */

  const [savingWorkout, setSavingWorkout] =
    useState(false);

  const [workoutSaved, setWorkoutSaved] =
    useState(false);

  const [saveError, setSaveError] = useState("");

  /*
    SESSION TIMER
  */

  useEffect(() => {
    if (!sessionStarted) {
      return;
    }

    const interval = window.setInterval(() => {
      setSeconds((previous) => previous + 1);
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [sessionStarted]);

  /*
    RESET WHEN EXERCISE CHANGES
  */

  useEffect(() => {
    countdownRunRef.current += 1;

    sessionStartedRef.current = false;

    cameraRef.current?.stopCamera();

    setSessionStarted(false);

    setSeconds(0);
    setReps(0);

    setSessionError("");

    setShowSetup(true);
    setShowResults(false);

    setCameraStarting(false);
    setCountdown(null);

    setFinalReps(0);
    setFinalSeconds(0);
    setFinalCalories(0);

    setSavingWorkout(false);
    setWorkoutSaved(false);
    setSaveError("");

    setSidePreference("auto");

    sidePreferenceRef.current = "auto";

    bicepStateRef.current =
      createInitialBicepCurlState("auto");

    squatStateRef.current =
      createInitialSquatState("auto");

    setAnalysis({
      ...initialAnalysis,

      feedback: analyzerSupported
        ? "Select a tracking side and get ready to begin."
        : "AI analyzer coming soon for this exercise.",
    });
  }, [exerciseId, analyzerSupported]);

  function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);

    const remainingSeconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  /*
    CALCULATE ESTIMATED CALORIES

    exercises.ts stores caloriesPerMinute.
  */

  function calculateCalories(durationSeconds: number) {
    if (!exercise) {
      return 0;
    }

    const calories =
      exercise.caloriesPerMinute * (durationSeconds / 60);

    return Number(calories.toFixed(2));
  }

  /*
    UPDATE ANALYSIS
  */

  function updateDisplayedAnalysis(
    nextAnalysis: WorkoutAnalysis
  ) {
    setReps(nextAnalysis.reps);

    setAnalysis((currentAnalysis) => {
      if (
        currentAnalysis.angle === nextAnalysis.angle &&
        currentAnalysis.phase === nextAnalysis.phase &&
        currentAnalysis.reps === nextAnalysis.reps &&
        currentAnalysis.feedback === nextAnalysis.feedback &&
        currentAnalysis.tracking === nextAnalysis.tracking &&
        currentAnalysis.trackedSide ===
          nextAnalysis.trackedSide &&
        currentAnalysis.formValid === nextAnalysis.formValid
      ) {
        return currentAnalysis;
      }

      return nextAnalysis;
    });
  }

  /*
    RECEIVE LANDMARKS
  */

  const handleLandmarks = useCallback(
    (landmarks: Landmark[] | null) => {
      if (
        !sessionStartedRef.current ||
        !analyzerSupported
      ) {
        return;
      }

      if (isBicepCurl) {
        const result = analyzeBicepCurl(
          landmarks,
          bicepStateRef.current,
          sidePreferenceRef.current as ArmPreference
        );

        bicepStateRef.current = result.state;

        updateDisplayedAnalysis({
          angle: result.analysis.angle,
          phase: result.analysis.phase,
          reps: result.analysis.reps,
          feedback: result.analysis.feedback,
          tracking: result.analysis.tracking,
          trackedSide: result.analysis.trackedArm,
          formValid: result.analysis.formValid,
        });

        return;
      }

      if (isSquat) {
        const result = analyzeSquat(
          landmarks,
          squatStateRef.current,
          sidePreferenceRef.current as LegPreference
        );

        squatStateRef.current = result.state;

        updateDisplayedAnalysis({
          angle: result.analysis.angle,
          phase: result.analysis.phase,
          reps: result.analysis.reps,
          feedback: result.analysis.feedback,
          tracking: result.analysis.tracking,
          trackedSide: result.analysis.trackedLeg,
          formValid: result.analysis.formValid,
        });
      }
    },
    [analyzerSupported, isBicepCurl, isSquat]
  );

  /*
    SELECT SIDE
  */

  function selectSide(preference: SidePreference) {
    if (
      sessionStarted ||
      cameraStarting ||
      countdown !== null
    ) {
      return;
    }

    setSidePreference(preference);

    sidePreferenceRef.current = preference;

    setSeconds(0);
    setReps(0);

    if (isBicepCurl) {
      bicepStateRef.current =
        createInitialBicepCurlState(
          preference as ArmPreference
        );
    }

    if (isSquat) {
      squatStateRef.current =
        createInitialSquatState(
          preference as LegPreference
        );
    }

    setAnalysis({
      ...initialAnalysis,

      feedback:
        preference === "auto"
          ? `Auto mode will lock the clearest visible ${
              isSquat ? "leg" : "arm"
            }.`
          : `The ${preference} ${
              isSquat ? "leg" : "arm"
            } will be tracked.`,
    });
  }

  /*
    START SESSION
  */

  async function startSession() {
    if (!analyzerSupported) {
      setSessionError(
        "AI tracking is not available for this exercise yet."
      );

      return;
    }

    if (
      cameraStarting ||
      countdown !== null ||
      sessionStarted
    ) {
      return;
    }

    const currentRun = countdownRunRef.current + 1;

    countdownRunRef.current = currentRun;

    sessionStartedRef.current = false;

    setSessionStarted(false);

    setSessionError("");

    setShowResults(false);

    setWorkoutSaved(false);
    setSavingWorkout(false);
    setSaveError("");

    setFinalReps(0);
    setFinalSeconds(0);
    setFinalCalories(0);

    setCameraStarting(true);

    setSeconds(0);
    setReps(0);

    sidePreferenceRef.current = sidePreference;

    if (isBicepCurl) {
      bicepStateRef.current =
        createInitialBicepCurlState(
          sidePreference as ArmPreference
        );
    }

    if (isSquat) {
      squatStateRef.current =
        createInitialSquatState(
          sidePreference as LegPreference
        );
    }

    setAnalysis({
      ...initialAnalysis,

      feedback: "Camera starting. Get into position.",
    });

    /*
      Mount CameraView.
    */

    setShowSetup(false);

    await waitForNextPaint();

    if (countdownRunRef.current !== currentRun) {
      return;
    }

    if (!cameraRef.current) {
      await waitForNextPaint();
    }

    if (countdownRunRef.current !== currentRun) {
      return;
    }

    if (!cameraRef.current) {
      setCameraStarting(false);

      setShowSetup(true);

      setSessionError(
        "Camera component could not be initialized. Please try again."
      );

      return;
    }

    const cameraStarted =
      await cameraRef.current.startCamera();

    if (countdownRunRef.current !== currentRun) {
      cameraRef.current?.stopCamera();

      return;
    }

    if (!cameraStarted) {
      setCameraStarting(false);

      setShowSetup(true);

      setSessionError(
        "Camera could not be started. Please allow camera access and try again."
      );

      return;
    }

    setCameraStarting(false);

    setCountdown(3);

    await wait(1000);

    if (countdownRunRef.current !== currentRun) {
      return;
    }

    setCountdown(2);

    await wait(1000);

    if (countdownRunRef.current !== currentRun) {
      return;
    }

    setCountdown(1);

    await wait(1000);

    if (countdownRunRef.current !== currentRun) {
      return;
    }

    setCountdown(0);

    await wait(600);

    if (countdownRunRef.current !== currentRun) {
      return;
    }

    setCountdown(null);

    sessionStartedRef.current = true;

    setSessionStarted(true);

    setAnalysis({
      ...initialAnalysis,

      feedback: isSquat
        ? "Stand upright to begin."
        : "Straighten your arm to begin.",
    });
  }

  /*
    STOP SESSION AND SHOW RESULTS
  */

  function stopSession() {
    countdownRunRef.current += 1;

    sessionStartedRef.current = false;

    /*
      Capture results BEFORE resetting anything.
    */

    const completedReps = reps;
    const completedSeconds = seconds;

    const estimatedCalories =
      calculateCalories(completedSeconds);

    setFinalReps(completedReps);

    setFinalSeconds(completedSeconds);

    setFinalCalories(estimatedCalories);

    setSessionStarted(false);

    setCountdown(null);

    setCameraStarting(false);

    cameraRef.current?.stopCamera();

    setWorkoutSaved(false);

    setSavingWorkout(false);

    setSaveError("");

    setShowSetup(false);

    setShowResults(true);

    setAnalysis((previous) => ({
      ...previous,

      tracking: false,

      feedback:
        completedReps > 0
          ? `Session stopped with ${completedReps} completed rep${
              completedReps === 1 ? "" : "s"
            }.`
          : "Session stopped.",
    }));
  }

  /*
    SAVE WORKOUT TO SUPABASE
  */

  async function handleSaveWorkout() {
    if (!exercise) {
      return;
    }

    /*
      Prevent duplicate saves.
    */

    if (savingWorkout || workoutSaved) {
      return;
    }

    setSavingWorkout(true);

    setSaveError("");

    const { error } = await saveWorkoutSession({
      exercise_id: exercise.id,

      exercise_name: exercise.name,

      reps: finalReps,

      duration_seconds: finalSeconds,

      estimated_calories: finalCalories,
    });

    if (error) {
      console.error("WORKOUT SAVE ERROR:", error);

      setSaveError(
        error instanceof Error
          ? error.message
          : "Unable to save workout. Please try again."
      );

      setSavingWorkout(false);

      return;
    }

    setWorkoutSaved(true);

    setSavingWorkout(false);
  }

  /*
    START AGAIN
  */

  function startAgain() {
    countdownRunRef.current += 1;

    sessionStartedRef.current = false;

    cameraRef.current?.stopCamera();

    setSessionStarted(false);

    setSeconds(0);
    setReps(0);

    setSessionError("");

    setShowResults(false);

    setShowSetup(true);

    setCameraStarting(false);

    setCountdown(null);

    setFinalReps(0);
    setFinalSeconds(0);
    setFinalCalories(0);

    setSavingWorkout(false);

    setWorkoutSaved(false);

    setSaveError("");

    sidePreferenceRef.current = sidePreference;

    bicepStateRef.current =
      createInitialBicepCurlState(
        sidePreference as ArmPreference
      );

    squatStateRef.current =
      createInitialSquatState(
        sidePreference as LegPreference
      );

    setAnalysis({
      ...initialAnalysis,

      feedback: "Get into position and start when ready.",
    });
  }

  /*
    RESET SESSION
  */

  function resetSession() {
    countdownRunRef.current += 1;

    sessionStartedRef.current = false;

    cameraRef.current?.stopCamera();

    setSessionStarted(false);

    setSeconds(0);
    setReps(0);

    setSessionError("");

    setShowSetup(true);

    setShowResults(false);

    setCameraStarting(false);

    setCountdown(null);

    setFinalReps(0);
    setFinalSeconds(0);
    setFinalCalories(0);

    setSavingWorkout(false);

    setWorkoutSaved(false);

    setSaveError("");

    sidePreferenceRef.current = sidePreference;

    bicepStateRef.current =
      createInitialBicepCurlState(
        sidePreference as ArmPreference
      );

    squatStateRef.current =
      createInitialSquatState(
        sidePreference as LegPreference
      );

    setAnalysis({
      ...initialAnalysis,

      feedback: analyzerSupported
        ? "Get into position and start when ready."
        : "AI analyzer coming soon for this exercise.",
    });
  }

  /*
    BACK TO EXERCISE DETAILS
  */

  function handleBack() {
    countdownRunRef.current += 1;

    sessionStartedRef.current = false;

    cameraRef.current?.stopCamera();

    navigate(`/workout/${exercise?.id}`);
  }

  /*
    BACK TO WORKOUT LIBRARY
  */

  function handleBackToLibrary() {
    countdownRunRef.current += 1;

    sessionStartedRef.current = false;

    cameraRef.current?.stopCamera();

    navigate("/workout");
  }

  const bodyPartLabel = isSquat ? "Leg" : "Arm";

  const bodyPartLabelLower =
    bodyPartLabel.toLowerCase();

  const angleTitle =
    isSquat ? "Knee Angle" : "Elbow Angle";

  const headerInstruction = isSquat
    ? "Stand far enough from the camera to keep your hip, knee, and ankle visible."
    : "Stand facing forward or sideways and keep one complete arm visible from shoulder to wrist.";

  function getPhaseTitle() {
    if (!sessionStarted) {
      return analyzerSupported
        ? "Waiting"
        : "Coming Soon";
    }

    if (!analysis.tracking) {
      return `Searching for ${bodyPartLabel}`;
    }

    if (isBicepCurl) {
      if (analysis.phase === "up") {
        return "Curl Up";
      }

      if (analysis.phase === "down") {
        return "Arm Down";
      }

      return "Get Ready";
    }

    if (isSquat) {
      if (analysis.phase === "standing") {
        return "Standing";
      }

      if (analysis.phase === "squat") {
        return "Squat Position";
      }

      return "Get Ready";
    }

    return "Waiting";
  }

  if (!exercise) {
    return (
      <main className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
        <h1 className="text-3xl font-bold text-white">
          Exercise not found
        </h1>

        <button
          type="button"
          onClick={() => navigate("/workout")}
          className="mt-6 rounded-xl bg-green-500 px-6 py-3 font-semibold text-black"
        >
          Back to Workout Library
        </button>
      </main>
    );
  }

  /*
    RESULTS SCREEN
  */

  if (showResults) {
    return (
      <main className="space-y-6">
        <button
          type="button"
          onClick={handleBackToLibrary}
          className="flex items-center gap-2 text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={18} />

          Workout Library
        </button>

        <WorkoutResults
          exerciseName={exercise.name}
          reps={finalReps}
          durationSeconds={finalSeconds}
          estimatedCalories={finalCalories}
          saving={savingWorkout}
          saved={workoutSaved}
          error={saveError}
          onSave={handleSaveWorkout}
          onStartAgain={startAgain}
          onBackToLibrary={handleBackToLibrary}
        />
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-2 text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft size={18} />

        Exercise Details
      </button>

      {/* HEADER */}

      <section className="flex flex-col gap-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-green-500">
            <Bot size={17} />

            AI Workout Session
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white">
            {exercise.name}
          </h1>

          <p className="mt-2 text-zinc-400">
            {analyzerSupported
              ? headerInstruction
              : "A dedicated AI movement analyzer has not been added for this exercise yet."}
          </p>
        </div>

        <div
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            !analyzerSupported
              ? "bg-zinc-800 text-zinc-500"
              : countdown !== null
                ? "bg-yellow-500/10 text-yellow-400"
                : sessionStarted
                  ? analysis.tracking
                    ? "bg-green-500/10 text-green-500"
                    : "bg-yellow-500/10 text-yellow-400"
                  : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {!analyzerSupported
            ? "Analyzer Coming Soon"
            : countdown !== null
              ? "Get Ready"
              : sessionStarted
                ? analysis.tracking
                  ? "AI Tracking"
                  : `Searching for ${bodyPartLabel}`
                : cameraStarting
                  ? "Starting Camera"
                  : "Ready"}
        </div>
      </section>

      {/* SIDE SELECTOR */}

      {analyzerSupported && showSetup && (
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-white">
                Tracking {bodyPartLabel}
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Auto locks the clearest visible{" "}
                {bodyPartLabelLower}.
              </p>
            </div>

            <div className="flex rounded-xl bg-zinc-950 p-1">
              {(
                [
                  "auto",
                  "left",
                  "right",
                ] as SidePreference[]
              ).map((preference) => (
                <button
                  key={preference}
                  type="button"
                  disabled={cameraStarting}
                  onClick={() => selectSide(preference)}
                  className={`rounded-lg px-5 py-2 text-sm font-semibold capitalize transition ${
                    sidePreference === preference
                      ? "bg-green-500 text-black"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {preference}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {sessionError && (
        <section className="rounded-2xl border border-red-900/60 bg-red-950/30 px-5 py-4 text-sm text-red-400">
          {sessionError}
        </section>
      )}

      {/* SETUP */}

      {analyzerSupported && showSetup && (
        <WorkoutSetup
          exerciseId={exercise.id}
          exerciseName={exercise.name}
          loading={cameraStarting}
          onStart={startSession}
        />
      )}

      {/* UNSUPPORTED */}

      {!analyzerSupported && (
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <Bot
            size={38}
            className="mx-auto text-zinc-600"
          />

          <h2 className="mt-4 text-xl font-bold text-white">
            AI Analyzer Coming Soon
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500">
            This exercise is available in the workout library,
            but its movement-specific analyzer has not been
            connected yet.
          </p>
        </section>
      )}

      {/* WORKOUT AREA */}

      {analyzerSupported && !showSetup && (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <article className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
            <div className="relative">
              <CameraView
                ref={cameraRef}
                active={
                  cameraStarting ||
                  countdown !== null ||
                  sessionStarted
                }
                onLandmarks={handleLandmarks}
              />

              {countdown !== null && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
                  <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-500">
                      Get Ready
                    </p>

                    <p className="mt-3 text-8xl font-black text-white">
                      {countdown === 0 ? "GO!" : countdown}
                    </p>

                    <p className="mt-4 text-sm text-zinc-300">
                      {isSquat
                        ? "Keep your full body inside the frame."
                        : "Keep your selected arm clearly visible."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 p-5">
              <div>
                <p className="text-sm text-zinc-500">
                  AI tracking:{" "}
                  <span className="font-medium text-green-500">
                    Supported
                  </span>
                </p>

                {sessionStarted &&
                  analysis.trackedSide && (
                    <p className="mt-1 text-xs capitalize text-zinc-500">
                      Locked on {analysis.trackedSide}{" "}
                      {bodyPartLabelLower}
                    </p>
                  )}
              </div>

              <div className="flex flex-wrap gap-3">
                {sessionStarted ? (
                  <button
                    type="button"
                    onClick={stopSession}
                    className="flex items-center gap-2 rounded-xl bg-zinc-800 px-5 py-3 font-semibold text-white transition hover:bg-zinc-700"
                  >
                    <CircleStop size={18} />

                    Stop Session
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={countdown !== null}
                    onClick={resetSession}
                    className="rounded-xl bg-zinc-800 px-5 py-3 font-semibold text-zinc-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="button"
                  onClick={resetSession}
                  className="flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800"
                >
                  <RotateCcw size={18} />

                  Reset
                </button>
              </div>
            </div>
          </article>

          {/* METRICS */}

          <aside className="space-y-5">
            <MetricCard
              icon={<Dumbbell size={21} />}
              title="Repetitions"
              value={String(reps)}
            />

            <MetricCard
              icon={<Clock3 size={21} />}
              title="Session Time"
              value={formatTime(seconds)}
            />

            <MetricCard
              icon={<Gauge size={21} />}
              title={angleTitle}
              value={
                analysis.angle !== null
                  ? `${analysis.angle}°`
                  : "--"
              }
            />

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-sm font-medium text-zinc-500">
                Live Form Feedback
              </p>

              <div className="mt-4 flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-white">
                  {getPhaseTitle()}
                </h2>

                {analysis.tracking && (
                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold uppercase text-green-500">
                    {analysis.phase}
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm leading-6 text-zinc-400">
                {analysis.feedback}
              </p>

              {analysis.trackedSide && (
                <p className="mt-3 text-xs capitalize text-zinc-500">
                  {bodyPartLabel}:{" "}
                  <span className="font-semibold text-zinc-300">
                    {analysis.trackedSide}
                  </span>
                </p>
              )}
            </section>
          </aside>
        </section>
      )}
    </main>
  );
}

function waitForNextPaint() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function MetricCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <article className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
        {icon}
      </div>

      <p className="mt-5 text-sm text-zinc-500">
        {title}
      </p>

      <p className="mt-2 text-4xl font-bold text-white">
        {value}
      </p>
    </article>
  );
}