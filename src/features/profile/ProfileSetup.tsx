import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import { saveProfile } from "../../service/profileService";
import { useUser } from "../../context/UserContext";

import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
} from "../../utils/health";

type ProfileFormData = {
  full_name: string;
  age: number;
  height: number;
  weight: number;
  gender: "Male" | "Female" | "Other" | "";
  goal:
    | "Lose Weight"
    | "Gain Muscle"
    | "Stay Fit"
    | "Improve Endurance"
    | "";
  activity_level:
    | "Sedentary"
    | "Light"
    | "Moderate"
    | "Active"
    | "Athlete"
    | "";
};

export default function ProfileSetup() {
  const navigate = useNavigate();

  const { setProfile } = useUser();

  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: "",
    age: 21,
    height: 170,
    weight: 70,
    gender: "",
    goal: "",
    activity_level: "",
  });

  function updateField<K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  }

  function validateStep() {
    switch (step) {
      case 1:
        if (formData.full_name.trim().length < 2) {
          setError("Please enter your full name.");
          return false;
        }

        break;

      case 2:
        if (formData.age < 15 || formData.age > 80) {
          setError("Please select a valid age.");
          return false;
        }

        break;

      case 3:
        if (formData.height < 120 || formData.height > 220) {
          setError("Please select a valid height.");
          return false;
        }

        break;

      case 4:
        if (formData.weight < 30 || formData.weight > 180) {
          setError("Please select a valid weight.");
          return false;
        }

        break;

      case 5:
        if (!formData.gender) {
          setError("Please select your gender.");
          return false;
        }

        break;

      case 6:
        if (!formData.goal) {
          setError("Please select your fitness goal.");
          return false;
        }

        break;

      case 7:
        if (!formData.activity_level) {
          setError("Please select your activity level.");
          return false;
        }

        break;
    }

    setError("");

    return true;
  }

  function next() {
    if (!validateStep()) {
      return;
    }

    if (step < 7) {
      setStep((previous) => previous + 1);
    }
  }

  function back() {
    setError("");

    if (step > 1) {
      setStep((previous) => previous - 1);
    }
  }

  async function finishOnboarding() {
    if (!validateStep()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("No authenticated user found. Please login again.");
      }

      const bmi = calculateBMI(
        formData.height,
        formData.weight
      );

      const bmr = calculateBMR(
        formData.gender,
        formData.height,
        formData.weight,
        formData.age
      );

      const tdee = calculateTDEE(
        bmr,
        formData.activity_level
      );

      const profile = {
        id: user.id,

        email: user.email ?? "",

        full_name: formData.full_name.trim(),

        age: formData.age,

        height: formData.height,

        weight: formData.weight,

        gender: formData.gender as "Male" | "Female" | "Other",

        goal: formData.goal as "Lose Weight" | "Gain Muscle" | "Stay Fit" | "Improve Endurance",

        activity_level: formData.activity_level as "Sedentary" | "Light" | "Moderate" | "Active" | "Athlete",

        bmi,

        bmr,

        tdee,
      };

      console.log("AUTH USER:", user);

console.log("PROFILE TO SAVE:", profile);

const { data, error: profileError } =
  await saveProfile(profile);

console.log("PROFILE SAVE RESULT:", {
  data,
  error: profileError,
});

if (profileError) {
  throw profileError;
}

      if (!data) {
        throw new Error("Profile could not be saved.");
      }

      setProfile(data);

      navigate("/", {
        replace: true,
      });
    } catch (caughtError: unknown) {
  console.error("ONBOARDING SAVE ERROR:", caughtError);

  if (
    typeof caughtError === "object" &&
    caughtError !== null &&
    "message" in caughtError
  ) {
    setError(String(caughtError.message));
  } else {
    setError("Something went wrong while saving your profile.");
  }
} finally {
  setLoading(false);
}
  }

  const genderOptions = ["Male", "Female", "Other"] as const;

  const goalOptions = [
    {
      value: "Lose Weight",
      title: "Lose Weight",
      description: "Reduce body fat and improve overall fitness.",
    },
    {
      value: "Gain Muscle",
      title: "Gain Muscle",
      description: "Build strength and increase muscle mass.",
    },
    {
      value: "Stay Fit",
      title: "Stay Fit",
      description: "Maintain a healthy and active lifestyle.",
    },
    {
      value: "Improve Endurance",
      title: "Improve Endurance",
      description: "Improve stamina and cardiovascular fitness.",
    },
  ] as const;

  const activityOptions = [
    {
      value: "Sedentary",
      title: "Sedentary",
      description: "Little or no regular exercise.",
    },
    {
      value: "Light",
      title: "Light",
      description: "Exercise around 1–2 days per week.",
    },
    {
      value: "Moderate",
      title: "Moderate",
      description: "Exercise around 3–5 days per week.",
    },
    {
      value: "Active",
      title: "Active",
      description: "Train around 6 days per week.",
    },
    {
      value: "Athlete",
      title: "Athlete",
      description: "Very intense training or athletic lifestyle.",
    },
  ] as const;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center">
        <section className="w-full rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl sm:p-10">
          <header>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-green-500">
                FITAI PRO
              </p>

              <p className="text-sm text-zinc-500">
                Step {step} of 7
              </p>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{
                  width: `${(step / 7) * 100}%`,
                }}
              />
            </div>
          </header>

          <div className="mt-10 min-h-[350px]">
            {step === 1 && (
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  LET'S GET STARTED
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  What's your full name?
                </h1>

                <p className="mt-3 text-zinc-400">
                  We'll use your name to personalize your FitAI experience.
                </p>

                <input
                  autoFocus
                  type="text"
                  value={formData.full_name}
                  onChange={(event) =>
                    updateField("full_name", event.target.value)
                  }
                  placeholder="Enter your full name"
                  className="mt-10 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-lg outline-none transition focus:border-green-500"
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  ABOUT YOU
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  How old are you?
                </h1>

                <p className="mt-3 text-zinc-400">
                  Your age helps us estimate your daily energy needs.
                </p>

                <div className="mt-12 text-center">
                  <p className="text-7xl font-bold tracking-tight text-green-500">
                    {formData.age}
                  </p>

                  <p className="mt-2 text-zinc-500">years old</p>
                </div>

                <input
                  type="range"
                  min={15}
                  max={80}
                  value={formData.age}
                  onChange={(event) =>
                    updateField("age", Number(event.target.value))
                  }
                  className="mt-12 w-full accent-green-500"
                />

                <div className="mt-3 flex justify-between text-sm text-zinc-600">
                  <span>15</span>
                  <span>80</span>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  BODY METRICS
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  What's your height?
                </h1>

                <p className="mt-3 text-zinc-400">
                  Height and weight are used to calculate your BMI and calorie needs.
                </p>

                <div className="mt-12 text-center">
                  <p className="text-7xl font-bold tracking-tight text-green-500">
                    {formData.height}
                  </p>

                  <p className="mt-2 text-zinc-500">centimeters</p>
                </div>

                <input
                  type="range"
                  min={120}
                  max={220}
                  value={formData.height}
                  onChange={(event) =>
                    updateField("height", Number(event.target.value))
                  }
                  className="mt-12 w-full accent-green-500"
                />

                <div className="mt-3 flex justify-between text-sm text-zinc-600">
                  <span>120 cm</span>
                  <span>220 cm</span>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  BODY METRICS
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  What's your current weight?
                </h1>

                <p className="mt-3 text-zinc-400">
                  You can update this later as you progress.
                </p>

                <div className="mt-12 text-center">
                  <p className="text-7xl font-bold tracking-tight text-green-500">
                    {formData.weight}
                  </p>

                  <p className="mt-2 text-zinc-500">kilograms</p>
                </div>

                <input
                  type="range"
                  min={30}
                  max={180}
                  value={formData.weight}
                  onChange={(event) =>
                    updateField("weight", Number(event.target.value))
                  }
                  className="mt-12 w-full accent-green-500"
                />

                <div className="mt-3 flex justify-between text-sm text-zinc-600">
                  <span>30 kg</span>
                  <span>180 kg</span>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  PERSONALIZATION
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Select your gender
                </h1>

                <p className="mt-3 text-zinc-400">
                  This is used for your metabolic calculations.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {genderOptions.map((gender) => (
                    <button
                      type="button"
                      key={gender}
                      onClick={() => updateField("gender", gender)}
                      className={`min-h-32 rounded-2xl border p-5 text-left transition ${
                        formData.gender === gender
                          ? "border-green-500 bg-green-500 text-black"
                          : "border-zinc-700 bg-zinc-950 text-white hover:border-zinc-500"
                      }`}
                    >
                      <span className="text-lg font-semibold">
                        {gender}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  YOUR OBJECTIVE
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  What's your main fitness goal?
                </h1>

                <p className="mt-3 text-zinc-400">
                  We'll use your goal to personalize future workouts and recommendations.
                </p>

                <div className="mt-8 grid gap-3">
                  {goalOptions.map((goal) => (
                    <button
                      type="button"
                      key={goal.value}
                      onClick={() => updateField("goal", goal.value)}
                      className={`rounded-2xl border p-5 text-left transition ${
                        formData.goal === goal.value
                          ? "border-green-500 bg-green-500 text-black"
                          : "border-zinc-700 bg-zinc-950 hover:border-zinc-500"
                      }`}
                    >
                      <p className="font-semibold">{goal.title}</p>

                      <p
                        className={`mt-1 text-sm ${
                          formData.goal === goal.value
                            ? "text-black/70"
                            : "text-zinc-500"
                        }`}
                      >
                        {goal.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 7 && (
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  FINAL STEP
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  How active are you?
                </h1>

                <p className="mt-3 text-zinc-400">
                  This helps us estimate your total daily energy expenditure.
                </p>

                <div className="mt-8 grid gap-3">
                  {activityOptions.map((activity) => (
                    <button
                      type="button"
                      key={activity.value}
                      onClick={() =>
                        updateField("activity_level", activity.value)
                      }
                      className={`rounded-2xl border p-5 text-left transition ${
                        formData.activity_level === activity.value
                          ? "border-green-500 bg-green-500 text-black"
                          : "border-zinc-700 bg-zinc-950 hover:border-zinc-500"
                      }`}
                    >
                      <p className="font-semibold">{activity.title}</p>

                      <p
                        className={`mt-1 text-sm ${
                          formData.activity_level === activity.value
                            ? "text-black/70"
                            : "text-zinc-500"
                        }`}
                      >
                        {activity.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <footer className="mt-8 flex items-center justify-between gap-4 border-t border-zinc-800 pt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={back}
                disabled={loading}
                className="rounded-xl border border-zinc-700 px-6 py-3 font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 7 ? (
              <button
                type="button"
                onClick={next}
                className="rounded-xl bg-green-500 px-8 py-3 font-semibold text-black transition hover:bg-green-400"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={finishOnboarding}
                disabled={loading}
                className="rounded-xl bg-green-500 px-8 py-3 font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating Profile..." : "Finish Setup"}
              </button>
            )}
          </footer>
        </section>
      </div>
    </main>
  );
}