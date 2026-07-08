import {
  CalendarDays,
  Clock3,
  Dumbbell,
  LoaderCircle,
} from "lucide-react";

import Card from "../../../components/ui/Card";
import SectionTitle from "../../../components/ui/SectionTitle";

import type { WorkoutSession } from "../../../service/workoutService";

type WeeklyProgressProps = {
  sessions: WorkoutSession[];
  loading: boolean;
};

type DayProgress = {
  key: string;
  day: string;
  date: string;
  seconds: number;
  workouts: number;
  isToday: boolean;
};

export default function WeeklyProgress({
  sessions,
  loading,
}: WeeklyProgressProps) {
  const weeklyProgress = calculateWeeklyProgress(sessions);

  const maximumSeconds = Math.max(
    ...weeklyProgress.map((item) => item.seconds),
    1
  );

  const weeklyWorkouts = weeklyProgress.reduce(
    (total, item) => total + item.workouts,
    0
  );

  const weeklySeconds = weeklyProgress.reduce(
    (total, item) => total + item.seconds,
    0
  );

  return (
    <div>
      <SectionTitle
        title="Weekly Progress"
        subtitle="Your workout activity during the last 7 days"
      />

      <Card>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <LoaderCircle
                size={20}
                className="animate-spin text-green-500"
              />

              Loading weekly progress...
            </div>
          </div>
        ) : (
          <>
            {/* WEEKLY SUMMARY */}

            <div className="mb-6 flex flex-wrap gap-3">
              <SummaryBadge
                icon={<Dumbbell size={15} />}
                value={`${weeklyWorkouts} ${
                  weeklyWorkouts === 1
                    ? "workout"
                    : "workouts"
                }`}
              />

              <SummaryBadge
                icon={<Clock3 size={15} />}
                value={formatTotalDuration(weeklySeconds)}
              />

              <SummaryBadge
                icon={<CalendarDays size={15} />}
                value={`${
                  weeklyProgress.filter(
                    (item) => item.workouts > 0
                  ).length
                } active days`}
              />
            </div>

            {/* CHART */}

            <div className="w-full min-w-0">
  <div className="w-full min-w-0">
    <div className="grid h-52 grid-cols-7 items-end gap-2 border-b border-zinc-800">
                  {weeklyProgress.map((item) => {
                    const percentage =
                      (item.seconds / maximumSeconds) * 100;

                    const barHeight =
                      item.seconds > 0
                        ? Math.max(percentage, 10)
                        : 0;

                    return (
                      <div
                        key={item.key}
                        className="flex h-full flex-1 flex-col items-center justify-end"
                      >
                        {/* VALUE */}

                        <div className="mb-2 min-h-8 text-center">
                          {item.seconds > 0 && (
                            <p className="text-xs font-semibold text-zinc-300">
                              {formatChartDuration(
                                item.seconds
                              )}
                            </p>
                          )}
                        </div>

                        {/* BAR AREA */}

                        <div className="flex h-36 w-full items-end justify-center">
                          <div
                            className={`w-8 rounded-t-lg transition-all duration-500 hover:bg-green-400 ${
                              item.seconds > 0
                                ? "bg-green-500"
                                : "bg-zinc-800"
                            }`}
                            style={{
                              height:
                                item.seconds > 0
                                  ? `${barHeight}%`
                                  : "4px",
                            }}
                            title={`${item.date}: ${
                              item.workouts
                            } workout${
                              item.workouts === 1
                                ? ""
                                : "s"
                            }, ${formatTotalDuration(
                              item.seconds
                            )}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* DAY LABELS */}

                <div className="grid grid-cols-7 gap-2 pt-3">
                  {weeklyProgress.map((item) => (
                    <div
                      key={item.key}
                      className="flex-1 text-center"
                    >
                      <p
                        className={`text-sm font-medium ${
                          item.isToday
                            ? "text-green-500"
                            : "text-zinc-500"
                        }`}
                      >
                        {item.day}
                      </p>

                      {item.isToday && (
                        <p className="mt-1 text-[10px] font-semibold uppercase text-green-500">
                          Today
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* EMPTY WEEK */}

            {weeklyWorkouts === 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-5 text-center">
                <p className="text-sm text-zinc-500">
                  No workouts saved during the last 7 days.
                </p>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

function SummaryBadge({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-400">
      <span className="text-green-500">
        {icon}
      </span>

      {value}
    </div>
  );
}

function calculateWeeklyProgress(
  sessions: WorkoutSession[]
): DayProgress[] {
  const today = startOfLocalDay(new Date());

  const days: DayProgress[] = Array.from(
    {
      length: 7,
    },
    (_, index) => {
      const date = new Date(today);

      date.setDate(
        today.getDate() - (6 - index)
      );

      return {
        key: getLocalDateKey(date),

        day: new Intl.DateTimeFormat("en-IN", {
          weekday: "short",
        }).format(date),

        date: new Intl.DateTimeFormat("en-IN", {
          day: "numeric",
          month: "short",
        }).format(date),

        seconds: 0,

        workouts: 0,

        isToday:
          getLocalDateKey(date) ===
          getLocalDateKey(today),
      };
    }
  );

  const dayMap = new Map(
    days.map((day) => [
      day.key,
      day,
    ])
  );

  for (const session of sessions) {
    const completedDate = new Date(
      session.completed_at
    );

    const day = dayMap.get(
      getLocalDateKey(completedDate)
    );

    if (!day) {
      continue;
    }

    day.seconds += session.duration_seconds;

    day.workouts += 1;
  }

  return days;
}

function startOfLocalDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

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

  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;

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

  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}