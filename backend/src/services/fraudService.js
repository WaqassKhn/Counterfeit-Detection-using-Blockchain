const config = require("../config");

async function callFraudService(payload) {
  try {
    const response = await fetch(`${config.fraudServiceUrl}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Fraud service returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return buildFallbackAnalysis(payload.history || [], error.message);
  }
}

function buildFallbackAnalysis(history, reason) {
  const findings = [];
  const validOrder = ["Manufacturer", "Logistics", "Distributor", "Retailer"];

  for (let index = 1; index < history.length; index += 1) {
    const previous = history[index - 1];
    const current = history[index];
    const previousPos = validOrder.indexOf(previous.role);
    const currentPos = validOrder.indexOf(current.role);

    if (currentPos < previousPos || currentPos - previousPos > 1) {
      findings.push({
        type: "invalid_transition",
        detail: `${previous.role} -> ${current.role} is not allowed`
      });
    }
  }

  const nodes = history.map((event, index) => ({
    id: `${event.role}-${index}`,
    label: `${event.role} ${event.location}`
  }));
  const edges = history.slice(1).map((event, index) => ({
    source: `${history[index].role}-${index}`,
    target: `${event.role}-${index + 1}`,
    suspicious: findings.length > 0
  }));
  const riskScores = {};

  history.forEach((event) => {
    riskScores[event.location] = findings.length ? 0.72 : 0.08;
  });

  return {
    findings,
    severity: findings.length ? "high" : "low",
    authenticityStatus: findings.length ? "suspicious" : "verified",
    graph: { nodes, edges },
    riskScores,
    engine: "fallback",
    reason
  };
}

module.exports = {
  callFraudService
};

