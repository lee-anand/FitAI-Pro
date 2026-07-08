import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Dumbbell,
  Flame,
  LoaderCircle,
  Trash2,
} from "lucide-react";

import {
  deleteWorkoutSession,
  getWorkoutHistory,
  type WorkoutSession,
} from "../../service/workoutService";

export default function WorkoutHistory() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    setError("");

    const { data, error } = await getWorkoutHistory();

    if (error) {
      console.error("WORKOUT HISTORY ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load workout history."
      );

      setLoading(false);
      return;
    }

    setSessions(data ?? []);
    setLoading(false);
  }

  async function handleDelete(sessionId: string) {
    if (deletingId) {
      return;
    }

    setDeletingId(sessionId);
    setError("");

    const { error } = await deleteWorkoutSession(sessionId);

    if (error) {
      console.error("DELETE WORKOUT ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete workout."
      );

      setDeletingId(null);
      return;
    }

    setSessions((currentSessions) =>
      currentSessions.filter(
        (session) => session.id !== sessionId
      )
    );

    setDeletingId(null);
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-400">
          <LoaderCircle className="animate-spin" size={22} />
          Loading workout history...
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-500">
          Workout History
        </p>

        <h1 className="mt-3 text-3xl font-bold text-white">
          Your Completed Workouts
        </h1>

        <p className="mt-2 text-zinc-400">
          Review the AI workout sessions saved to your account.
        </p>
      </section>

      {error && (
        <section className="rounded-2xl border border-red-900/60 bg-red-950/30 px-5 py-4 text-sm text-red-400">
          {error}
        </section>
      )}

      {sessions.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900 p-12 text-center">
          <Dumbbell
            size={42}
            className="mx-auto text-zinc-700"
          />

          <h2 className="mt-5 text-xl font-bold text-white">
            No Workouts Yet
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Complete and save an AI workout session to see it here.
          </p>
        </section>
      ) : (
        <section className="grid gap-4">
          {sessions.map((session) => (
            <article
              key={session.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700 sm:p-6"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {session.exercise_name}
                  </h2>

                  <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
                    <CalendarDays size={16} />

                    {formatWorkoutDate(session.completed_at)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <HistoryMetric
                    icon={<Dumbbell size={17} />}
                    label={`${session.reps} reps`}
                  />

                  <HistoryMetric
                    icon={<Clock3 size={17} />}
                    label={formatDuration(session.duration_seconds)}
                  />

                  <HistoryMetric
                    icon={<Flame size={17} />}
                    label={`${Number(
                      session.estimated_calories
                    ).toFixed(1)} kcal`}
                  />

                  <button
                    type="button"
                    disabled={deletingId === session.id}
                    onClick={() => handleDelete(session.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-900/60 text-red-400 transition hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Delete ${session.exercise_name} workout`}
                  >
                    {deletingId === session.id ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

function HistoryMetric({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2 text-sm text-zinc-300">
      <span className="text-green-500">{icon}</span>
      {label}
    </div>
  );
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function formatWorkoutDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}