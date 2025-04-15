import { AssessmentCategory, AssessmentType, AssessmentUnit } from './assessment';
import { Timestamp } from 'firebase/firestore';

export * from './assessment';

export interface Patient {
  id: string;
  userId: string;
  therapistId: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string;
  phoneNumber: string;
  address?: string;
  medicalHistory?: string;
  medications?: string;
  allergies?: string;
  notes?: string;
  diagnosisId?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Evaluation {
  id: string;
  patientId: string;
  evaluatorId: string;
  evaluatorName: string;
  date: Timestamp;
  type: 'initial' | 'progress' | 'final';
  status: 'pending' | 'completed';
  results: Record<string, any>;
  nextEvaluationDate?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface EvaluationTemplate {
  id: string;
  name: string;
  description?: string;
  fields: Record<string, {
    type: 'text' | 'number' | 'select' | 'checkbox';
    label: string;
    required: boolean;
    options?: string[];
  }>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Assessment {
  id: string;
  name: string;
  name_en?: string;
  category: AssessmentCategory;
  type: AssessmentType;
  description?: string;
  minValue?: number;
  maxValue?: number;
  unit?: AssessmentUnit;
  normal_range?: {
    min: number;
    max: number;
  };
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface AssessmentResult {
  id: string;
  assessment_id: string;
  patientId: string;
  evaluatorId: string;
  sessionId: string;
  value: string | number;
  date: Timestamp;
  notes?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Diagnosis {
  id: string;
  code?: string;
  name: string;
  description?: string;
  category?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface AssessmentChartProps {
  data: Record<string, number[]>;
  selectedCategory?: string;
}

export interface SoapGeneratorProps {
  patient: Patient;
  onSave: (soapNote: string) => Promise<void>;
  assessments?: Assessment[];
  results?: AssessmentResult[];
}

export interface Goal {
  id: string;
  description: string;
  targetDate: Timestamp;
  status: 'ongoing' | 'achieved' | 'not_achieved';
}

export interface Intervention {
  id: string;
  name: string;
  description: string;
  frequency: string;
  duration: string;
}

export interface AssessmentSession {
  id: string;
  patientId: string;
  evaluatorId: string;
  date: Timestamp;
  status: 'pending' | 'completed';
  assessments: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AssessmentGroup {
  id: string;
  name: string;
  description?: string;
  items: Assessment[];
}

export type UserRole = 'patient' | 'therapist';

export type AssessmentCategory =
  | "ROM"
  | "근력"
  | "통증"
  | "균형"
  | "ADL"
  | "특수검사"
  | "심폐"
  | "인지"
  | "감각"
  | "기타" 