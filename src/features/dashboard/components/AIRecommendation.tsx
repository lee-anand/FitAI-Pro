import { useUser } from "../../../context/UserContext";

export default function AIRecommendation() {
  const { profile } = useUser();

  function getRecommendation() {
    if (!profile) {
      return {
        title: "Complete your profile",
        description:
          "Complete your profile to receive personalized workout recommendations.",
        workout: "Profile Setup",
      };
    }

    switch (profile.goal) {
      case "Gain Muscle":
        return {
          title: "Focus on progressive overload",
          description:
            profile.activity_level === "Sedentary" ||
            profile.activity_level === "Light"
              ? "Start with 3 strength workouts per week and focus on proper form before increasing training volume."
              : "Prioritize compound movements, progressive overload, recovery, and consistent protein intake.",
          workout: "Upper Body Strength",
        };

      case "Lose Weight":
        return {
          title: "Combine strength and cardio",
          description:
            "Maintain regular strength training while adding moderate cardio sessions and keeping your nutrition consistent.",
          workout: "Full Body Fat Burn",
        };

      case "Improve Endurance":
        return {
          title: "Build your aerobic capacity",
          description:
            "Combine steady-state cardio with interval training and gradually increase your weekly training volume.",
          workout: "Endurance Training",
        };

      default:
        return {
          title: "Build consistency this week",
          description:
            "Follow a balanced routine of strength, mobility, and cardio training while maintaining adequate recovery.",
          workout: "Full Body Workout",
        };
    }
  }

  const recommendation = getRecommendation();

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-xl">
              🤖
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-500">
                AI Recommendation
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Based on your current fitness profile
              </p>
            </div>
          </div>

          <h2 className="mt-6 text-2xl font-bold text-white">
            {recommendation.title}
          </h2>

          <p className="mt-3 leading-7 text-zinc-400">
            {recommendation.description}
          </p>

          {profile && (
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-400">
                Goal: {profile.goal}
              </span>

              <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-400">
                Activity: {profile.activity_level}
              </span>

              <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-400">
                Daily Energy: {Math.round(Number(profile.tdee))} kcal
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="shrink-0 rounded-xl bg-green-500 px-6 py-3 font-semibold text-black transition hover:bg-green-400"
        >
          Start {recommendation.workout}
        </button>
      </div>
    </section>
  );
}