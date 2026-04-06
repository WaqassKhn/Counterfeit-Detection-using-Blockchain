export default function StatCard({ label, value, accent = "sky", subtext }) {
  const accentMap = {
    sky: "border-atlas-sky bg-sky-50",
    mint: "border-atlas-mint bg-emerald-50",
    ember: "border-atlas-ember bg-orange-50",
    slate: "border-slate-300 bg-slate-50"
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${accentMap[accent] || accentMap.slate}`}>
      <p className="text-xs uppercase tracking-[0.25em] text-atlas-steel">{label}</p>
      <p className="mt-3 text-3xl font-bold text-atlas-ink">{value}</p>
      {subtext ? <p className="mt-2 text-sm text-atlas-steel">{subtext}</p> : null}
    </div>
  );
}
