from pathlib import Path

path = Path("layer2-semantic-extraction/app/clause_mapper.py")
content = path.read_text(encoding="utf-8")

old_str = "return OntologyField.GOVERNMENT_EMPLOYMENT_STATUS, 0.95"
new_str = old_str + '\n        if any(w in lowered for w in ["annual income", "family income", "वार्षिक आय", "வருமானம்", "ஆண்டு வருமானம்", "ஆదాయం", "వార్షిక ఆదాయం"]):\n            return OntologyField.INCOME_THRESHOLD, 0.95'

if old_str in content:
    content = content.replace(old_str, new_str, 1)
    path.write_text(content, encoding="utf-8")
    print("Successfully updated clause_mapper.py")
else:
    print("Target string not found")
