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

const NAV_TABS: { id: Page; label: string; icon: string }[] = [
  { id: "monitor", label: "Live Monitor", icon: "📊" },
  { id: "comparison", label: "Model Comparison", icon: "⚖️" },
  { id: "dataset", label: "Dataset Overview", icon: "📁" },
];

export function Sidebar({
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
    <aside className="sidebar">
      {/* Branding */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">⬡</div>
        <span className="sidebar-brand-name">Anomaly Guard</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`sidebar-nav-item ${page === tab.id ? "active" : ""}`}
            onClick={() => onPageChange(tab.id)}
          >
            <span className="sidebar-nav-icon">{tab.icon}</span>
            <span className="sidebar-nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Global Config Section */}
      <div className="sidebar-config">
        <p className="sidebar-config-title">Model Settings</p>
        
        <div className="sidebar-config-group">
          <label htmlFor="active-model-select">Active Model</label>
          <select
            id="active-model-select"
            className="sidebar-select"
            value={activeModel}
            onChange={(e) => onModelChange(e.target.value)}
          >
            {models.map((m) => (
              <option key={m} value={m}>
                {m.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="sidebar-config-group">
          <div className="sidebar-config-label-row">
            <label htmlFor="threshold-slider">Threshold</label>
            <span className="threshold-value">{threshold.toFixed(2)}</span>
          </div>
          <input
            id="threshold-slider"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={threshold}
            onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
            className="sidebar-slider"
          />
        </div>
      </div>

      {/* Footer / User Profile */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{user[0].toUpperCase()}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-username">{user}</span>
            <span className="sidebar-role">SecOps Analyst</span>
          </div>
        </div>
        <button className="btn-logout" onClick={onLogout} type="button">
          Sign out
        </button>
      </div>
    </aside>
  );
}
