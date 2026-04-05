const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:4000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export function registerProduct(payload) {
  return request("/product/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function transferProduct(payload) {
  return request("/product/transfer", {
    method: "POST",
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

