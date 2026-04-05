export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_30%),linear-gradient(135deg,_#f8fafc,_#e2e8f0)] px-4 py-8 text-atlas-ink">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 rounded-[32px] border border-white/60 bg-white/70 p-8 shadow-lg backdrop-blur">
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-atlas-ember">Atlas Corp</p>
          <h1 className="font-display text-4xl font-bold md:text-5xl">Blockchain Counterfeit Prevention Network</h1>
          <p className="mt-4 max-w-3xl text-base text-atlas-steel">
            Permissioned lifecycle tracking for spare parts, with immutable blockchain records, anomaly detection,
            and customer-facing authenticity verification.
          </p>
        </header>
        {children}
      </div>
    </div>
  );
}

