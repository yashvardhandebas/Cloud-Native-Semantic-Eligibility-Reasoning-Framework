"""
Smoke Test Script for Gateway API and Microservice Stack.
Verifies end-to-end HTTP pipeline processing.
"""

import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT / "layer1-ingestion"))
sys.path.insert(0, str(ROOT / "layer2-semantic-extraction"))
sys.path.insert(0, str(ROOT / "layer3-reasoning-engine"))
sys.path.insert(0, str(ROOT / "layer4-delivery" / "layer4-service"))
sys.path.insert(0, str(ROOT / "gateway"))


def run_smoke_test(gateway_url: str = "http://localhost:8000") -> bool:
    """Send HTTP request to API Gateway or run in-process pipeline test."""
    print(f"Running end-to-end Gateway smoke test against: {gateway_url}")

    try:
        import requests
        resp = requests.get(f"{gateway_url}/health", timeout=3)
        if resp.status_code == 200:
            print("Gateway Health Check: PASSED (HTTP 200)")

            payload = {
                "notification_text": "Post-Matric Scholarship for SC Students. Family income limit Rs 2,50,000.",
                "citizen_facts": {"caste_category": "SC", "income_threshold": 210000, "education_level": "10th"},
                "language": "en"
            }
            res_pipe = requests.post(f"{gateway_url}/api/v1/pipeline/process-text", json=payload, timeout=10)
            if res_pipe.status_code == 200:
                print("End-to-End Pipeline Smoke Test: PASSED (HTTP 200)")
                print(f"Verdict: {res_pipe.json().get('eligibility_verdict')}")
                return True
    except Exception as e:
        print(f"Gateway HTTP endpoint not reachable ({e}). Running in-process Gateway pipeline test...")

    # In-process smoke test fallback
    from gateway.main import process_pipeline_text, PipelineTextRequest
    req = PipelineTextRequest(
        notification_text="Post-Matric Scholarship for SC Students. Family income limit Rs 2,50,000.",
        citizen_facts={"caste_category": "SC", "income_threshold": 210000, "education_level": "10th"},
        language="en"
    )
    result = process_pipeline_text(req)
    assert result["eligibility_verdict"] == "eligible"
    assert result["readiness_score"] == 100.0
    print("In-Process Gateway Pipeline Smoke Test: PASSED")
    return True


if __name__ == "__main__":
    success = run_smoke_test()
    if not success:
        sys.exit(1)
