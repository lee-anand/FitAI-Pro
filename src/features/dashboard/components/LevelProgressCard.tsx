import {
  Activity,
  Dumbbell,
  LoaderCircle,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

import type {
  LevelProgress,
  UserProgress,
} from "../../../service/progressService";

type LevelProgressCardProps = {
  progress: UserProgress | null;
  levelProgress: LevelProgress | null;
  loading: boolean;
};

export default function LevelProgressCard({
  progress,
  levelProgress,
  loading,
}: LevelProgressCardProps) {
  if (loading) {
    return (
      <section className="flex min-h-64 items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <LoaderCircle
            size={20}
            className="animate-spin text-green-500"
          />

          Loading level progress...
        </div>
      </section>
    );
  }

  if (!progress || !levelProgress) {
    return (
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
            <Trophy size={27} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-white">
            Start Earning XP
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
            Complete and save AI-tracked workouts to earn XP, increase your
            level, and build your FitAI Pro progression.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-w-0 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      {/* HEADER */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-500 text-black">
            <Trophy size={27} />
          </div>

          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-green-500">
              Player Progress

              <Sparkles size={14} />
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Level {levelProgress.currentLevel}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Keep completing workouts to increase your level.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
            Total XP
          </p>

          <p className="mt-1 text-2xl font-bold text-green-500">
            {levelProgress.totalXp} XP
          </p>
        </div>
      </div>

      {/* XP PROGRESS */}

      <div className="mt-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">
              Level {levelProgress.currentLevel} Progress
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {levelProgress.xpIntoLevel} XP earned in this level
            </p>
          </div>

          <p className="shrink-0 text-sm font-bold text-green-500">
            {Math.round(levelProgress.progressPercentage)}%
          </p>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-700"
            style={{
              width: `${levelProgress.progressPercentage}%`,
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
          <span>
            {levelProgress.currentLevelXp} XP
          </span>

          <span>
            {levelProgress.xpNeededForNextLevel} XP until Level{" "}
            {levelProgress.currentLevel + 1}
          </span>

          <span>
            {levelProgress.nextLevelXp} XP
          </span>
        </div>
      </div>

      {/* PROGRESS STATS */}

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <ProgressMetric
          icon={<Dumbbell size={18} />}
          label="Workouts Completed"
          value={String(progress.workouts_completed)}
        />

        <ProgressMetric
          icon={<Activity size={18} />}
          label="Total Repetitions"
          value={String(progress.total_reps)}
        />

        <ProgressMetric
          icon={<Star size={18} />}
          label="XP to Next Level"
          value={String(levelProgress.xpNeededForNextLevel)}
        />
      </div>
    </section>
  );
}

function ProgressMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="text-green-500">
        {icon}
      </div>

      <p className="mt-3 text-xs text-zinc-600">
        {label}
      </p>

      <p className="mt-1 truncate text-xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}