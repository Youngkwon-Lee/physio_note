import { useState, useEffect } from 'react';
import { Assessment, AssessmentSession as AssessmentSessionType } from '@/types';
import { saveAssessmentResult } from '@/lib/assessments';
import { AssessmentForm } from './AssessmentForm';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RecommendedAssessment } from '@/lib/recommended-assessments';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface AssessmentSessionProps {
  patientId: string;
  selectedAssessments: Assessment[];
  onComplete: () => void;
}

const convertToRecommendedAssessment = (assessment: Assessment): RecommendedAssessment => {
  return {
    id: assessment.id,
    name: assessment.name,
    category: assessment.category,
    description: assessment.description,
    priority: 1,
    contraindications: undefined
  };
};

export default function AssessmentSession({
  patientId,
  selectedAssessments,
  onComplete
}: AssessmentSessionProps) {
  const [sessionId, setSessionId] = useState<string>('');
  const [currentAssessmentIndex, setCurrentAssessmentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // 평가 시작 가능 여부 확인
  const canStartAssessment = () => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return false;
    }
    if (!patientId) {
      setError('환자 정보가 필요합니다.');
      return false;
    }
    if (selectedAssessments.length === 0) {
      setError('평가 항목을 선택해주세요.');
      return false;
    }
    return true;
  };

  const startAssessment = async () => {
    if (!canStartAssessment()) return;

    setIsLoading(true);
    setError(null);

    try {
      const sessionRef = await addDoc(collection(db, 'assessment_sessions'), {
        patientId,
        evaluatorId: user?.uid,
        date: serverTimestamp(),
        status: 'pending',
        assessments: selectedAssessments.map(a => a.id),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setSessionId(sessionRef.id);
      setIsSessionStarted(true);
    } catch (error) {
      console.error('세션 생성 실패:', error);
      setError('평가 세션을 시작할 수 없습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssessmentComplete = () => {
    if (currentAssessmentIndex < selectedAssessments.length - 1) {
      setCurrentAssessmentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  if (!user) {
    return (
      <Alert>
        <AlertDescription>평가를 시작하려면 로그인이 필요합니다.</AlertDescription>
      </Alert>
    );
  }

  if (!isSessionStarted) {
    return (
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">평가 준비 완료</h2>
          <p className="text-gray-500">
            선택된 평가 항목: {selectedAssessments.length}개
          </p>
        </div>
        <Button
          onClick={startAssessment}
          disabled={isLoading || !canStartAssessment()}
          className="w-full"
        >
          {isLoading ? '준비 중...' : '평가 시작하기'}
        </Button>
      </div>
    );
  }

  if (!sessionId) {
    return <LoadingSpinner />;
  }

  const currentAssessment = selectedAssessments[currentAssessmentIndex];
  const recommendedAssessment = convertToRecommendedAssessment(currentAssessment);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          평가 진행 중 ({currentAssessmentIndex + 1}/{selectedAssessments.length})
        </h2>
        <span className="text-sm text-gray-500">
          {currentAssessment.name}
        </span>
      </div>

      <AssessmentForm
        assessment={recommendedAssessment}
        patientId={patientId}
        sessionId={sessionId}
        evaluatorId={user.uid}
        onSuccess={handleAssessmentComplete}
      />
    </div>
  );
} 