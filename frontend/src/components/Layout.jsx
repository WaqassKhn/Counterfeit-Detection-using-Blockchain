export default function Layout({ children, actor, onLogout }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.22),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.15),_transparent_30%),linear-gradient(135deg,_#eff6ff,_#f8fafc_35%,_#ecfeff)] px-4 py-8 text-atlas-ink">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 rounded-[32px] border border-white/70 bg-white/75 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.45em] text-atlas-ocean">Atlas Corp</p>
              <h1 className="font-display text-4xl font-bold md:text-5xl">Counterfeit-Resilient Supply Chain Network</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-atlas-steel">
                Permissioned lifecycle tracking for spare parts with multi-stop logistics, role-gated operations,
                anomaly detection, NFC simulation, and customer-facing authenticity verification.
              </p>
            </div>

            <div className="rounded-3xl bg-atlas-ink px-5 py-4 text-white shadow-lg">
              {actor ? (
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-sky-200">Active Actor</p>
                    <p className="text-sm font-semibold">{actor.displayName}</p>
                    <p className="text-xs text-slate-300">{actor.role} · {actor.location}</p>
                  </div>
                  <button className="rounded-full border border-white/20 px-4 py-2 text-sm" onClick={onLogout} type="button">
                    Logout
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-sky-200">Mode</p>
                  <p className="text-sm font-semibold">Verification and Monitoring</p>
                </div>
              )}
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
