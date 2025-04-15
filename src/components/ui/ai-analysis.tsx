import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Alert, AlertDescription, AlertTitle } from "./alert"
import { Badge } from "./badge"
import { Loader2 } from "lucide-react"

interface AIAnalysisProps {
  className?: string
  isLoading?: boolean
  error?: string
  analysis?: {
    diagnosis: string
    confidence: number
    recommendations: string[]
    riskFactors: string[]
    treatmentPlan: string[]
  }
}

export function AIAnalysis({ className, isLoading, error, analysis }: AIAnalysisProps) {
  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>AI 분석 중</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">AI가 데이터를 분석하고 있습니다...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>AI 분석 실패</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!analysis) {
    return null
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>AI 분석 결과</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">진단 결과</h3>
          <div className="flex items-center gap-2">
            <span>{analysis.diagnosis}</span>
            <Badge variant="outline">
              신뢰도: {(analysis.confidence * 100).toFixed(1)}%
            </Badge>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">위험 요인</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.riskFactors.map((factor, index) => (
              <Badge key={index} variant="destructive">
                {factor}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">치료 계획</h3>
          <ul className="list-disc pl-5 space-y-1">
            {analysis.treatmentPlan.map((plan, index) => (
              <li key={index}>{plan}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">추천 사항</h3>
          <ul className="list-disc pl-5 space-y-1">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 