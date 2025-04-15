import { AssessmentCategory } from "@/types"

export interface RecommendedAssessment {
  id: string
  name: string
  category: string
  description?: string
  priority: number
  contraindications?: string[]
}

interface DiagnosisAssessmentMap {
  [diagnosis: string]: RecommendedAssessment[]
}

// 진단별 추천 평가 항목 매핑
export const diagnosisAssessmentMap: DiagnosisAssessmentMap = {
  "어깨 충돌 증후군": [
    {
      id: "shoulder_rom",
      name: "어깨 관절 가동범위",
      category: "ROM",
      description: "전체 어깨 관절의 가동범위 측정",
      priority: 5,
      rationale: "어깨 충돌 증후군의 주요 진단 기준",
      contraindications: ["급성 염증", "심한 통증"]
    },
    {
      id: "neer_test",
      name: "니어 테스트",
      category: "특수검사",
      description: "어깨 충돌 증후군 진단을 위한 특수검사",
      priority: 5,
      rationale: "어깨 충돌 증후군의 특이도가 높은 검사"
    },
    {
      id: "hawkins_test",
      name: "호킨스 테스트",
      category: "특수검사",
      description: "어깨 충돌 증후군 진단을 위한 특수검사",
      priority: 4,
      rationale: "어깨 충돌 증후군의 민감도가 높은 검사"
    },
    {
      id: "rotator_cuff_strength",
      name: "회전근개 근력",
      category: "근력",
      description: "회전근개 근력 측정",
      priority: 4,
      rationale: "회전근개 약화는 어깨 충돌의 주요 원인"
    },
    {
      id: "pain_scale",
      name: "통증 척도",
      category: "통증",
      description: "VAS 통증 척도 측정",
      priority: 3,
      rationale: "치료 효과 평가를 위한 기준"
    }
  ],
  "요통": [
    {
      id: "lumbar_rom",
      name: "요추 가동범위",
      category: "ROM",
      description: "요추 전후굴곡, 측면굴곡, 회전 측정",
      priority: 5,
      rationale: "요통의 기능적 제한 평가"
    },
    {
      id: "slr_test",
      name: "직각거상 검사",
      category: "특수검사",
      description: "신경근 증상 평가",
      priority: 4,
      rationale: "요추 추간판 탈출증 진단에 유용"
    },
    {
      id: "core_strength",
      name: "코어 근력",
      category: "근력",
      description: "복부 및 등 근력 측정",
      priority: 4,
      rationale: "요통의 주요 원인 중 하나"
    },
    {
      id: "pain_scale",
      name: "통증 척도",
      category: "통증",
      description: "VAS 통증 척도 측정",
      priority: 3,
      rationale: "치료 효과 평가를 위한 기준"
    }
  ]
}

// 진단에 따른 추천 평가 항목 조회 함수
export async function getRecommendedAssessments(diagnosisId: string): Promise<RecommendedAssessment[]> {
  // TODO: Firestore에서 진단 ID에 따른 추천 평가 항목 조회
  return []
}

// 우선순위에 따른 평가 항목 정렬 함수
export function sortByPriority(assessments: RecommendedAssessment[]): RecommendedAssessment[] {
  return [...assessments].sort((a, b) => b.priority - a.priority)
}

// 카테고리별 평가 항목 필터링 함수
export function filterByCategory(
  assessments: RecommendedAssessment[],
  category: AssessmentCategory
): RecommendedAssessment[] {
  return assessments.filter(assessment => assessment.category === category)
} 