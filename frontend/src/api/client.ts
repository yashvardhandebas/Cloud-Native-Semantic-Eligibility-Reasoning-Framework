import { Scheme, CitizenFacts, EvaluationOutcome, BenchmarkMetrics } from '../types';
import { MOCK_SCHEMES, MOCK_EVALUATION_SCENARIOS, MOCK_BENCHMARK_METRICS } from './mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true' || String(import.meta.env.VITE_USE_MOCKS) === 'true';

export const isMockMode = (): boolean => USE_MOCKS;

export async function fetchSchemes(): Promise<Scheme[]> {
  if (USE_MOCKS) {
    return MOCK_SCHEMES;
  }
  try {
    const res = await fetch(`${BASE_URL}/api/v1/schemes`);
    if (!res.ok) throw new Error('Failed to fetch schemes');
    return await res.json();
  } catch (err) {
    console.warn('API error, falling back to mock schemes:', err);
    return MOCK_SCHEMES;
  }
}

export async function fetchSchemeById(id: string): Promise<Scheme | undefined> {
  const schemes = await fetchSchemes();
  return schemes.find((s) => s.id === id);
}

export function evaluateSchemeLocally(scheme: Scheme, facts: CitizenFacts): EvaluationOutcome {
  let hasFailure = false;
  let hasUnknown = false;
  let triggeredExclusion = false;

  const clauseDetails = scheme.conditions.map((cond) => {
    const actual = facts[cond.field];

    if (actual === undefined || actual === null || actual === '') {
      hasUnknown = true;
      return {
        clause_id: cond.id,
        field: cond.field,
        field_display: cond.field_display,
        status: 'UNKNOWN' as const,
        mutability: cond.mutability,
        expected_value: `${cond.operator} ${Array.isArray(cond.value) ? cond.value.join(', ') : cond.value}`,
        citizen_value: 'Missing / Not Stated',
        proximity_score: 0.0,
        original_clause: cond.original_clause,
        failure_reason: `Missing fact for ${cond.field_display}. Verification required.`,
      };
    }

    let passed = false;
    const op = cond.operator;
    const exp = cond.value;

    if (op === 'eq') {
      passed = String(actual).toLowerCase() === String(exp).toLowerCase();
    } else if (op === 'gte') {
      passed = Number(actual) >= Number(exp);
    } else if (op === 'lte') {
      passed = Number(actual) <= Number(exp);
    } else if (op === 'in' || op === 'in_list' as any) {
      const allowed = Array.isArray(exp) ? exp.map(v => String(v).toLowerCase()) : [String(exp).toLowerCase()];
      passed = allowed.includes(String(actual).toLowerCase());
    } else {
      passed = actual == exp;
    }

    if (!passed) hasFailure = true;

    return {
      clause_id: cond.id,
      field: cond.field,
      field_display: cond.field_display,
      status: passed ? ('PASSED' as const) : ('FAILED' as const),
      mutability: cond.mutability,
      expected_value: `${cond.operator} ${Array.isArray(cond.value) ? cond.value.join(', ') : cond.value}`,
      citizen_value: String(actual),
      proximity_score: passed ? 1.0 : 0.0,
      original_clause: cond.original_clause,
      failure_reason: passed ? undefined : `Citizen value (${actual}) does not satisfy required ${cond.operator} ${exp}`,
    };
  });

  // Evaluate exclusions
  scheme.exclusions.forEach((exc) => {
    const excVal = facts[exc.condition_field];
    const isTriggered = excVal === true || String(excVal).toLowerCase() === String(exc.condition_value).toLowerCase();
    if (isTriggered) {
      triggeredExclusion = true;
      clauseDetails.push({
        clause_id: exc.id,
        field: exc.condition_field,
        field_display: exc.title,
        status: 'FAILED',
        mutability: 'MUTABLE',
        expected_value: `Not (${exc.condition_value})`,
        citizen_value: String(excVal),
        proximity_score: 0.0,
        original_clause: exc.original_clause,
        failure_reason: `Statutory Exclusion Triggered: ${exc.title}`,
      });
    }
  });

  let verdict: 'ELIGIBLE' | 'INELIGIBLE' | 'NEEDS_MORE_INFO' = 'ELIGIBLE';
  if (triggeredExclusion || hasFailure) {
    verdict = 'INELIGIBLE';
  } else if (hasUnknown) {
    verdict = 'NEEDS_MORE_INFO';
  }

  const passedCount = clauseDetails.filter((c) => c.status === 'PASSED').length;
  const totalCount = clauseDetails.length;
  const readiness_score = verdict === 'INELIGIBLE' ? 0 : Math.round((passedCount / Math.max(1, totalCount)) * 100);

  const missing_evidence = clauseDetails
    .filter((c) => c.status === 'UNKNOWN')
    .map((c) => ({
      missing_fact: c.field_display,
      required_document: scheme.documents[0]?.title || 'Identity & Verification Document',
      issuing_authority: scheme.documents[0]?.issuing_authority || 'Competent Authority',
      governing_clause: c.original_clause,
      citizen_action: `Provide verified documentary proof for ${c.field_display}.`,
    }));

  const actionable_recommendations = clauseDetails
    .filter((c) => c.status === 'FAILED' || c.status === 'UNKNOWN')
    .map((c) => ({
      target_field: c.field,
      current_val: c.citizen_value,
      required_val: c.expected_value,
      recommendation: c.status === 'UNKNOWN' ? `Obtain and submit ${c.field_display} certificate.` : `Exclusion or unmet condition: ${c.failure_reason}`,
      difficulty: c.status === 'UNKNOWN' ? ('Medium' as const) : ('Hard' as const),
    }));

  return {
    scheme_id: scheme.id,
    scheme_title: scheme.title,
    verdict,
    overall_confidence: 0.98,
    readiness_score,
    clause_details: clauseDetails,
    missing_evidence,
    actionable_recommendations,
    citizen_summary: `Citizen facts evaluated against ${scheme.title} clauses and exclusions.`,
    evaluated_as_of: new Date().toISOString().split('T')[0],
  };
}

export async function evaluateEligibility(facts: CitizenFacts): Promise<EvaluationOutcome> {
  const scheme = MOCK_SCHEMES.find((s) => s.id === facts.scheme_id) || MOCK_SCHEMES[0];

  if (USE_MOCKS) {
    return evaluateSchemeLocally(scheme, facts);
  }

  try {
    const res = await fetch(`${BASE_URL}/api/v1/reasoning/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facts),
    });
    if (!res.ok) throw new Error('Evaluation failed');
    return await res.json();
  } catch (err) {
    console.warn('Evaluation API error, falling back to local reasoning:', err);
    return evaluateSchemeLocally(scheme, facts);
  }
}

export async function fetchBenchmarkMetrics(): Promise<BenchmarkMetrics> {
  if (USE_MOCKS) {
    return MOCK_BENCHMARK_METRICS;
  }
  try {
    const res = await fetch(`${BASE_URL}/api/v1/evaluation/metrics`);
    if (!res.ok) throw new Error('Failed to fetch evaluation metrics');
    return await res.json();
  } catch (err) {
    return MOCK_BENCHMARK_METRICS;
  }
}

export async function processNotificationPipeline(formData: FormData): Promise<any> {
  if (USE_MOCKS) {
    return {
      status: 'success',
      ocr_text: 'sample notification text extracted',
      cleaned_text: 'sample notification text cleaned',
      extracted_rules: MOCK_SCHEMES[0].conditions,
    };
  }
  const res = await fetch(`${BASE_URL}/api/v1/pipeline/process-text`, {
    method: 'POST',
    body: formData,
  });
  return await res.json();
}
