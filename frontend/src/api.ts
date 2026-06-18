import type { AlertItem, DriftData, KPI, ModelInfo, ModelMetrics, TimelinePoint } from "./types";

const BASE = "/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: "include", ...init });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Auth
export const login = (username: string, password: string) =>
  request<{ username: string; status: string }>(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

export const logout = () =>
  request<{ status: string }>(`${BASE}/auth/logout`, { method: "POST" });

export const getMe = () =>
  request<{ username: string; status: string }>(`${BASE}/auth/me`);

// Dashboard data
export const getKPIs = () => request<KPI>(`${BASE}/stats/kpi`);

export const getTimeline = () =>
  request<{ points: TimelinePoint[] }>(`${BASE}/stats/timeline`).then((r) => r.points);

export const getAlerts = (limit = 100) =>
  request<AlertItem[]>(`${BASE}/alerts?limit=${limit}`);

export const getDrift = () => request<DriftData>(`${BASE}/drift`);

// Models
export const getModels = () => request<ModelInfo[]>(`${BASE}/models`);

export const setActiveModel = (name: string) =>
  request<ModelInfo>(`${BASE}/models/active`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

export const setThreshold = (modelName: string, threshold: number) =>
  request<ModelInfo>(`${BASE}/models/${modelName}/threshold`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ threshold }),
  });

// Alerts
export const submitFeedback = (alertId: string, verdict: "true_positive" | "false_positive") =>
  request<{ status: string; verdict: string }>(`${BASE}/alerts/${alertId}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verdict }),
  });

export const downloadFeedbackCSV = () => {
  window.location.href = `${BASE}/alerts/feedback/export`;
};

// Model comparison
export const getComparison = () =>
  request<ModelMetrics[]>(`${BASE}/models/comparison`);

// Simulation
export const getScenario = () =>
  request<{ active_scenario: string | null }>("/simulate");

export const setScenario = (scenario: string | null) =>
  request<{ active_scenario: string | null }>("/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenario }),
  });
