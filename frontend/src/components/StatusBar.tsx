interface Props {
  connected: boolean;
  activeModel: string;
  flowsPerSec: number;
  alertRate: number;
  driftStatus: string | null;
}

export function StatusBar({ connected, activeModel, flowsPerSec, alertRate, driftStatus }: Props) {
  return (
    <div className="status-bar">
      <span className="status-chip">
        <span className={`status-dot ${connected ? "green" : "red"}`} />
        {connected ? "Live" : "Reconnecting"}
      </span>

      <span className="status-chip">
        <span className="status-dot blue" />
        {activeModel.replace(/_/g, " ")}
      </span>

      <span className="status-chip">
        {flowsPerSec.toFixed(1)} flows/s
      </span>

      <span className="status-chip">
        {alertRate.toFixed(1)} alerts/s
      </span>

      {driftStatus && (
        <span className="status-chip">
          <span className={`status-dot ${driftStatus === "drifting" ? "amber" : "green"}`} />
          Drift: {driftStatus}
        </span>
      )}
    </div>
  );
}
