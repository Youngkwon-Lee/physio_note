'use client';

import { useState, use, useEffect } from 'react';
import { Assessment } from '@/types/assessment';
import { AssessmentSelector } from '@/components/AssessmentSelector';
import { AssessmentInput } from '@/components/AssessmentInput';
import { saveAssessmentResult } from '@/lib/assessments';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AssessmentPageProps {
  params: Promise<{
    id: string;  // 환자 ID
  }>;
}

export default function AssessmentPage({ params }: AssessmentPageProps) {
  const unwrappedParams = use(params);
  const patientId = unwrappedParams.id;
  
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [value, setValue] = useState<string | number>('');
  const [notes, setNotes] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 인증 상태 확인
  useEffect(() => {
    console.log('인증 상태:', { user: user?.uid, loading });
    if (!loading && !user) {
      console.log('인증되지 않은 사용자, 로그인 페이지로 리디렉션');
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // 로그인 페이지로 리디렉션 중이므로 아무것도 렌더링하지 않음
  }

  const handleSave = async () => {
    if (!selectedAssessment) return;

    try {
      setSaveLoading(true);
      setError(null);
      setSuccessMessage(null);

      await saveAssessmentResult({
        assessment_id: selectedAssessment.id,
        patient_id: patientId,
        value,
        notes
      });

      setSuccessMessage('평가 결과가 저장되었습니다.');
      setValue('');
      setNotes('');
    } catch (err) {
      console.error('평가 결과 저장 실패:', err);
      setError('평가 결과를 저장하는데 실패했습니다.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">환자 평가</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 왼쪽: 평가 항목 선택 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">평가 항목 선택</h2>
          <AssessmentSelector
            onSelect={setSelectedAssessment}
            selectedId={selectedAssessment?.id}
          />
        </div>

        {/* 오른쪽: 평가 결과 입력 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">평가 결과 입력</h2>
          {selectedAssessment ? (
            <div className="space-y-4">
              <AssessmentInput
                assessment={selectedAssessment}
                value={value}
                onChange={setValue}
              />

              {/* 비고 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">비고</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="rounded-md border border-gray-300 p-2 w-full"
                  rows={3}
                  placeholder="추가 설명이나 특이사항을 입력하세요."
                />
              </div>

              {/* 저장 버튼 */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saveLoading || !value}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveLoading ? '저장 중...' : '저장'}
                </button>
              </div>

              {/* 메시지 표시 */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
                  {successMessage}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
              왼쪽에서 평가 항목을 선택해주세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 