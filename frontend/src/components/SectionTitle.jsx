export default function SectionTitle({ eyebrow, title, body }) {
  return (
    <div className="mb-6">
      <p className="text-xs uppercase tracking-[0.35em] text-atlas-ocean">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-bold text-atlas-ink">{title}</h2>
      {body ? <p className="mt-3 max-w-3xl text-atlas-steel">{body}</p> : null}
    </div>
  );
}
