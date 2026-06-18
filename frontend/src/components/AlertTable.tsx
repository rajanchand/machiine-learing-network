import { useState } from "react";
import { downloadFeedbackCSV } from "../api";
import type { AlertItem } from "../types";
import { AlertDrillDown } from "./AlertDrillDown";

type StatusFilter = "all" | "open" | "acknowledged" | "resolved";

const TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Acknowledged", value: "acknowledged" },
  { label: "Resolved", value: "resolved" },
];

type SeverityFilter = "all" | "low" | "medium" | "high" | "critical";

interface Props {
  alerts: AlertItem[];
  loading: boolean;
  onFeedbackSubmitted: (alertId: string, verdict: string) => void;
}

export function AlertTable({ alerts, loading, onFeedbackSubmitted }: Props) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [selected, setSelected] = useState<AlertItem | null>(null);

  const visible = alerts
    .filter((a) => filter === "all" || a.status === filter)
    .filter((a) => severityFilter === "all" || a.severity.toLowerCase() === severityFilter);

  return (
    <div className="card span-full">
      <div className="tab-bar">
        {TABS.map(({ label, value }) => (
          <button
            key={value}
            className={`tab ${filter === value ? "active" : ""}`}
            onClick={() => setFilter(value)}
            type="button"
          >
            {label}
            {value !== "all" && (
              <span style={{ marginLeft: 4, color: "var(--text-faint)" }}>
                ({alerts.filter((a) => a.status === value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="alert-table-toolbar">
        <div style={{ display: "flex", alignItems: "center", marginRight: "auto", paddingLeft: 4 }}>
          <label htmlFor="severity-filter" style={{ fontSize: 12, color: "var(--text-muted)", marginRight: 8 }}>
            Severity:
          </label>
          <select
            id="severity-filter"
            className="header-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button className="btn-sm" onClick={downloadFeedbackCSV} type="button">
          Export feedback CSV
        </button>
      </div>

      <div className="table-scroll" style={{ maxHeight: 320 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Severity</th>
              <th>Attack Type</th>
              <th>Verdict</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && !alerts.length && (
              <tr className="loading-row">
                <td colSpan={5}><span className="spinner" />Loading alerts…</td>
              </tr>
            )}
            {!loading && visible.length === 0 && (
              <tr className="empty-row">
                <td colSpan={5}>No alerts in this category</td>
              </tr>
            )}
            {visible.map((alert) => (
              <tr
                key={alert.id}
                className="clickable"
                onClick={() => setSelected(alert)}
              >
                <td className="mono">
                  {new Date(alert.created_at).toLocaleString([], {
                    month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </td>
                <td>
                  <span className={`badge badge-${alert.severity}`}>{alert.severity}</span>
                </td>
                <td>{alert.suspected_attack_type ?? "—"}</td>
                <td>
                  {alert.feedback_verdict ? (
                    <span className={`badge badge-${alert.feedback_verdict === "true_positive" ? "tp" : "fp"}`}>
                      {alert.feedback_verdict === "true_positive" ? "TP" : "FP"}
                    </span>
                  ) : (
                    <span className="badge badge-pending">Pending</span>
                  )}
                </td>
                <td>
                  <span className={`badge badge-${alert.status}`}>{alert.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <AlertDrillDown
          alert={selected}
          onClose={() => setSelected(null)}
          onFeedbackSubmitted={(id, verdict) => {
            onFeedbackSubmitted(id, verdict);
            setSelected((prev) => prev?.id === id ? { ...prev, feedback_verdict: verdict } : prev);
          }}
        />
      )}
    </div>
  );
}
