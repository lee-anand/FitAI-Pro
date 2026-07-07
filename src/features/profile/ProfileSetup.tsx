import { useState } from "react";

export default function ProfileSetup() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    full_name: "",
    age: 21,
    height: 170,
    weight: 70,
    gender: "",
    goal: "",
    activity_level: "",
  });

  const next = () => {
    if (step < 7) setStep(step + 1);
  };

  const back = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">

      <div className="w-full max-w-xl rounded-3xl bg-zinc-900 p-10">

        {/* Progress */}

        <p className="text-green-500 font-semibold">
          Step {step} / 7
        </p>

        <div className="mt-3 h-2 rounded-full bg-zinc-800">
          <div
            className="h-2 rounded-full bg-green-500 transition-all duration-500"
            style={{
              width: `${(step / 7) * 100}%`,
            }}
          />
        </div>

        {/* STEP 1 */}

        {step === 1 && (
          <>
            <h1 className="mt-8 text-4xl font-bold text-white">
              What's your full name?
            </h1>

            <input
              value={formData.full_name}
              onChange={(e) =>
                updateField("full_name", e.target.value)
              }
              placeholder="John Doe"
              className="mt-8 w-full rounded-xl bg-zinc-800 p-4 text-white"
            />
          </>
        )}

        {/* STEP 2 */}

        {step === 2 && (
          <>
            <h1 className="mt-8 text-4xl font-bold text-white">
              How old are you?
            </h1>

            <input
              type="range"
              min="15"
              max="80"
              value={formData.age}
              onChange={(e) =>
                updateField("age", Number(e.target.value))
              }
              className="mt-10 w-full"
            />

            <p className="mt-6 text-center text-5xl text-green-500">
              {formData.age}
            </p>
          </>
        )}

        {/* STEP 3 */}

        {step === 3 && (
          <>
            <h1 className="mt-8 text-4xl font-bold text-white">
              Height
            </h1>

            <input
              type="range"
              min="120"
              max="220"
              value={formData.height}
              onChange={(e) =>
                updateField("height", Number(e.target.value))
              }
              className="mt-10 w-full"
            />

            <p className="mt-6 text-center text-5xl text-green-500">
              {formData.height} cm
            </p>
          </>
        )}

        {/* STEP 4 */}

        {step === 4 && (
          <>
            <h1 className="mt-8 text-4xl font-bold text-white">
              Weight
            </h1>

            <input
              type="range"
              min="30"
              max="180"
              value={formData.weight}
              onChange={(e) =>
                updateField("weight", Number(e.target.value))
              }
              className="mt-10 w-full"
            />

            <p className="mt-6 text-center text-5xl text-green-500">
              {formData.weight} kg
            </p>
          </>
        )}

        {/* STEP 5 */}

        {step === 5 && (
          <>
            <h1 className="mt-8 text-4xl font-bold text-white">
              Select Gender
            </h1>

            <div className="mt-8 space-y-4">

              {["Male", "Female", "Other"].map((g) => (

                <button
                  key={g}
                  onClick={() => updateField("gender", g)}
                  className={`w-full rounded-xl p-4 ${
                    formData.gender === g
                      ? "bg-green-500 text-black"
                      : "bg-zinc-800 text-white"
                  }`}
                >
                  {g}
                </button>

              ))}

            </div>
          </>
        )}

        {/* STEP 6 */}

        {step === 6 && (
          <>
            <h1 className="mt-8 text-4xl font-bold text-white">
              Your Goal
            </h1>

            <div className="mt-8 grid gap-4">

              {[
                "Lose Weight",
                "Gain Muscle",
                "Stay Fit",
                "Improve Endurance",
              ].map((goal) => (

                <button
                  key={goal}
                  onClick={() => updateField("goal", goal)}
                  className={`rounded-xl p-4 ${
                    formData.goal === goal
                      ? "bg-green-500 text-black"
                      : "bg-zinc-800 text-white"
                  }`}
                >
                  {goal}
                </button>

              ))}

            </div>
          </>
        )}

        {/* STEP 7 */}

        {step === 7 && (
          <>
            <h1 className="mt-8 text-4xl font-bold text-white">
              Activity Level
            </h1>

            <div className="mt-8 grid gap-4">

              {[
                "Sedentary",
                "Light",
                "Moderate",
                "Active",
                "Athlete",
              ].map((level) => (

                <button
                  key={level}
                  onClick={() =>
                    updateField("activity_level", level)
                  }
                  className={`rounded-xl p-4 ${
                    formData.activity_level === level
                      ? "bg-green-500 text-black"
                      : "bg-zinc-800 text-white"
                  }`}
                >
                  {level}
                </button>

              ))}

            </div>
          </>
        )}

        {/* Buttons */}

        <div className="mt-12 flex justify-between">

          {step > 1 ? (
            <button
              onClick={back}
              className="rounded-xl bg-zinc-800 px-8 py-3 text-white"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 7 ? (
            <button
              onClick={next}
              className="rounded-xl bg-green-500 px-8 py-3 font-semibold text-black"
            >
              Next
            </button>
          ) : (
            <button
              className="rounded-xl bg-green-500 px-8 py-3 font-semibold text-black"
            >
              Finish
            </button>
          )}

        </div>

      </div>
    </div>
  );
}