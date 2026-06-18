"""Model training script.

Trains all four models on the processed data and saves artifacts
to the model registry.

Usage:
    python -m anomaly_detection.ml.train --data-dir data/processed --output-dir models
"""

from __future__ import annotations

import argparse
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from anomaly_detection.constants import FEATURE_COLUMNS
from anomaly_detection.logging import get_logger, setup_logging
from anomaly_detection.ml.decision_tree import DecisionTreeDetector
from anomaly_detection.ml.isolation_forest import IsolationForestDetector
from anomaly_detection.ml.random_forest import RandomForestDetector
from anomaly_detection.ml.xgboost_model import XGBoostDetector

logger = get_logger(__name__)

SEED = 42


def train_all_models(data_dir: Path, output_dir: Path) -> None:
    """Train all four models and save to the registry.

    Args:
        data_dir: Directory containing processed parquet files and scaler.
        output_dir: Model registry directory.
    """
    np.random.seed(SEED)

    # Load data
    train_benign = pd.read_parquet(data_dir / "train_benign.parquet")
    train_full = pd.read_parquet(data_dir / "train.parquet")
    scaler = joblib.load(data_dir / "scaler.joblib")

    logger.info(
        "data_loaded",
        train_benign_rows=len(train_benign),
        train_full_rows=len(train_full),
    )

    # Scale features
    X_benign = scaler.transform(train_benign[FEATURE_COLUMNS].values)
    X_full = scaler.transform(train_full[FEATURE_COLUMNS].values)

    # Binary labels for supervised model: BENIGN=0, anything else=1
    y_full = (train_full["label"].str.upper() != "BENIGN").astype(int).values

    # --- 1. Isolation Forest ---
    logger.info("training_model", model="isolation_forest")
    iforest = IsolationForestDetector(n_estimators=200, contamination=0.01)
    iforest.fit(X_benign)
    iforest.save(output_dir / "isolation_forest" / "v1")

    # --- 2. Decision Tree (supervised) ---
    logger.info("training_model", model="decision_tree")
    dt = DecisionTreeDetector(max_depth=10)
    dt.fit(X_full, y_full)
    dt.save(output_dir / "decision_tree" / "v1")

    # --- 3. Random Forest (supervised) ---
    logger.info("training_model", model="random_forest")
    rf = RandomForestDetector(n_estimators=200, max_depth=10)
    rf.fit(X_full, y_full)
    rf.save(output_dir / "random_forest" / "v1")

    # --- 4. XGBoost (supervised) ---
    logger.info("training_model", model="xgboost")
    xgb_model = XGBoostDetector(n_estimators=200, max_depth=6, learning_rate=0.1)
    xgb_model.fit(X_full, y_full)
    xgb_model.save(output_dir / "xgboost" / "v1")

    logger.info("all_models_trained", output_dir=str(output_dir))


def main() -> None:
    """CLI entrypoint."""
    parser = argparse.ArgumentParser(description="Train anomaly detection models")
    parser.add_argument("--data-dir", type=Path, default=Path("data/processed"))
    parser.add_argument("--output-dir", type=Path, default=Path("models"))
    args = parser.parse_args()

    setup_logging("INFO")
    train_all_models(args.data_dir, args.output_dir)


if __name__ == "__main__":
    main()
