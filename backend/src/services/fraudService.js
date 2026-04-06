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
    return buildFallbackAnalysis(payload.history || [], payload.product || {}, error.message);
  }
}

function buildFallbackAnalysis(history, product, reason) {
  const findings = [];
  let failurePoint = null;
  let lastDepartment = "Manufacturer";
  let logisticsStarted = false;
  let firstLogisticsOrigin = "";
  let finalDistributorDestination = "";

  history.forEach((event, index) => {
    if (event.department === "Logistics") {
      logisticsStarted = true;
      if (!firstLogisticsOrigin) {
        firstLogisticsOrigin = event.source;
        if (!String(event.source || "").toLowerCase().includes("manufacturer") &&
            event.source !== product.manufacturerName) {
          findings.push({
            type: "invalid_logistics_origin",
            detail: "The first logistics stop must originate from the manufacturer."
          });
          failurePoint = failurePoint || { index, location: event.location, eventType: event.eventType };
        }
      }

      finalDistributorDestination = event.destination || finalDistributorDestination;
    }

    if (event.department === "Distributor" && !logisticsStarted) {
      findings.push({
        type: "missing_logistics_chain",
        detail: "Distributor sale recorded before the logistics chain completed."
      });
      failurePoint = failurePoint || { index, location: event.location, eventType: event.eventType };
    }

    if (event.department === "Distributor" && finalDistributorDestination && event.location !== finalDistributorDestination) {
      findings.push({
        type: "wrong_distributor_destination",
        detail: "Distributor retail location does not match the logistics destination."
      });
      failurePoint = failurePoint || { index, location: event.location, eventType: event.eventType };
    }

    if (lastDepartment === "Distributor" && event.department === "Logistics") {
      findings.push({
        type: "reverse_transition",
        detail: "Logistics events cannot occur after the distributor closes the cycle."
      });
      failurePoint = failurePoint || { index, location: event.location, eventType: event.eventType };
    }

    lastDepartment = event.department;
  });

  const nodeColors = {
    Manufacturer: "#2563eb",
    Logistics: "#f97316",
    Distributor: "#10b981"
  };

  const nodes = history.map((event, index) => ({
    id: `${index}`,
    label: event.department,
    color: nodeColors[event.department] || "#64748b",
    details: event
  }));

  const edges = history.slice(1).map((event, index) => ({
    source: `${index}`,
    target: `${index + 1}`,
    suspicious: Boolean(failurePoint && (failurePoint.index === index || failurePoint.index === index + 1)),
    details: {
      source: event.source,
      destination: event.destination,
      timestamp: event.timestamp,
      eventType: event.eventType
    }
  }));

  const riskScores = {};
  history.forEach((event) => {
    const key = event.destination || event.location;
    riskScores[key] = findings.length ? 0.78 : 0.12;
  });

  return {
    findings,
    severity: findings.length ? "high" : "low",
    authenticityStatus: findings.length ? "suspicious" : "verified",
    failurePoint,
    graph: { nodes, edges },
    riskScores,
    engine: "fallback",
    reason
  };
}

module.exports = {
  callFraudService
};
