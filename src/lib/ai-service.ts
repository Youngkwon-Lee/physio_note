import { AssessmentResult, Evaluation } from "@/types"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})

interface AIAnalysisResult {
  diagnosis: string
  confidence: number
  recommendations: string[]
  riskFactors: string[]
  treatmentPlan: string[]
}

export async function analyzePatientData(
  evaluations: Evaluation[],
  assessmentResults: AssessmentResult[]
): Promise<AIAnalysisResult> {
  try {
    // 평가 데이터를 텍스트로 변환
    const evaluationText = evaluations
      .map((evaluation) => {
        return `평가일: ${evaluation.date.toLocaleDateString()}
평가 유형: ${evaluation.type}
평가자: ${evaluation.evaluatorName}
상태: ${evaluation.status}
`
      })
      .join("\n")

    const assessmentText = assessmentResults
      .map((result) => {
        return `평가 항목: ${result.assessment_id}
값: ${result.value}
단위: ${result.unit}
`
      })
      .join("\n")

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `당신은 물리치료 전문가입니다. 환자의 평가 데이터를 분석하여 진단, 위험 요인, 치료 계획, 추천 사항을 제공해야 합니다.
응답은 다음 형식의 JSON으로 해야 합니다:
{
  "diagnosis": "진단명",
  "confidence": 0.0~1.0 사이의 신뢰도,
  "recommendations": ["추천사항1", "추천사항2", ...],
  "riskFactors": ["위험요인1", "위험요인2", ...],
  "treatmentPlan": ["치료계획1", "치료계획2", ...]
}`
        },
        {
          role: "user",
          content: `다음은 환자의 평가 데이터입니다:

평가 기록:
${evaluationText}

평가 결과:
${assessmentText}

위 데이터를 분석하여 진단, 위험 요인, 치료 계획, 추천 사항을 JSON 형식으로 제공해주세요.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    // API 응답을 파싱하여 결과 반환
    const response = completion.choices[0].message.content
    if (!response) {
      throw new Error("AI 응답이 비어있습니다.")
    }

    const result = JSON.parse(response)
    return {
      diagnosis: result.diagnosis,
      confidence: result.confidence,
      recommendations: result.recommendations,
      riskFactors: result.riskFactors,
      treatmentPlan: result.treatmentPlan,
    }
  } catch (error) {
    console.error("AI 분석 실패:", error)
    throw new Error("AI 분석 중 오류가 발생했습니다.")
  }
} 