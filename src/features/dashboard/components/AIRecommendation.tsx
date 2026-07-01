import Card from "../../../components/ui/Card";
import SectionTitle from "../../../components/ui/SectionTitle";

export default function AIRecommendation() {
  return (
    <div>
      <SectionTitle title="AI Coach" />

      <Card>
        <h3 className="text-xl font-semibold">
          Leg Day
        </h3>

        <p className="mt-3 text-zinc-400">
          Yesterday you trained Chest.
        </p>

        <p className="mt-2 text-zinc-500">
          Estimated Time: 42 min
        </p>

        <button className="mt-5 rounded-xl bg-green-500 px-5 py-3 font-medium text-black">
          Start Workout
        </button>
      </Card>
    </div>
  );
}