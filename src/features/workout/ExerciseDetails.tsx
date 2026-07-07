import { ArrowLeft, Bot, Flame, Target, TriangleAlert } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { exercises } from "./data/exercises";

export default function ExerciseDetails() {
  const navigate = useNavigate();
  const { exerciseId } = useParams();

  const exercise = exercises.find(
    (item) => item.id === exerciseId
  );

  if (!exercise) {
    return (
      <main className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
        <h1 className="text-3xl font-bold text-white">
          Exercise not found
        </h1>

        <button
          type="button"
          onClick={() => navigate("/workout")}
          className="mt-6 rounded-xl bg-green-500 px-6 py-3 font-semibold text-black"
        >
          Back to Workout Library
        </button>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <button
        type="button"
        onClick={() => navigate("/workout")}
        className="flex items-center gap-2 text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft size={18} />
        Back to Workout Library
      </button>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-400">
                {exercise.category}
              </span>

              <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-400">
                {exercise.difficulty}
              </span>

              {exercise.aiCompatible && (
                <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
                  <Bot size={14} />
                  AI Tracking Supported
                </span>
              )}
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white">
              {exercise.name}
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
              {exercise.description}
            </p>
          </div>

          {exercise.aiCompatible && (
            <button
              type="button"
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-black transition hover:bg-green-400"
            >
              <Bot size={19} />
              Start AI Workout
            </button>
          )}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <InfoCard
          icon={<Target size={20} />}
          title="Target Muscles"
          value={exercise.targetMuscles.join(", ")}
        />

        <InfoCard
          icon={<Flame size={20} />}
          title="Estimated Calories"
          value={`~${exercise.caloriesPerMinute} kcal/min`}
        />

        <InfoCard
          icon={<Bot size={20} />}
          title="AI Tracking"
          value={exercise.aiCompatible ? "Supported" : "Not Supported"}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white">
            How to Perform
          </h2>

          <ol className="mt-6 space-y-4">
            {exercise.instructions.map((instruction, index) => (
              <li
                key={instruction}
                className="flex gap-4 rounded-2xl bg-zinc-950 p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500 font-bold text-black">
                  {index + 1}
                </span>

                <p className="pt-1 leading-6 text-zinc-300">
                  {instruction}
                </p>
              </li>
            ))}
          </ol>
        </article>

        <article className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <TriangleAlert className="text-yellow-500" size={24} />

            <h2 className="text-2xl font-bold text-white">
              Common Mistakes
            </h2>
          </div>

          <ul className="mt-6 space-y-4">
            {exercise.commonMistakes.map((mistake) => (
              <li
                key={mistake}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 leading-6 text-zinc-300"
              >
                {mistake}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
        {icon}
      </div>

      <p className="mt-4 text-sm text-zinc-500">{title}</p>

      <p className="mt-2 font-semibold text-white">{value}</p>
    </article>
  );
}