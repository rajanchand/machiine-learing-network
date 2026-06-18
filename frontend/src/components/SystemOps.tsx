import { getScenario, setScenario } from "../api";
import { usePolling } from "../hooks/usePolling";
import type { DriftData } from "../types";

const SCENARIOS = [
  { id: "ddos", label: "DDoS" },
  { id: "port_scan", label: "Port Scan" },
  { id: "brute_force", label: "Brute Force" },
];

interface Props {
  drift: DriftData | null;
  driftLoading: boolean;
}

export function SystemOps({ drift, driftLoading }: Props) {
  const { data: scenarioData, refresh } = usePolling(getScenario, 3000);
  const activeScenario = scenarioData?.active_scenario ?? null;

  const toggle = async (id: string) => {
    await setScenario(activeScenario === id ? null : id);
    refresh();
  };

  const topPsiEntries = Object.entries(drift?.feature_psis ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Attack simulation */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Attack Simulation</span>
        </div>
        <div className="card-body">
          <div className="scenario-grid">
            {SCENARIOS.map(({ id, label }) => (
              <button
                key={id}
                className={`scenario-btn ${activeScenario === id ? "active" : ""}`}
                onClick={() => toggle(id)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          {activeScenario && (
            <div className="active-scenario-indicator">
              <span className="pulse-dot" />
              Injecting: {activeScenario.replace(/_/g, " ")}
            </div>
          )}
        </div>
      </div>

      {/* Drift monitor */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Feature Drift (PSI)</span>
          {driftLoading && <span className="spinner" />}
        </div>
        <div className="card-body">
          {drift ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  {drift.overall_psi.toFixed(3)}
                </span>
                <span className={`badge badge-${drift.status === "drifting" ? "medium" : "low"}`}>
                  {drift.status}
                </span>
              </div>

              <div className="feature-psi-list">
                {topPsiEntries.map(([name, psi]) => {
                  const pct = Math.min((psi / 0.5) * 100, 100);
                  const cls = psi > 0.25 ? "critical" : psi > 0.1 ? "drifting" : "";
                  return (
                    <div key={name} className="feature-psi-row">
                      <span className="feature-psi-name">{name}</span>
                      <div className="feature-psi-bar-track">
                        <div
                          className={`feature-psi-bar-fill ${cls}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="feature-psi-value">{psi.toFixed(3)}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p style={{ color: "var(--text-faint)", fontSize: 13 }}>
              {driftLoading ? "Loading drift data…" : "No drift data available"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
