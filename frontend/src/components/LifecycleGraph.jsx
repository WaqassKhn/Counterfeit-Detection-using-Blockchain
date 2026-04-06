function formatTimestamp(timestamp) {
  return new Date(timestamp * 1000).toLocaleString();
}

export default function LifecycleGraph({ events = [], graph, failurePoint }) {
  if (!events.length) {
    return <p className="text-sm text-atlas-steel">No lifecycle data available yet.</p>;
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max items-start gap-6">
        {events.map((event, index) => {
          const node = graph?.nodes?.[index];
          const edge = graph?.edges?.[index];
          const isFailure = failurePoint?.index === index;

          return (
            <div className="flex items-start gap-6" key={`${event.department}-${index}`}>
              <div className="group relative flex w-48 flex-col items-center text-center">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full border-4 text-sm font-semibold text-white shadow-lg ${isFailure ? "ring-4 ring-red-200" : ""}`}
                  style={{ backgroundColor: node?.color || "#64748b", borderColor: "rgba(255,255,255,0.85)" }}
                >
                  {event.department.slice(0, 3).toUpperCase()}
                </div>
                <p className="mt-4 text-sm font-semibold text-atlas-ink">{event.eventType}</p>
                <p className="mt-1 text-sm text-atlas-steel">{event.location}</p>
                <p className="mt-1 text-xs text-atlas-steel">{event.source} → {event.destination}</p>
                <div className="pointer-events-none absolute left-1/2 top-[4.75rem] z-20 hidden w-72 -translate-x-1/2 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-xl group-hover:block">
                  <p className="text-xs uppercase tracking-[0.2em] text-atlas-ocean">Transaction Details</p>
                  <p className="mt-2 text-sm"><span className="font-semibold">Department:</span> {event.department}</p>
                  <p className="text-sm"><span className="font-semibold">Type:</span> {event.eventType}</p>
                  <p className="text-sm"><span className="font-semibold">Source:</span> {event.source}</p>
                  <p className="text-sm"><span className="font-semibold">Destination:</span> {event.destination}</p>
                  <p className="text-sm"><span className="font-semibold">Actor:</span> {event.actorId}</p>
                  <p className="text-sm"><span className="font-semibold">Time:</span> {formatTimestamp(event.timestamp)}</p>
                  <p className="text-sm"><span className="font-semibold">Notes:</span> {event.notes || "None"}</p>
                </div>
              </div>

              {index < events.length - 1 ? (
                <div className="mt-8 flex w-24 flex-col items-center">
                  <div className={`h-1 w-full rounded-full ${edge?.suspicious ? "bg-red-400" : "bg-slate-300"}`} />
                  <p className="mt-2 text-center text-xs text-atlas-steel">{events[index + 1].source} → {events[index + 1].destination}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
