import { dashboardData } from "../../mock/dashboard";

export default function DashboardHeader() {
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <div className="mb-8">
      <p className="text-zinc-400 text-lg">
        {greeting}
      </p>

      <h1 className="mt-2 text-5xl font-bold">
        Welcome Back,
        <span className="text-green-500">
          {" "}
          {dashboardData.user.name}
        </span>{" "}
        👋
      </h1>

      <p className="mt-4 text-zinc-500">
        Ready to crush today's workout?
      </p>
    </div>
  );
}