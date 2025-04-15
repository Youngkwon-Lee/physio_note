import { Timestamp } from 'firebase/firestore';

// 진단 분류 카테고리
export type DiagnosisCategory = 'MSD' | 'Neuro' | 'Cardio' | 'Geriatric' | 'Sports';

// MSD 하위 카테고리
export type MSDSubCategory = 
  | 'Cervical'
  | 'Thoracic'
  | 'Lumbar'
  | 'Shoulder'
  | 'Elbow'
  | 'Wrist_Hand'
  | 'Hip'
  | 'Knee'
  | 'Ankle_Foot';

// ICF 코드 구조
export interface ICFCodes {
  body_function: string[];    // b codes
  body_structure: string[];   // s codes
  activity: string[];         // d codes
}

// 진단 정보 인터페이스
export interface Diagnosis {
  id: string;
  name: string;
  name_en?: string;
  category: DiagnosisCategory;
  subCategory?: MSDSubCategory;
  description?: string;
  ICF_codes: ICFCodes;
  recommended_assessments: string[];
  red_flags?: string[];
  yellow_flags?: string[];
  evidence_level?: 'A' | 'B' | 'C';
  references?: string[];
  created_at: Date;
  updated_at: Date;
}

// 진단 검색 필터
export interface DiagnosisFilter {
  category?: DiagnosisCategory;
  subCategory?: MSDSubCategory;
  searchTerm?: string;
  evidence_level?: 'A' | 'B' | 'C';
}

// Firestore 문서 형식
export type DiagnosisDocument = Omit<Diagnosis, 'created_at' | 'updated_at'> & {
  created_at: Timestamp;
  updated_at: Timestamp;
}; 