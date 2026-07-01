import Card from "../../../components/ui/Card";
import { PlayCircle, Clock3, Flame } from "lucide-react";

export default function ContinueWorkout() {
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">Continue Workout</p>

          <h2 className="mt-2 text-2xl font-bold">
            Upper Body Strength
          </h2>

          <p className="mt-2 text-zinc-400">
            Last session saved automatically.
          </p>
        </div>

        <PlayCircle className="h-12 w-12 text-green-500" />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">

        <div className="rounded-xl bg-zinc-800 p-4">
          <Clock3 className="mb-2 text-green-500" />

          <p className="text-sm text-zinc-500">
            Remaining
          </p>

          <h3 className="text-xl font-semibold">
            18 min
          </h3>
        </div>

        <div className="rounded-xl bg-zinc-800 p-4">
          <Flame className="mb-2 text-orange-500" />

          <p className="text-sm text-zinc-500">
            Calories
          </p>

          <h3 className="text-xl font-semibold">
            382 kcal
          </h3>
        </div>

      </div>

      <button
        className="
        mt-8
        w-full
        rounded-xl
        bg-green-500
        py-3
        font-semibold
        text-black
        transition
        hover:scale-[1.02]
      "
      >
        Resume Workout
      </button>
    </Card>
  );
}