import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getComparison } from "../api";
import type { ModelMetrics } from "../types";

const MODEL_COLORS: Record<string, string> = {
  isolation_forest: "#3b82f6",
  autoencoder: "#10b981",
  halfspace_trees: "#f59e0b",
  lightgbm_benchmark: "#ef4444",
  random_forest: "#8b5cf6",
  xgboost: "#f97316",
};

const DISPLAY_NAMES: Record<string, string> = {
  isolation_forest: "Isolation Forest",
  autoencoder: "AutoEncoder",
  halfspace_trees: "HalfSpace Trees",
  lightgbm_benchmark: "LightGBM",
  random_forest: "Random Forest",
  xgboost: "XGBoost",
};

const METRICS = [
  { key: "accuracy", label: "Accuracy" },
  { key: "precision", label: "Precision" },
  { key: "recall", label: "Recall" },
  { key: "f1", label: "F1-Score" },
  { key: "roc_auc", label: "ROC-AUC" },
];

const STRENGTHS: Record<string, { strengths: string[]; limitations: string[] }> = {
  random_forest: {
    strengths: [
      "Handles high-dimensional feature spaces well",
      "Robust to outliers and noisy features",
      "Provides feature importance rankings",
      "Low risk of overfitting via ensemble averaging",
    ],
    limitations: [
      "Requires labelled training data",
      "Slower inference than single trees",
      "Large memory footprint for 200 trees",
      "Less effective on very imbalanced datasets without tuning",
    ],
  },
  xgboost: {
    strengths: [
      "State-of-the-art accuracy on tabular data",
      "Built-in handling of class imbalance (scale_pos_weight)",
      "Fast training with gradient boosting optimisation",
      "Regularisation prevents overfitting",
    ],
    limitations: [
      "Requires labelled training data",
      "Many hyperparameters to tune",
      "Harder to interpret than a single decision tree",
      "Sequential boosting limits parallelism vs. Random Forest",
    ],
  },
  isolation_forest: {
    strengths: [
      "Fully unsupervised — no labels needed",
      "Works well on high-dimensional data",
      "Computationally efficient (O(n log n))",
      "Detects novel attack types not seen in training",
    ],
    limitations: [
      "Anomaly scores are not probabilities",
      "Lower precision on dense attack clusters",
      "Contamination rate must be estimated",
      "Struggles when attacks closely resemble normal traffic",
    ],
  },
  autoencoder: {
    strengths: [
      "Learns complex non-linear patterns in normal traffic",
      "Unsupervised — trains on benign data only",
      "Reconstruction error is intuitive",
      "Extensible to variational / deep architectures",
    ],
    limitations: [
      "Training time scales with network depth",
      "Sensitive to feature scaling",
      "Threshold selection is non-trivial",
      "May fail on attacks that resemble normal reconstruction",
    ],
  },
  halfspace_trees: {
    strengths: [
      "Online learning — adapts to concept drift in real time",
      "Extremely fast inference per flow",
      "Low memory footprint",
      "No retraining needed when traffic patterns shift",
    ],
    limitations: [
      "Lower accuracy than batch-trained models",
      "Sensitive to window size parameter",
      "Warm-up period required before detection stabilises",
      "Less effective on structured, low-variance attacks",
    ],
  },
  lightgbm_benchmark: {
    strengths: [
      "Fastest gradient boosting training speed",
      "Leaf-wise tree growth for high accuracy",
      "Native categorical feature support",
      "Excellent on large datasets (>100k samples)",
    ],
    limitations: [
      "Requires labelled training data",
      "Leaf-wise growth can overfit on small datasets",
      "Many parameters — requires careful tuning",
      "Less interpretable than simpler models",
    ],
  },
};

function pct(v: number) {
  return (v * 100).toFixed(1) + "%";
}

function MetricBadge({ value, best }: { value: number; best: number }) {
  const isBest = Math.abs(value - best) < 0.001;
  return (
    <span
      style={{
        fontVariantNumeric: "tabular-nums",
        background: isBest ? "#dcfce7" : undefined,
        color: isBest ? "#166534" : undefined,
        fontWeight: isBest ? 600 : undefined,
        padding: "2px 6px",
        borderRadius: 4,
        fontSize: 13,
      }}
    >
      {pct(value)}
    </span>
  );
}

