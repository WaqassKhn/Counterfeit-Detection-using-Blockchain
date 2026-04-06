import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import VerifyPage from "./pages/VerifyPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import PortalPage from "./pages/PortalPage";

const SESSION_KEY = "atlas-session";

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? "bg-atlas-ink text-white" : "bg-white/60 text-atlas-ink hover:bg-white"
  }`;

function ProtectedRoute({ actor, children }) {
  if (!actor) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  return (
    <Layout actor={session?.actor} onLogout={() => setSession(null)}>
      <nav className="mb-8 flex flex-wrap gap-3">
        <NavLink className={linkClass} to="/">
          Verify Authenticity
        </NavLink>
        <NavLink className={linkClass} to="/dashboard">
          Intelligence Dashboard
        </NavLink>
        {session?.actor ? (
          <NavLink className={linkClass} to="/portal">
            {session.actor.role} Portal
          </NavLink>
        ) : (
          <NavLink className={linkClass} to="/login">
            Authorized Access
          </NavLink>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<VerifyPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/login" element={<LoginPage onLogin={setSession} />} />
        <Route
          path="/portal"
          element={
            <ProtectedRoute actor={session?.actor}>
              <PortalPage session={session} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}
