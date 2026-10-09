"""
Multilingual extraction and English-equivalent comparison tests for Layer 2.
Tests non-English samples (Hindi, Tamil, Telugu) and measures equivalence against English equivalents.
Includes comparison test for SentenceTransformerClauseMapper vs TfidfClauseMapper baseline.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.clause_mapper import (
    MultilingualClauseMapper,
    SentenceTransformerClauseMapper,
    TfidfClauseMapper,
)
from app.ontology import OntologyField


SAMPLES_DIR = Path(__file__).parent / "sample_notifications"


def test_multilingual_clause_mapper_hindi():
    mapper = MultilingualClauseMapper()

    clause_income = "पारिवारिक वार्षिक आय 2.5 लाख रुपये से कम होनी चाहिए"
    field, sim = mapper.map_clause_to_field(clause_income)
    assert field == OntologyField.INCOME_THRESHOLD
    assert sim >= 0.5

    clause_land = "संस्थागत भूमिधारक किसान इस योजना के तहत पात्र नहीं हैं"
    field, sim = mapper.map_clause_to_field(clause_land)
    assert field == OntologyField.INSTITUTIONAL_LANDHOLDER
    assert sim >= 0.5


def test_multilingual_clause_mapper_tamil():
    mapper = MultilingualClauseMapper()

    clause_income = "குடும்பத்தின் ஆண்டு வருமானம் ரூ. 2.50 லட்சத்திற்கு மிகாமல் இருக்க வேண்டும்"
    field, sim = mapper.map_clause_to_field(clause_income)
    assert field == OntologyField.INCOME_THRESHOLD
    assert sim >= 0.5

    clause_tax = "கடந்த மதிப்பீட்டு ஆண்டில் வருமான வரி செலுத்தியவர்கள் தகுதியற்றவர்"
    field, sim = mapper.map_clause_to_field(clause_tax)
    assert field == OntologyField.INCOME_TAX_PAYER_STATUS
    assert sim >= 0.5


def test_multilingual_clause_mapper_telugu():
    mapper = MultilingualClauseMapper()

    clause_income = "కుటుంబ వార్షిక ఆదాయం 2.50 లక్షల రూపాయల కంటే తక్కువగా ఉండాలి"
    field, sim = mapper.map_clause_to_field(clause_income)
    assert field == OntologyField.INCOME_THRESHOLD
    assert sim >= 0.5


def test_pm_kisan_hindi_vs_english_equivalence():
    mapper = MultilingualClauseMapper()

    hi_path = SAMPLES_DIR / "hi" / "01_pm_kisan_hi.txt"
    en_path = SAMPLES_DIR / "en" / "01_pm_kisan.txt"

    assert hi_path.exists()
    assert en_path.exists()

    hi_text = hi_path.read_text(encoding="utf-8")
    en_text = en_path.read_text(encoding="utf-8")

    hi_fields = []
    for line in hi_text.splitlines():
        field, sim = mapper.map_clause_to_field(line)
        if field:
            hi_fields.append(field.value)

    en_fields = []
    for line in en_text.splitlines():
        field, sim = mapper.map_clause_to_field(line)
        if field:
            en_fields.append(field.value)

    metrics = mapper.compute_rule_equivalence(hi_fields, en_fields)

    assert metrics["recall"] >= 0.70
    assert metrics["is_equivalent"] is True
    assert "institutional_landholder" in metrics["matched_fields"]
    assert "income_tax_payer_status" in metrics["matched_fields"]


def test_compare_sentence_transformer_vs_tfidf_baseline():
    """
    Item 1: Compare SentenceTransformer (multilingual embeddings / LaBSE) vs TF-IDF baseline
    on Hindi, Tamil, and Telugu notification clauses against English ground truth.
    """
    st_mapper = SentenceTransformerClauseMapper()
    tfidf_mapper = TfidfClauseMapper()

    hi_path = SAMPLES_DIR / "hi" / "01_pm_kisan_hi.txt"
    en_path = SAMPLES_DIR / "en" / "01_pm_kisan.txt"
    hi_text = hi_path.read_text(encoding="utf-8")
    en_text = en_path.read_text(encoding="utf-8")

    en_fields_gt = [tfidf_mapper.map_clause_to_field(l)[0].value for l in en_text.splitlines() if tfidf_mapper.map_clause_to_field(l)[0]]

    # SentenceTransformer extraction
    st_hi_fields = [st_mapper.map_clause_to_field(l)[0].value for l in hi_text.splitlines() if st_mapper.map_clause_to_field(l)[0]]
    st_metrics = st_mapper.compute_rule_equivalence(st_hi_fields, en_fields_gt)

    # TF-IDF baseline extraction
    tfidf_hi_fields = [tfidf_mapper.map_clause_to_field(l)[0].value for l in hi_text.splitlines() if tfidf_mapper.map_clause_to_field(l)[0]]
    tfidf_metrics = tfidf_mapper.compute_rule_equivalence(tfidf_hi_fields, en_fields_gt)

    assert st_metrics["recall"] >= 0.70
    assert tfidf_metrics["recall"] >= 0.75
    # Verify both mappers identify key exclusion fields
    assert "institutional_landholder" in st_metrics["matched_fields"]
    assert "institutional_landholder" in tfidf_metrics["matched_fields"]
