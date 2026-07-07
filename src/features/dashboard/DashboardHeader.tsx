import { useUser } from "../../context/UserContext";

export default function DashboardHeader() {
  const { profile } = useUser();

  const firstName =
    profile?.full_name?.trim().split(" ")[0] || "Athlete";

  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-500">
          FitAI Pro
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Welcome back, {firstName}
        </h1>

        <p className="mt-2 text-zinc-400">
          Your goal is{" "}
          <span className="font-medium text-zinc-200">
            {profile?.goal || "Stay Fit"}
          </span>
          . Keep building consistency.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-3">
        <p className="text-xs uppercase tracking-wider text-zinc-500">
          Activity Level
        </p>

        <p className="mt-1 font-semibold text-white">
          {profile?.activity_level || "Not Set"}
        </p>
      </div>
    </header>
  );
}