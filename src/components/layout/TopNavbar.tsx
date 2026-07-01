import { Bell, Search } from "lucide-react";

export default function TopNavbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-8">

      <h2 className="text-xl font-semibold">
        Dashboard
      </h2>

      <div className="flex items-center gap-4">

        <div className="flex items-center rounded-xl bg-zinc-800 px-4 py-2">
          <Search size={18} />

          <input
            className="ml-2 bg-transparent outline-none"
            placeholder="Search..."
          />
        </div>

        <button className="rounded-xl bg-zinc-800 p-3">
          <Bell size={18} />
        </button>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500 font-bold">
          U
        </div>

      </div>
    </header>
  );
}