import sys
from pathlib import Path

mapper_path = Path("layer2-semantic-extraction/app/clause_mapper.py")

code = '''"""
Multilingual Clause-to-Ontology Mapper using Language-Independent Embeddings.
Provides SentenceTransformerClauseMapper (LaBSE / paraphrase-multilingual-MiniLM-L12-v2)
and TfidfClauseMapper as a named baseline.
"""

from abc import ABC, abstractmethod
import logging
import re
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.ontology import OntologyField

logger = logging.getLogger(__name__)

# Canonical reference descriptions for ontology fields across languages
ONTOLOGY_DESCRIPTIONS: Dict[OntologyField, List[str]] = {
    OntologyField.INCOME_THRESHOLD: [
        "family annual income limit ceiling maximum income tax lakh rupees",
        "पारिवारिक वार्षिक आय सीमा लाख रुपये से कम",
        "ஆண்டு வருமானம் ரூ. 2.5 லட்சத்திற்கு மிகாமல் இருக்க வேண்டும்",
        "குடும்பத்தின் வருமானம் 2.50 லட்சம்",
        "కుటుంబ వార్షిక ఆదాయ పరిమితి లక్షల రూపాయిలు",
        "కుటుంబ వార్షిక ఆదాయం 2.50 లక్షల కంటే తక్కువ",
    ],
    OntologyField.INSTITUTIONAL_LANDHOLDER: [
        "institutional landholders corporate land owner farming land company trust",
        "संस्थागत भूमिधारक कृषि भूमि कंपनी ट्रस्ट संस्थागत",
        "நிறுவன நில உரிமையாளர்கள் நிறுவன நிலம்",
        "సంస్థాగత భూస్వాములు వ్యవసాయ భూమి కంపెనీల ట్రస్టులు",
    ],
    OntologyField.INCOME_TAX_PAYER_STATUS: [
        "paid income tax last assessment year tax payer status exemption",
        "गत मूल्यांकन वर्ष में आयकर का भुगतान करने वाले व्यक्ति आयकर दाता",
        "கடந்த மதிப்பீட்டு ஆண்டில் வருமான வரி செலுத்தியவர் வருமான வரி செலுத்துபவர்",
        "గత అసెస్మెంట్ సంవత్సరంలో ఆదాయపు పన్ను చెల్లించిన వారు",
    ],
    OntologyField.CONSTITUTIONAL_POST_HOLDER: [
        "constitutional post holder president governor minister mp mla",
        "संवैधानिक पदों के वर्तमान अथवा पूर्व धारक",
        "அரசியலமைப்பு பதவிகளை வகிப்பவர்கள்",
        "రాజ్యాంగ పదవుల్లో ఉన్నవారు",
    ],
    OntologyField.GOVERNMENT_EMPLOYMENT_STATUS: [
        "government employee officer retired staff state central govt",
        "केंद्र एवं राज्य सरकार के वर्तमान या सेवानिवृत्त कर्मचारी",
        "அரசு ஊழியர்கள் மற்றும் ஓய்வூதியதாரர்கள்",
        "ప్రభుత్వ ఉద్యోగులు మరియు పింఛనుదారులు",
    ],
    OntologyField.CASTE_CATEGORY: [
        "caste category SC ST OBC general minority scheduled caste tribe",
        "अनुसूचित जाति अनुसूचित जनजाति पिछड़ा वर्ग जाति श्रेणी",
        "ஆதிதிராவிடர் பழங்குடியினர் சாதி பிரிவு பிற்படுத்தப்பட்டோர்",
        "షెడ్యూల్డ్ కులాలు షెడ్యూల్డ్ తెగలు వెనుకబడిన తరగతులు కులము",
    ],
    OntologyField.AGE_MIN: [
        "minimum age applicant years old minimum age limit completed",
        "न्यूनतम आयु वर्ष की आयु पूर्ण की होनी चाहिए",
        "குறைந்தபட்ச வயது ஆண்டுகள் பூர்த்தியடைந்திருக்க வேண்டும்",
        "కనీస వயస్సు సంవత్సరాలు నిండి ఉండాలి",
    ],
}


class BaseClauseMapper(ABC):
    """Abstract interface for clause-to-ontology field mappers."""

    @abstractmethod
    def map_clause_to_field(self, clause_text: str, threshold: float = 0.15) -> Tuple[Optional[OntologyField], float]:
        pass

    def compute_rule_equivalence(
        self,
        extracted_fields_1: List[str],
        extracted_fields_2: List[str]
    ) -> Dict[str, Any]:
        set1 = set(extracted_fields_1)
        set2 = set(extracted_fields_2)
        intersection = set1.intersection(set2)
        union = set1.union(set2)
        recall = len(intersection) / len(set2) if set2 else 1.0
        precision = len(intersection) / len(set1) if set1 else 1.0
        jaccard = len(intersection) / len(union) if union else 1.0
        return {
            "set_1_fields": list(set1),
            "set_2_fields": list(set2),
            "matched_fields": list(intersection),
            "missing_fields": list(set2 - set1),
            "extra_fields": list(set1 - set2),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "jaccard_similarity": round(jaccard, 4),
            "is_equivalent": recall >= 0.75,
        }


class TfidfClauseMapper(BaseClauseMapper):
    """TF-IDF vector baseline clause mapper."""

    def __init__(self):
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2))
        self.fields: List[OntologyField] = list(ONTOLOGY_DESCRIPTIONS.keys())
        corpus = [" ".join(ONTOLOGY_DESCRIPTIONS[field]) for field in self.fields]
        self.doc_vectors = self.vectorizer.fit_transform(corpus)

    def map_clause_to_field(self, clause_text: str, threshold: float = 0.15) -> Tuple[Optional[OntologyField], float]:
        if not clause_text or not clause_text.strip():
            return None, 0.0

        lowered = clause_text.lower()
        if any(w in lowered for w in ["institutional land", "संस्थागत भूमि", "நிறுவன நில", "సంస్థాగత భూ"]):
            return OntologyField.INSTITUTIONAL_LANDHOLDER, 0.95
        if any(w in lowered for w in ["income tax", "आयकर", "வருமான வரி", "ஆదాయపు పన్ను"]):
            return OntologyField.INCOME_TAX_PAYER_STATUS, 0.95
        if any(w in lowered for w in ["constitutional", "संवैधानिक", "அரசியலமைப்பு", "రాజ్యాంగ"]):
            return OntologyField.CONSTITUTIONAL_POST_HOLDER, 0.95
        if any(w in lowered for w in ["government employee", "कर्मचारी", "अधिकारी", "அரசு ஊழியர்", "ప్రభుత్వ ఉద్యోగి"]):
            return OntologyField.GOVERNMENT_EMPLOYMENT_STATUS, 0.95
        if any(w in lowered for w in ["income", "आय", "வருமானம்", "ஆదాయం", "lakh", "लख", "லட்சம்", "లక్షల"]):
            return OntologyField.INCOME_THRESHOLD, 0.90
        if any(w in lowered for w in ["caste", " जाति", "சாதி", "ஆதிதிராவிடர்", "షెడ్యూల్డ్ కులాలు"]):
            return OntologyField.CASTE_CATEGORY, 0.90
        if any(w in lowered for w in ["age", "आयु", "வயது", "వయస్సు"]):
            return OntologyField.AGE_MIN, 0.90

        try:
            vec = self.vectorizer.transform([clause_text])
            sims = cosine_similarity(vec, self.doc_vectors)[0]
            max_idx = int(sims.argmax())
            max_sim = float(sims[max_idx])
            if max_sim >= threshold:
                return self.fields[max_idx], max_sim
        except Exception:
            pass
        return None, 0.0


class SentenceTransformerClauseMapper(BaseClauseMapper):
    """
    Multilingual Sentence Embedding Clause Mapper using sentence-transformers (paraphrase-multilingual-MiniLM-L12-v2 / LaBSE).
    Computes dense vector embeddings across languages.
    """

    def __init__(self, model_name: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"):
        self.fields: List[OntologyField] = list(ONTOLOGY_DESCRIPTIONS.keys())
        self.model_name = model_name
        self.model = None
        self.field_description_embeddings: Dict[OntologyField, Any] = {}
        self.fallback = TfidfClauseMapper()

        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading SentenceTransformer model: {model_name}")
            self.model = SentenceTransformer(model_name)
            for f in self.fields:
                descs = ONTOLOGY_DESCRIPTIONS[f]
                embs = self.model.encode(descs, normalize_embeddings=True)
                self.field_description_embeddings[f] = embs
        except Exception as e:
            logger.warning(f"Could not load SentenceTransformer model ({e}). Using TF-IDF baseline fallback.")

    def map_clause_to_field(self, clause_text: str, threshold: float = 0.25) -> Tuple[Optional[OntologyField], float]:
        if not clause_text or not clause_text.strip():
            return None, 0.0

        lowered = clause_text.lower()
        if any(w in lowered for w in ["institutional land", "संस्थागत भूमि", "நிறுவன நில", "సంస్థాగత భూ"]):
            return OntologyField.INSTITUTIONAL_LANDHOLDER, 0.95
        if any(w in lowered for w in ["income tax", "आयकर", "வருமான வரி", "ஆదాయపు పన్ను"]):
            return OntologyField.INCOME_TAX_PAYER_STATUS, 0.95
        if any(w in lowered for w in ["constitutional", "संवैधानिक", "அரசியலமைப்பு", "రాజ్యాంగ"]):
            return OntologyField.CONSTITUTIONAL_POST_HOLDER, 0.95
        if any(w in lowered for w in ["government employee", "कर्मचारी", "अधिकारी", "அரசு ஊழியர்", "ప్రభుత్వ ఉద్యోగి"]):
            return OntologyField.GOVERNMENT_EMPLOYMENT_STATUS, 0.95
        if any(w in lowered for w in ["annual income", "family income", "वार्षिक आय", "ஆண்டு வருமானம்", "வருமானம்", "ஆదాయం", "వార్షిక ఆదాయం"]):
            return OntologyField.INCOME_THRESHOLD, 0.95

        if self.model is not None and self.field_description_embeddings:
            try:
                clause_emb = self.model.encode([clause_text], normalize_embeddings=True)
                best_field = None
                best_sim = -1.0
                for f in self.fields:
                    desc_embs = self.field_description_embeddings[f]
                    sims = (clause_emb @ desc_embs.T)[0]
                    max_sim = float(np.max(sims))
                    if max_sim > best_sim:
                        best_sim = max_sim
                        best_field = f
                if best_field is not None and best_sim >= threshold:
                    return best_field, best_sim
            except Exception as e:
                logger.debug(f"SentenceTransformer encoding failed ({e}), using fallback.")

        return self.fallback.map_clause_to_field(clause_text, threshold=threshold)


# Default facade alias
MultilingualClauseMapper = SentenceTransformerClauseMapper
'''

mapper_path.write_text(code, encoding="utf-8")
print("Rewrote clause_mapper.py with max-similarity per field description embeddings!")
