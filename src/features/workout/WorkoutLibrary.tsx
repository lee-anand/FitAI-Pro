import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Flame, Search } from "lucide-react";

import { exercises } from "./data/exercises";

import type {
  ExerciseCategory,
  ExerciseDifficulty,
} from "../../types/exercise";

type CategoryFilter = "All" | ExerciseCategory;
type DifficultyFilter = "All" | ExerciseDifficulty;

const categories: CategoryFilter[] = [
  "All",
  "Upper Body",
  "Lower Body",
  "Core",
];

const difficulties: DifficultyFilter[] = [
  "All",
  "Beginner",
  "Intermediate",
  "Advanced",
];

export default function WorkoutLibrary() {
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<CategoryFilter>("All");

  const navigate = useNavigate();

  const [difficulty, setDifficulty] =
    useState<DifficultyFilter>("All");

  const [aiOnly, setAiOnly] = useState(false);

  const filteredExercises = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return exercises.filter((exercise) => {
      const matchesSearch =
        normalizedSearch === "" ||
        exercise.name.toLowerCase().includes(normalizedSearch) ||
        exercise.targetMuscles.some((muscle) =>
          muscle.toLowerCase().includes(normalizedSearch)
        );

      const matchesCategory =
        category === "All" || exercise.category === category;

      const matchesDifficulty =
        difficulty === "All" ||
        exercise.difficulty === difficulty;

      const matchesAI = !aiOnly || exercise.aiCompatible;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDifficulty &&
        matchesAI
      );
    });
  }, [search, category, difficulty, aiOnly]);

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setDifficulty("All");
    setAiOnly(false);
  }

  return (
    <main className="space-y-8">
      {/* HEADER */}

      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-500">
          Training
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Workout Library
        </h1>

        <p className="mt-3 max-w-2xl text-zinc-400">
          Explore exercises, filter by training category and difficulty,
          and discover movements supported by FitAI pose tracking.
        </p>
      </section>

      {/* FILTER PANEL */}

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto_auto]">
          {/* SEARCH */}

          <label className="relative block">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search exercises or muscles..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-green-500"
            />
          </label>

          {/* CATEGORY */}

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as CategoryFilter)
            }
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-green-500"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Categories" : item}
              </option>
            ))}
          </select>

          {/* DIFFICULTY */}

          <select
            value={difficulty}
            onChange={(event) =>
              setDifficulty(event.target.value as DifficultyFilter)
            }
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-green-500"
          >
            {difficulties.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Difficulties" : item}
              </option>
            ))}
          </select>

          {/* AI FILTER */}

          <button
            type="button"
            onClick={() => setAiOnly((previous) => !previous)}
            className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-3 font-medium transition ${
              aiOnly
                ? "border-green-500 bg-green-500 text-black"
                : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500"
            }`}
          >
            <Bot size={18} />

            AI Tracking
          </button>
        </div>
      </section>

      {/* RESULT COUNT */}

      <section className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">
          Showing{" "}
          <span className="font-semibold text-white">
            {filteredExercises.length}
          </span>{" "}
          exercises
        </p>

        {(search ||
          category !== "All" ||
          difficulty !== "All" ||
          aiOnly) && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-green-500 transition hover:text-green-400"
          >
            Clear filters
          </button>
        )}
      </section>

      {/* EXERCISE GRID */}

      {filteredExercises.length > 0 ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredExercises.map((exercise) => (
            <article
              key={exercise.id}
              className="group flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900 p-6 transition duration-300 hover:-translate-y-1 hover:border-green-500/40"
            >
              {/* CARD HEADER */}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs font-medium text-zinc-400">
                    {exercise.category}
                  </span>

                  <h2 className="mt-4 text-xl font-bold text-white">
                    {exercise.name}
                  </h2>
                </div>

                {exercise.aiCompatible && (
                  <div
                    title="Supported by FitAI pose tracking"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500"
                  >
                    <Bot size={20} />
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}

              <p className="mt-4 line-clamp-3 leading-6 text-zinc-400">
                {exercise.description}
              </p>

              {/* MUSCLES */}

              <div className="mt-5 flex flex-wrap gap-2">
                {exercise.targetMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400"
                  >
                    {muscle}
                  </span>
                ))}
              </div>

              {/* META */}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-zinc-950 p-3">
                  <p className="text-xs text-zinc-600">
                    Difficulty
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    {exercise.difficulty}
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-950 p-3">
                  <p className="flex items-center gap-1 text-xs text-zinc-600">
                    <Flame size={13} />
                    Calories
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    ~{exercise.caloriesPerMinute} kcal/min
                  </p>
                </div>
              </div>

              {/* BUTTON */}

              <button
  type="button"
  onClick={() => navigate(`/workout/${exercise.id}`)}
  className="mt-6 w-full rounded-xl bg-zinc-800 px-5 py-3 font-semibold text-white transition hover:bg-green-500 hover:text-black"
>
  View Exercise
</button>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900 p-12 text-center">
          <h2 className="text-xl font-bold text-white">
            No exercises found
          </h2>

          <p className="mt-2 text-zinc-500">
            Try changing your search or filters.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-6 rounded-xl bg-green-500 px-6 py-3 font-semibold text-black"
          >
            Reset Filters
          </button>
        </section>
      )}
    </main>
  );
}