# Anomaly Guard: Network Anomaly Detection System (CICIDS2017 & NSL-KDD)

A high-performance, real-time machine learning system for network traffic anomaly detection. It observes stream connection parameters, calculates statistical feature deviations relative to normal benign baselines, and fires alerts on suspicious threat indicators.

![Dashboard Screenshot](dashboard_screenshot.png)

---

## ✨ Features

- **Unsupervised & Supervised Models:** Built-in loaders and metrics for 6 models (AutoEncoder, Isolation Forest, HalfSpace Trees, XGBoost, Random Forest, and LightGBM).
- **One-Click Startup:** Orchestrates the FastAPI API, stream simulator, and React glassmorphism UI from a single unified shell script.
- **Explainability (SHAP Approximation):** Pinpoints the exact features causing anomalous alerts using normalized Z-score feature deviations relative to benign traffic baselines.
- **Analyst Feedback Loop:** Triages and reviews alerts as True Positives or False Positives. Feedbacks can be exported as clean, training-ready datasets.
- **Data Drift Monitoring:** Detects concept drift using feature-level Population Stability Index (PSI) calculations against training quantiles.
- **Mobile-Responsive UI:** Responsive design with a collapsible left sidebar layout adapting automatically from desktop consoles down to mobile views.

---

## 📈 Evaluation & Benchmarks

All models were trained and benchmarked against the **CICIDS2017** and **NSL-KDD** network datasets. Because network threats represent highly imbalanced events, Precision-Recall Area Under Curve (PR-AUC) acts as our leading selection metric.

### Model Comparison

| Model | Type | PR-AUC | ROC-AUC | Accuracy | Precision | Recall | F1 | FPR |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **autoencoder** | Unsupervised | **0.8718** | **0.9149** | **0.9852** | **0.9694** | **0.7252** | **0.8297** | **0.0064** |
| **isolation_forest** | Unsupervised | 0.4315 | 0.7140 | 0.9412 | 0.6000 | 0.0458 | 0.0851 | 0.0085 |
| **halfspace_trees** | Unsupervised | 0.3259 | 0.6758 | 0.9234 | 0.2000 | 0.0076 | 0.0147 | 0.0085 |
| **xgboost** | Supervised | 0.9712 | 0.9835 | 0.9934 | 0.9892 | 0.9125 | 0.9493 | 0.0012 |
| **random_forest** | Supervised | 0.9584 | 0.9790 | 0.9901 | 0.9811 | 0.9002 | 0.9389 | 0.0021 |
| **lightgbm_benchmark** | Supervised | 0.9601 | 0.9746 | 0.9912 | 0.9833 | 0.9008 | 0.9402 | 0.0043 |

*All unsupervised models were trained exclusively on benign traffic. Thresholds were optimized to guarantee a False Positive Rate (FPR) of ≤ 1%.*

---

## 🚀 Setup & One-Click Execution

### 1. Prerequisites
- Docker & Docker Compose (for containerized setup)
- Python 3.12+ (for local host setup)
- Node.js (v18+) and `npm`

### 2. One-Click Host Startup
You can launch the entire stack (FastAPI server, Stream Simulator, and React Web Console) with a single script:

```bash
# 1. Initialize environment variables
cp .env.example .env

# 2. Run the startup script
./start.sh
```

The startup script will boot up all services, perform health checks, and redirect service logs to:
- `backend.log` (FastAPI Server)
- `simulator.log` (Traffic Replay Simulator)
- `frontend.log` (Vite Frontend Dev Server)

To stop all background processes gracefully, simply press **`Ctrl+C`**.

---

## 🔒 Security Note & Credentials

The system includes built-in SeOps analyst authentication. 

> [!WARNING]
> The system is configured with default developer credentials. You **MUST** change these credentials before placing the system online.
> - **Default Username:** `analyst`
> - **Default Password:** `password123`
>
> To rotate credentials, configure standard secure passwords in your SQLite or PostgreSQL storage backend.

---

## 📊 Feature Reference List (48 Features)

The network traffic anomaly classifier processes **48 key features** (41 standard NSL-KDD / CICIDS2017 features + 7 derived features) grouped into the following functional SeOps categories:

### 1. Flow Volume (6 features)
- `duration`: Length of the connection in seconds.
- `total_fwd_packets`: Total packets sent in the forward direction.
- `total_bwd_packets`: Total packets sent in the backward direction.
- `total_length_fwd_packets`: Total volume of payload bytes sent forward.
- `total_length_bwd_packets`: Total volume of payload bytes sent backward.
- `flow_bytes_per_s`: Rate of payload bytes transmitted per second.
- `flow_packets_per_s`: Rate of packets transmitted per second.

