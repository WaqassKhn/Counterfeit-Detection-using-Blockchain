const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:4000";

function authHeaders(token) {
  return token
    ? {
        Authorization: `Bearer ${token}`
      }
    : {};
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export function login(payload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchActors() {
  return request("/auth/actors");
}

export function registerProduct(payload, token) {
  return request("/product/register", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export function addLogisticsStop(payload, token) {
  return request("/product/logistics/stop", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export function closeLogisticsCycle(payload, token) {
  return request("/product/logistics/complete", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export function recordRetail(payload, token) {
  return request("/product/distributor/retail", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export function fetchProduct(serialId) {
  return request(`/product/${serialId}`);
}

export function fetchAlerts() {
  return request("/fraud/alerts");
}

export function fetchGraph() {
  return request("/fraud/graph");
}

export function fetchNfcTags() {
  return request("/nfc/tags");
}

export function readNfcTag(tagId) {
  return request(`/nfc/read/${tagId}`);
}
