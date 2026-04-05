from math import radians, cos, sin, asin, sqrt

import numpy as np

try:
    from sklearn.ensemble import IsolationForest
except Exception:
    IsolationForest = None

from graph_rules import analyze_flow


CITY_COORDS = {
    "Mumbai": (19.0760, 72.8777),
    "Delhi": (28.6139, 77.2090),
    "Bengaluru": (12.9716, 77.5946),
    "London": (51.5072, -0.1276),
    "Dubai": (25.2048, 55.2708),
    "Factory": (18.5204, 73.8567),
}


def haversine_km(source, target):
    if source not in CITY_COORDS or target not in CITY_COORDS:
        return 0.0

    lat1, lon1 = CITY_COORDS[source]
    lat2, lon2 = CITY_COORDS[target]
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    value = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return 6371 * 2 * asin(sqrt(value))


def extract_features(history):
    events = len(history)
    duplicate_locations = len(history) - len(set(item["location"] for item in history))
    invalid_transition_count = len(analyze_flow(history))

    if len(history) < 2:
      return np.array([[events, 0, duplicate_locations, invalid_transition_count]])

    previous = history[-2]
    current = history[-1]
    delta_seconds = max(current["timestamp"] - previous["timestamp"], 1)
    distance_km = haversine_km(previous["location"], current["location"])

    return np.array([[events, distance_km, duplicate_locations, invalid_transition_count + (3600 / delta_seconds)]])


def deterministic_score(history):
    score = 0.05
    findings = []
    findings.extend(analyze_flow(history))

    if len(history) >= 2:
        previous = history[-2]
        current = history[-1]
        distance_km = haversine_km(previous["location"], current["location"])
        delta_seconds = max(current["timestamp"] - previous["timestamp"], 1)

        if distance_km > 4000 and delta_seconds < 6 * 3600:
            findings.append(
                {
                    "type": "impossible_location_jump",
                    "detail": f'{previous["location"]} -> {current["location"]} within {delta_seconds / 3600:.1f} hours'
                }
            )
            score += 0.45

        if delta_seconds < 300:
            findings.append(
                {
                    "type": "abnormal_transfer_timing",
                    "detail": "Transfers are happening too quickly to be operationally normal"
                }
            )
            score += 0.2

    if len(history) > 5:
        findings.append(
            {
                "type": "high_scan_frequency",
                "detail": "The same product has an unusually high number of lifecycle events"
            }
        )
        score += 0.15

    return min(score, 0.99), findings


def build_graph(history):
    nodes = []
    edges = []
    suspicious = len(analyze_flow(history)) > 0

    for index, event in enumerate(history):
        nodes.append(
            {
                "id": f'{event["role"]}-{index}',
                "label": event["role"],
                "location": event["location"],
            }
        )

        if index > 0:
            edges.append(
                {
                    "source": f'{history[index - 1]["role"]}-{index - 1}',
                    "target": f'{event["role"]}-{index}',
                    "suspicious": suspicious,
                }
            )

    return {"nodes": nodes, "edges": edges}


def entity_risk_scores(history, anomaly_score):
    result = {}
    for event in history:
        current = result.get(event["location"], 0.05)
        result[event["location"]] = round(max(current, anomaly_score), 2)
    return result


def analyze_payload(payload):
    history = payload.get("history", [])
    features = extract_features(history)
    score, findings = deterministic_score(history)

    if IsolationForest is not None and len(history) >= 2:
        model = IsolationForest(contamination=0.2, random_state=42)
        synthetic_baseline = np.vstack(
            [
                [2, 50, 0, 0.2],
                [3, 300, 0, 0.1],
                [4, 800, 1, 0.4],
                [4, 200, 0, 0.15],
                features[0],
            ]
        )
        predictions = model.fit_predict(synthetic_baseline)
        if predictions[-1] == -1:
            score = min(score + 0.2, 0.99)
            findings.append(
                {
                    "type": "ml_anomaly",
                    "detail": "Isolation Forest marked this product route as anomalous"
                }
            )

    status = "verified" if score < 0.5 and not findings else "suspicious"
    severity = "low"
    if score >= 0.7:
        severity = "high"
    elif score >= 0.4:
        severity = "medium"

    return {
        "findings": findings,
        "severity": severity,
        "authenticityStatus": status,
        "anomalyScore": round(score, 2),
        "graph": build_graph(history),
        "riskScores": entity_risk_scores(history, round(score, 2)),
    }

