import { useState, useEffect } from 'react';
import { Assessment } from '@/types/assessment';
import { Diagnosis } from '@/types/diagnosis';
import { getRecommendedAssessments } from '@/lib/assessments';

interface AssessmentRecommendationProps {
  diagnosis: Diagnosis;
  onSelectAssessment: (assessment: Assessment) => void;
}

export default function AssessmentRecommendation({ diagnosis, onSelectAssessment }: AssessmentRecommendationProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecommendedAssessments() {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getRecommendedAssessments(diagnosis.id);
        setAssessments(data);
      } catch (err) {
        console.error('추천 평가 항목 로드 실패:', err);
        setError('추천 평가 항목을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }

    if (diagnosis?.id) {
      loadRecommendedAssessments();
    }
  }, [diagnosis]);

  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-gray-500">추천 평가 항목을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!assessments || assessments.length === 0) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-yellow-700">
          &ldquo;{diagnosis.name}&rdquo;에 대한 추천 평가 항목이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h3 className="font-medium text-blue-800">&ldquo;{diagnosis.name}&rdquo;에 대한 추천 평가 항목</h3>
        <p className="text-sm text-blue-600 mt-1">
          선택한 진단에 따라 추천되는 평가 항목입니다. 필요에 따라 항목을 추가하거나 제외할 수 있습니다.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {assessments.map(assessment => (
          <button
            key={assessment.id}
            onClick={() => onSelectAssessment(assessment)}
            className="text-left p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{assessment.name}</h4>
                {assessment.name_en && (
                  <p className="text-sm text-gray-500">{assessment.name_en}</p>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                assessment.category === 'ROM' 
                  ? 'bg-green-100 text-green-800'
                  : assessment.category === 'MMT'
                    ? 'bg-blue-100 text-blue-800'
                    : assessment.category === 'SpecialTest'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
              }`}>
                {assessment.category}
              </span>
            </div>
            
            {assessment.description && (
              <p className="text-sm text-gray-600 mt-1">{assessment.description}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
} 