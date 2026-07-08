import {
  CheckCircle2,
  Dumbbell,
  LoaderCircle,
  Trophy,
} from "lucide-react";

import Card from "../../../components/ui/Card";
import SectionTitle from "../../../components/ui/SectionTitle";

import type { WorkoutSession } from "../../../service/workoutService";

type ChallengeCardProps = {
  sessions: WorkoutSession[];
  loading: boolean;
};

const PUSH_UP_TARGET = 100;

export default function ChallengeCard({
  sessions,
  loading,
}: ChallengeCardProps) {
  const todayKey = getLocalDateKey(new Date());

  const todayPushUpReps = sessions.reduce(
    (total, session) => {
      const sessionDate = getLocalDateKey(
        new Date(session.completed_at)
      );

      const isPushUp =
        session.exercise_id === "push-up";

      if (
        sessionDate === todayKey &&
        isPushUp
      ) {
        return total + session.reps;
      }

      return total;
    },
    0
  );

  const progress = Math.min(
    (todayPushUpReps / PUSH_UP_TARGET) * 100,
    100
  );

  const remainingReps = Math.max(
    PUSH_UP_TARGET - todayPushUpReps,
    0
  );

  const completed =
    todayPushUpReps >= PUSH_UP_TARGET;

  return (
    <div>
      <SectionTitle
        title="Today's Challenge"
        subtitle="Complete daily challenges and build consistency"
      />

      <Card>
        {loading ? (
          <div className="flex min-h-52 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <LoaderCircle
                size={20}
                className="animate-spin text-green-500"
              />

              Loading challenge progress...
            </div>
          </div>
        ) : (
          <>
            {/* HEADER */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Dumbbell
                    size={20}
                    className="text-green-500"
                  />

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-500">
                    Daily Challenge
                  </p>
                </div>

                <h3 className="mt-4 text-xl font-semibold text-white">
                  Complete 100 Push-ups
                </h3>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Complete 100 AI-tracked push-up repetitions today.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
                {completed ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <Trophy size={24} />
                )}
              </div>
            </div>

            {/* PROGRESS NUMBERS */}

            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">
                  Progress
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {todayPushUpReps}
                  <span className="text-base font-medium text-zinc-600">
                    {" "}
                    / {PUSH_UP_TARGET} reps
                  </span>
                </p>
              </div>

              <p className="text-lg font-bold text-green-500">
                {Math.round(progress)}%
              </p>
            </div>

            {/* PROGRESS BAR */}

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            {/* STATUS */}

            <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
              {completed ? (
                <p className="flex items-center gap-2 text-sm font-medium text-green-500">
                  <CheckCircle2 size={17} />

                  Challenge completed! You earned +100 XP.
                </p>
              ) : todayPushUpReps > 0 ? (
                <p className="text-sm text-zinc-400">
                  Keep going —{" "}
                  <span className="font-semibold text-white">
                    {remainingReps} reps
                  </span>{" "}
                  remaining to complete today's challenge.
                </p>
              ) : (
                <p className="text-sm text-zinc-400">
                  No push-ups recorded today. Start a workout to begin the
                  challenge.
                </p>
              )}
            </div>

            {/* REWARD */}

            <p className="mt-5 text-sm font-medium text-green-500">
              Reward: +100 XP
            </p>
          </>
        )}
      </Card>
    </div>
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