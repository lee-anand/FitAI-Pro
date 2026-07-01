import Card from "../../../components/ui/Card";
import SectionTitle from "../../../components/ui/SectionTitle";

export default function ChallengeCard() {
  return (
    <div>
      <SectionTitle title="Today's Challenge" />

      <Card>
        <h3 className="text-xl font-semibold">
          💪 100 Push-ups
        </h3>

        <p className="mt-3 text-zinc-400">
          Progress: 63%
        </p>

        <div className="mt-4 h-2 rounded-full bg-zinc-800">
          <div className="h-2 w-[63%] rounded-full bg-green-500"></div>
        </div>

        <p className="mt-5 text-sm text-green-500">
          Reward: +100 XP
        </p>
      </Card>
    </div>
  );
}