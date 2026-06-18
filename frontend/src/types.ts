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
