import {
  Activity,
  Clock3,
  Dumbbell,
  Flame,
} from "lucide-react";

import type { WorkoutSession } from "../../../service/workoutService";

type ExerciseBreakdownProps = {
  sessions: WorkoutSession[];
};

type ExerciseStats = {
  exerciseId: string;
  exerciseName: string;
  workouts: number;
  reps: number;
  seconds: number;
  calories: number;
  percentage: number;
};

export default function ExerciseBreakdown({
  sessions,
}: ExerciseBreakdownProps) {
  const breakdown = calculateExerciseBreakdown(sessions);

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <div>
        <div className="flex items-center gap-2">
          <Activity
            size={21}
            className="text-green-500"
          />

          <h2 className="text-xl font-bold text-white">
            Exercise Breakdown
          </h2>
        </div>

        <p className="mt-2 text-sm text-zinc-500">
          See how your workout activity is distributed across exercises.
        </p>
      </div>

      {breakdown.length === 0 ? (
        <div className="mt-7 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-8 text-center">
          <Dumbbell
            size={36}
            className="mx-auto text-zinc-700"
          />

          <p className="mt-4 text-sm text-zinc-500">
            Complete and save workouts to build your exercise breakdown.
          </p>
        </div>
      ) : (
        <div className="mt-7 space-y-4">
          {breakdown.map((exercise) => (
            <article
              key={exercise.exerciseId}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="font-bold text-white">
                    {exercise.exerciseName}
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500">
                    {exercise.percentage.toFixed(1)}% of your saved workouts
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <BreakdownMetric
                    icon={<Dumbbell size={16} />}
                    value={`${exercise.workouts} ${
                      exercise.workouts === 1
                        ? "workout"
                        : "workouts"
                    }`}
                  />

                  <BreakdownMetric
                    icon={<Activity size={16} />}
                    value={`${exercise.reps} reps`}
                  />

                  <BreakdownMetric
                    icon={<Clock3 size={16} />}
                    value={formatDuration(exercise.seconds)}
                  />

                  <BreakdownMetric
                    icon={<Flame size={16} />}
                    value={`${exercise.calories.toFixed(1)} kcal`}
                  />
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{
                    width: `${exercise.percentage}%`,
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function BreakdownMetric({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300">
      <span className="text-green-500">
        {icon}
      </span>

      {value}
    </div>
  );
}

function calculateExerciseBreakdown(
  sessions: WorkoutSession[]
): ExerciseStats[] {
  const exerciseMap = new Map<
    string,
    Omit<ExerciseStats, "percentage">
  >();

  for (const session of sessions) {
    const existing =
      exerciseMap.get(session.exercise_id);

    if (existing) {
      existing.workouts += 1;
      existing.reps += session.reps;
      existing.seconds += session.duration_seconds;
      existing.calories += Number(
        session.estimated_calories
      );

      continue;
    }

    exerciseMap.set(session.exercise_id, {
      exerciseId: session.exercise_id,
      exerciseName: session.exercise_name,
      workouts: 1,
      reps: session.reps,
      seconds: session.duration_seconds,
      calories: Number(session.estimated_calories),
    });
  }

  return Array.from(exerciseMap.values())
    .map((exercise) => ({
      ...exercise,

      percentage:
        sessions.length > 0
          ? (exercise.workouts / sessions.length) * 100
          : 0,
    }))
    .sort((first, second) => {
      if (second.workouts !== first.workouts) {
        return second.workouts - first.workouts;
      }

      return second.reps - first.reps;
    });
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}