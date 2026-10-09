import sys
from pathlib import Path
sys.path.insert(0, str(Path("layer2-semantic-extraction").resolve()))

from sentence_transformers import SentenceTransformer
import numpy as np
from app.ontology import OntologyField
from app.clause_mapper import ONTOLOGY_DESCRIPTIONS

model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

clause_income = "குடும்பத்தின் ஆண்டு வருமானம் ரூ. 2.50 லட்சத்திற்கு மிகாமல் இருக்க வேண்டும்"
clause_emb = model.encode([clause_income], normalize_embeddings=True)

with open("scratch/fix_out.txt", "w", encoding="utf-8") as out:
    out.write("--- Testing separate encoding (max similarity per field) ---\n")
    for f, desc_list in ONTOLOGY_DESCRIPTIONS.items():
        desc_embs = model.encode(desc_list, normalize_embeddings=True)
        sims = (clause_emb @ desc_embs.T)[0]
        max_sim = float(np.max(sims))
        best_desc = desc_list[int(np.argmax(sims))]
        out.write(f"{f}: max_sim = {max_sim:.4f} (best desc: {best_desc})\n")
