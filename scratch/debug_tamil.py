import sys
from pathlib import Path
sys.path.insert(0, str(Path("layer2-semantic-extraction").resolve()))

from app.clause_mapper import MultilingualClauseMapper

clause_income = "குடும்பத்தின் ஆண்டு வருமானம் ரூ. 2.50 லட்சத்திற்கு மிகாமல் இருக்க வேண்டும்"
lowered = clause_income.lower()

mapper = MultilingualClauseMapper()
field, sim = mapper.map_clause_to_field(clause_income)

with open("scratch/debug_out.txt", "w", encoding="utf-8") as f:
    f.write(f"Clause: {clause_income}\n")
    f.write(f"Result field: {field}\n")
    f.write(f"Similarity: {sim}\n")
    if mapper.model is not None:
        emb = mapper.model.encode([clause_income], normalize_embeddings=True)
        sims = (emb @ mapper.field_embeddings.T)[0]
        for idx, fld in enumerate(mapper.fields):
            f.write(f"Field {fld}: similarity {sims[idx]}\n")
