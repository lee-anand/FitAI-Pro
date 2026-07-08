import {
  Bot,
  Camera,
  CheckCircle2,
  Footprints,
  PersonStanding,
} from "lucide-react";

type WorkoutSetupProps = {
  exerciseId: string;
  exerciseName: string;
  loading: boolean;
  onStart: () => void;
};

type SetupConfig = {
  title: string;
  description: string;
  instructions: string[];
};

const setupConfigs: Record<string, SetupConfig> = {
  "bicep-curl": {
    title: "Position Yourself for Bicep Curls",
    description:
      "A side or slightly angled camera position gives the AI the clearest view of your elbow movement.",
    instructions: [
      "Stand far enough away to show your upper body clearly.",
      "Turn sideways or slightly toward the camera.",
      "Keep the selected arm visible from shoulder to wrist.",
      "Start with your arm almost fully straight.",
    ],
  },

  "bodyweight-squat": {
    title: "Position Yourself for Squats",
    description:
      "The AI needs a clear view of your hip, knee, and ankle to measure squat depth.",
    instructions: [
      "Step back until your full body is visible.",
      "Turn sideways or slightly toward the camera.",
      "Keep your feet, knees, hips, and shoulders inside the frame.",
      "Start standing upright with your legs almost straight.",
    ],
  },
};

export default function WorkoutSetup({
  exerciseId,
  exerciseName,
  loading,
  onStart,
}: WorkoutSetupProps) {
  const config = setupConfigs[exerciseId];

  if (!config) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
            <PersonStanding size={25} />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-green-500">
            Before You Begin
          </p>

          <h2 className="mt-3 text-3xl font-bold text-white">
            {config.title}
          </h2>

          <p className="mt-3 leading-7 text-zinc-400">
            {config.description}
          </p>

          <div className="mt-7 space-y-3">
            {config.instructions.map(
              (instruction, index) => (
                <div
                  key={instruction}
                  className="flex items-start gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500 font-bold text-black">
                    {index + 1}
                  </div>

                  <p className="pt-1 text-sm leading-6 text-zinc-300">
                    {instruction}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        <aside className="w-full rounded-3xl border border-zinc-800 bg-zinc-950 p-6 lg:max-w-sm">
          <div className="flex items-center gap-3">
            <Bot className="text-green-500" size={22} />

            <h3 className="font-semibold text-white">
              AI Camera Checklist
            </h3>
          </div>

          <div className="mt-6 space-y-4">
            <ChecklistItem
              icon={<Camera size={18} />}
              text="Allow browser camera permission."
            />

            <ChecklistItem
              icon={<PersonStanding size={18} />}
              text="Keep the required joints inside the frame."
            />

            <ChecklistItem
              icon={<Footprints size={18} />}
              text="Make sure you have enough space to exercise safely."
            />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onStart}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Camera size={18} />

            {loading
              ? "Starting Camera..."
              : `I'm Ready for ${exerciseName}`}
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-zinc-600">
            A 3-second countdown will begin after the camera starts.
          </p>
        </aside>
      </div>
    </section>
  );
}

function ChecklistItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 text-sm text-zinc-400">
      <span className="mt-0.5 text-green-500">
        {icon}
      </span>

      <span className="flex-1 leading-6">
        {text}
      </span>

      <CheckCircle2
        size={17}
        className="mt-1 shrink-0 text-zinc-700"
      />
    </div>
  );
}