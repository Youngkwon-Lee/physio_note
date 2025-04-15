'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DiagnosisSelector from '@/components/DiagnosisSelector';
import AssessmentRecommendation from '@/components/AssessmentRecommendation';
import { Diagnosis, Assessment } from '@/types';
import { initializeAssessmentsData, getRecommendedAssessments, getDiagnosisById } from '@/lib/assessments';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AssessmentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null);
  const [recommendedAssessments, setRecommendedAssessments] = useState<Assessment[]>([]);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [step, setStep] = useState<'diagnosis' | 'assessment'>('diagnosis');
  const [isLoading, setIsLoading] = useState({
    diagnosis: false,
    assessments: false
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 초기 평가 항목 데이터 로드 (없는 경우 초기화)
    async function initializeData() {
      try {
        await initializeAssessmentsData();
      } catch (error) {
        console.error('평가 항목 초기화 오류:', error);
      }
    }
    
    initializeData();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadDiagnosis = async () => {
      if (!user) return;

      try {
        setIsLoading(prev => ({ ...prev, diagnosis: true }));
        // 사용자 정보에서 진단 ID 가져오기
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          throw new Error('사용자 정보를 찾을 수 없습니다.');
        }

        const userData = userDoc.data();
        if (!userData.diagnosisId) {
          setSelectedDiagnosis(null);
          return;
        }

        // 진단 정보 로드
        const diagnosisData = await getDiagnosisById(userData.diagnosisId);
        setSelectedDiagnosis(diagnosisData);
        
        if (diagnosisData?.id) {
          const recommended = await getRecommendedAssessments(diagnosisData.id);
          setRecommendedAssessments(recommended);
          // 추천 평가 항목 자동 선택
          setSelectedAssessments(recommended.map(a => a.id));
        }
      } catch (err) {
        console.error('진단 정보 로드 실패:', err);
        setError('진단 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(prev => ({ ...prev, diagnosis: false }));
      }
    };

    loadDiagnosis();
  }, [user]);

  const handleDiagnosisSelect = (diagnosis: Diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setStep('assessment');
  };

  const handleAssessmentToggle = (assessment: Assessment) => {
    setSelectedAssessments(prev => 
      prev.includes(assessment.id)
        ? prev.filter(id => id !== assessment.id)
        : [...prev, assessment.id]
    );
  };

  const handleStartAssessment = () => {
    if (selectedAssessments.length === 0) {
      toast.error('최소 1개 이상의 평가 항목을 선택해주세요.');
      return;
    }
    
    // 평가 세션 생성 및 이동 로직 구현
    toast.success('평가를 시작합니다.');
    // TODO: 선택된 진단 및 평가 항목을 세션에 저장하고 평가 페이지로 이동
  };

  const handleBack = () => {
    setStep('diagnosis');
  };

  if (isLoading.diagnosis) {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">환자 평가</h1>
        
        {/* 단계 표시 */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'diagnosis' ? 'bg-primary text-white' : 'bg-primary-200 text-primary-700'
            }`}>
              1
            </div>
            <div className={`h-1 flex-1 mx-2 ${
              step === 'diagnosis' ? 'bg-primary-200' : 'bg-primary'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'assessment' ? 'bg-primary text-white' : 'bg-primary-200 text-primary-700'
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm font-medium">진단 선택</span>
            <span className="text-sm font-medium">평가 항목 선택</span>
          </div>
        </div>
        
        {step === 'diagnosis' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">진단 선택</h2>
            <p className="mb-6 text-gray-600">
              환자의 진단명을 선택하세요. 선택한 진단에 따라 추천 평가 항목이 제공됩니다.
            </p>
            <DiagnosisSelector 
              onSelect={handleDiagnosisSelect} 
              selectedId={selectedDiagnosis?.id}
            />
          </div>
        )}
        
        {step === 'assessment' && selectedDiagnosis && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">평가 항목 선택</h2>
              <button 
                onClick={handleBack}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                진단 다시 선택
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium">선택된 진단</h3>
                <p className="text-lg font-semibold text-primary">{selectedDiagnosis.name}</p>
                {selectedDiagnosis.description && (
                  <p className="text-sm text-gray-600 mt-1">{selectedDiagnosis.description}</p>
                )}
              </div>
              
              {/* 추천 평가 항목 */}
              <AssessmentRecommendation 
                diagnosis={selectedDiagnosis}
                onSelectAssessment={handleAssessmentToggle}
              />
              
              {/* 선택된 평가 항목 표시 */}
              <div className="mt-8">
                <h3 className="font-medium mb-3">선택된 평가 항목 ({selectedAssessments.length})</h3>
                {selectedAssessments.length === 0 ? (
                  <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                    선택된 평가 항목이 없습니다. 위에서 평가 항목을 선택해주세요.
                  </p>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            항목명
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            카테고리
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            타입
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            작업
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recommendedAssessments.map(assessment => (
                          <tr key={assessment.id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{assessment.name}</div>
                              {assessment.name_en && (
                                <div className="text-xs text-gray-500">{assessment.name_en}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {assessment.type}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={selectedAssessments.includes(assessment.id)}
                                  onChange={() => handleAssessmentToggle(assessment)}
                                  className="h-5 w-5 text-blue-600"
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleStartAssessment}
                  disabled={selectedAssessments.length === 0}
                  className={`px-6 py-3 rounded-md font-medium text-white ${
                    selectedAssessments.length === 0 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-primary hover:bg-primary-dark'
                  }`}
                >
                  평가 시작하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 