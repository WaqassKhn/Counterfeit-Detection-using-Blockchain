import { useEffect, useState } from "react";
import { fetchActors, login } from "../api";
import SectionTitle from "../components/SectionTitle";

const initialForm = {
  username: "manufacturer1",
  password: "atlas-manufacturer"
};

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState(initialForm);
  const [actors, setActors] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchActors()
      .then((data) => setActors(data.actors))
      .catch(() => setActors([]));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const session = await login(form);
      onLogin(session);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[30px] bg-white/80 p-6 shadow-lg">
        <SectionTitle
          eyebrow="Authorized Access"
          title="Role-gated control panels"
          body="Only predefined manufacturer, logistics, and distributor actors can access operational forms. Verification remains public."
        />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Username"
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
          />
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          <button className="rounded-full bg-atlas-ink px-5 py-3 text-white" type="submit">
            Access Portal
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="rounded-[30px] bg-slate-950 p-6 text-white shadow-lg">
        <SectionTitle
          eyebrow="Demo Accounts"
          title="Dummy actors mapped to network roles"
          body="These identities are backend-enforced and designed so you can later replace them with real wallet-based auth."
        />

        <div className="space-y-3">
          {actors.map((actor) => (
            <div className="rounded-2xl bg-white/10 p-4" key={actor.id}>
              <p className="font-semibold">{actor.displayName}</p>
              <p className="text-sm text-slate-300">{actor.role} · {actor.location}</p>
              <p className="mt-2 text-xs text-slate-400">{actor.username} / {actor.role === "Manufacturer" ? "atlas-manufacturer" : actor.role === "Logistics" ? "atlas-logistics" : "atlas-distributor"}</p>
              <p className="text-xs text-slate-500">{actor.walletHint}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
