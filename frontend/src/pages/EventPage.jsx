import { useState } from "react";
import { registerProduct, transferProduct } from "../api";
import SectionTitle from "../components/SectionTitle";

const initialRegister = { serialId: "", manufacturer: "Atlas Corp" };
const initialTransfer = { serialId: "", role: "Logistics", location: "", actorId: "" };

export default function EventPage() {
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [transferForm, setTransferForm] = useState(initialTransfer);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submitRegister(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await registerProduct(registerForm);
      setMessage(`Registered ${response.serialId} on-chain. TX: ${response.txHash}`);
      setRegisterForm(initialRegister);
    } catch (err) {
      setMessage("");
      setError(err.message);
    }
  }

  async function submitTransfer(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await transferProduct(transferForm);
      setMessage(`Recorded ${transferForm.role} transfer for ${response.serialId}. TX: ${response.txHash}`);
      setTransferForm(initialTransfer);
    } catch (err) {
      setMessage("");
      setError(err.message);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-[28px] bg-white/80 p-6 shadow-lg">
        <SectionTitle
          eyebrow="Registration"
          title="Register a new product"
          body="This writes the initial manufacturer event to the permissioned blockchain."
        />

        <form className="space-y-4" onSubmit={submitRegister}>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Serial ID"
            value={registerForm.serialId}
            onChange={(event) => setRegisterForm({ ...registerForm, serialId: event.target.value })}
          />
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Manufacturer"
            value={registerForm.manufacturer}
            onChange={(event) => setRegisterForm({ ...registerForm, manufacturer: event.target.value })}
          />
          <button className="rounded-full bg-atlas-ink px-5 py-3 text-white" type="submit">
            Register Product
          </button>
        </form>
      </section>

      <section className="rounded-[28px] bg-white/80 p-6 shadow-lg">
        <SectionTitle
          eyebrow="Transfer Event"
          title="Record a supply-chain movement"
          body="Authorized participants use this form to add logistics, distributor, or retailer events."
        />

        <form className="space-y-4" onSubmit={submitTransfer}>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Serial ID"
            value={transferForm.serialId}
            onChange={(event) => setTransferForm({ ...transferForm, serialId: event.target.value })}
          />
          <select
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            value={transferForm.role}
            onChange={(event) => setTransferForm({ ...transferForm, role: event.target.value })}
          >
            <option>Logistics</option>
            <option>Distributor</option>
            <option>Retailer</option>
            <option>Manufacturer</option>
          </select>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Location"
            value={transferForm.location}
            onChange={(event) => setTransferForm({ ...transferForm, location: event.target.value })}
          />
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Actor ID (optional)"
            value={transferForm.actorId}
            onChange={(event) => setTransferForm({ ...transferForm, actorId: event.target.value })}
          />
          <button className="rounded-full bg-atlas-ember px-5 py-3 text-white" type="submit">
            Record Transfer
          </button>
        </form>
      </section>

      {(message || error) ? (
        <section className="lg:col-span-2 rounded-[28px] bg-slate-950 p-6 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Submission status</p>
          {message ? <p className="mt-3 text-emerald-300">{message}</p> : null}
          {error ? <p className="mt-3 text-red-300">{error}</p> : null}
        </section>
      ) : null}
    </div>
  );
}

