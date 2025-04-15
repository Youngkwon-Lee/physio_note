'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Assessment, Evaluation } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EvaluationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('모든 카테고리');
  const [evaluationStarted, setEvaluationStarted] = useState(false);
  const [selectedAssessments, setSelectedAssessments] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadAssessments = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const assessmentsQuery = query(collection(db, 'assessments'));
        const snapshot = await getDocs(assessmentsQuery);
        const assessmentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Assessment[];
        setAssessments(assessmentsData);
      } catch (err) {
        console.error('평가 항목 로드 실패:', err);
        setError('평가 항목을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadAssessments();
  }, [user]);

  const handleStartEvaluation = () => {
    setEvaluationStarted(true);
  };

  const handleAssessmentChange = (assessmentId: string, value: number) => {
    setSelectedAssessments(prev => ({
      ...prev,
      [assessmentId]: value
    }));
  };

  const handleSaveEvaluation = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // 새로운 평가 생성
      const newEvaluation: Partial<Evaluation> = {
        patientId: user.uid,
        evaluatorId: user.uid,
        evaluatorName: user.displayName || '',
        date: new Date(),
        type: 'initial',
        status: 'completed',
        results: selectedAssessments,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, 'evaluations'), newEvaluation);
      router.push('/patient-dashboard');
    } catch (err) {
      console.error('평가 저장 실패:', err);
      setError('평가를 저장하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => router.refresh()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!evaluationStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">환자 평가</h2>
          <p className="text-gray-600">
            아직 평가가 시작되지 않았습니다. 새로운 평가를 시작하시겠습니까?
          </p>
          <button
            onClick={handleStartEvaluation}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            평가 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">환자 평가</h2>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="모든 카테고리">모든 카테고리</option>
          <option value="이동능력">이동능력</option>
          <option value="ADL">ADL</option>
          <option value="균형">균형</option>
          <option value="근력">근력</option>
          <option value="ROM">ROM</option>
        </select>
      </div>

      <div className="grid gap-4">
        {assessments
          .filter(assessment => 
            selectedCategory === '모든 카테고리' || 
            assessment.category === selectedCategory
          )
          .map(assessment => (
            <div key={assessment.id} className="p-4 border rounded-lg bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{assessment.name}</h3>
                  {assessment.description && (
                    <p className="text-sm text-gray-600">{assessment.description}</p>
                  )}
                </div>
                <input
                  type="number"
                  min={assessment.minValue || 0}
                  max={assessment.maxValue || 100}
                  value={selectedAssessments[assessment.id] || ''}
                  onChange={(e) => handleAssessmentChange(assessment.id, parseFloat(e.target.value))}
                  className="w-24 px-3 py-2 border rounded"
                />
              </div>
              {assessment.normal_range && (
                <p className="text-sm text-gray-500 mt-2">
                  정상 범위: {assessment.normal_range.min} - {assessment.normal_range.max}
                  {assessment.unit && ` ${assessment.unit}`}
                </p>
              )}
            </div>
          ))}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          취소
        </button>
        <button
          onClick={handleSaveEvaluation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          평가 저장
        </button>
      </div>
    </div>
  );
} 