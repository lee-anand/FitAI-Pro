import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Flame,
  LoaderCircle,
  RotateCcw,
  Save,
  Trophy,
} from "lucide-react";

type WorkoutResultsProps = {
  exerciseName: string;
  reps: number;
  durationSeconds: number;
  estimatedCalories: number;

  saving: boolean;
  saved: boolean;
  error: string;

  onSave: () => void;
  onStartAgain: () => void;
  onBackToLibrary: () => void;
};

export default function WorkoutResults({
  exerciseName,
  reps,
  durationSeconds,
  estimatedCalories,
  saving,
  saved,
  error,
  onSave,
  onStartAgain,
  onBackToLibrary,
}: WorkoutResultsProps) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
            <Trophy size={32} />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-green-500">
            Workout Complete
          </p>

          <h2 className="mt-3 text-3xl font-bold text-white">
            {exerciseName}
          </h2>

          <p className="mt-3 text-zinc-400">
            Your AI workout session has been completed.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <ResultCard
            icon={<Dumbbell size={22} />}
            label="Repetitions"
            value={String(reps)}
          />

          <ResultCard
            icon={<Clock3 size={22} />}
            label="Duration"
            value={formatTime(durationSeconds)}
          />

          <ResultCard
            icon={<Flame size={22} />}
            label="Estimated Calories"
            value={`${estimatedCalories.toFixed(1)} kcal`}
          />
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-900/60 bg-red-950/30 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {saved && (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-green-900/60 bg-green-950/30 px-5 py-4 text-sm font-medium text-green-400">
            <CheckCircle2 size={18} />

            Workout saved successfully.
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            disabled={saving || saved}
            onClick={onSave}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />

                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 size={18} />

                Workout Saved
              </>
            ) : (
              <>
                <Save size={18} />

                Save Workout
              </>
            )}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={onStartAgain}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-60"
          >
            <RotateCcw size={18} />

            Start Again
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={onBackToLibrary}
            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-800 px-6 py-3 font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60"
          >
            <ArrowLeft size={18} />

            Workout Library
          </button>
        </div>
      </div>
    </section>
  );
}

function ResultCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
        {icon}
      </div>

      <p className="mt-4 text-sm text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>
    </article>
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}