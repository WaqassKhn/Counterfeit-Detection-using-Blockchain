export default function StatCard({ label, value, accent = "sky" }) {
  const border =
    accent === "ember" ? "border-atlas-ember" : accent === "mint" ? "border-atlas-mint" : "border-atlas-sky";

  return (
    <div className={`rounded-3xl border ${border} bg-white/80 p-5 shadow-sm`}>
      <p className="text-sm uppercase tracking-[0.2em] text-atlas-steel">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

