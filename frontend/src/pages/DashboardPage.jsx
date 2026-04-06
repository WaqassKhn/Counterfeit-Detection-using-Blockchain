import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { fetchAlerts, fetchGraph } from "../api";
import SectionTitle from "../components/SectionTitle";
import StatCard from "../components/StatCard";

const authColors = ["#10b981", "#ef4444"];

export default function DashboardPage() {
  const [alertsData, setAlertsData] = useState({ alerts: [], trend: [], riskScores: [], authenticityStats: { authentic: 0, suspicious: 0 } });
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [alertsResponse, graphResponse] = await Promise.all([fetchAlerts(), fetchGraph()]);
        setAlertsData(alertsResponse);
        setGraph(graphResponse);
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, []);

  const authChartData = [
    { name: "Authentic", value: alertsData.authenticityStats.authentic },
    { name: "Suspicious", value: alertsData.authenticityStats.suspicious }
  ];

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Fraud Intelligence"
        title="Operational integrity, failure points, and authenticity mix"
        body="The dashboard separates authentic versus suspicious products, highlights failure points, and visualizes where lifecycle breakdowns occur."
      />

      {error ? <p className="text-red-600">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Authentic" value={alertsData.authenticityStats.authentic} accent="mint" />
        <StatCard label="Suspicious" value={alertsData.authenticityStats.suspicious} accent="ember" />
        <StatCard label="Failure Points" value={alertsData.alerts.filter((alert) => alert.failurePoint).length} accent="sky" />
        <StatCard label="Tracked Edges" value={graph.edges.length} accent="slate" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[30px] bg-white/80 p-6 shadow-lg">
          <p className="text-sm uppercase tracking-[0.25em] text-atlas-steel">Authenticity Distribution</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={authChartData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={4}>
                  {authChartData.map((entry, index) => (
                    <Cell fill={authColors[index % authColors.length]} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-[30px] bg-white/80 p-6 shadow-lg">
          <p className="text-sm uppercase tracking-[0.25em] text-atlas-steel">Suspicion Trend</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={alertsData.trend}>
                <defs>
                  <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area dataKey="count" fill="url(#trendFill)" stroke="#ef4444" strokeWidth={3} type="monotone" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[30px] bg-white/80 p-6 shadow-lg">
          <SectionTitle eyebrow="Failure Analysis" title="Where suspicious activity was detected" body="Each flagged product includes the lifecycle point where the system first identified a path violation or anomaly." />
          <div className="space-y-3">
            {alertsData.alerts.length ? alertsData.alerts.map((alert) => (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4" key={alert.serialId}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-red-700">{alert.serialId}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-red-500">{alert.severity}</p>
                </div>
                <p className="mt-2 text-sm text-red-700">{alert.anomalyTypes.join(", ")}</p>
                <p className="mt-1 text-sm text-red-700/80">Failure point: {alert.failurePoint ? `${alert.failurePoint.eventType} at ${alert.failurePoint.location}` : "Not available"}</p>
              </div>
            )) : <p className="text-sm text-atlas-steel">No suspicious products yet.</p>}
          </div>
        </section>

        <section className="rounded-[30px] bg-white/80 p-6 shadow-lg">
          <SectionTitle eyebrow="Risk Scores" title="Distribution endpoints under pressure" body="Risk scores rise when routes end in suspicious destinations or break sequence rules." />
          <div className="space-y-3">
            {alertsData.riskScores.length ? alertsData.riskScores.map((item) => (
              <div className="rounded-2xl border border-slate-200 p-4" key={item.entity}>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold">{item.entity}</span>
                  <span className="text-sm">{item.riskScore}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-atlas-ember" style={{ width: `${Math.min(item.riskScore * 100, 100)}%` }} />
                </div>
              </div>
            )) : <p className="text-sm text-atlas-steel">No risk signals available yet.</p>}
          </div>
        </section>
      </div>

      <section className="rounded-[30px] bg-white/80 p-6 shadow-lg">
        <SectionTitle eyebrow="Network View" title="Suspicious path edges across products" body="Each card represents a recorded transition. Red cards indicate a suspicious edge in the lifecycle graph." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {graph.edges.length ? graph.edges.map((edge, index) => (
            <div className={`rounded-2xl border p-4 shadow-sm ${edge.suspicious ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"}`} key={`${edge.serialId}-${edge.source}-${edge.target}-${index}`}>
              <p className="text-xs uppercase tracking-[0.2em] text-atlas-steel">{edge.serialId}</p>
              <p className="mt-2 text-sm font-semibold text-atlas-ink">{edge.details?.source || edge.source} → {edge.details?.destination || edge.target}</p>
              <p className="mt-2 text-sm text-atlas-steel">Event: {edge.details?.eventType || "Lifecycle step"}</p>
              <p className="mt-1 text-sm text-atlas-steel">Time: {edge.details?.timestamp ? new Date(edge.details.timestamp * 1000).toLocaleString() : "Unknown"}</p>
              <p className={`mt-3 text-sm font-semibold ${edge.suspicious ? "text-red-600" : "text-emerald-600"}`}>{edge.suspicious ? "Suspicious edge" : "Approved edge"}</p>
            </div>
          )) : <p className="text-sm text-atlas-steel">The graph will populate once products move through the network.</p>}
        </div>
      </section>
    </div>
  );
}
