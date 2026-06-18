"""Shared constants for the anomaly detection system (NSL-KDD dataset)."""

from __future__ import annotations

FEATURE_COLUMNS: list[str] = [
    # Basic connection features (9)
    "duration",
    "protocol_type",
    "service",
    "flag",
    "src_bytes",
    "dst_bytes",
    "land",
    "wrong_fragment",
    "urgent",
    # Content / login features (13)
    "hot",
    "num_failed_logins",
    "logged_in",
    "num_compromised",
    "root_shell",
    "su_attempted",
    "num_root",
    "num_file_creations",
    "num_shells",
    "num_access_files",
    "num_outbound_cmds",
    "is_host_login",
    "is_guest_login",
    # Time-based features (9)
    "count",
    "srv_count",
    "serror_rate",
    "srv_serror_rate",
    "rerror_rate",
    "srv_rerror_rate",
    "same_srv_rate",
    "diff_srv_rate",
    "srv_diff_host_rate",
    # Host-based features (10)
    "dst_host_count",
    "dst_host_srv_count",
    "dst_host_same_srv_rate",
    "dst_host_diff_srv_rate",
    "dst_host_same_src_port_rate",
    "dst_host_srv_diff_host_rate",
    "dst_host_serror_rate",
    "dst_host_srv_serror_rate",
    "dst_host_rerror_rate",
    "dst_host_srv_rerror_rate",
    # Derived / computed features (7)
    "packet_rate",
    "byte_rate",
    "avg_packet_size",
    "flow_duration",
    "inter_arrival_time",
    "fwd_bwd_ratio",
    "port_entropy",
]

EXPECTED_FEATURE_COUNT: int = len(FEATURE_COLUMNS)  # 48
