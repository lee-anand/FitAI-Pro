import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

interface Props {
  children: React.ReactNode;
}

export default function AppLayout({
  children,
}: Props) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-950 text-white">
      <Sidebar />

      {/* MAIN APP AREA */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopNavbar />

        {/* SCROLLABLE PAGE CONTENT */}

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full min-w-0 max-w-[1600px] p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}