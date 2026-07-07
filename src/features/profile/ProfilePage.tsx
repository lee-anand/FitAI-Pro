import { useState } from "react";
import { useUser } from "../../context/UserContext";
// Local fallback for updateProfile to avoid missing module error
async function updateProfile(id: string | number, updates: any) {
  try {
    const res = await fetch(`/api/profile/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      return { data: null, error: err };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}
import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
} from "../../utils/health";

export default function ProfilePage() {
  const { profile, setProfile } = useUser();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    full_name: profile?.full_name ?? "",
    age: profile?.age ?? 21,
    height: profile?.height ?? 170,
    weight: profile?.weight ?? 70,
    gender: profile?.gender ?? "Other",
    goal: profile?.goal ?? "Stay Fit",
    activity_level: profile?.activity_level ?? "Moderate",
  });

  if (!profile) {
    return (
      <div className="text-white">
        Profile not available.
      </div>
    );
  }

  function updateField(field: string, value: string | number) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setMessage("");
  }

  function cancelEditing() {
    if (!profile) {
      return;
    }

    setFormData({
      full_name: profile.full_name,
      age: profile.age,
      height: profile.height,
      weight: profile.weight,
      gender: profile.gender,
      goal: profile.goal,
      activity_level: profile.activity_level,
    });

    setEditing(false);
    setMessage("");
  }

  async function handleSave() {
    if (!profile) {
      return;
    }

    setLoading(true);
    setMessage("");

    const bmi = calculateBMI(
      Number(formData.height),
      Number(formData.weight)
    );

    const bmr = calculateBMR(
      formData.gender,
      Number(formData.height),
      Number(formData.weight),
      Number(formData.age)
    );

    const tdee = calculateTDEE(
      bmr,
      formData.activity_level
    );

    const updates = {
      ...formData,
      bmi,
      bmr,
      tdee,
    };

    const { data, error } = await updateProfile(
      profile.id,
      updates
    );

    if (error) {
      console.error("PROFILE UPDATE ERROR:", error);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setMessage("Profile could not be updated.");
      setLoading(false);
      return;
    }

    setProfile(data);
    setEditing(false);
    setLoading(false);
    setMessage("Profile updated successfully.");
  }

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-500">
              Your Profile
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white">
              {profile.full_name}
            </h1>

            <p className="mt-2 text-zinc-400">
              Manage your personal information and fitness preferences.
            </p>
          </div>

          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-black transition hover:bg-green-400"
            >
              Edit Profile
            </button>
          ) : (
            <button
              type="button"
              onClick={cancelEditing}
              disabled={loading}
              className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-white transition hover:bg-zinc-800"
            >
              Cancel
            </button>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Weight" value={`${profile.weight} kg`} />

        <StatCard title="Height" value={`${profile.height} cm`} />

        <StatCard title="BMI" value={Number(profile.bmi).toFixed(1)} />

        <StatCard
          title="Daily Energy"
          value={`${Math.round(Number(profile.tdee))} kcal`}
        />
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-white">
          Personal Information
        </h2>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <ProfileInput
            label="Full Name"
            value={formData.full_name}
            disabled={!editing}
            onChange={(value) => updateField("full_name", value)}
          />

          <ProfileInput
            label="Age"
            type="number"
            value={formData.age}
            disabled={!editing}
            onChange={(value) => updateField("age", Number(value))}
          />

          <ProfileInput
            label="Height (cm)"
            type="number"
            value={formData.height}
            disabled={!editing}
            onChange={(value) => updateField("height", Number(value))}
          />

          <ProfileInput
            label="Weight (kg)"
            type="number"
            value={formData.weight}
            disabled={!editing}
            onChange={(value) => updateField("weight", Number(value))}
          />

          <ProfileSelect
            label="Gender"
            value={formData.gender}
            disabled={!editing}
            options={["Male", "Female", "Other"]}
            onChange={(value) => updateField("gender", value)}
          />

          <ProfileSelect
            label="Fitness Goal"
            value={formData.goal}
            disabled={!editing}
            options={[
              "Lose Weight",
              "Gain Muscle",
              "Stay Fit",
              "Improve Endurance",
            ]}
            onChange={(value) => updateField("goal", value)}
          />

          <ProfileSelect
            label="Activity Level"
            value={formData.activity_level}
            disabled={!editing}
            options={[
              "Sedentary",
              "Light",
              "Moderate",
              "Active",
              "Athlete",
            ]}
            onChange={(value) =>
              updateField("activity_level", value)
            }
          />
        </div>

        {message && (
          <p className="mt-6 text-sm text-zinc-300">
            {message}
          </p>
        )}

        {editing && (
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="rounded-xl bg-green-500 px-8 py-3 font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-500">{title}</p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>
    </article>
  );
}

function ProfileInput({
  label,
  value,
  type = "text",
  disabled,
  onChange,
}: {
  label: string;
  value: string | number;
  type?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="text-sm font-medium text-zinc-400">
        {label}
      </span>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function ProfileSelect({
  label,
  value,
  disabled,
  options,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="text-sm font-medium text-zinc-400">
        {label}
      </span>

      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}