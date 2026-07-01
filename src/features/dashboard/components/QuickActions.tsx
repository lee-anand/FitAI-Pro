import { Bot, Dumbbell, Salad, Trophy } from "lucide-react";
import ActionButton from "../../../components/ui/ActionButton";
import SectionTitle from "../../../components/ui/SectionTitle";

export default function QuickActions() {
  return (
    <div className="mt-8">
      <SectionTitle
        title="Quick Actions"
        subtitle="Start your fitness journey in one click"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionButton title="Start Workout" icon={Dumbbell} />
        <ActionButton title="Ask AI Coach" icon={Bot} />
        <ActionButton title="Meal Plan" icon={Salad} />
        <ActionButton title="Challenges" icon={Trophy} />
      </div>
    </div>
  );
}