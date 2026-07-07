import { supabase } from "../lib/supabase";
import { Profile } from "../types/profile";

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
}

export async function createProfile(profile: Profile) {
  const { data, error } = await supabase
    .from("profiles")
    .insert(profile)
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

export async function saveProfile(profile: Profile) {
  const existing = await getProfile(profile.id);

  if (existing.data) {
    return await updateProfile(profile.id, profile);
  }

  return await createProfile(profile);
}