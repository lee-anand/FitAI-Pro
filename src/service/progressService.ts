import { supabase } from "../lib/supabase";

export type UserProgress = {
  user_id: string;
  total_xp: number;
  current_level: number;
  workouts_completed: number;
  total_reps: number;
  total_workout_seconds: number;
  created_at: string;
  updated_at: string;
};

export type LevelProgress = {
  currentLevel: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpIntoLevel: number;
  xpNeededForNextLevel: number;
  progressPercentage: number;
};

/*
  GET CURRENT USER PROGRESS
*/

export async function getUserProgress() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return {
      data: null,
      error: userError,
    };
  }

  if (!user) {
    return {
      data: null,
      error: new Error(
        "You must be logged in to view progress."
      ),
    };
  }

  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    data: data as UserProgress | null,
    error,
  };
}

/*
  XP REQUIRED TO REACH A LEVEL

  Level 1 = 0 XP
  Level 2 = 100 XP
  Level 3 = 300 XP
  Level 4 = 600 XP

  Formula:

  50 × level × (level - 1)
*/

export function getXpRequiredForLevel(
  level: number
) {
  const safeLevel = Math.max(
    1,
    Math.floor(level)
  );

  return (
    50 *
    safeLevel *
    (safeLevel - 1)
  );
}

/*
  CALCULATE LEVEL INFORMATION
*/

export function calculateLevelProgress(
  totalXp: number,
  currentLevel: number
): LevelProgress {
  const safeXp = Math.max(
    0,
    Math.floor(totalXp)
  );

  const safeLevel = Math.max(
    1,
    Math.floor(currentLevel)
  );

  const currentLevelXp =
    getXpRequiredForLevel(safeLevel);

  const nextLevelXp =
    getXpRequiredForLevel(safeLevel + 1);

  const xpIntoLevel = Math.max(
    0,
    safeXp - currentLevelXp
  );

  const xpNeededForNextLevel = Math.max(
    0,
    nextLevelXp - safeXp
  );

  const levelXpRange = Math.max(
    1,
    nextLevelXp - currentLevelXp
  );

  const progressPercentage = Math.min(
    100,
    Math.max(
      0,
      (xpIntoLevel / levelXpRange) * 100
    )
  );

  return {
    currentLevel: safeLevel,
    totalXp: safeXp,
    currentLevelXp,
    nextLevelXp,
    xpIntoLevel,
    xpNeededForNextLevel,
    progressPercentage,
  };
}