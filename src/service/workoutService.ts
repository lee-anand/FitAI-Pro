import { supabase } from "../lib/supabase";

export type WorkoutSessionInsert = {
  exercise_id: string;
  exercise_name: string;
  reps: number;
  duration_seconds: number;
  estimated_calories: number;
};

export type WorkoutSession = WorkoutSessionInsert & {
  id: string;
  user_id: string;
  completed_at: string;
};

export type CompletedWorkoutResult = {
  session_id: string;
  exercise_id: string;
  exercise_name: string;
  reps: number;
  duration_seconds: number;
  estimated_calories: number;
  completed_at: string;
  xp_earned: number;
  total_xp: number;
  current_level: number;
};

/*
  SAVE WORKOUT SESSION + AWARD XP
*/

export async function saveWorkoutSession(
  workout: WorkoutSessionInsert
) {
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
        "You must be logged in to save a workout."
      ),
    };
  }

  /*
    complete_workout() performs:

    1. Save workout session
    2. Calculate earned XP
    3. Update user progress
    4. Calculate current level
    5. Return workout + XP information

    All operations happen atomically in PostgreSQL.
  */

  const { data, error } = await supabase.rpc(
    "complete_workout",
    {
      p_exercise_id: workout.exercise_id,

      p_exercise_name: workout.exercise_name,

      p_reps: workout.reps,

      p_duration_seconds:
        workout.duration_seconds,

      p_estimated_calories:
        workout.estimated_calories,
    }
  );

  if (error) {
    console.error(
      "COMPLETE WORKOUT ERROR:",
      error
    );

    return {
      data: null,
      error,
    };
  }

  /*
    PostgreSQL RETURNS TABLE functions
    are returned by Supabase as arrays.

    complete_workout() returns exactly one row.
  */

  const completedWorkout =
    (data?.[0] as CompletedWorkoutResult | undefined) ??
    null;

  if (!completedWorkout) {
    return {
      data: null,
      error: new Error(
        "Workout completed, but no workout result was returned."
      ),
    };
  }

  return {
    data: completedWorkout,
    error: null,
  };
}

/*
  GET CURRENT USER WORKOUT HISTORY
*/

export async function getWorkoutHistory() {
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
        "You must be logged in to view workout history."
      ),
    };
  }

  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("completed_at", {
      ascending: false,
    });

  return {
    data: data as WorkoutSession[] | null,
    error,
  };
}

/*
  GET RECENT WORKOUTS
*/

export async function getRecentWorkouts(
  limit = 5
) {
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
        "You must be logged in to view recent workouts."
      ),
    };
  }

  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("completed_at", {
      ascending: false,
    })
    .limit(limit);

  return {
    data: data as WorkoutSession[] | null,
    error,
  };
}

/*
  DELETE WORKOUT SESSION

  IMPORTANT:
  This currently deletes the workout history row only.

  It does NOT subtract XP because XP should generally behave
  like an awarded progression event rather than being recalculated
  whenever workout history is deleted.

  We can change this behavior later if required.
*/

export async function deleteWorkoutSession(
  sessionId: string
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return {
      error: userError,
    };
  }

  if (!user) {
    return {
      error: new Error(
        "You must be logged in to delete a workout."
      ),
    };
  }

  const { error } = await supabase
    .from("workout_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id);

  return {
    error,
  };
}