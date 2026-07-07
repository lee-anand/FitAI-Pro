import {
  Home,
  Dumbbell,
  Apple,
  Bot,
  Users,
  Trophy,
  BarChart3,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import { useUser } from "../../context/UserContext";

const menu = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Dumbbell, label: "Workout", path: "/workout" },
  { icon: Apple, label: "Nutrition", path: "/nutrition" },
  { icon: Bot, label: "AI Coach", path: "/ai-coach" },
  { icon: Users, label: "Community", path: "/community" },
  { icon: Trophy, label: "Challenges", path: "/challenges" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { setProfile } = useUser();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("LOGOUT ERROR:", error);
      return;
    }

    setProfile(null);
    navigate("/login", {
      replace: true,
    });
  }

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-green-500">
          FitAI Pro
        </h1>
      </div>

      <nav className="flex-1 px-3">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 transition ${
                  isActive
                    ? "bg-green-500 text-black"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`
              }
            >
              <Icon size={20} />

              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          <LogOut size={20} />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}