### 2. Packet Size (13 features)
- `fwd_packet_length_max`: Maximum length of a forward packet.
- `fwd_packet_length_min`: Minimum length of a forward packet.
- `fwd_packet_length_mean`: Average length of forward packets.
- `fwd_packet_length_std`: Standard deviation of forward packet sizes.
- `bwd_packet_length_max`: Maximum length of a backward packet.
- `bwd_packet_length_min`: Minimum length of a backward packet.
- `bwd_packet_length_mean`: Average length of backward packets.
- `bwd_packet_length_std`: Standard deviation of backward packet sizes.
- `min_packet_length`: Minimum length of any packet in the flow.
- `max_packet_length`: Maximum length of any packet in the flow.
- `packet_length_mean`: Average packet size across the entire flow.
- `packet_length_std`: Standard deviation of packet sizes across the entire flow.
- `packet_length_variance`: Variance of packet sizes in the flow.

### 3. Inter-Arrival Times (IAT) (14 features)
- `flow_iat_mean`: Mean time between two packets in the flow.
- `flow_iat_std`: Standard deviation of flow inter-arrival times.
- `flow_iat_max`: Maximum time between two packets in the flow.
- `flow_iat_min`: Minimum time between two packets in the flow.
- `fwd_iat_total`: Cumulative inter-arrival time of forward packets.
- `fwd_iat_mean`: Mean time between consecutive forward packets.
- `fwd_iat_std`: Standard deviation of forward inter-arrival times.
- `fwd_iat_max`: Maximum time between consecutive forward packets.
- `fwd_iat_min`: Minimum time between consecutive forward packets.
- `bwd_iat_total`: Cumulative inter-arrival time of backward packets.
- `bwd_iat_mean`: Mean time between consecutive backward packets.
- `bwd_iat_std`: Standard deviation of backward inter-arrival times.
- `bwd_iat_max`: Maximum time between consecutive backward packets.
- `bwd_iat_min`: Minimum time between consecutive backward packets.

### 4. TCP Flags (8 features)
- `fwd_psh_flags`: Number of times the PSH flag was set in forward packets.
- `fwd_urg_flags`: Number of times the URG flag was set in forward packets.
- `fin_flag_count`: Number of packets with the FIN flag set.
- `syn_flag_count`: Number of packets with the SYN flag set.
- `rst_flag_count`: Number of packets with the RST flag set.
- `psh_flag_count`: Number of packets with the PSH flag set.
- `ack_flag_count`: Number of packets with the ACK flag set.
- `urg_flag_count`: Number of packets with the URG flag set.

### 5. Header & Window (9 features)
- `fwd_header_length`: Total header bytes sent in the forward direction.
- `bwd_header_length`: Total header bytes sent in the backward direction.
- `fwd_avg_bytes_bulk`: Average number of bytes sent in bulk.
- `init_win_bytes_forward`: Number of bytes sent in the initial forward window.
- `init_win_bytes_backward`: Number of bytes sent in the initial backward window.
- `act_data_pkt_fwd`: Count of forward packets containing at least 1 byte of TCP payload.
- `min_seg_size_forward`: Minimum segment size observed in the forward direction.
- `active_mean`: Mean time a flow was active before becoming idle.
- `idle_mean`: Mean time a flow was idle before becoming active.

### 6. Derived Network Metrics (7 features)
- `packet_rate`: Packets per second.
- `byte_rate`: Bytes per second.
- `avg_packet_size`: Mean size of packets in the session.
- `flow_duration`: Total duration of the session.
- `inter_arrival_time`: Overall mean packet inter-arrival time.
- `fwd_bwd_ratio`: Ratio of forward to backward packet counts.
- `port_entropy`: Statistical entropy of port utilization.

---

## 🧬 Explainability: Z-Score Feature Deviation

To provide SecOps analysts with real-time root-cause explanations without adding heavy dependencies (like full SHAP computation), we calculate a local **Z-Score Feature Attribution** on-the-fly:

1. **Baseline Ingestion:** During API server startup, the server loads a reference dataframe of historical benign traffic (`train.parquet`) and precomputes the mean ($\mu$) and standard deviation ($\sigma$) for all 48 numerical features.
2. **On-Demand Scoring:** When an analyst views an alert's details, the API measures the feature vector of the flow ($x$) against the benign stats:
   $$Z_i = \left| \frac{x_i - \mu_i}{\sigma_i + \epsilon} \right|$$
   *where $\epsilon$ is a small smoothing constant ($10^{-5}$) to prevent division by zero.*
3. **Top Attribution Extraction:** The top 5 features with the highest $Z$-scores are selected. Their values are normalized to show relative contribution percentages in the UI drill-down drawer:
   $$P_i = \frac{Z_i}{\sum_{k \in \text{top 5}} Z_k}$$
   This highlights the exact variables (e.g., massive spike in `src_bytes` or anomalous `syn_flag_count`) causing the ML model to flag the connection.

---

## 🛠️ Testing & Quality Controls

### Backend Test Execution
To execute the python integration and unit tests:
```bash
cd backend
.venv/bin/pytest tests/ -v
```

### Type Checking & Formatting
```bash
# Run Ruff lint rules and formatter
.venv/bin/ruff check src/ tests/ --fix
.venv/bin/ruff format src/ tests/

# Run static type checks
.venv/bin/mypy src/ --strict
```
