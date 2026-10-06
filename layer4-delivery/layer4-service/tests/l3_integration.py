"""
Build Layer 3 eligibility results for Layer 4 demo and unit tests (offline mock graph).
"""

import json
import subprocess
import sys
from functools import lru_cache
from pathlib import Path

from app.schema import EligibilityResult

_LAYER3_ROOT = Path(__file__).resolve().parents[3] / "layer3-reasoning-engine"
_EMITTER = _LAYER3_ROOT / "tests" / "emit_eligibility_case.py"


@lru_cache(maxsize=3)
def layer3_eligibility(case_key: str) -> EligibilityResult:
    proc = subprocess.run(
        [sys.executable, str(_EMITTER), case_key],
        cwd=str(_LAYER3_ROOT),
        capture_output=True,
        text=True,
        check=True,
    )
    return EligibilityResult.model_validate(json.loads(proc.stdout))
