import { supabase } from "../lib/supabase";
import type { Profile } from "../types/profile";

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return { data, error };
}

export async function saveProfile(profile: Profile) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, {
      onConflict: "id",
    })
    .select()
    .single();

  return { data, error };
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  return { data, error };
}