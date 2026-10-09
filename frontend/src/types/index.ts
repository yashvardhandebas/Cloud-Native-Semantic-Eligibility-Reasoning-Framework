export type ClauseStatus = 'PASSED' | 'FAILED' | 'UNKNOWN';
export type VerdictType = 'ELIGIBLE' | 'INELIGIBLE' | 'NEEDS_MORE_INFO';
export type MutabilityType = 'IMMUTABLE' | 'MUTABLE';

export interface ConditionRule {
  id: string;
  field: string;
  field_display: string;
  operator: 'gte' | 'lte' | 'eq' | 'neq' | 'in' | 'notin';
  value: string | number | boolean | string[];
  unit?: string;
  original_clause: string;
  mutability: MutabilityType;
  confidence: number;
  language: string;
  is_current: boolean;
  valid_from: string;
  valid_to?: string | null;
}

export interface SchemeDocument {
  id: string;
  title: string;
  required_for_fields: string[];
  issuing_authority: string;
}

export interface SchemeBenefit {
  id: string;
  title: string;
  amount?: string;
  frequency?: string;
  description: string;
}

export interface SchemeExclusion {
  id: string;
  title: string;
  condition_field: string;
  condition_value: string;
  original_clause: string;
  overrides_all: boolean;
}

export interface Scheme {
  id: string;
  title: string;
  category: 'Education' | 'Agriculture' | 'Health' | 'Housing' | 'Pension' | 'Women & Child';
  state: string;
  language: string;
  version: string;
  last_amended: string;
  summary: string;
  conditions: ConditionRule[];
  documents: SchemeDocument[];
  benefits: SchemeBenefit[];
  exclusions: SchemeExclusion[];
}

export interface CitizenFacts {
  scheme_id: string;
  caste_category?: string | null;
  education_level?: string | null;
  income_threshold?: number | null;
  land_ownership_ha?: number | null;
  age_min?: number | null;
  income_tax_payer_status?: boolean | null;
  institutional_landholder?: boolean | null;
  constitutional_post_holder?: boolean | null;
  government_employee?: boolean | null;
  [key: string]: any;
}

export interface ClauseEvaluationDetail {
  clause_id: string;
  field: string;
  field_display: string;
  status: ClauseStatus;
  mutability: MutabilityType;
  expected_value: string;
  citizen_value: string;
  proximity_score: number; // 0.0 to 1.0
  original_clause: string;
  failure_reason?: string;
}

export interface MissingEvidenceItem {
  missing_fact: string;
  required_document: string;
  issuing_authority: string;
  governing_clause: string;
  citizen_action: string;
}

export interface RecommendationItem {
  target_field: string;
  current_val: string;
  required_val: string;
  recommendation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface EvaluationOutcome {
  scheme_id: string;
  scheme_title: string;
  verdict: VerdictType;
  overall_confidence: number;
  readiness_score: number; // 0 to 100
  clause_details: ClauseEvaluationDetail[];
  missing_evidence: MissingEvidenceItem[];
  actionable_recommendations: RecommendationItem[];
  citizen_summary: string;
  evaluated_as_of: string;
}

export interface BenchmarkMetrics {
  evaluation_mode: string;
  hand_derived_verdict_accuracy: number;
  confusion_matrix: {
    eligible: { eligible: number; ineligible: number; needs_more_info: number };
    ineligible: { eligible: number; ineligible: number; needs_more_info: number };
    needs_more_info: { eligible: number; ineligible: number; needs_more_info: number };
  };
  multilingual_extraction: {
    precision: number;
    recall: number;
    per_language: Record<string, { precision: number; recall: number }>;
  };
  timing_benchmark: {
    in_memory: { full_ms: number; incremental_ms: number; speedup: number };
    live_neo4j: { full_ms: number; incremental_ms: number; speedup: number; status: string };
  };
}
