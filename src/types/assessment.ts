import { Timestamp } from 'firebase/firestore';

// 평가 항목 카테고리
export type AssessmentCategory = 
  | 'ROM'           // 관절가동범위
  | 'MMT'           // 근력
  | 'SpecialTest'   // 특수검사
  | 'Functional'    // 기능적 평가
  | 'Pain'          // 통증
  | 'Posture'       // 자세
  | 'Balance'       // 균형
  | 'Gait'          // 보행
  | 'Other';        // 기타

// 평가 항목 타입
export type AssessmentType = 
  | 'Range'         // 범위 (예: ROM)
  | 'Grade'         // 등급 (예: MMT)
  | 'Binary'        // 이진 (예: 특수검사)
  | 'Score'         // 점수 (예: 기능적 평가)
  | 'VAS'           // 시각적 상사척도
  | 'Text';         // 텍스트

// 평가 항목 단위
export type AssessmentUnit = 
  | 'degree'        // 도
  | 'cm'            // 센티미터
  | 'kg'            // 킬로그램
  | 'sec'           // 초
  | 'count'         // 횟수
  | 'score'         // 점수
  | 'none';         // 단위 없음

// 평가 항목 인터페이스
export interface Assessment {
  id: string;
  name: string;           // 평가 항목명
  name_en?: string;       // 영문명
  category: AssessmentCategory;  // 카테고리
  type: AssessmentType;   // 평가 타입
  unit?: AssessmentUnit;  // 단위
  description?: string;   // 설명
  normal_range?: {        // 정상 범위
    min: number;
    max: number;
  };
  scoring_criteria?: {    // 채점 기준
    [key: string]: number;
  };
  instructions?: string[]; // 검사 방법
  references?: string[];  // 참고문헌
  created_at: Timestamp;
  updated_at: Timestamp;
}

// 평가 결과 인터페이스
export interface AssessmentResult {
  id: string;
  assessment_id: string;
  sessionId: string;
  patientId: string;
  evaluatorId: string;
  value: string | number;
  notes?: string;
  date: Date;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// 평가 항목 필터 인터페이스
export interface AssessmentFilter {
  category?: AssessmentCategory;
  type?: AssessmentType;
  searchTerm?: string;
}

// Firestore 문서 형식
export type AssessmentDocument = Omit<Assessment, 'created_at' | 'updated_at'> & {
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type AssessmentResultDocument = Omit<AssessmentResult, 'created_at' | 'updated_at'> & {
  created_at: Timestamp;
  updated_at: Timestamp;
};

// 평가 항목 그룹 인터페이스
export interface AssessmentGroup {
  id: string;
  name: string;
  items: Assessment[];
}

export const ASSESSMENT_GROUPS: AssessmentGroup[] = [
  {
    id: 'range_of_motion',
    name: '관절 가동범위',
    items: [
      {
        id: 'shoulder_flexion',
        name: '어깨 굴곡',
        name_en: 'Shoulder Flexion',
        category: 'ROM',
        type: 'Range',
        unit: 'degree',
        description: '어깨를 앞으로 들어올리는 각도를 측정합니다.',
        normal_range: {
          min: 0,
          max: 180
        },
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      },
      {
        id: 'shoulder_extension',
        name: '어깨 신전',
        name_en: 'Shoulder Extension',
        category: 'ROM',
        type: 'Range',
        unit: 'degree',
        description: '어깨를 뒤로 젖히는 각도를 측정합니다.',
        normal_range: {
          min: 0,
          max: 60
        },
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      }
    ]
  },
  {
    id: 'muscle_strength',
    name: '근력',
    items: [
      {
        id: 'shoulder_abduction_strength',
        name: '어깨 외전 근력',
        name_en: 'Shoulder Abduction Strength',
        category: 'MMT',
        type: 'Grade',
        description: '어깨를 옆으로 들어올리는 근력을 평가합니다.',
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      },
      {
        id: 'elbow_flexion_strength',
        name: '팔꿈치 굴곡 근력',
        name_en: 'Elbow Flexion Strength',
        category: 'MMT',
        type: 'Grade',
        description: '팔꿈치를 구부리는 근력을 평가합니다.',
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      }
    ]
  },
  {
    id: 'special_tests',
    name: '특수검사',
    items: [
      {
        id: 'spurling-test',
        name: '스펄링 검사',
        name_en: 'Spurling Test',
        category: 'SpecialTest',
        type: 'Binary',
        description: '경추 신경근병증을 평가하는 검사입니다.',
        instructions: [
          '환자를 앉은 자세로 유지합니다.',
          '경추를 신전하고 환측으로 회전 및 측방 굴곡시킵니다.',
          '머리 위에서 아래로 압박을 가합니다.',
          '상지로의 방사통이 재현되면 양성입니다.'
        ],
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      },
      {
        id: 'neer-test',
        name: '니어 충돌 검사',
        name_en: 'Neer Impingement Test',
        category: 'SpecialTest',
        type: 'Binary',
        description: '어깨 충돌증후군을 평가하는 검사입니다.',
        instructions: [
          '환자를 앉은 자세로 유지합니다.',
          '검사자는 한 손으로 견갑골을 고정하고 다른 손으로 환자의 팔을 수동적으로 굴곡시킵니다.',
          '통증이 발생하면 양성입니다.'
        ],
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      },
      {
        id: 'slr-test',
        name: '하지직거상 검사',
        name_en: 'Straight Leg Raise Test',
        category: 'SpecialTest',
        type: 'Binary',
        description: '요추 신경근병증을 평가하는 검사입니다.',
        instructions: [
          '환자를 바로 누운 자세로 유지합니다.',
          '환자의 다리를 펴서 들어올립니다.',
          '30-70도 사이에서 하지로의 방사통이 발생하면 양성입니다.'
        ],
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      }
    ]
  }
]; 