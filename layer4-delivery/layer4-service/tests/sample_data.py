"""
Sample Layer 3 eligibility evaluation outputs for testing Layer 4 pure functions.
Built from the live Layer 3 evaluation engine (Post-Matric SC Scholarship ruleset).
"""

from tests.l3_integration import layer3_eligibility

CASE_1_HIGH_CONFIDENCE_ELIGIBLE = layer3_eligibility("eligible")
CASE_2_LOW_CONFIDENCE_MISSING_FACTS = layer3_eligibility("needs_more_info")
CASE_3_INELIGIBLE_BUT_CLOSE = layer3_eligibility("ineligible_close")
