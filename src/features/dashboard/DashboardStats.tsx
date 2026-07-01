import { dashboardData } from "../../mock/dashboard";

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-4 gap-6">

      {dashboardData.stats.map((stat) => (

        <div
          key={stat.title}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-green-500"
        >

          <div className="text-3xl">
            {stat.icon}
          </div>

          <p className="mt-5 text-zinc-400">
            {stat.title}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {stat.value}

            <span className="text-base text-zinc-500">
              {" "}
              {stat.unit}
            </span>

          </h2>

        </div>

      ))}

    </div>
  );
}