import { useState } from "react";
import { submitFeedback } from "../api";
import type { AlertItem } from "../types";

interface Props {
  alert: AlertItem;
  onClose: () => void;
  onFeedbackSubmitted: (alertId: string, verdict: string) => void;
}

function SeverityBadge({ severity }: { severity: string }) {
  return <span className={`badge badge-${severity}`}>{severity}</span>;
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

export function AlertDrillDown({ alert, onClose, onFeedbackSubmitted }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [localVerdict, setLocalVerdict] = useState(alert.feedback_verdict);

  const handleFeedback = async (verdict: "true_positive" | "false_positive") => {
    setSubmitting(true);
    try {
      await submitFeedback(alert.id, verdict);
      setLocalVerdict(verdict);
      onFeedbackSubmitted(alert.id, verdict);
    } catch {
      // keep submitting state reset; user can retry
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="drilldown-overlay" onClick={onClose} />
      <div className="drilldown-panel" role="dialog" aria-label="Alert detail">
        <div className="drilldown-header">
          <span className="drilldown-title">Alert Detail</span>
          <button className="btn-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="drilldown-body">
          <div>
            <p className="section-label">Metadata</p>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Alert ID</label>
                <div className="detail-value mono" style={{ fontSize: 11 }}>{alert.id}</div>
              </div>
              <div className="detail-item">
                <label>Flow ID</label>
                <div className="detail-value mono" style={{ fontSize: 11 }}>{alert.flow_id}</div>
              </div>
              <div className="detail-item">
                <label>Severity</label>
                <div className="detail-value"><SeverityBadge severity={alert.severity} /></div>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <div className="detail-value"><StatusBadge status={alert.status} /></div>
              </div>
              <div className="detail-item">
                <label>Attack Type</label>
                <div className="detail-value">{alert.suspected_attack_type ?? "—"}</div>
              </div>
              <div className="detail-item">
                <label>Created</label>
                <div className="detail-value">
                  {new Date(alert.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="divider" />

          <div className="feedback-section">
            <h4>Analyst Verdict</h4>

            {localVerdict ? (
              <div className="verdict-display">
                <span>
                  Current verdict:{" "}
                  <span className={`badge badge-${localVerdict === "true_positive" ? "tp" : "fp"}`}>
                    {localVerdict === "true_positive" ? "True Positive" : "False Positive"}
                  </span>
                </span>
                <button
                  className="btn-sm"
                  onClick={() => setLocalVerdict(null)}
                  disabled={submitting}
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
                  Is this alert a real threat or a false alarm?
                </p>
                <div className="feedback-buttons">
                  <button
                    className="btn-feedback tp"
                    onClick={() => handleFeedback("true_positive")}
                    disabled={submitting}
                  >
                    True Positive
                  </button>
                  <button
                    className="btn-feedback fp"
                    onClick={() => handleFeedback("false_positive")}
                    disabled={submitting}
                  >
                    False Positive
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
