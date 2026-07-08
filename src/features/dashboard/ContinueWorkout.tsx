import {
  ArrowRight,
  Clock3,
  Dumbbell,
  Flame,
  History,
  LoaderCircle,
  Play,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import type { WorkoutSession } from "../../service/workoutService";

type ContinueWorkoutProps = {
  sessions: WorkoutSession[];
  loading: boolean;
};

export default function ContinueWorkout({
  sessions,
  loading,
}: ContinueWorkoutProps) {
  const navigate = useNavigate();

  const latestSession = [...sessions].sort(
    (first, second) =>
      new Date(second.completed_at).getTime() -
      new Date(first.completed_at).getTime()
  )[0];

  if (loading) {
    return (
      <section className="flex min-h-72 min-w-0 items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <LoaderCircle
            size={20}
            className="animate-spin text-green-500"
          />

          Loading recent workout...
        </div>
      </section>
    );
  }

  if (!latestSession) {
    return (
      <section className="flex min-h-72 min-w-0 flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
          <Dumbbell size={27} />
        </div>

        <h2 className="mt-5 text-xl font-bold text-white">
          Start Your First Workout
        </h2>

        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          Complete and save an AI workout session to see your latest activity
          here.
        </p>

        <button
          type="button"
          onClick={() => navigate("/workout")}
          className="mt-6 flex items-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-semibold text-black transition hover:bg-green-400"
        >
          <Play size={18} />

          Browse Workouts
        </button>
      </section>
    );
  }

  return (
    <section className="flex h-full min-w-0 flex-col rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      {/* HEADER */}

      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-green-500">
            <History size={17} className="shrink-0" />

            Latest Workout
          </p>

          <h2 className="mt-3 truncate text-2xl font-bold text-white">
            {latestSession.exercise_name}
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            {formatWorkoutDate(latestSession.completed_at)}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
          <Dumbbell size={24} />
        </div>
      </div>

      {/* METRICS */}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <RecentMetric
          icon={<Dumbbell size={17} />}
          label="Reps"
          value={String(latestSession.reps)}
        />

        <RecentMetric
          icon={<Clock3 size={17} />}
          label="Time"
          value={formatDuration(
            Number(latestSession.duration_seconds)
          )}
        />

        <RecentMetric
          icon={<Flame size={17} />}
          label="Calories"
          value={`${Number(
            latestSession.estimated_calories
          ).toFixed(1)} kcal`}
        />
      </div>

      {/* ACTIONS */}

      <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/workout/${latestSession.exercise_id}/session`
            )
          }
          className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-semibold text-black transition hover:bg-green-400"
        >
          <Play size={18} />

          Start Again
        </button>

        <button
          type="button"
          onClick={() => navigate("/history")}
          className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
        >
          View History

          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}

function RecentMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-zinc-950 p-4">
      <div className="text-green-500">
        {icon}
      </div>

      <p className="mt-3 text-xs text-zinc-600">
        {label}
      </p>

      <p className="mt-1 truncate font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function formatDuration(totalSeconds: number) {
  const safeSeconds = Math.max(
    0,
    Math.floor(totalSeconds)
  );

  const hours = Math.floor(
    safeSeconds / 3600
  );

  const minutes = Math.floor(
    (safeSeconds % 3600) / 60
  );

  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function formatWorkoutDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently completed";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}