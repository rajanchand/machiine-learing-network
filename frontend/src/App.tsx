import { useCallback, useEffect, useRef, useState } from "react";

import { getAlerts, getDrift, getKPIs, getModels, getTimeline, setActiveModel, setThreshold } from "./api";
import { AlertTable } from "./components/AlertTable";
import { FlowFeed } from "./components/FlowFeed";
import { Sidebar, type Page } from "./components/Sidebar";
import { KPIStrip } from "./components/KPIStrip";
import { LoginPage } from "./components/LoginPage";
import { StatusBar } from "./components/StatusBar";
import { SystemOps } from "./components/SystemOps";
import { TimelineChart } from "./components/TimelineChart";
import { useAuth } from "./hooks/useAuth";
import { usePolling } from "./hooks/usePolling";
import { useSSE } from "./hooks/useSSE";
import { DatasetOverview } from "./pages/DatasetOverview";
import { ModelComparison } from "./pages/ModelComparison";
import type { AlertItem, StreamEvent } from "./types";

export default function App() {
  const { user, loading: authLoading, login, logout } = useAuth();

  const [page, setPage] = useState<Page>("monitor");
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activeModel, setActiveModelState] = useState("autoencoder");
  const [threshold, setThresholdState] = useState(0.5);

  // Real-time rate counters
  const flowCountRef = useRef(0);
  const alertCountRef = useRef(0);
  const [flowsPerSec, setFlowsPerSec] = useState(0);
  const [alertRate, setAlertRate] = useState(0);

  const handleIncomingEvent = useCallback((ev: StreamEvent) => {
    flowCountRef.current += 1;
    if (ev.is_anomaly) alertCountRef.current += 1;
  }, []);

  // Tick the per-second rate counters every 2s
  useEffect(() => {
    const id = setInterval(() => {
      setFlowsPerSec(flowCountRef.current / 2);
      setAlertRate(alertCountRef.current / 2);
      flowCountRef.current = 0;
      alertCountRef.current = 0;
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const { events, connected } = useSSE("/api/v1/flows/feed", handleIncomingEvent);

  const { data: kpi, error: kpiError, loading: kpiLoading } = usePolling(getKPIs, 5000, !!user);
  const { data: timeline, error: timelineError, loading: timelineLoading } = usePolling(getTimeline, 5000, !!user);
  const { data: drift, error: driftError, loading: driftLoading } = usePolling(getDrift, 10000, !!user);
  const { error: alertsError } = usePolling(
    useCallback(() => getAlerts(100).then((data) => { setAlerts(data); return data; }), []),
    5000,
    !!user,
  );

  const apiError = kpiError || timelineError || driftError || alertsError;

  usePolling(
    useCallback(async () => {
      const models = await getModels();
      const active = models.find((m) => m.is_active);
      if (active) {
        setActiveModelState(active.name);
        setThresholdState(active.threshold);
      }
      return models;
    }, []),
    30000,
    !!user,
  );

  const handleModelChange = async (name: string) => {
    try {
      await setActiveModel(name);
      setActiveModelState(name);
    } catch {
      // model switch failed — keep existing
    }
  };

  const handleThresholdChange = async (value: number) => {
    setThresholdState(value);
    try {
      await setThreshold(activeModel, value);
    } catch {
      // threshold update failed silently
    }
  };

  const handleFeedbackSubmitted = (alertId: string, verdict: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, feedback_verdict: verdict } : a))
    );
  };

  const allModels = [
    "autoencoder",
    "isolation_forest",
    "halfspace_trees",
    "lightgbm_benchmark",
    "random_forest",
    "xgboost",
  ];

  if (authLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <span className="spinner" style={{ width: 20, height: 20 }} />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        user={user}
        models={allModels}
        activeModel={activeModel}
        threshold={threshold}
        page={page}
        onModelChange={handleModelChange}
        onThresholdChange={handleThresholdChange}
        onLogout={logout}
        onPageChange={setPage}
      />

      <div className="content-container">
        {apiError && (
          <div className="alert-banner error" style={{ margin: "20px 24px 0", borderRadius: 8 }}>
            <strong>⚠️ Service Interruption:</strong> {apiError}. Please ensure the backend server is running.
          </div>
        )}

        {page === "monitor" && (
          <>
            <StatusBar
              connected={connected}
              activeModel={activeModel}
              flowsPerSec={flowsPerSec}
              alertRate={alertRate}
              driftStatus={drift?.status ?? null}
            />

            <main className="main-content">
              <KPIStrip kpi={kpi} loading={kpiLoading} />

              <TimelineChart
                data={timeline ?? []}
                threshold={threshold}
                loading={timelineLoading}
              />

              <FlowFeed events={events} />

              <SystemOps drift={drift} driftLoading={driftLoading} />

              <AlertTable
                alerts={alerts}
                loading={false}
                onFeedbackSubmitted={handleFeedbackSubmitted}
              />
            </main>
          </>
        )}

        {page === "comparison" && <ModelComparison />}

        {page === "dataset" && <DatasetOverview />}
      </div>
    </div>
  );
}
