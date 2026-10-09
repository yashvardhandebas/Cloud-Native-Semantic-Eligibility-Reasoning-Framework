"""
Unit tests for Layer 1 OCR text cleaner module.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.cleaner import clean_ocr_text


def test_clean_ocr_hyphenation_and_whitespace():
    dirty_text = "Post-Matric Scholar-\nship Scheme for SC Students.\nEli- \ngibility criteria applies."
    cleaned = clean_ocr_text(dirty_text)
    assert "Scholarship" in cleaned
    assert "Eligibility" in cleaned


def test_clean_ocr_currency_normalization():
    dirty_text = "Family income ceiling is RS . 2,50,000 per annum or ₹ 250000."
    cleaned = clean_ocr_text(dirty_text)
    assert "Rs. 2,50,000" in cleaned or "Rs. 250000" in cleaned
    assert "RS ." not in cleaned
    assert "₹" not in cleaned


def test_clean_ocr_noise_filtering():
    dirty_text = "Valid Notice Title\n| ~ ¬\nApplicant must belong to SC category.\n---"
    cleaned = clean_ocr_text(dirty_text)
    assert "Valid Notice Title" in cleaned
    assert "Applicant must belong to SC category" in cleaned
    assert "| ~ ¬" not in cleaned
