import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  BarChart3,
  CalendarDays,
  Clock3,
  Dumbbell,
  Flame,
  LoaderCircle,
  Trophy,
} from "lucide-react";

import {
  getWorkoutHistory,
  type WorkoutSession,
} from "../../service/workoutService";
import WorkoutStreak from "./components/WorkoutStreak";
import ExerciseBreakdown from "./components/ExerciseBreakdown";
type WeeklyActivityDay = {
  key: string;
  label: string;
  dateLabel: string;
  seconds: number;
  workouts: number;
  calories: number;
  isToday: boolean;
};

export default function Analytics() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
    LOAD WORKOUT HISTORY
  */

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);

      setError("");

      const { data, error } =
        await getWorkoutHistory();

      if (error) {
        console.error(
          "ANALYTICS ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load workout analytics."
        );

        setLoading(false);

        return;
      }

      setSessions(data ?? []);

      setLoading(false);
    }

    loadAnalytics();
  }, []);

  /*
    OVERALL ANALYTICS
  */

  const analytics = useMemo(() => {
    const totalWorkouts = sessions.length;

    const totalReps = sessions.reduce(
      (total, session) =>
        total + session.reps,
      0
    );

    const totalSeconds = sessions.reduce(
      (total, session) =>
        total + session.duration_seconds,
      0
    );

    const totalCalories = sessions.reduce(
      (total, session) =>
        total +
        Number(
          session.estimated_calories
        ),
      0
    );

    /*
      COUNT EXERCISE OCCURRENCES
    */

    const exerciseCounts = sessions.reduce<
      Record<string, number>
    >((counts, session) => {
      counts[session.exercise_name] =
        (counts[session.exercise_name] ?? 0) +
        1;

      return counts;
    }, {});

    const favoriteExercise =
      Object.entries(exerciseCounts).sort(
        (first, second) =>
          second[1] - first[1]
      )[0]?.[0] ?? "No workouts yet";

    return {
      totalWorkouts,
      totalReps,
      totalSeconds,
      totalCalories,
      favoriteExercise,
    };
  }, [sessions]);

  /*
    LAST 7 DAYS ACTIVITY
  */

  const weeklyActivity =
    useMemo<WeeklyActivityDay[]>(() => {
      const today = startOfLocalDay(
        new Date()
      );

      /*
        Create 7 days:

        6 days ago → Today
      */

      const days =
        Array.from(
          {
            length: 7,
          },
          (_, index) => {
            const date = new Date(today);

            date.setDate(
              today.getDate() -
                (6 - index)
            );

            return {
              key: getLocalDateKey(date),

              label:
                new Intl.DateTimeFormat(
                  "en-IN",
                  {
                    weekday: "short",
                  }
                ).format(date),

              dateLabel:
                new Intl.DateTimeFormat(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                  }
                ).format(date),

              seconds: 0,

              workouts: 0,

              calories: 0,

              isToday:
                getLocalDateKey(date) ===
                getLocalDateKey(today),
            };
          }
        );

      /*
        Fast lookup:

        YYYY-MM-DD → day
      */

      const dayMap = new Map(
        days.map((day) => [
          day.key,
          day,
        ])
      );

      /*
        Add workout data
      */

      for (const session of sessions) {
        const completedDate = new Date(
          session.completed_at
        );

        const key =
          getLocalDateKey(completedDate);

        const day = dayMap.get(key);

        if (!day) {
          continue;
        }

        day.seconds +=
          session.duration_seconds;

        day.workouts += 1;

        day.calories += Number(
          session.estimated_calories
        );
      }

      return days;
    }, [sessions]);

  /*
    CHART MAXIMUM

    Used to calculate relative bar height.
  */

  const maximumWeeklySeconds =
    useMemo(() => {
      return Math.max(
        ...weeklyActivity.map(
          (day) => day.seconds
        ),
        1
      );
    }, [weeklyActivity]);

  /*
    WEEKLY TOTALS
  */

  const weeklyTotals =
    useMemo(() => {
      return weeklyActivity.reduce(
        (totals, day) => {
          totals.workouts +=
            day.workouts;

          totals.seconds += day.seconds;

          totals.calories +=
            day.calories;

          return totals;
        },
        {
          workouts: 0,
          seconds: 0,
          calories: 0,
        }
      );
    }, [weeklyActivity]);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-400">
          <LoaderCircle
            size={22}
            className="animate-spin"
          />

          Loading analytics...
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* HEADER */}

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-green-500">
          <BarChart3 size={18} />

          Workout Analytics
        </div>

        <h1 className="mt-3 text-3xl font-bold text-white">
          Your Fitness Progress
        </h1>

        <p className="mt-2 text-zinc-400">
          Insights calculated from your
          saved AI workout sessions.
        </p>
      </section>

      {/* ERROR */}

      {error && (
        <section className="rounded-2xl border border-red-900/60 bg-red-950/30 px-5 py-4 text-sm text-red-400">
          {error}
        </section>
      )}

      {/* SUMMARY CARDS */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard
          icon={<Dumbbell size={22} />}
          title="Total Workouts"
          value={String(
            analytics.totalWorkouts
          )}
        />

        <AnalyticsCard
          icon={<Activity size={22} />}
          title="Total Repetitions"
          value={String(
            analytics.totalReps
          )}
        />

        <AnalyticsCard
          icon={<Clock3 size={22} />}
          title="Workout Time"
          value={formatTotalDuration(
            analytics.totalSeconds
          )}
        />

        <AnalyticsCard
          icon={<Flame size={22} />}
          title="Calories Burned"
          value={`${analytics.totalCalories.toFixed(
            1
          )} kcal`}
        />
      </section>

      {/* WEEKLY ACTIVITY CHART */}

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays
                size={20}
                className="text-green-500"
              />

              <h2 className="text-xl font-bold text-white">
                Weekly Activity
              </h2>
            </div>

            <p className="mt-2 text-sm text-zinc-500">
              Your workout time during the
              last 7 days.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <WeeklyBadge
              label={`${weeklyTotals.workouts} workout${
                weeklyTotals.workouts === 1
                  ? ""
                  : "s"
              }`}
            />

            <WeeklyBadge
              label={formatTotalDuration(
                weeklyTotals.seconds
              )}
            />

            <WeeklyBadge
              label={`${weeklyTotals.calories.toFixed(
                1
              )} kcal`}
            />
          </div>
        </div>

        {/* CHART */}

        <div className="mt-8 overflow-x-auto">
          <div className="min-w-[620px]">
            <div className="flex h-64 items-end gap-3 border-b border-zinc-800">
              {weeklyActivity.map((day) => {
                const percentage =
                  (day.seconds /
                    maximumWeeklySeconds) *
                  100;

                /*
                  Give days with workouts a
                  minimum visible bar height.
                */

                const barHeight =
                  day.seconds > 0
                    ? Math.max(
                        percentage,
                        8
                      )
                    : 0;

                return (
                  <div
                    key={day.key}
                    className="flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <div className="mb-3 min-h-10 text-center">
                      {day.seconds > 0 && (
                        <>
                          <p className="text-xs font-semibold text-white">
                            {formatChartDuration(
                              day.seconds
                            )}
                          </p>

                          <p className="mt-1 text-[11px] text-zinc-600">
                            {day.workouts}{" "}
                            {day.workouts === 1
                              ? "session"
                              : "sessions"}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex h-44 w-full items-end justify-center">
                      <div
                        className={`w-full max-w-12 rounded-t-xl transition-all duration-500 ${
                          day.seconds > 0
                            ? day.isToday
                              ? "bg-green-400"
                              : "bg-green-500"
                            : "bg-zinc-800"
                        }`}
                        style={{
                          height:
                            day.seconds > 0
                              ? `${barHeight}%`
                              : "4px",
                        }}
                        title={`${day.dateLabel}: ${formatChartDuration(
                          day.seconds
                        )}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X AXIS LABELS */}

            <div className="flex gap-3 pt-4">
              {weeklyActivity.map((day) => (
                <div
                  key={day.key}
                  className="flex-1 text-center"
                >
                  <p
                    className={`text-sm font-semibold ${
                      day.isToday
                        ? "text-green-500"
                        : "text-zinc-400"
                    }`}
                  >
                    {day.label}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    {day.dateLabel}
                  </p>

                  {day.isToday && (
                    <span className="mt-2 inline-block rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-green-500">
                      Today
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {weeklyTotals.workouts === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-5 text-center text-sm text-zinc-500">
            No workouts saved during the
            last 7 days.
          </div>
        )}
      </section>
      {/* WORKOUT STREAK */}

<WorkoutStreak sessions={sessions} />

{/* EXERCISE BREAKDOWN */}

<ExerciseBreakdown sessions={sessions} />

      {/* FAVORITE EXERCISE */}

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
            <Trophy size={22} />
          </div>

          <div>
            <p className="text-sm text-zinc-500">
              Most Performed Exercise
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              {analytics.favoriteExercise}
            </h2>
          </div>
        </div>
      </section>

      {/* EMPTY STATE */}

      {sessions.length === 0 && (
        <section className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900 p-12 text-center">
          <BarChart3
            size={42}
            className="mx-auto text-zinc-700"
          />

          <h2 className="mt-5 text-xl font-bold text-white">
            No Analytics Yet
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Complete and save workouts to
            start building your fitness
            analytics.
          </p>
        </section>
      )}
    </main>
  );
}

function AnalyticsCard({
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

      <p className="mt-2 text-3xl font-bold text-white">
        {value}
      </p>
    </article>
  );
}

function WeeklyBadge({
  label,
}: {
  label: string;
}) {
  return (
    <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-medium text-zinc-400">
      {label}
    </span>
  );
}

/*
  NORMALIZE DATE TO LOCAL MIDNIGHT
*/

function startOfLocalDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

/*
  LOCAL YYYY-MM-DD KEY

  We intentionally do not use toISOString()
  because that uses UTC and could place
  workouts on the wrong day in India.
*/

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatChartDuration(
  totalSeconds: number
) {
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(
    totalSeconds / 60
  );

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  const remainingMinutes =
    minutes % 60;

  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
}

function formatTotalDuration(
  totalSeconds: number
) {
  const hours = Math.floor(
    totalSeconds / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds =
    totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}