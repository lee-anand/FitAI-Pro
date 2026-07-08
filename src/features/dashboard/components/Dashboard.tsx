import { useEffect, useMemo, useState, type ComponentType } from "react";

import DashboardHeader from "../DashboardHeader";
import DashboardStats from "../DashboardStats";
import CommunityPreview from "../CommunityPreview";

import QuickActions from "./QuickActions";
import ContinueWorkout from "./ContinueWorkout";
import WeeklyProgress from "./WeeklyProgress";
import ChallengeCard from "./ChallengeCard";
import AIRecommendation from "./AIRecommendation";
import LevelProgressCard from "./LevelProgressCard";

type DashboardComponentProps = {
  sessions: WorkoutSession[];
  loading: boolean;
};

const ContinueWorkoutComponent =
  ContinueWorkout as ComponentType<DashboardComponentProps>;
const WeeklyProgressComponent =
  WeeklyProgress as ComponentType<DashboardComponentProps>;
const ChallengeCardComponent =
  ChallengeCard as ComponentType<DashboardComponentProps>;
const AIRecommendationComponent =
  AIRecommendation as ComponentType<DashboardComponentProps>;

import {
  getWorkoutHistory,
  type WorkoutSession,
} from "../../../service/workoutService";

import {
  calculateLevelProgress,
  getUserProgress,
  type LevelProgress,
  type UserProgress,
} from "../../../service/progressService";

export type DashboardWorkoutStats = {
  totalWorkouts: number;
  totalReps: number;
  totalSeconds: number;
  totalCalories: number;
};

export default function Dashboard() {
  const [sessions, setSessions] = useState<
    WorkoutSession[]
  >([]);

  const [progress, setProgress] =
    useState<UserProgress | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      /*
        LOAD WORKOUTS + XP PROGRESS TOGETHER
      */

      const [
        workoutResult,
        progressResult,
      ] = await Promise.all([
        getWorkoutHistory(),
        getUserProgress(),
      ]);

      /*
        WORKOUT ERROR
      */

      if (workoutResult.error) {
        console.error(
          "DASHBOARD WORKOUT ERROR:",
          workoutResult.error
        );

        setError(
          workoutResult.error instanceof Error
            ? workoutResult.error.message
            : "Unable to load workout history."
        );

        setLoading(false);

        return;
      }

      /*
        PROGRESS ERROR
      */

      if (progressResult.error) {
        console.error(
          "DASHBOARD PROGRESS ERROR:",
          progressResult.error
        );

        setError(
          progressResult.error instanceof Error
            ? progressResult.error.message
            : "Unable to load player progress."
        );

        setLoading(false);

        return;
      }

      setSessions(
        workoutResult.data ?? []
      );

      setProgress(
        progressResult.data ?? null
      );

      setLoading(false);
    }

    loadDashboard();
  }, []);

  /*
    WORKOUT STATISTICS
  */

  const stats =
    useMemo<DashboardWorkoutStats>(() => {
      return sessions.reduce<DashboardWorkoutStats>(
        (totals, session) => {
          totals.totalWorkouts += 1;

          totals.totalReps +=
            Number(session.reps);

          totals.totalSeconds +=
            Number(session.duration_seconds);

          totals.totalCalories +=
            Number(
              session.estimated_calories
            );

          return totals;
        },
        {
          totalWorkouts: 0,
          totalReps: 0,
          totalSeconds: 0,
          totalCalories: 0,
        }
      );
    }, [sessions]);

  /*
    LEVEL INFORMATION
  */

  const levelProgress =
    useMemo<LevelProgress | null>(() => {
      if (!progress) {
        return null;
      }

      return calculateLevelProgress(
        progress.total_xp,
        progress.current_level
      );
    }, [progress]);

  return (
    <div className="min-w-0 space-y-8">
      <DashboardHeader />

      {/* ERROR */}

      {error && (
        <section className="rounded-2xl border border-red-900/60 bg-red-950/30 px-5 py-4 text-sm text-red-400">
          {error}
        </section>
      )}

      {/* WORKOUT + BODY STATS */}

      <DashboardStats
        stats={stats}
        loading={loading}
      />

      {/* XP + LEVEL */}

      <LevelProgressCard
        progress={progress}
        levelProgress={levelProgress}
        loading={loading}
      />

      {/* QUICK ACTIONS */}

      <QuickActions />

      {/* LATEST WORKOUT + WEEKLY PROGRESS */}

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
        <ContinueWorkoutComponent
          sessions={sessions}
          loading={loading}
        />

        <WeeklyProgressComponent
          sessions={sessions}
          loading={loading}
        />
      </div>

      {/* CHALLENGE + AI RECOMMENDATION */}

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
        <ChallengeCardComponent
          sessions={sessions}
          loading={loading}
        />

        <AIRecommendationComponent
          sessions={sessions}
          loading={loading}
        />
      </div>

      {/* COMMUNITY */}

      <CommunityPreview />
    </div>
  );
}