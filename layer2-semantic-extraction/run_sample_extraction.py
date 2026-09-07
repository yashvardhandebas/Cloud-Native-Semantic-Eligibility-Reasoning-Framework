import json
import sys
from pathlib import Path
from app.config import settings
from app.extractor import RuleExtractor

def main():
    print("=" * 70)
    print("Layer 2: Semantic Rule Extraction - Live Sample Runner")
    print("=" * 70)
    print(f"Active Model: {settings.GROQ_MODEL}")
    has_key = bool(settings.GROQ_API_KEY and settings.GROQ_API_KEY.startswith("gsk_"))
    print(f"GROQ API Key Configured: {'[YES]' if has_key else '[NO]'}")

    sample_path = Path(__file__).parent / "tests" / "sample_notifications" / "en" / "01_pm_kisan.txt"
    if len(sys.argv) > 1:
        sample_path = Path(sys.argv[1])

    if not sample_path.exists():
        print(f"Error: Sample file not found at {sample_path}")
        sys.exit(1)

    with open(sample_path, "r", encoding="utf-8") as f:
        sample_text = f.read()

    print(f"\n--- Input Notification ({sample_path.name}) ---")
    print(sample_text.strip())
    print("-" * 70)

    print("\nSending request to Groq LLM for semantic extraction...")
    extractor = RuleExtractor()

    try:
        rule_set = extractor.extract(text=sample_text, language="en")
        print("\nSUCCESS: Successfully extracted and validated RuleSet against Pydantic schema!")
        print("-" * 70)
        formatted_json = json.dumps(rule_set.model_dump(), indent=2, ensure_ascii=False)
        print(formatted_json)
        print("-" * 70)
        print("Summary of Extracted Clauses:")
        print(f"  • Scheme Name: {rule_set.scheme_name}")
        print(f"  • Notification ID: {rule_set.notification_id}")
        print(f"  • Conditions Extracted: {len(rule_set.conditions)}")
        print(f"  • Documents Required:   {len(rule_set.documents)}")
        print(f"  • Benefits Extracted:    {len(rule_set.benefits)}")
        print(f"  • Exclusions Extracted:  {len(rule_set.exclusions)}")
        print("=" * 70)

        # Save output to file for record
        out_path = Path(__file__).parent / "sample_extracted_output.json"
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(formatted_json)
        print(f"Saved extracted JSON to: {out_path}")

    except Exception as e:
        print(f"\nExtraction Failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