function StrengthCard({ name }: { name: string }) {
  const info = STRENGTHS[name];
  if (!info) return null;
  const color = MODEL_COLORS[name] ?? "#64748b";
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: color,
          color: "#fff",
          padding: "10px 16px",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        {DISPLAY_NAMES[name] ?? name}
        <span
          style={{
            fontSize: 11,
            fontWeight: 400,
            marginLeft: 8,
            opacity: 0.85,
          }}
        >
          {name === "isolation_forest" || name === "autoencoder" || name === "halfspace_trees"
            ? "unsupervised"
            : "supervised"}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        <div style={{ padding: "12px 16px", borderRight: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#166534", marginBottom: 8 }}>
            Strengths
          </div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, lineHeight: 1.6 }}>
            {info.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#991b1b", marginBottom: 8 }}>
            Limitations
          </div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, lineHeight: 1.6 }}>
            {info.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ModelComparison() {
  const [data, setData] = useState<ModelMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getComparison()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <span className="spinner" style={{ width: 20, height: 20 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: "var(--red)" }}>
        Failed to load comparison data: {error}
      </div>
    );
  }

  // Best value per metric
  const bests: Record<string, number> = {};
  for (const m of METRICS) {
    bests[m.key] = Math.max(...data.map((d) => (d as unknown as Record<string, number>)[m.key] ?? 0));
  }

  // Bar chart data: one entry per model, all metrics as separate bars
  const barData = METRICS.map((m) => ({
    metric: m.label,
    ...Object.fromEntries(
      data.map((d) => [DISPLAY_NAMES[d.name] ?? d.name, (d as unknown as Record<string, number>)[m.key]])
    ),
  }));

  // Per-attack recall: collect all attack types
  const attackTypes = Array.from(
    new Set(data.flatMap((d) => Object.keys(d.per_attack_recall)))
  ).sort();

  return (
    <div className="main-content">
      {/* Section 1 — Summary Table */}
      <section className="card">
        <h2 className="section-title">Performance Summary</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 600 }}>Model</th>
                <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 600 }}>Type</th>
                {METRICS.map((m) => (
                  <th
                    key={m.key}
                    style={{ textAlign: "center", padding: "8px 12px", fontWeight: 600 }}
                  >
                    {m.label}
                  </th>
                ))}
                <th style={{ textAlign: "center", padding: "8px 12px", fontWeight: 600 }}>FPR</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.name}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td style={{ padding: "8px 12px", fontWeight: 500 }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: MODEL_COLORS[row.name] ?? "#94a3b8",
                        marginRight: 8,
                      }}
                    />
                    {DISPLAY_NAMES[row.name] ?? row.name}
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-2)", fontSize: 12 }}>
                    {row.model_type}
                  </td>
                  {METRICS.map((m) => (
                    <td key={m.key} style={{ padding: "8px 12px", textAlign: "center" }}>
                      <MetricBadge
                        value={(row as unknown as Record<string, number>)[m.key] ?? 0}
                        best={bests[m.key]}
                      />
                    </td>
                  ))}
                  <td style={{ padding: "8px 12px", textAlign: "center", fontSize: 13, color: "var(--text-2)" }}>
                    {pct(row.fpr)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 10, fontSize: 12, color: "var(--text-2)" }}>
          Green cells = best value in that column. Supervised models (Random Forest, XGBoost,
          LightGBM) have access to labels during training; unsupervised models do not.
        </p>
      </section>

      {/* Section 2 — Grouped Bar Chart */}
      <section className="card">
        <h2 className="section-title">Metric Comparison Chart</h2>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={barData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="metric" tick={{ fontSize: 13 }} />
            <YAxis domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => pct(v as number)} />
            <Legend />
            {data.map((d) => (
              <Bar
                key={d.name}
                dataKey={DISPLAY_NAMES[d.name] ?? d.name}
                fill={MODEL_COLORS[d.name] ?? "#94a3b8"}
                radius={[3, 3, 0, 0]}
              >
                {barData.map((_, i) => (
                  <Cell key={i} fill={MODEL_COLORS[d.name] ?? "#94a3b8"} />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Section 3 — Per-Attack-Type Recall */}
      {attackTypes.length > 0 && (
        <section className="card">
          <h2 className="section-title">Per-Attack-Type Recall</h2>
          <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 16 }}>
            Recall (detection rate) for each attack type. Higher = better. Shows which models
            detect specific attack categories most reliably.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 600 }}>
                    Attack Type
                  </th>
                  {data.map((d) => (
                    <th
                      key={d.name}
                      style={{ textAlign: "center", padding: "8px 12px", fontWeight: 600 }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: MODEL_COLORS[d.name] ?? "#94a3b8",
                          marginRight: 6,
                        }}
                      />
                      {DISPLAY_NAMES[d.name] ?? d.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attackTypes.map((attack) => {
                  const values = data.map((d) => d.per_attack_recall[attack] ?? 0);
                  const best = Math.max(...values);
                  return (
                    <tr key={attack} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "8px 12px", fontWeight: 500 }}>{attack}</td>
                      {values.map((v, i) => {
                        const isBest = Math.abs(v - best) < 0.001;
                        const hue = Math.round(v * 120);
                        return (
                          <td
                            key={i}
                            style={{
                              textAlign: "center",
                              padding: "8px 12px",
                              background: `hsl(${hue}, 60%, ${isBest ? "88%" : "95%"})`,
                              fontWeight: isBest ? 600 : undefined,
                            }}
                          >
                            {pct(v)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Section 4 — Strengths and Limitations */}
      <section className="card">
        <h2 className="section-title">Strengths &amp; Limitations</h2>
        <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 16 }}>
          A qualitative analysis of each model's design trade-offs for network anomaly detection.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.map((d) => (
            <StrengthCard key={d.name} name={d.name} />
          ))}
        </div>
      </section>
    </div>
  );
}
