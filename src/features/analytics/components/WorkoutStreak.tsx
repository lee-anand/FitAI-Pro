import {
  CalendarCheck2,
  Flame,
  Trophy,
} from "lucide-react";

import type { WorkoutSession } from "../../../service/workoutService";


type WorkoutStreakProps = {
  sessions: WorkoutSession[];
};

export default function WorkoutStreak({
  sessions,
}: WorkoutStreakProps) {
  const streak = calculateWorkoutStreak(sessions);

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <div>
        <div className="flex items-center gap-2">
          <Flame
            size={21}
            className="text-green-500"
          />

          <h2 className="text-xl font-bold text-white">
            Workout Streak
          </h2>
        </div>

        <p className="mt-2 text-sm text-zinc-500">
          Stay consistent and keep building your training habit.
        </p>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <StreakCard
          icon={<Flame size={22} />}
          label="Current Streak"
          value={`${streak.currentStreak} ${
            streak.currentStreak === 1 ? "day" : "days"
          }`}
        />

        <StreakCard
          icon={<Trophy size={22} />}
          label="Longest Streak"
          value={`${streak.longestStreak} ${
            streak.longestStreak === 1 ? "day" : "days"
          }`}
        />

        <StreakCard
          icon={<CalendarCheck2 size={22} />}
          label="Active Days"
          value={String(streak.activeDays)}
        />
      </div>

      {streak.currentStreak > 0 && (
        <div className="mt-6 rounded-2xl border border-green-900/50 bg-green-950/20 px-5 py-4">
          <p className="text-sm font-medium text-green-400">
            {getStreakMessage(streak.currentStreak)}
          </p>
        </div>
      )}

      {streak.activeDays === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 px-5 py-4">
          <p className="text-center text-sm text-zinc-500">
            Complete and save a workout to start your streak.
          </p>
        </div>
      )}
    </section>
  );
}

function StreakCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
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

function calculateWorkoutStreak(
  sessions: WorkoutSession[]
) {
  /*
    Create one unique local date for every day
    containing at least one saved workout.
  */

  const workoutDates = Array.from(
    new Set(
      sessions.map((session) =>
        getLocalDateKey(
          new Date(session.completed_at)
        )
      )
    )
  )
    .map((key) => parseLocalDateKey(key))
    .sort(
      (first, second) =>
        first.getTime() - second.getTime()
    );

  if (workoutDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      activeDays: 0,
    };
  }

  /*
    LONGEST STREAK
  */

  let longestStreak = 1;
  let runningStreak = 1;

  for (
    let index = 1;
    index < workoutDates.length;
    index += 1
  ) {
    const previousDate =
      workoutDates[index - 1];

    const currentDate =
      workoutDates[index];

    const difference =
      getCalendarDayDifference(
        previousDate,
        currentDate
      );

    if (difference === 1) {
      runningStreak += 1;

      longestStreak = Math.max(
        longestStreak,
        runningStreak
      );
    } else {
      runningStreak = 1;
    }
  }

  /*
    CURRENT STREAK

    A streak remains active if the latest
    workout was today OR yesterday.

    This prevents the streak from becoming
    zero before the user has had a chance
    to work out today.
  */

  const today = startOfLocalDay(new Date());

  const latestWorkoutDate =
    workoutDates[workoutDates.length - 1];

  const daysSinceLatestWorkout =
    getCalendarDayDifference(
      latestWorkoutDate,
      today
    );

  let currentStreak = 0;

  if (
    daysSinceLatestWorkout === 0 ||
    daysSinceLatestWorkout === 1
  ) {
    currentStreak = 1;

    for (
      let index = workoutDates.length - 1;
      index > 0;
      index -= 1
    ) {
      const currentDate =
        workoutDates[index];

      const previousDate =
        workoutDates[index - 1];

      const difference =
        getCalendarDayDifference(
          previousDate,
          currentDate
        );

      if (difference !== 1) {
        break;
      }

      currentStreak += 1;
    }
  }

  return {
    currentStreak,
    longestStreak,
    activeDays: workoutDates.length,
  };
}

function getStreakMessage(
  currentStreak: number
) {
  if (currentStreak >= 30) {
    return `Outstanding consistency — ${currentStreak} consecutive workout days.`;
  }

  if (currentStreak >= 14) {
    return `Excellent work — your ${currentStreak}-day streak is growing strong.`;
  }

  if (currentStreak >= 7) {
    return `One week strong — you've maintained a ${currentStreak}-day workout streak.`;
  }

  if (currentStreak >= 3) {
    return `You're building momentum with a ${currentStreak}-day workout streak.`;
  }

  return `Your workout streak is active. Train again to keep it growing.`;
}

/*
  LOCAL DATE HELPERS

  We use local calendar dates instead of UTC
  so workouts around midnight are assigned
  to the correct day.
*/

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

function parseLocalDateKey(key: string) {
  const [year, month, day] = key
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

/*
  Using UTC timestamps here avoids
  daylight-saving-time issues when
  calculating calendar-day differences.
*/

function getCalendarDayDifference(
  earlierDate: Date,
  laterDate: Date
) {
  const earlierUtc = Date.UTC(
    earlierDate.getFullYear(),
    earlierDate.getMonth(),
    earlierDate.getDate()
  );

  const laterUtc = Date.UTC(
    laterDate.getFullYear(),
    laterDate.getMonth(),
    laterDate.getDate()
  );

  return Math.round(
    (laterUtc - earlierUtc) /
      86_400_000
  );
}