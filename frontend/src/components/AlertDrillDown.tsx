import { useEffect, useState } from "react";
import { getAlertDetail, submitFeedback } from "../api";
import type { AlertDetailResponse, AlertItem } from "../types";

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
  const [detail, setDetail] = useState<AlertDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAlertDetail(alert.id)
      .then((data) => {
        setDetail(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Failed to load alert details");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [alert.id]);

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
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 40, gap: 12 }}>
              <span className="spinner" style={{ width: 24, height: 24, marginRight: 0 }} />
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading details...</span>
            </div>
          ) : error ? (
            <div style={{ padding: 20, color: "var(--red)", fontSize: 13, textAlign: "center" }}>
              ⚠️ {error}
            </div>
          ) : (
            <>
              <div>
                <p className="section-label">Metadata</p>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Alert ID</label>
                    <div className="detail-value mono" style={{ fontSize: 10 }}>{alert.id}</div>
                  </div>
                  <div className="detail-item">
                    <label>Flow ID</label>
                    <div className="detail-value mono" style={{ fontSize: 10 }}>{alert.flow_id}</div>
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

              {detail?.flow && (
                <div>
                  <p className="section-label">Network Flow Info</p>
                  <div className="detail-grid">
                    <div className="detail-item" style={{ gridColumn: "span 2" }}>
                      <label>Connection</label>
                      <div className="detail-value mono" style={{ fontSize: 12 }}>
                        {detail.flow.src_ip}:{detail.flow.src_port} → {detail.flow.dst_ip}:{detail.flow.dst_port}
                      </div>
                    </div>
                    <div className="detail-item">
                      <label>Protocol</label>
                      <div className="detail-value">
                        {detail.flow.protocol === 6 ? "TCP" : detail.flow.protocol === 17 ? "UDP" : detail.flow.protocol}
                      </div>
                    </div>
                    <div className="detail-item">
                      <label>Duration</label>
                      <div className="detail-value mono">{detail.flow.duration.toFixed(4)} s</div>
                    </div>
                    <div className="detail-item">
                      <label>Src / Dst Bytes</label>
                      <div className="detail-value mono">{detail.flow.src_bytes} / {detail.flow.dst_bytes} B</div>
                    </div>
                    <div className="detail-item">
                      <label>Byte Rate</label>
                      <div className="detail-value mono">{detail.flow.byte_rate.toFixed(2)} B/s</div>
                    </div>
                  </div>
                </div>
              )}

              {detail?.explainability && (
                <div>
                  <p className="section-label">Explainability (Top Contributors)</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                    {Object.entries(detail.explainability).map(([feature, pct]) => (
                      <div key={feature} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span className="mono" style={{ color: "var(--text)" }}>{feature}</span>
                          <span style={{ fontWeight: 600, color: "var(--blue)" }}>{(pct * 100).toFixed(1)}%</span>
                        </div>
                        <div style={{ width: "100%", height: 6, background: "var(--surface-alt)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${pct * 100}%`, height: "100%", background: "var(--blue)", borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6, fontStyle: "italic" }}>
                    *Percentage deviation of feature values compared to training baseline.
                  </p>
                </div>
              )}

              {detail?.predictions && detail.predictions.length > 0 && (
                <div>
                  <p className="section-label">Model Predictions</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                    {detail.predictions.map((pred) => (
                      <div
                        key={pred.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: 12,
                          padding: "6px 8px",
                          background: "var(--surface-alt)",
                          borderRadius: 4,
                        }}
                      >
                        <span>{pred.model_name.replace(/_/g, " ")}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="mono">{pred.score.toFixed(4)}</span>
                          <span className={`score-badge ${pred.is_anomaly ? "anomaly" : "normal"}`} style={{ fontSize: 9, padding: "1px 4px" }}>
                            {pred.is_anomaly ? "ANOMALY" : "NORMAL"}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                      type="button"
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
                        type="button"
                      >
                        True Positive
                      </button>
                      <button
                        className="btn-feedback fp"
                        onClick={() => handleFeedback("false_positive")}
                        disabled={submitting}
                        type="button"
                      >
                        False Positive
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
