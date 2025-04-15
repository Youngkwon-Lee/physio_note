'use client';

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { RecommendedAssessment } from "@/lib/recommended-assessments"
import { saveAssessmentResult } from "@/lib/assessments"
import { useToast } from "./ui/use-toast"

interface AssessmentFormProps {
  assessment: RecommendedAssessment
  patientId: string
  sessionId: string
  evaluatorId: string
  onSuccess?: () => void
  className?: string
}

export function AssessmentForm({
  assessment,
  patientId,
  sessionId,
  evaluatorId,
  onSuccess,
  className
}: AssessmentFormProps) {
  const [value, setValue] = React.useState<string>("")
  const [notes, setNotes] = React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isStarted, setIsStarted] = React.useState(false)
  const { toast } = useToast()

  const handleStart = () => {
    setIsStarted(true)
    toast({
      title: "평가 시작",
      description: `${assessment.name} 평가를 시작합니다.`
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await saveAssessmentResult({
        assessment_id: assessment.id,
        patientId: patientId,
        sessionId: sessionId,
        evaluatorId: evaluatorId,
        value: assessment.category === "통증" ? Number(value) : value,
        notes: notes.trim() || undefined,
        date: new Date()
      })

      toast({
        title: "성공",
        description: "평가 결과가 저장되었습니다."
      })

      setValue("")
      setNotes("")
      setIsStarted(false)
      onSuccess?.()
    } catch (error) {
      toast({
        title: "오류",
        description: "평가 결과 저장에 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{assessment.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {!isStarted ? (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-center text-muted-foreground">
              {assessment.description}
            </p>
            {assessment.contraindications && (
              <div className="w-full p-4 bg-yellow-50 rounded-md">
                <h4 className="font-medium text-yellow-800">주의사항</h4>
                <p className="text-sm text-yellow-700">{assessment.contraindications}</p>
              </div>
            )}
            <Button onClick={handleStart} className="w-full">
              평가 시작하기
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="value">측정값</Label>
              <Input
                id="value"
                type={assessment.category === "통증" ? "number" : "text"}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">비고</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                placeholder="특이사항이나 추가 설명을 입력하세요"
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsStarted(false)}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "저장 중..." : "저장"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
} 