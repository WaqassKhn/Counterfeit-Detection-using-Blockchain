class AlertStore {
  constructor() {
    this.products = {};
  }

  update(serialId, analysis, history) {
    this.products[serialId] = {
      serialId,
      analysis,
      history,
      updatedAt: new Date().toISOString()
    };
  }

  getAlerts() {
    return Object.values(this.products)
      .filter((item) => (item.analysis.findings || []).length)
      .map((item) => ({
        serialId: item.serialId,
        anomalyTypes: item.analysis.findings.map((finding) => finding.type),
        lastLocation: item.history.events[item.history.events.length - 1]?.location || "Unknown",
        timestamp: item.updatedAt,
        severity: item.analysis.severity || "medium",
        failurePoint: item.analysis.failurePoint || null
      }));
  }

  getGraph() {
    const nodes = [];
    const edges = [];

    Object.values(this.products).forEach((item) => {
      (item.analysis.graph?.nodes || []).forEach((node) => {
        nodes.push({
          ...node,
          id: `${item.serialId}-${node.id}`,
          serialId: item.serialId
        });
      });

      (item.analysis.graph?.edges || []).forEach((edge) => {
        edges.push({
          ...edge,
          source: `${item.serialId}-${edge.source}`,
          target: `${item.serialId}-${edge.target}`,
          serialId: item.serialId
        });
      });
    });

    return { nodes, edges };
  }

  getRiskScores() {
    const merged = {};

    Object.values(this.products).forEach((item) => {
      Object.entries(item.analysis.riskScores || {}).forEach(([entity, score]) => {
        merged[entity] = Math.max(merged[entity] || 0, score);
      });
    });

    return Object.entries(merged).map(([entity, riskScore]) => ({
      entity,
      riskScore
    }));
  }

  getTrend() {
    const buckets = {};

    this.getAlerts().forEach((alert) => {
      const key = alert.timestamp.slice(0, 10);
      buckets[key] = (buckets[key] || 0) + 1;
    });

    return Object.entries(buckets).map(([day, count]) => ({ day, count }));
  }

  getAuthenticityStats() {
    const stats = { authentic: 0, suspicious: 0 };

    Object.values(this.products).forEach((item) => {
      if (item.analysis.authenticityStatus === "verified") {
        stats.authentic += 1;
      } else {
        stats.suspicious += 1;
      }
    });

    return stats;
  }
}

module.exports = new AlertStore();
