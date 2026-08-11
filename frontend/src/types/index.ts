// ─── Pet Types ────────────────────────────────────────────────────────────────

export interface Pet {
  id: string;
  pet_name: string;
  pet_type: string;
  age?: number;
  gender?: string;
  created_at?: string;
}

export interface PetCreate {
  pet_name: string;
  pet_type: string;
  age?: number;
  gender?: string;
}

// ─── Scan Types ───────────────────────────────────────────────────────────────

export interface BoundingBox {
  label: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
}

export interface QAResult {
  is_valid_pet: boolean;
  detected_pet: string;
  is_healthy: boolean;
  suspected_condition: string;
}

export interface ScanAnalysis {
  qa: QAResult;
  bboxes: BoundingBox[];
}

export interface PetScan {
  id: string;
  is_valid_pet: boolean;
  is_healthy: boolean;
  result: ScanAnalysis;
  created_at: string;
}

export interface ScanUploadResponse {
  scan_id: string;
  is_valid_pet: boolean;
  is_healthy: boolean;
  analysis: ScanAnalysis;
  message: string;
}

// ─── Diagnosis Types ──────────────────────────────────────────────────────────

export interface FullDiagnosis {
  disease_overview: string;
  common_symptoms: string[];
  general_treatment: string[];
  home_care_tips: string[];
  when_to_visit_vet: string[];
  disclaimer: string;
}

export interface DiagnosisResponse {
  pet_name: string;
  disease_name: string;
  summary: {
    scan_id: string;
    is_healthy: boolean;
    severity: string | null;
  };
  kb: {
    treatment: string;
  };
  full_diagnosis: FullDiagnosis;
  ai_status: string;
}

// ─── Stats Types ──────────────────────────────────────────────────────────────

export interface ScanStats {
  total_scans: number;
  healthy: number;
  unhealthy: number;
}

export interface DiseaseStatItem {
  disease_name: string;
  count: number;
}

// ─── Knowledge Base Types ─────────────────────────────────────────────────────

export interface KBEntry {
  id: number;
  pet_name: string;
  disease_name: string;
  treatment: string;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface AuthUser {
  email: string;
  name: string;
  avatar?: string;
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

export type ScanStep = 
  | 'idle'
  | 'uploading'
  | 'analyzing'
  | 'detecting'
  | 'diagnosing'
  | 'complete'
  | 'error';

export type Severity = 'healthy' | 'mild' | 'moderate' | 'severe' | 'unknown';
