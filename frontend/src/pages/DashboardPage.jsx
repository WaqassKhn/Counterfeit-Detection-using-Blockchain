import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { fetchAlerts, fetchGraph } from "../api";
import SectionTitle from "../components/SectionTitle";
import StatCard from "../components/StatCard";

export default function DashboardPage() {
  const [alertsData, setAlertsData] = useState({ alerts: [], trend: [], riskScores: [] });
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

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Fraud Intelligence"
        title="See counterfeit risk across the Atlas network"
        body="This dashboard combines graph validation, anomaly detection, and participant risk scoring to spotlight suspicious supply-chain behavior."
      />

      {error ? <p className="text-red-600">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Suspicious Products" value={alertsData.alerts.length} accent="ember" />
        <StatCard label="Graph Nodes" value={graph.nodes.length} />
        <StatCard label="Risk Entities" value={alertsData.riskScores.length} accent="mint" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[28px] bg-white/80 p-6 shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-atlas-steel">Fraud Trend</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={alertsData.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line dataKey="count" stroke="#ea580c" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-[28px] bg-white/80 p-6 shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-atlas-steel">Entity Risk Scores</p>
          <div className="mt-4 space-y-3">
            {alertsData.riskScores.length ? (
              alertsData.riskScores.map((item) => (
                <div className="rounded-2xl border border-slate-200 p-4" key={item.entity}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">{item.entity}</span>
                    <span className="text-sm">{item.riskScore}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-atlas-ember"
                      style={{ width: `${Math.min(item.riskScore * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-atlas-steel">No risk signals available yet.</p>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[28px] bg-white/80 p-6 shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-atlas-steel">Suspicious Product List</p>
          <div className="mt-4 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-atlas-steel">
                  <th className="pb-3">Serial ID</th>
                  <th className="pb-3">Anomaly Type</th>
                  <th className="pb-3">Last Location</th>
                  <th className="pb-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {alertsData.alerts.length ? (
                  alertsData.alerts.map((alert) => (
                    <tr className="border-b border-slate-100" key={alert.serialId}>
                      <td className="py-3">{alert.serialId}</td>
                      <td className="py-3">{alert.anomalyTypes.join(", ")}</td>
                      <td className="py-3">{alert.lastLocation}</td>
                      <td className="py-3">{new Date(alert.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-4 text-atlas-steel" colSpan="4">
                      No suspicious products yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[28px] bg-slate-950 p-6 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Supply Chain Graph Summary</p>
          <div className="mt-4 space-y-3">
            {graph.edges.length ? (
              graph.edges.map((edge, index) => (
                <div
                  className={`rounded-2xl p-4 ${edge.suspicious ? "bg-red-500/20 text-red-200" : "bg-white/10 text-white"}`}
                  key={`${edge.source}-${edge.target}-${index}`}
                >
                  <p>
                    {edge.source} -&gt; {edge.target}
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    {edge.suspicious ? "Suspicious edge highlighted by graph validation" : "Approved movement"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-300">The graph will populate after products are registered and moved.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

