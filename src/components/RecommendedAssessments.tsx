import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { getRecommendedAssessments, sortByPriority, filterByCategory } from "@/lib/recommended-assessments"
import { AssessmentCategory } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

interface RecommendedAssessmentsProps {
  diagnosis: string
  className?: string
}

const categories: AssessmentCategory[] = [
  "ROM",
  "근력",
  "통증",
  "균형",
  "ADL",
  "특수검사"
]

export function RecommendedAssessments({ diagnosis, className }: RecommendedAssessmentsProps) {
  const [activeCategory, setActiveCategory] = React.useState<AssessmentCategory>("ROM")
  
  const allAssessments = getRecommendedAssessments(diagnosis)
  const sortedAssessments = sortByPriority(allAssessments)
  const filteredAssessments = filterByCategory(sortedAssessments, activeCategory)

  if (allAssessments.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>추천 평가 항목</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">해당 진단에 대한 추천 평가 항목이 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>추천 평가 항목</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as AssessmentCategory)}>
          <TabsList className="grid grid-cols-3 gap-2">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="space-y-4">
                {filterByCategory(sortedAssessments, category).map((assessment) => (
                  <div key={assessment.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{assessment.name}</h3>
                      <Badge variant="outline">우선순위: {assessment.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {assessment.description}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">근거:</span> {assessment.rationale}
                    </p>
                    {assessment.contraindications && assessment.contraindications.length > 0 && (
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
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
} 