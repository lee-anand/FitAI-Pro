import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import type { User } from "@supabase/supabase-js";

import { supabase } from "./lib/supabase";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./features/dashboard/components/Dashboard";

import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import ForgotPassword from "./features/auth/ForgotPassword";

import ProfileSetup from "./features/profile/ProfileSetup";

import { getProfile } from "./service/profileService";
import { useUser } from "./context/UserContext";

export default function App() {
  const { profile, setProfile } = useUser();

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    async function initializeAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user ?? null);
      setAuthLoading(false);
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (!session?.user) {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setProfile]);

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);

      const { data, error } = await getProfile(user.id);

      if (error) {
        // PGRST116 means no profile row exists.
        if (error.code !== "PGRST116") {
          console.error("Profile fetch error:", error);
        }

        setProfile(null);
        setProfileLoading(false);
        return;
      }

      setProfile(data);
      setProfileLoading(false);
    }

    loadProfile();
  }, [user, setProfile]);

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading FitAI Pro...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            profile ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/profile-setup" replace />
            )
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/register"
        element={
          user ? (
            profile ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/profile-setup" replace />
            )
          ) : (
            <Register />
          )
        }
      />

      <Route
        path="/forgot-password"
        element={
          user ? <Navigate to="/" replace /> : <ForgotPassword />
        }
      />

      <Route
        path="/profile-setup"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : profile ? (
            <Navigate to="/" replace />
          ) : (
            <ProfileSetup />
          )
        }
      />

      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : !profile ? (
            <Navigate to="/profile-setup" replace />
          ) : (
            <AppLayout>
              <Dashboard />
            </AppLayout>
          )
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={!user ? "/login" : profile ? "/" : "/profile-setup"}
            replace
          />
        }
      />
    </Routes>
  );
}