import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./features/dashboard/components/Dashboard";

import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import ForgotPassword from "./features/auth/ForgotPassword";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import ProfileSetup from "./features/profile/ProfileSetup";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
          
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
    </Routes>
  );
}