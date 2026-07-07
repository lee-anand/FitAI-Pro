export type ExerciseCategory = "Upper Body" | "Lower Body" | "Core";

export type ExerciseDifficulty =
  | "Beginner"
  | "Intermediate"
  | "Advanced";

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  targetMuscles: string[];
  difficulty: ExerciseDifficulty;
  caloriesPerMinute: number;
  aiCompatible: boolean;
  description: string;
  instructions: string[];
  commonMistakes: string[];
}