export interface Profile {
  id: string;
  email: string;

  full_name: string;

  age: number;

  gender: "Male" | "Female" | "Other";

  height: number; // cm
  weight: number; // kg

  goal:
    | "Lose Weight"
    | "Gain Muscle"
    | "Stay Fit"
    | "Improve Endurance";

  activity_level:
    | "Sedentary"
    | "Light"
    | "Moderate"
    | "Active"
    | "Athlete";

  bmi: number;

  bmr: number;

  tdee: number;

  avatar_url?: string;

  created_at?: string;

  updated_at?: string;
}