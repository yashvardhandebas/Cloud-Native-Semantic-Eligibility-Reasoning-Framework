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

export async function evaluateEligibility(facts: CitizenFacts): Promise<EvaluationOutcome> {
  if (USE_MOCKS) {
    // Determine which mock scenario to return based on income input
    if (facts.income_threshold === undefined || facts.income_threshold === null) {
      return MOCK_EVALUATION_SCENARIOS.needs_info;
    }
    if (typeof facts.income_threshold === 'number' && facts.income_threshold > 250000) {
      return MOCK_EVALUATION_SCENARIOS.ineligible;
    }
    return MOCK_EVALUATION_SCENARIOS.eligible;
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
    console.warn('Evaluation API error, falling back to mock result:', err);
    if (facts.income_threshold === undefined || facts.income_threshold === null) {
      return MOCK_EVALUATION_SCENARIOS.needs_info;
    }
    if (typeof facts.income_threshold === 'number' && facts.income_threshold > 250000) {
      return MOCK_EVALUATION_SCENARIOS.ineligible;
    }
    return MOCK_EVALUATION_SCENARIOS.eligible;
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
