import { useUser } from "../../context/UserContext";

export default function DashboardStats() {
  const { profile } = useUser();

  const stats = [
    {
      title: "Weight",
      value:
        profile?.weight != null
          ? `${Number(profile.weight).toFixed(1)} kg`
          : "--",
      subtitle: "Current body weight",
      icon: "⚖️",
    },
    {
      title: "BMI",
      value:
        profile?.bmi != null
          ? Number(profile.bmi).toFixed(1)
          : "--",
      subtitle: "Body Mass Index",
      icon: "❤️",
    },
    {
      title: "Daily Calories",
      value:
        profile?.tdee != null
          ? `${Math.round(Number(profile.tdee))} kcal`
          : "--",
      subtitle: "Estimated daily energy needs",
      icon: "🔥",
    },
    {
      title: "Height",
      value:
        profile?.height != null
          ? `${Number(profile.height)} cm`
          : "--",
      subtitle: "Current height",
      icon: "📏",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <article
          key={stat.title}
          className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition duration-300 hover:-translate-y-1 hover:border-green-500/50"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">
                {stat.title}
              </p>

              <h2 className="mt-3 text-2xl font-bold text-white">
                {stat.value}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800 text-xl transition group-hover:bg-green-500/10">
              {stat.icon}
            </div>
          </div>

          <p className="mt-4 text-sm text-zinc-500">
            {stat.subtitle}
          </p>
        </article>
      ))}
    </section>
  );
}