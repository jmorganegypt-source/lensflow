import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LumenAuthProvider, useLumenAuth } from "./context/LumenAuthContext";
import { Toaster } from "sonner";
import "@/App.css";
import "@/lumen.css";

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
import BillingSuccess from "./pages/app/BillingSuccess";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

// Lumen
import LumenLanding from "./pages/lumen/Landing";
import LumenLogin from "./pages/lumen/Login";
import LumenRegister from "./pages/lumen/Register";
import LumenPricing from "./pages/lumen/Pricing";
import LumenShare from "./pages/lumen/Share";
import LumenAppShell from "./pages/lumen/app/AppShell";
import LumenHome from "./pages/lumen/app/Home";
import LumenCreate from "./pages/lumen/app/Create";
import LumenLibrary from "./pages/lumen/app/Library";
import LumenBilling from "./pages/lumen/app/Billing";
import LumenBillingSuccess from "./pages/lumen/app/BillingSuccess";
import LumenSettings from "./pages/lumen/app/Settings";

// ----- LensFlow guards -----
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

// ----- Lumen guards -----
function LumenProtected({ children }) {
  const { user } = useLumenAuth();
  if (user === null) {
    return (
      <div className="lumen-root min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#FF6B6B] text-sm font-semibold">
          <div className="w-2 h-2 bg-[#FF6B6B] rounded-full animate-pulse" /> loading…
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/lumen/login" replace />;
  return children;
}
function LumenPublicOnly({ children }) {
  const { user } = useLumenAuth();
  if (user) return <Navigate to="/lumen/app/home" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LumenAuthProvider>
          <Toaster richColors position="top-right" />
          <PWAInstallPrompt />
          <Routes>
            {/* LensFlow (root) */}
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
              <Route path="billing/success" element={<BillingSuccess />} />
            </Route>

            {/* Lumen (separate brand) */}
            <Route path="/lumen" element={<LumenLanding />} />
            <Route path="/lumen/pricing" element={<LumenPricing />} />
            <Route path="/lumen/share/:token" element={<LumenShare />} />
            <Route path="/lumen/login" element={<LumenPublicOnly><LumenLogin /></LumenPublicOnly>} />
            <Route path="/lumen/register" element={<LumenPublicOnly><LumenRegister /></LumenPublicOnly>} />
            <Route path="/lumen/app" element={<LumenProtected><LumenAppShell /></LumenProtected>}>
              <Route index element={<Navigate to="/lumen/app/home" replace />} />
              <Route path="home" element={<LumenHome />} />
              <Route path="create" element={<LumenCreate />} />
              <Route path="library" element={<LumenLibrary />} />
              <Route path="billing" element={<LumenBilling />} />
              <Route path="billing/success" element={<LumenBillingSuccess />} />
              <Route path="settings" element={<LumenSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LumenAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
