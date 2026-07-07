type ComingSoonPageProps = {
  title: string;
  description: string;
};

export default function ComingSoonPage({
  title,
  description,
}: ComingSoonPageProps) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <section className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-500">
          FitAI Pro
        </p>

        <h1 className="mt-4 text-4xl font-bold text-white">
          {title}
        </h1>

        <p className="mt-4 text-zinc-400">
          {description}
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-500">
          This module will be implemented in the next development sprint.
        </div>
      </section>
    </main>
  );
}