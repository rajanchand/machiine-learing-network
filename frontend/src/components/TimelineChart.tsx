import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TimelinePoint } from "../types";

interface Props {
  data: TimelinePoint[];
  threshold: number;
  loading: boolean;
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function TimelineChart({ data, threshold, loading }: Props) {
  const chartData = data.map((p) => ({ ...p, time: formatTime(p.timestamp) }));

  return (
    <div className="card span-full">
      <div className="card-header">
        <span className="card-title">Anomaly Score Timeline</span>
        {loading && <span className="spinner" />}
      </div>
      <div className="card-body" style={{ padding: "16px 12px" }}>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 1]}
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  fontSize: 12,
                  boxShadow: "var(--shadow-md)",
                }}
                labelStyle={{ color: "var(--text-muted)", marginBottom: 4 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
              />
              <ReferenceLine
                y={threshold}
                stroke="var(--amber)"
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{ value: "threshold", fill: "var(--amber)", fontSize: 10, position: "right" }}
              />
              <Line
                type="monotone"
                dataKey="avg_score"
                name="Avg score"
                stroke="var(--blue)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="max_score"
                name="Max score"
                stroke="var(--red)"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 2"
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
