import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const TOTAL_SAMPLES = 3000;
const BENIGN_COUNT = 2388;
const ATTACK_COUNT = TOTAL_SAMPLES - BENIGN_COUNT;
const FEATURE_COUNT = 37; // after preprocessing

const CLASS_DISTRIBUTION = [
  { name: "Benign", value: BENIGN_COUNT, fill: "#10b981" },
  { name: "Attack", value: ATTACK_COUNT, fill: "#ef4444" },
];

const ATTACK_TYPES = [
  { name: "DDoS", count: 156 },
  { name: "PortScan", count: 113 },
  { name: "DoS Hulk", count: 108 },
  { name: "DoS GoldenEye", count: 62 },
  { name: "DoS slowloris", count: 30 },
  { name: "DoS Slowhttptest", count: 27 },
  { name: "Bot", count: 25 },
  { name: "FTP-Patator", count: 24 },
  { name: "SSH-Patator", count: 20 },
  { name: "Web Attack - SQLi", count: 15 },
  { name: "Web Attack - BruteForce", count: 12 },
  { name: "Infiltration", count: 10 },
  { name: "Web Attack - XSS", count: 9 },
  { name: "Heartbleed", count: 1 },
].sort((a, b) => b.count - a.count);

const FEATURE_GROUPS = [
  {
    group: "Flow Volume",
    features: [
      "total_fwd_packets", "total_bwd_packets", "total_length_fwd_packets",
      "total_length_bwd_packets", "flow_bytes_per_s", "flow_packets_per_s",
    ],
    color: "#3b82f6",
  },
  {
    group: "Packet Size",
    features: [
      "fwd_packet_length_max", "fwd_packet_length_min", "fwd_packet_length_mean",
      "fwd_packet_length_std", "bwd_packet_length_max", "bwd_packet_length_min",
      "bwd_packet_length_mean", "bwd_packet_length_std", "min_packet_length",
      "max_packet_length", "packet_length_mean", "packet_length_std",
      "packet_length_variance",
    ],
    color: "#8b5cf6",
  },
  {
    group: "Inter-Arrival Times (IAT)",
    features: [
      "flow_iat_mean", "flow_iat_std", "flow_iat_max", "flow_iat_min",
      "fwd_iat_total", "fwd_iat_mean", "fwd_iat_std", "fwd_iat_max", "fwd_iat_min",
      "bwd_iat_total", "bwd_iat_mean", "bwd_iat_std", "bwd_iat_max", "bwd_iat_min",
    ],
    color: "#f59e0b",
  },
  {
    group: "TCP Flags",
    features: [
      "fwd_psh_flags", "fwd_urg_flags", "fin_flag_count", "syn_flag_count",
      "rst_flag_count", "psh_flag_count", "ack_flag_count", "urg_flag_count",
    ],
    color: "#10b981",
  },
  {
    group: "Header / Window",
    features: [
      "fwd_header_length", "bwd_header_length", "fwd_avg_bytes_bulk",
      "init_win_bytes_forward", "init_win_bytes_backward", "act_data_pkt_fwd",
      "min_seg_size_forward", "active_mean", "idle_mean",
    ],
    color: "#ef4444",
  },
];

const STATS = [
  { label: "Total Samples", value: TOTAL_SAMPLES.toLocaleString() },
  { label: "Benign Flows", value: `${BENIGN_COUNT.toLocaleString()} (79.6%)` },
  { label: "Attack Flows", value: `${ATTACK_COUNT.toLocaleString()} (20.4%)` },
  { label: "Attack Categories", value: "14" },
  { label: "Features (after preprocessing)", value: FEATURE_COUNT.toString() },
  { label: "Train / Test Split", value: "80% / 20%" },
];

export function DatasetOverview() {
  return (
    <div className="main-content">
      {/* Topic summary */}
      <section className="card">
        <h2 className="section-title">ML-Based Network Anomaly Detection</h2>
        <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)" }}>
          This project applies machine learning to detect anomalous network behaviour using the{" "}
          <strong>CICIDS2017 dataset</strong> — a widely used benchmark containing realistic
          network traffic captures with 14 attack categories alongside benign traffic. Each network
          flow is represented as a vector of 37 statistical features (packet sizes, inter-arrival
          times, TCP flags, byte counts) extracted from raw PCAP files.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)", marginTop: 10 }}>
          Both <strong>unsupervised</strong> approaches (Isolation Forest, AutoEncoder, HalfSpace
          Trees) and <strong>supervised</strong> approaches (Random Forest, XGBoost, LightGBM) are
          evaluated. Unsupervised models learn the statistical profile of normal traffic and flag
          deviations, while supervised models learn decision boundaries from labelled examples.
        </p>
      </section>

      {/* Stats strip */}
      <section className="card">
        <h2 className="section-title">Dataset Statistics</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 4 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Class distribution pie */}
        <section className="card">
          <h2 className="section-title">Class Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={CLASS_DISTRIBUTION}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(1)}%`}
                labelLine={true}
              >
                {CLASS_DISTRIBUTION.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => (v as number).toLocaleString()} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 8 }}>
            The dataset is imbalanced: 79.6% benign, 20.4% attacks. All supervised models use
            class-weight balancing to handle this.
          </p>
        </section>

        {/* Attack breakdown bar */}
        <section className="card">
          <h2 className="section-title">Attack Type Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={ATTACK_TYPES}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 120, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={120}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      {/* Feature list */}
      <section className="card">
        <h2 className="section-title">Feature Groups ({FEATURE_COUNT} features)</h2>
        <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 16 }}>
          Features are extracted from raw network flows using CICFlowMeter and normalised with
          StandardScaler before model input.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 12,
          }}
        >
          {FEATURE_GROUPS.map((g) => (
            <div
              key={g.group}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: g.color,
                  color: "#fff",
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {g.group}
                <span
                  style={{
                    fontWeight: 400,
                    fontSize: 11,
                    marginLeft: 8,
                    opacity: 0.9,
                  }}
                >
                  ({g.features.length} features)
                </span>
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: "8px 14px 8px 28px",
                  fontSize: 12,
                  lineHeight: 1.8,
                  color: "var(--text)",
                }}
              >
                {g.features.map((f) => (
                  <li key={f} style={{ fontFamily: "monospace" }}>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
