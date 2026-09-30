"""
Unit tests for Part A — Evidence Completion Engine.
"""

import pytest
from app.evidence_engine import analyze_evidence_completion
from tests.sample_data import (
    CASE_1_HIGH_CONFIDENCE_ELIGIBLE,
    CASE_2_LOW_CONFIDENCE_MISSING_FACTS,
    CASE_3_INELIGIBLE_BUT_CLOSE,
)


def test_high_confidence_eligible():
    summary = analyze_evidence_completion(CASE_1_HIGH_CONFIDENCE_ELIGIBLE)
    assert summary.confidence_score == 1.0
    assert summary.total_clauses == 3
    assert summary.resolved_clauses == 3
    assert summary.unknown_clauses_count == 0
    assert len(summary.missing_evidence) == 0
    assert "complete citizen evidence" in summary.explanation


def test_low_confidence_missing_facts():
    summary = analyze_evidence_completion(CASE_2_LOW_CONFIDENCE_MISSING_FACTS)
    assert summary.confidence_score == 0.67
    assert summary.total_clauses == 3
    assert summary.resolved_clauses == 2
    assert summary.unknown_clauses_count == 1
    assert len(summary.missing_evidence) == 1

    item = summary.missing_evidence[0]
    assert item.field == "income_threshold"
    assert item.field_label == "Annual Family Income"
    assert "Rs. 2,50,000" in item.raw_text
    assert "Income Certificate" in item.recommended_document
    assert "Please declare your annual family income" in item.action_prompt


def test_ineligible_complete_facts():
    summary = analyze_evidence_completion(CASE_3_INELIGIBLE_BUT_CLOSE)
    assert summary.confidence_score == 1.0
    assert summary.total_clauses == 3
    assert summary.resolved_clauses == 3
    assert summary.unknown_clauses_count == 0
    assert len(summary.missing_evidence) == 0
