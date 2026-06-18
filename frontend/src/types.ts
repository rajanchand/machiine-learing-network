export interface StreamEvent {
  event_type: string;
  flow_id: string;
  ts: string;
  src_ip: string;
  dst_ip: string;
  protocol: number;
  score: number | null;
  is_anomaly: boolean | null;
  model_name: string | null;
  alert_id: string | null;
  severity: string | null;
  suspected_attack_type: string | null;
}

export interface KPI {
  total_flows: number;
  total_alerts: number;
  open_alerts: number;
  estimated_fpr: number;
  top_talkers: { ip: string; flow_count: number }[];
}

export interface TimelinePoint {
  timestamp: string;
  avg_score: number;
  max_score: number;
  flow_count: number;
  anomaly_count: number;
}

export interface AlertItem {
  id: string;
  flow_id: string;
  severity: string;
  suspected_attack_type: string | null;
  status: string;
  created_at: string;
  feedback_verdict: string | null;
}

export interface FlowDetail {
  id: string;
  ts: string;
  src_ip: string;
  src_port: number;
  dst_ip: string;
  dst_port: number;
  protocol: number;
  label: string | null;
  duration: number;
  src_bytes: number;
  dst_bytes: number;
  count: number;
  byte_rate: number;
  // Extra features
  protocol_type?: number;
  service?: number;
  flag?: number;
  logged_in?: number;
  num_failed_logins?: number;
  root_shell?: number;
  serror_rate?: number;
  rerror_rate?: number;
  same_srv_rate?: number;
  diff_srv_rate?: number;
  dst_host_count?: number;
  dst_host_srv_count?: number;
  packet_rate?: number;
  avg_packet_size?: number;
  fwd_bwd_ratio?: number;
}

export interface PredictionDetail {
  id: string;
  flow_id: string;
  model_name: string;
  model_version: string;
  score: number;
  is_anomaly: boolean;
  threshold: number;
  created_at: string;
}

export interface AlertDetailResponse {
  id: string;
  flow_id: string;
  severity: string;
  suspected_attack_type: string | null;
  status: string;
  created_at: string;
  feedback_verdict: string | null;
  flow: FlowDetail | null;
  predictions: PredictionDetail[];
  explainability: Record<string, number> | null;
}

export interface DriftFeature {
  psi: number;
}

export interface DriftData {
  overall_psi: number;
  status: string;
  feature_psis: Record<string, number>;
}

export interface ModelInfo {
  name: string;
  threshold: number;
  is_active: boolean;
}

export interface ModelMetrics {
  name: string;
  model_type: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  pr_auc: number;
  fpr: number;
  confusion_matrix: { tn: number; fp: number; fn: number; tp: number };
  per_attack_recall: Record<string, number>;
}
