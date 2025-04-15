'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Patient, Evaluation, EvaluationTemplate, Assessment, AssessmentResult, Diagnosis } from '@/types';
import { collection, getDocs, query, where, orderBy, limit, getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getPatientAssessmentResults, getPatientAssessmentTimeline } from '@/lib/assessments';
import AssessmentChart from '@/components/AssessmentChart';
import SoapGenerator from '@/components/SoapGenerator';
import { getDiagnosisById } from '@/lib/diagnoses';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { FirebaseError } from 'firebase/app';
import { Timestamp } from 'firebase/firestore';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<string>('이동능력');
  const [loading, setLoading] = useState({
    patients: true,
    evaluations: false,
    assessments: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [assessmentData, setAssessmentData] = useState<{
    assessments: Assessment[];
    results: AssessmentResult[];
  }>({ assessments: [], results: [] });
  const [timelineData, setTimelineData] = useState<{
    dates: string[];
    data: Record<string, number[]>;
    assessments: Assessment[];
  }>({ dates: [], data: {}, assessments: [] });
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null);
  
  const functionTabs = useMemo(() => [
    '이동능력', 'ADL', '균형', '근력', 'ROM', '인지', '통증', '심폐', '고유감각', '스포츠'
  ], []);

  // 데이터 로딩 함수
  const loadData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(prev => ({ ...prev, patients: true }));
      setError(null);

      // 권한 체크
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // 사용자 문서가 없으면 생성
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          createdAt: new Date(),
          updatedAt: new Date(),
          role: 'therapist',
        });
      }

      // 환자 데이터 로드
      const patientQuery = query(
        collection(db, 'patients'), 
        where('userId', '==', user.uid)
      );
      const patientsSnapshot = await getDocs(patientQuery);
      console.log('현재 사용자 ID:', user.uid);
      console.log('환자 데이터 쿼리 결과:', patientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
      if (!patientsSnapshot.empty) {
        const loadedPatients = patientsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            birthDate: data.birthDate instanceof Timestamp ? data.birthDate.toDate() : new Date(data.birthDate),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          };
        }) as Patient[];
        console.log('로드된 환자 데이터:', loadedPatients);
        setPatients(loadedPatients);
      
      // 첫 번째 환자 선택
        if (loadedPatients.length > 0 && !selectedPatient) {
          setSelectedPatient(loadedPatients[0]);
        }
      } else {
        console.log('환자 데이터가 없습니다.');
        setPatients([]);
      }

      // 평가 데이터 로드 (인덱스가 필요한 쿼리는 임시로 제거)
      const evaluationsQuery = query(
        collection(db, 'evaluations'),
        where('patientId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const evaluationsSnapshot = await getDocs(evaluationsQuery);
      if (!evaluationsSnapshot.empty) {
        const evaluationsData = evaluationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
          nextEvaluationDate: doc.data().nextEvaluationDate?.toDate(),
        })) as Evaluation[];
        setEvaluations(evaluationsData);
      }

      // 템플릿 데이터 로드
      const templatesQuery = query(collection(db, 'evaluationTemplates'));
      const templatesSnapshot = await getDocs(templatesQuery);
      if (!templatesSnapshot.empty) {
        const templatesData = templatesSnapshot.docs.map(doc => ({
        id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as EvaluationTemplate[];
        setTemplates(templatesData);
      }

    } catch (err) {
      console.error('데이터 로드 실패:', err);
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'permission-denied':
            setError('데이터 접근 권한이 없습니다. 관리자에게 문의하세요.');
            break;
          case 'failed-precondition':
            setError('필요한 인덱스가 아직 생성되지 않았습니다. 잠시 후 다시 시도해주세요.');
            break;
          case 'unavailable':
            setError('서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.');
            break;
          default:
            setError(`데이터를 불러오는 중 오류가 발생했습니다: ${err.message}`);
        }
      } else if (err instanceof Error) {
        setError(err.message || '알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(prev => ({ ...prev, patients: false }));
    }
  }, [user, selectedPatient]);

  // 환자 선택 핸들러
  const handlePatientSelect = useCallback(async (patient: Patient) => {
    setSelectedPatient(patient);
    setLoading(prev => ({ ...prev, evaluations: true }));

    try {
      // 환자 평가 데이터 가져오기
      const results = await getPatientAssessmentResults(patient.id);
      setAssessmentData(results);
      
      // 평가 시계열 데이터 가져오기
      const timeline = await getPatientAssessmentTimeline(patient.id);
      setTimelineData(timeline);
      
      // 진단 정보 가져오기
      if (patient.diagnosisId) {
        const diagnosis = await getDiagnosisById(patient.diagnosisId);
        setSelectedDiagnosis(diagnosis);
      }

    } catch (err) {
      console.error('환자 데이터 로드 실패:', err);
      setError('환자 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(prev => ({ ...prev, evaluations: false }));
    }
  }, []);

  const handleSaveSoap = useCallback(async (soapNote: string) => {
    if (!selectedPatient) return;
    try {
      // SOAP 노트 저장 로직 구현
      console.log('SOAP 노트 저장:', soapNote);
    } catch (err) {
      console.error('SOAP 노트 저장 실패:', err);
      setError('SOAP 노트를 저장하는 중 오류가 발생했습니다.');
    }
  }, [selectedPatient]);

  // 초기 데이터 로드
  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    }
  }, [authLoading, user, loadData]);

  // 로딩 중이거나 오류 발생 시 표시
  if (authLoading || loading.patients) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* 개요 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">총 환자 수</h3>
          <p className="text-3xl font-bold">{patients.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">총 평가 수</h3>
          <p className="text-3xl font-bold">{evaluations.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">평균 평가 횟수</h3>
          <p className="text-3xl font-bold">
            {patients.length > 0 ? (evaluations.length / patients.length).toFixed(1) : 0}
          </p>
        </div>
      </div>
      
      {/* 최근 활동 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">최근 환자</h3>
          <div className="space-y-4">
              {patients.map(patient => (
              <div
                  key={patient.id}
                className={`flex items-center justify-between p-4 border rounded cursor-pointer transition-colors ${
                    selectedPatient?.id === patient.id 
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handlePatientSelect(patient)}
              >
              <div>
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(patient.birthDate).toLocaleDateString()} ({patient.gender})
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {evaluations.filter(e => e.patientId === patient.id).length}회 평가
                </div>
              </div>
            ))}
          </div>
                </div>
                
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">최근 평가</h3>
                  <div className="space-y-4">
            {evaluations.map(evaluation => {
              const patient = patients.find(p => p.id === evaluation.patientId);
                        return (
                <div
                  key={evaluation.id}
                  className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    if (patient) {
                      handlePatientSelect(patient);
                    }
                  }}
                >
                            <div className="flex justify-between items-start">
                              <div>
                      <p className="font-medium">{patient?.name || '알 수 없음'}</p>
                                <p className="text-sm text-gray-500">
                        {new Date(evaluation.date).toLocaleDateString()} - 
                        {evaluation.type === 'initial' ? '초기' : 
                         evaluation.type === 'progress' ? '진행' : '종료'} 평가
                                </p>
                              </div>
                    <span className={`px-2 py-1 rounded ${
                      evaluation.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {evaluation.status === 'completed' ? '완료' : '진행중'}
                                  </span>
                  </div>
                </div>
              );
            })}
                  </div>
                </div>
              </div>
              
      {/* 선택된 환자의 평가 분석 */}
      {selectedPatient && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">
              {selectedPatient.name} 환자 평가 분석
            </h3>
                  </div>
                  
          {loading.evaluations ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* 평가 차트 */}
              <div className="mb-6">
                <AssessmentChart
                  data={timelineData.data}
                  selectedCategory={activeTab}
                />
            </div>
            
              {/* SOAP 노트 */}
              <div className="mb-6">
                  <SoapGenerator 
                    patient={selectedPatient}
                    onSave={handleSaveSoap}
                    assessments={assessmentData.assessments}
                    results={assessmentData.results}
                  />
              </div>
              
              {/* 진단 정보 */}
              {selectedDiagnosis && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-2">진단 정보</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="font-medium">{selectedDiagnosis.name}</p>
                    <p className="text-sm text-gray-600">{selectedDiagnosis.description}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
} 