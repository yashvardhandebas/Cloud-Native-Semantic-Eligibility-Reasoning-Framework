"""
OCR text cleaning routines for Layer 1.
Removes common Tesseract OCR noise, fixes line-break hyphenations, normalizes currency, and cleans formatting artifacts.
"""

import re
from typing import Optional


def clean_ocr_text(raw_text: Optional[str]) -> str:
    """
    Clean and normalize raw OCR output text.
    
    Operations:
    1. Strip control characters and non-printable noise symbols.
    2. Merge words hyphenated across line breaks (e.g., 'Eli- \\ngibility' -> 'Eligibility').
    3. Normalize currency notation (e.g., 'Rs .', 'RS.', '₹ ') to 'Rs. '.
    4. Normalize spacing around punctuation and remove redundant whitespace.
    5. Filter out common OCR artifact lines (e.g., isolated non-alphanumeric noise).
    """
    if not raw_text:
        return ""

    text = raw_text

    # 1. Remove non-printable control characters except standard newlines/tabs
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]", "", text)

    # 2. Fix hyphenated line breaks (e.g. "scholar-\nship" -> "scholarship")
    text = re.sub(r"(\w+)-\s*\n\s*(\w+)", r"\1\2", text)

    # 3. Replace stray pipe/bar characters often inserted by table borders in OCR
    text = re.sub(r"(?<=\w)\s*\|\s*(?=\w)", " ", text)
    text = re.sub(r"^\s*\|\s*", "", text, flags=re.MULTILINE)

    # 4. Standardize currency expressions
    text = re.sub(r"\b(?:RS|Rs|rs)\s*\.\s*", "Rs. ", text)
    text = re.sub(r"₹\s*", "Rs. ", text)

    # 5. Fix common OCR character misrecognitions in English/Hindi numbers/punctuation
    text = re.sub(r"(\d)\s*,\s*(\d)", r"\1,\2", text)  # Fix spaced numbers e.g. "2 , 50,000"
    text = re.sub(r"\b([Ll])akhs?\b", "Lakhs", text)

    # 6. Normalize paragraph whitespace (preserve single blank line paragraph separators)
    lines = []
    for line in text.splitlines():
        cleaned_line = re.sub(r"\s+", " ", line).strip()
        # Filter out lines containing only stray punctuation or noise symbols
        if cleaned_line and not re.match(r"^[^a-zA-Z0-9\u0900-\u097F\u0B80-\u0BFF\u0C00-\u0C7F]+$", cleaned_line):
            lines.append(cleaned_line)

    cleaned = "\n".join(lines)
    return cleaned
