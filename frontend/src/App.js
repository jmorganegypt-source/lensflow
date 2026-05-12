import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "sonner";
import "@/App.css";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Pricing from "./pages/Pricing";
import Presenters from "./pages/Presenters";
import Concierge from "./pages/Concierge";

import AppShell from "./pages/app/AppShell";
import Dashboard from "./pages/app/Dashboard";
import Studio from "./pages/app/Studio";
import Recorder from "./pages/app/Recorder";
import Projects from "./pages/app/Projects";
import Settings from "./pages/app/Settings";

function Protected({ children }) {
  const { user } = useAuth();
  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white/60">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#C99A2E] rounded-full animate-pulse" />
          <span className="font-mono text-xs tracking-widest uppercase">Authenticating</span>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/app/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster theme="dark" position="top-right" toastOptions={{ style: { background: "#0A0A0A", color: "#fff", border: "1px solid rgba(201,154,46,0.25)" } }} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/presenters" element={<Presenters />} />
          <Route path="/concierge" element={<Concierge />} />
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/app" element={<Protected><AppShell /></Protected>}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="studio" element={<Studio />} />
            <Route path="recorder" element={<Recorder />} />
            <Route path="projects" element={<Projects />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
