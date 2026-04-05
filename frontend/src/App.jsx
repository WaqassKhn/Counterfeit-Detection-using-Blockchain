import { NavLink, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import VerifyPage from "./pages/VerifyPage";
import EventPage from "./pages/EventPage";
import DashboardPage from "./pages/DashboardPage";

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? "bg-atlas-ink text-white" : "bg-white/70 text-atlas-ink hover:bg-white"
  }`;

export default function App() {
  return (
    <Layout>
      <nav className="mb-8 flex flex-wrap gap-3">
        <NavLink className={linkClass} to="/">
          Verify Product
        </NavLink>
        <NavLink className={linkClass} to="/events">
          Supply Chain Event
        </NavLink>
        <NavLink className={linkClass} to="/dashboard">
          Fraud Intelligence
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<VerifyPage />} />
        <Route path="/events" element={<EventPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Layout>
  );
}

