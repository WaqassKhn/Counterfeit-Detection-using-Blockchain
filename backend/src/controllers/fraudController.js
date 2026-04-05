const alertStore = require("../services/alertStore");

function getAlerts(req, res) {
  res.json({
    alerts: alertStore.getAlerts(),
    trend: alertStore.getTrend(),
    riskScores: alertStore.getRiskScores()
  });
}

function getGraph(req, res) {
  res.json(alertStore.getGraph());
}

module.exports = {
  getAlerts,
  getGraph
};

