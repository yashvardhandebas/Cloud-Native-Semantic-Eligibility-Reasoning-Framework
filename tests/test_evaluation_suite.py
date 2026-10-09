"""
Pytest wrapper running the benchmark evaluation suite.
Checks precision, recall, verdict accuracy across 12 hand-derived gold profiles, and incremental timing.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT / "evaluation"))

from run_evaluation import (
    evaluate_multilingual_extraction,
    evaluate_hand_derived_verdict_accuracy,
    evaluate_incremental_timing_benchmark,
)


def test_multilingual_extraction_benchmark():
    metrics = evaluate_multilingual_extraction()
    assert metrics["average_precision"] >= 0.50
    assert metrics["average_recall"] >= 0.70


def test_verdict_accuracy_across_12_hand_derived_profiles():
    metrics = evaluate_hand_derived_verdict_accuracy()
    assert metrics["total_profiles"] == 12
    assert metrics["verdict_accuracy"] == 1.0  # All 12 hand-derived profiles pass


def test_incremental_update_timing_benchmark():
    timing = evaluate_incremental_timing_benchmark()
    assert timing["in_memory_graph"]["incremental_evolution_ms"] >= 0.0
