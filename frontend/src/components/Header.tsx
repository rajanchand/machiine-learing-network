export type Page = "monitor" | "comparison" | "dataset";

interface Props {
  user: string;
  models: string[];
  activeModel: string;
  threshold: number;
  page: Page;
  onModelChange: (name: string) => void;
  onThresholdChange: (value: number) => void;
  onLogout: () => void;
  onPageChange: (page: Page) => void;
}

const NAV_TABS: { id: Page; label: string }[] = [
  { id: "monitor", label: "Live Monitor" },
  { id: "comparison", label: "Model Comparison" },
  { id: "dataset", label: "Dataset" },
];

export function Header({
  user,
  models,
  activeModel,
  threshold,
  page,
  onModelChange,
  onThresholdChange,
  onLogout,
  onPageChange,
}: Props) {
  return (
    <header className="header" style={{ flexDirection: "column", gap: 0, padding: 0 }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          height: 52,
          borderBottom: "1px solid var(--border)",
          gap: 12,
        }}
      >
        <div className="header-brand">
          <div className="header-brand-icon">⬡</div>
          <span className="header-brand-name">Network Anomaly Detection</span>
        </div>

        <div className="header-spacer" />

        <div className="header-controls">
          {page === "monitor" && (
            <>
              <select
                className="header-select"
                value={activeModel}
                onChange={(e) => onModelChange(e.target.value)}
                aria-label="Active model"
              >
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m.replace(/_/g, " ")}
                  </option>
                ))}
              </select>

              <div className="threshold-control">
                <span>Threshold</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={threshold}
                  onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
                  aria-label="Detection threshold"
                />
                <span className="threshold-value">{threshold.toFixed(2)}</span>
              </div>
            </>
          )}

          <div className="header-user">
            <span>{user}</span>
            <button className="btn-logout" onClick={onLogout} type="button">
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Nav tabs */}
      <nav
        style={{
          display: "flex",
          gap: 0,
          padding: "0 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        {NAV_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onPageChange(tab.id)}
            style={{
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: page === tab.id ? 600 : 400,
              color: page === tab.id ? "var(--blue)" : "var(--text-2)",
              background: "none",
              border: "none",
              borderBottom: page === tab.id ? "2px solid var(--blue)" : "2px solid transparent",
              cursor: "pointer",
              marginBottom: -1,
              transition: "color 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
