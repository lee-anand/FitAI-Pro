import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import type { User } from "@supabase/supabase-js";

import { supabase } from "./lib/supabase";
import { getProfile } from "./service/profileService";
import { useUser } from "./context/UserContext";

import AppLayout from "./components/layout/AppLayout";

import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import ForgotPassword from "./features/auth/ForgotPassword";

import ProfileSetup from "./features/profile/ProfileSetup";
import ProfilePage from "./features/profile/ProfilePage";

import Dashboard from "./features/dashboard/components/Dashboard";
import WorkoutLibrary from "./features/workout/WorkoutLibrary";
import ExerciseDetails from "./features/workout/ExerciseDetails";

const ComingSoonPage = ({ title, description }: { title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <h1 className="text-4xl font-bold">{title}</h1>
    <p className="text-lg text-gray-600 mt-4">{description}</p>
  </div>
);

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
        setProfileLoading(false);
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
        console.error("PROFILE FETCH ERROR:", error);
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

  const protectedPage = (page: React.ReactNode) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (!profile) {
      return <Navigate to="/profile-setup" replace />;
    }

    return <AppLayout>{page}</AppLayout>;
  };

  return (
    <Routes>
      {/* LOGIN */}

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

      {/* REGISTER */}

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

      {/* FORGOT PASSWORD */}

      <Route
        path="/forgot-password"
        element={
          user ? (
            profile ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/profile-setup" replace />
            )
          ) : (
            <ForgotPassword />
          )
        }
      />

      {/* ONBOARDING */}

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

      {/* DASHBOARD */}

      <Route
        path="/"
        element={protectedPage(<Dashboard />)}
      />

      {/* PROFILE */}

      <Route
        path="/profile"
        element={protectedPage(<ProfilePage />)}
      />

      {/* WORKOUT */}

      <Route
  path="/workout"
  element={protectedPage(<WorkoutLibrary />)}
/>
<Route
  path="/workout/:exerciseId"
  element={protectedPage(<ExerciseDetails />)}
/>

      {/* NUTRITION */}

      <Route
        path="/nutrition"
        element={protectedPage(
          <ComingSoonPage
            title="Nutrition"
            description="Track calories, macros, water intake, and personalized nutrition recommendations."
          />
        )}
      />

      {/* AI COACH */}

      <Route
        path="/ai-coach"
        element={protectedPage(
          <ComingSoonPage
            title="AI Coach"
            description="Get personalized workout guidance and recommendations based on your fitness progress."
          />
        )}
      />

      {/* COMMUNITY */}

      <Route
        path="/community"
        element={protectedPage(
          <ComingSoonPage
            title="Community"
            description="Share progress, interact with other users, and participate in the FitAI community."
          />
        )}
      />

      {/* CHALLENGES */}

      <Route
        path="/challenges"
        element={protectedPage(
          <ComingSoonPage
            title="Challenges"
            description="Join fitness challenges, build streaks, earn achievements, and compete on leaderboards."
          />
        )}
      />

      {/* ANALYTICS */}

      <Route
        path="/analytics"
        element={protectedPage(
          <ComingSoonPage
            title="Analytics"
            description="View workout history, progress trends, performance metrics, and fitness insights."
          />
        )}
      />

      {/* SETTINGS */}

      <Route
        path="/settings"
        element={protectedPage(
          <ComingSoonPage
            title="Settings"
            description="Manage application preferences, account settings, and personalization options."
          />
        )}
      />

      {/* UNKNOWN ROUTES */}

      <Route
        path="*"
        element={
          <Navigate
            to={
              !user
                ? "/login"
                : profile
                  ? "/"
                  : "/profile-setup"
            }
            replace
          />
        }
      />
    </Routes>
  );
}