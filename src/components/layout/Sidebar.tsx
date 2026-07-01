import {
  Home,
  Dumbbell,
  Apple,
  Bot,
  Users,
  Trophy,
  BarChart3,
  User,
  Settings
} from "lucide-react";

const menu = [
  { icon: Home, label: "Dashboard" },
  { icon: Dumbbell, label: "Workout" },
  { icon: Apple, label: "Nutrition" },
  { icon: Bot, label: "AI Coach" },
  { icon: Users, label: "Community" },
  { icon: Trophy, label: "Challenges" },
  { icon: BarChart3, label: "Analytics" },
  { icon: User, label: "Profile" },
  { icon: Settings, label: "Settings" }
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-900">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-green-500">
          FitAI Pro
        </h1>
      </div>

      <nav className="px-3">
        {menu.map((item) => (
          <button
            key={item.label}
            className="mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}