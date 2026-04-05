import { useState } from "react";
import { fetchProduct } from "../api";
import SectionTitle from "../components/SectionTitle";

export default function VerifyPage() {
  const [serialId, setSerialId] = useState("AX1001");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await fetchProduct(serialId);
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
      <section className="rounded-[28px] bg-white/80 p-6 shadow-lg">
        <SectionTitle
          eyebrow="Customer Verification"
          title="Check if a spare part is genuine"
          body="Enter a serial ID to retrieve its on-chain lifecycle, manufacturer, supply-chain path, and any fraud warnings."
        />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-atlas-sky focus:ring-2"
            value={serialId}
            onChange={(event) => setSerialId(event.target.value)}
            placeholder="Enter serial ID"
          />
          <button className="rounded-full bg-atlas-ink px-5 py-3 text-white" disabled={loading} type="submit">
            {loading ? "Verifying..." : "Verify Product"}
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="rounded-[28px] bg-slate-950 p-6 text-white shadow-lg">
        <SectionTitle
          eyebrow="Authenticity Result"
          title={result ? result.authenticityStatus.toUpperCase() : "Awaiting serial lookup"}
          body={result ? `Manufacturer: ${result.manufacturer}` : "The result will appear here after a verification request."}
        />

        {result ? (
          <div className="space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Path</p>
              <p className="mt-2 text-lg">{result.path.join(" -> ")}</p>
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">History</p>
              <div className="mt-3 space-y-3">
                {result.events.map((eventItem, index) => (
                  <div className="rounded-2xl bg-white/10 p-3" key={`${eventItem.role}-${index}`}>
                    <p className="font-semibold">{eventItem.role}</p>
                    <p className="text-sm text-slate-300">{eventItem.location}</p>
                    <p className="text-xs text-slate-400">{new Date(eventItem.timestamp * 1000).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Fraud Warnings</p>
              {result.fraudWarnings.length ? (
                <ul className="mt-3 space-y-2 text-sm text-amber-300">
                  {result.fraudWarnings.map((warning, index) => (
                    <li key={`${warning.type}-${index}`}>
                      {warning.type}: {warning.detail}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-emerald-300">No anomalies detected for this product.</p>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

