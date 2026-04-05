export default function SectionTitle({ eyebrow, title, body }) {
  return (
    <div className="mb-6">
      <p className="text-xs uppercase tracking-[0.3em] text-atlas-ember">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-bold">{title}</h2>
      {body ? <p className="mt-2 max-w-2xl text-atlas-steel">{body}</p> : null}
    </div>
  );
}

