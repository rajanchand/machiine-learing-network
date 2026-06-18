import type { KPI } from "../types";

interface Props {
  kpi: KPI | null;
  loading: boolean;
}

export function KPIStrip({ kpi, loading }: Props) {
  if (loading && !kpi) {
    return (
      <div className="kpi-strip span-full">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-label">Loading…</div>
            <div className="kpi-value" style={{ color: "var(--text-faint)" }}>—</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="kpi-strip span-full">
      <div className="kpi-card">
        <div className="kpi-label">Flows Processed</div>
        <div className="kpi-value">{(kpi?.total_flows ?? 0).toLocaleString()}</div>
      </div>

      <div className="kpi-card red">
        <div className="kpi-label">Alerts Raised</div>
        <div className="kpi-value">{(kpi?.total_alerts ?? 0).toLocaleString()}</div>
        {kpi && <div className="kpi-sub">{kpi.open_alerts} open</div>}
      </div>

      <div className="kpi-card amber">
        <div className="kpi-label">Est. False Positive Rate</div>
        <div className="kpi-value">
          {kpi ? `${(kpi.estimated_fpr * 100).toFixed(1)}%` : "—"}
        </div>
      </div>

      <div className="kpi-card purple">
        <div className="kpi-label">Top Talkers</div>
        <div className="kpi-talkers">
          {kpi?.top_talkers.slice(0, 3).map(({ ip }) => (
            <span key={ip} className="ip-badge">{ip}</span>
          )) ?? <span style={{ color: "var(--text-faint)", fontSize: 12 }}>No data</span>}
        </div>
      </div>
    </div>
  );
}
