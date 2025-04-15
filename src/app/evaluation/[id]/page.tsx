'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Evaluation, AssessmentResult } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import AssessmentChart from '@/components/AssessmentChart';

export default function EvaluationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedResults, setEditedResults] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadEvaluationData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 평가 데이터 로드
        const evaluationDoc = await getDoc(doc(db, 'evaluations', params.id));
        if (!evaluationDoc.exists()) {
          throw new Error('평가를 찾을 수 없습니다.');
        }

        const evaluationData = {
          id: evaluationDoc.id,
          ...evaluationDoc.data(),
          date: evaluationDoc.data().date.toDate(),
          createdAt: evaluationDoc.data().createdAt.toDate(),
          updatedAt: evaluationDoc.data().updatedAt.toDate(),
          nextEvaluationDate: evaluationDoc.data().nextEvaluationDate?.toDate(),
        } as Evaluation;

        setEvaluation(evaluationData);
        setEditedResults(evaluationData.results || {});

        // 평가 결과 데이터 로드
        const resultsQuery = query(
          collection(db, 'assessment_results'),
          where('evaluation_id', '==', params.id)
        );
        const resultsSnapshot = await getDocs(resultsQuery);
        const resultsData = resultsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as AssessmentResult[];

        setAssessmentResults(resultsData);
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadEvaluationData();
  }, [params.id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (!evaluation) return;

      await updateDoc(doc(db, 'evaluations', evaluation.id), {
        results: editedResults,
        updatedAt: new Date(),
      });

      setEvaluation(prev => prev ? { ...prev, results: editedResults } : null);
      setIsEditing(false);
    } catch (err) {
      console.error('저장 실패:', err);
      setError('저장 중 오류가 발생했습니다.');
    }
  };

  const handleCancel = () => {
    setEditedResults(evaluation?.results || {});
    setIsEditing(false);
  };

  const handleResultChange = (key: string, value: string | number) => {
    setEditedResults(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => router.refresh()} />;
  }

  if (!evaluation) {
    return <ErrorMessage message="평가를 찾을 수 없습니다." onRetry={() => router.refresh()} />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* 평가 정보 요약 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">
            {evaluation.type === 'initial' ? '초기' : 
             evaluation.type === 'progress' ? '진행' : '종료'} 평가
          </h2>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                수정
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  저장
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  취소
                </button>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">평가 날짜</p>
            <p className="font-medium">{evaluation.date.toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">평가 상태</p>
            <p className="font-medium">
              {evaluation.status === 'completed' ? '완료' : '진행중'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">다음 평가 예정일</p>
            <p className="font-medium">
              {evaluation.nextEvaluationDate
                ? evaluation.nextEvaluationDate.toLocaleDateString()
                : '미정'}
            </p>
          </div>
        </div>
      </div>

      {/* 평가 결과 차트 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">평가 결과 추이</h3>
        <AssessmentChart
          data={assessmentResults.reduce((acc, result) => {
            const date = new Date(result.date).toLocaleDateString();
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(result.value as number);
            return acc;
          }, {} as Record<string, number[]>)}
          selectedCategory="전체"
        />
      </div>

      {/* 평가 결과 상세 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">평가 결과 상세</h3>
        <div className="space-y-4">
          {Object.entries(isEditing ? editedResults : evaluation.results || {}).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{key}</p>
                {isEditing ? (
                  <input
                    type="number"
                    value={value as number}
                    onChange={(e) => handleResultChange(key, parseFloat(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-600">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 