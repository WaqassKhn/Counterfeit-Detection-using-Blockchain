class AlertStore {
  constructor() {
    this.alerts = [];
    this.graph = {
      nodes: [],
      edges: []
    };
    this.riskScores = {};
  }

  update(serialId, analysis, history) {
    const findings = analysis.findings || [];
    const latestEvent = history.events[history.events.length - 1];

    this.alerts = this.alerts.filter((item) => item.serialId !== serialId);

    if (findings.length) {
      this.alerts.unshift({
        serialId,
        anomalyTypes: findings.map((finding) => finding.type),
        lastLocation: latestEvent?.location || "Unknown",
        timestamp: new Date().toISOString(),
        severity: analysis.severity || "medium"
      });
    }

    this.graph = analysis.graph || this.graph;
    this.riskScores = analysis.riskScores || this.riskScores;
  }

  getAlerts() {
    return this.alerts;
  }

  getGraph() {
    return this.graph;
  }

  getRiskScores() {
    return Object.entries(this.riskScores).map(([entity, riskScore]) => ({
      entity,
      riskScore
    }));
  }

  getTrend() {
    const buckets = {};

    for (const alert of this.alerts) {
      const key = alert.timestamp.slice(0, 7);
      buckets[key] = (buckets[key] || 0) + 1;
    }

    return Object.entries(buckets).map(([month, count]) => ({
      month,
      count
    }));
  }
}

module.exports = new AlertStore();

