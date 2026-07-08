import {
  Bot,
  BrainCircuit,
  LoaderCircle,
  Play,
  Sparkles,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useUser } from "../../../context/UserContext";

import type { WorkoutSession } from "../../../service/workoutService";

type AIRecommendationProps = {
  sessions: WorkoutSession[];
  loading: boolean;
};

type Recommendation = {
  title: string;
  description: string;
  workout: string;
  exerciseId: string | null;
  reason: string;
};

export default function AIRecommendation({
  sessions,
  loading,
}: AIRecommendationProps) {
  const { profile } = useUser();

  const navigate = useNavigate();

  const recommendation = getRecommendation(
    profile,
    sessions
  );

  function handleStartWorkout() {
    if (!profile) {
      navigate("/profile-setup");
      return;
    }

    if (recommendation.exerciseId) {
      navigate(
        `/workout/${recommendation.exerciseId}`
      );

      return;
    }

    navigate("/workout");
  }

  if (loading) {
    return (
      <section className="flex min-h-[420px] w-full min-w-0 items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <LoaderCircle
            size={20}
            className="animate-spin text-green-500"
          />

          Analyzing your workout activity...
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-w-0 flex-col rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      {/* HEADER */}

      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
          <Bot size={23} />
        </div>

        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-green-500">
            AI Recommendation

            <Sparkles size={14} />
          </p>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Based on your fitness profile and workout history
          </p>
        </div>
      </div>

      {/* RECOMMENDATION */}

      <div className="mt-6 min-w-0">
        <h2 className="text-2xl font-bold leading-tight text-white">
          {recommendation.title}
        </h2>

        <p className="mt-3 leading-7 text-zinc-400">
          {recommendation.description}
        </p>
      </div>

      {/* REASON */}

      <div className="mt-5 flex min-w-0 items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <BrainCircuit
          size={19}
          className="mt-0.5 shrink-0 text-green-500"
        />

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Why this recommendation?
          </p>

          <p className="mt-2 break-words text-sm leading-6 text-zinc-400">
            {recommendation.reason}
          </p>
        </div>
      </div>

      {/* PROFILE INFORMATION */}

      {profile && (
        <div className="mt-5 flex min-w-0 flex-wrap gap-2">
          <RecommendationBadge
            label={`Goal: ${
              profile.goal ?? "General Fitness"
            }`}
          />

          <RecommendationBadge
            label={`Activity: ${
              profile.activity_level ?? "Unknown"
            }`}
          />

          {profile.tdee != null && (
            <RecommendationBadge
              label={`Daily Energy: ${Math.round(
                Number(profile.tdee)
              )} kcal`}
            />
          )}

          <RecommendationBadge
            label={`${sessions.length} saved workout${
              sessions.length === 1 ? "" : "s"
            }`}
          />
        </div>
      )}

      {/* ACTION */}

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={handleStartWorkout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-semibold text-black transition hover:bg-green-400"
        >
          <Play size={18} />

          {profile
            ? `Start ${recommendation.workout}`
            : "Complete Profile"}
        </button>
      </div>
    </section>
  );
}

function RecommendationBadge({
  label,
}: {
  label: string;
}) {
  return (
    <span className="max-w-full break-words rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-400">
      {label}
    </span>
  );
}

function getRecommendation(
  profile: ReturnType<typeof useUser>["profile"],
  sessions: WorkoutSession[]
): Recommendation {
  if (!profile) {
    return {
      title: "Complete your fitness profile",
      description:
        "Add your goal, activity level, and body information to receive personalized workout recommendations.",
      workout: "Profile Setup",
      exerciseId: null,
      reason:
        "Your fitness profile is required before FitAI Pro can generate personalized training suggestions.",
    };
  }

  /*
    SORT NEWEST → OLDEST
  */

  const sortedSessions = [...sessions].sort(
    (first, second) =>
      new Date(second.completed_at).getTime() -
      new Date(first.completed_at).getTime()
  );

  /*
    NEW USER
  */

  if (sortedSessions.length === 0) {
    return getGoalBasedStarterRecommendation(
      profile.goal
    );
  }

  /*
    LAST WORKOUT DATE
  */

  const latestSession = sortedSessions[0];

  const daysSinceLastWorkout =
    getCalendarDayDifference(
      new Date(latestSession.completed_at),
      new Date()
    );

  /*
    LAST 7 DAYS
  */

  const sevenDaysAgo = new Date();

  sevenDaysAgo.setDate(
    sevenDaysAgo.getDate() - 6
  );

  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentSessions = sortedSessions.filter(
    (session) =>
      new Date(session.completed_at) >= sevenDaysAgo
  );

  /*
    EXERCISE COUNTS
  */

  const exerciseCounts =
    recentSessions.reduce<Record<string, number>>(
      (counts, session) => {
        counts[session.exercise_id] =
          (counts[session.exercise_id] ?? 0) + 1;

        return counts;
      },
      {}
    );

  const mostTrainedExerciseId =
    Object.entries(exerciseCounts).sort(
      (first, second) =>
        second[1] - first[1]
    )[0]?.[0];

  /*
    RETURNING AFTER INACTIVITY
  */

  if (daysSinceLastWorkout >= 4) {
    return {
      title:
        "Restart with a controlled full-body session",
      description:
        "You have had several days away from training. Return with a moderate session and focus on movement quality instead of maximum intensity.",
      workout: "Bodyweight Squat",
      exerciseId: "bodyweight-squat",
      reason: `Your latest saved workout was ${daysSinceLastWorkout} days ago, so a controlled return session is a better choice than immediately increasing training intensity.`,
    };
  }

  /*
    HIGH RECENT FREQUENCY
  */

  if (recentSessions.length >= 6) {
    return {
      title:
        "Prioritize recovery and core stability",
      description:
        "Your recent workout frequency is high. Choose a lower-impact session and allow heavily trained muscle groups time to recover.",
      workout: "Plank",
      exerciseId: "plank",
      reason: `You completed ${recentSessions.length} workouts during the last 7 days. Recovery is important for maintaining training quality and reducing unnecessary fatigue.`,
    };
  }

  /*
    MUSCLE GAIN
  */

  if (profile.goal === "Gain Muscle") {
    if (
      mostTrainedExerciseId === "push-up" ||
      mostTrainedExerciseId ===
        "diamond-push-up" ||
      mostTrainedExerciseId ===
        "pike-push-up" ||
      mostTrainedExerciseId === "bicep-curl"
    ) {
      return {
        title:
          "Balance your training with lower-body work",
        description:
          "Your recent sessions favor upper-body exercises. Add lower-body training to build a more balanced routine.",
        workout: "Bodyweight Squat",
        exerciseId: "bodyweight-squat",
        reason:
          "Your recent workout history shows repeated upper-body training, so FitAI Pro recommends training a different major muscle group.",
      };
    }

    return {
      title: "Build upper-body strength",
      description:
        "Continue developing strength with controlled repetitions, full range of motion, and gradual progression.",
      workout: "Push Up",
      exerciseId: "push-up",
      reason:
        "Your muscle-gain goal benefits from consistent resistance training and progressive increases in training volume.",
    };
  }

  /*
    WEIGHT LOSS
  */

  if (profile.goal === "Lose Weight") {
    return {
      title:
        "Increase full-body training activity",
      description:
        "Choose a dynamic exercise that combines cardiovascular demand with core stability and consistent movement.",
      workout: "Mountain Climber",
      exerciseId: "mountain-climber",
      reason:
        "Your weight-loss goal benefits from combining regular strength training with exercises that increase overall activity and energy expenditure.",
    };
  }

  /*
    ENDURANCE
  */

  if (profile.goal === "Improve Endurance") {
    return {
      title:
        "Build conditioning with continuous movement",
      description:
        "Use a controlled, continuous exercise session and gradually increase your workout duration over time.",
      workout: "Mountain Climber",
      exerciseId: "mountain-climber",
      reason:
        "Your endurance goal benefits from gradually increasing sustained activity and total weekly training volume.",
    };
  }

  /*
    GENERAL FITNESS
  */

  return {
    title: "Keep your weekly training balanced",
    description:
      "Continue building consistency by rotating between upper-body, lower-body, and core exercises.",
    workout: "Bodyweight Squat",
    exerciseId: "bodyweight-squat",
    reason:
      "A balanced exercise rotation helps prevent repeatedly training the same movement pattern while supporting general fitness.",
  };
}

function getGoalBasedStarterRecommendation(
  goal: string | null | undefined
): Recommendation {
  switch (goal) {
    case "Gain Muscle":
      return {
        title:
          "Start building your strength foundation",
        description:
          "Begin with a controlled upper-body exercise and focus on proper technique before increasing training volume.",
        workout: "Push Up",
        exerciseId: "push-up",
        reason:
          "You do not have saved workout history yet, so this recommendation is based on your muscle-gain goal.",
      };

    case "Lose Weight":
      return {
        title:
          "Start with an active full-body movement",
        description:
          "Begin building consistency with a dynamic exercise that increases activity while training core stability.",
        workout: "Mountain Climber",
        exerciseId: "mountain-climber",
        reason:
          "You do not have saved workout history yet, so this recommendation is based on your weight-loss goal.",
      };

    case "Improve Endurance":
      return {
        title:
          "Start building your conditioning base",
        description:
          "Begin with controlled continuous movement and gradually increase your training duration.",
        workout: "Mountain Climber",
        exerciseId: "mountain-climber",
        reason:
          "You do not have saved workout history yet, so this recommendation is based on your endurance goal.",
      };

    default:
      return {
        title:
          "Start building workout consistency",
        description:
          "Begin with a fundamental lower-body movement and focus on controlled repetitions and proper form.",
        workout: "Bodyweight Squat",
        exerciseId: "bodyweight-squat",
        reason:
          "You do not have enough workout history yet, so FitAI Pro recommends starting with a fundamental movement.",
      };
  }
}

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

  return Math.max(
    0,
    Math.round(
      (laterUtc - earlierUtc) /
        86_400_000
    )
  );
}