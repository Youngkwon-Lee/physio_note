'use client';

import React, { useState, useMemo } from 'react';
import { Assessment, ASSESSMENT_GROUPS } from '@/types/assessment';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Checkbox } from "./ui/checkbox"
import { RecommendedAssessment } from "@/lib/recommended-assessments"
import { Badge } from "./ui/badge"

interface AssessmentSelectorProps {
  assessments: RecommendedAssessment[]
  selectedAssessments: string[]
  onSelectionChange: (selectedIds: string[]) => void
  className?: string
}

export function AssessmentSelector({
  assessments,
  selectedAssessments,
  onSelectionChange,
  className
}: AssessmentSelectorProps) {
  const handleAssessmentSelect = (assessmentId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedAssessments, assessmentId])
    } else {
      onSelectionChange(selectedAssessments.filter(id => id !== assessmentId))
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>평가 항목 선택</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="flex items-start space-x-4 p-4 border rounded-lg"
            >
              <Checkbox
                id={assessment.id}
                checked={selectedAssessments.includes(assessment.id)}
                onCheckedChange={(checked) => 
                  handleAssessmentSelect(assessment.id, checked as boolean)
                }
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={assessment.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {assessment.name}
                  </label>
                  <Badge variant="outline">
                    우선순위: {assessment.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {assessment.description}
                </p>
                {assessment.contraindications && 
                 assessment.contraindications.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-500">금기사항:</p>
                    <ul className="text-sm text-red-500 list-disc pl-4">
                      {assessment.contraindications.map((contraindication, index) => (
                        <li key={index}>{contraindication}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 