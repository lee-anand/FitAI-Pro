import {
  Activity,
  Clock3,
  Dumbbell,
  Flame,
  HeartPulse,
  LoaderCircle,
  Ruler,
  Scale,
  Utensils,
} from "lucide-react";

import { useUser } from "../../context/UserContext";

import type { DashboardWorkoutStats } from "./components/Dashboard";

type DashboardStatsProps = {
  stats: DashboardWorkoutStats;
  loading: boolean;
};

export default function DashboardStats({
  stats,
  loading,
}: DashboardStatsProps) {
  const { profile } = useUser();

  const workoutStats = [
    {
      title: "Total Workouts",
      value: String(stats.totalWorkouts),
      subtitle: "Saved workout sessions",
      icon: <Dumbbell size={21} />,
    },
    {
      title: "Total Repetitions",
      value: String(stats.totalReps),
      subtitle: "AI-tracked completed reps",
      icon: <Activity size={21} />,
    },
    {
      title: "Workout Time",
      value: formatWorkoutTime(stats.totalSeconds),
      subtitle: "Total training duration",
      icon: <Clock3 size={21} />,
    },
    {
      title: "Calories Burned",
      value: `${stats.totalCalories.toFixed(1)} kcal`,
      subtitle: "Estimated from saved workouts",
      icon: <Flame size={21} />,
    },
  ];

  const profileStats = [
    {
      title: "Weight",
      value:
        profile?.weight != null
          ? `${Number(profile.weight).toFixed(1)} kg`
          : "--",
      subtitle: "Current body weight",
      icon: <Scale size={21} />,
    },
    {
      title: "BMI",
      value:
        profile?.bmi != null
          ? Number(profile.bmi).toFixed(1)
          : "--",
      subtitle: "Body Mass Index",
      icon: <HeartPulse size={21} />,
    },
    {
      title: "Daily Calories",
      value:
        profile?.tdee != null
          ? `${Math.round(Number(profile.tdee))} kcal`
          : "--",
      subtitle: "Estimated daily energy needs",
      icon: <Utensils size={21} />,
    },
    {
      title: "Height",
      value:
        profile?.height != null
          ? `${Number(profile.height)} cm`
          : "--",
      subtitle: "Current height",
      icon: <Ruler size={21} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* WORKOUT STATS */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white">
            Workout Overview
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Your progress from saved AI workout sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {workoutStats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              loading={loading}
            />
          ))}
        </div>
      </section>

      {/* PROFILE STATS */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white">
            Body Profile
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Your current fitness profile and estimated daily needs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {profileStats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              loading={false}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  loading,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <article className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition duration-300 hover:-translate-y-1 hover:border-green-500/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            {title}
          </p>

          {loading ? (
            <div className="mt-3 flex h-8 items-center">
              <LoaderCircle
                size={21}
                className="animate-spin text-green-500"
              />
            </div>
          ) : (
            <h3 className="mt-3 text-2xl font-bold text-white">
              {value}
            </h3>
          )}
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500 transition group-hover:bg-green-500 group-hover:text-black">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-500">
        {subtitle}
      </p>
    </article>
  );
}

function formatWorkoutTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);

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