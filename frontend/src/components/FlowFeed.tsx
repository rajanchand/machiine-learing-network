import { useEffect, useRef } from "react";
import type { StreamEvent } from "../types";

const PROTOCOL_NAMES: Record<number, string> = { 6: "TCP", 17: "UDP" };

interface Props {
  events: StreamEvent[];
}

export function FlowFeed({ events }: Props) {
  const topRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ block: "nearest" });
  }, [events.length]);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Live Flow Feed</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{events.length} events</span>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Source → Destination</th>
              <th>Proto</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr className="empty-row">
                <td colSpan={4}>Waiting for flows…</td>
              </tr>
            )}
            {events.map((ev, i) => (
              <tr key={ev.flow_id + i} ref={i === 0 ? topRef : undefined}>
                <td className="mono">
                  {new Date(ev.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </td>
                <td className="mono">
                  {ev.src_ip}
                  <span className="flow-arrow">→</span>
                  {ev.dst_ip}
                </td>
                <td>{PROTOCOL_NAMES[ev.protocol] ?? ev.protocol}</td>
                <td>
                  {ev.score !== null ? (
                    <span className={`score-badge ${ev.is_anomaly ? "anomaly" : "normal"}`}>
                      {ev.score.toFixed(3)}
                    </span>
                  ) : (
                    <span style={{ color: "var(--text-faint)" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
