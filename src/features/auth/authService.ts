import { supabase } from "../../lib/supabase";

export async function login(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function register(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { data, error };
  }

  if (data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        email: data.user.email,
        full_name: "",
        age: null,
        gender: "",
        height: null,
        weight: null,
        goal: "",
        activity_level: "",
      });

    if (profileError) {
      console.error(profileError);
    }
  }

  return { data, error: null };
}

export async function logout() {
  return await supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  return await supabase.auth.resetPasswordForEmail(email);
}