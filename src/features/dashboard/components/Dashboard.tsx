import DashboardHeader from "../DashboardHeader";
import DashboardStats from "../DashboardStats";
import QuickActions from "./QuickActions";
import ContinueWorkout from "./ContinueWorkout";
import WeeklyProgress from "./WeeklyProgress";
import ChallengeCard from "./ChallengeCard";
import AIRecommendation from "./AIRecommendation";
import CommunityPreview from "../CommunityPreview";

export default function Dashboard() {
  return (
    <div className="space-y-8">

      <DashboardHeader />

      <DashboardStats />

      <QuickActions />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <ContinueWorkout />

        <WeeklyProgress />

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <ChallengeCard />

        <AIRecommendation />

      </div>

      <CommunityPreview />

    </div>
  );
}