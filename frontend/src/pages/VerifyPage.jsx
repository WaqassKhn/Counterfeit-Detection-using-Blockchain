import { useEffect, useState } from "react";
import { fetchProduct, fetchNfcTags, readNfcTag } from "../api";
import LifecycleGraph from "../components/LifecycleGraph";
import SectionTitle from "../components/SectionTitle";

export default function VerifyPage() {
  const [serialId, setSerialId] = useState("AX1001");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState("NFC-AX1001");

  useEffect(() => {
    fetchNfcTags().then((data) => setTags(data.tags)).catch(() => setTags([]));
  }, []);

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

  async function handleDummyNfcRead() {
    try {
      const data = await readNfcTag(selectedTagId);
      setSerialId(data.tag.serialId);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <section className="rounded-[30px] bg-white/80 p-6 shadow-lg">
          <SectionTitle
            eyebrow="Product Authenticity"
            title="Verify a part by serial number or dummy NFC tag"
            body="Customers can inspect the full lifecycle, hover each department node, and see where any suspicious activity occurred."
          />

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-atlas-sky focus:ring-2"
              value={serialId}
              onChange={(event) => setSerialId(event.target.value)}
              placeholder="Enter serial ID"
            />
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-atlas-ink px-5 py-3 text-white" disabled={loading} type="submit">
                {loading ? "Verifying..." : "Verify Product"}
              </button>
              <select className="rounded-full border border-slate-200 px-4 py-3" value={selectedTagId} onChange={(event) => setSelectedTagId(event.target.value)}>
                {tags.map((tag) => (
                  <option key={tag.tagId} value={tag.tagId}>{tag.tagId}</option>
                ))}
              </select>
              <button className="rounded-full bg-atlas-ocean px-5 py-3 text-white" onClick={handleDummyNfcRead} type="button">
                Read Dummy NFC
              </button>
            </div>
          </form>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </section>

        <section className="rounded-[30px] bg-slate-950 p-6 text-white shadow-lg">
          <SectionTitle
            eyebrow="Verification Result"
            title={result ? result.authenticityStatus.toUpperCase() : "Awaiting lookup"}
            body={result ? `${result.manufacturerName} · Batch ${result.batchNumber} · Manufactured ${result.manufactureDate}` : "The authenticity verdict appears here after lookup."}
          />

          {result ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Lifecycle Path</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{result.path.join(" → ")}</p>
              </div>
              <div className={`rounded-3xl p-4 ${result.failurePoint ? "bg-red-500/20 text-red-100" : "bg-emerald-500/20 text-emerald-100"}`}>
                <p className="text-xs uppercase tracking-[0.25em]">Failure Point</p>
                <p className="mt-3 text-sm">
                  {result.failurePoint ? `${result.failurePoint.eventType} at ${result.failurePoint.location}` : "No suspicious failure point detected."}
                </p>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <section className="rounded-[30px] bg-white/80 p-6 shadow-lg">
        <SectionTitle
          eyebrow="Lifecycle Graph"
          title="Visual chain of custody"
          body="Different colors represent departments. Hover a node to inspect transaction details including source, destination, actor, time, and notes."
        />
        <LifecycleGraph events={result?.events || []} graph={result?.graph} failurePoint={result?.failurePoint} />
      </section>

      {result ? (
        <section className="rounded-[30px] bg-white/80 p-6 shadow-lg">
          <SectionTitle eyebrow="Warnings" title="Suspicion indicators" body="These findings are generated from lifecycle-path rules and anomaly checks." />
          {result.fraudWarnings.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {result.fraudWarnings.map((warning, index) => (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4" key={`${warning.type}-${index}`}>
                  <p className="text-sm font-semibold text-red-700">{warning.type}</p>
                  <p className="mt-2 text-sm text-red-700/90">{warning.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-emerald-700">No anomalies detected for this product.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
