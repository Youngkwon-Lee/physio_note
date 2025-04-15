import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Patient, Evaluation, EvaluationTemplate } from '../types';
import EvaluationAnalytics from './EvaluationAnalytics';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EvaluationTemplate | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // 환자 데이터 로드
      const patientsRef = collection(db, 'patients');
      const patientsQuery = query(patientsRef, where('therapistId', '==', user?.uid));
      const patientsSnapshot = await getDocs(patientsQuery);
      const patientsData = patientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        birthDate: doc.data().birthDate.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Patient[];
      setPatients(patientsData);

      // 평가 데이터 로드
      const evaluationsRef = collection(db, 'evaluations');
      const evaluationsQuery = query(evaluationsRef, where('evaluatorId', '==', user?.uid));
      const evaluationsSnapshot = await getDocs(evaluationsQuery);
      const evaluationsData = evaluationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
        nextEvaluationDate: doc.data().nextEvaluationDate?.toDate(),
      })) as Evaluation[];
      setEvaluations(evaluationsData);

      // 템플릿 데이터 로드
      const templatesRef = collection(db, 'evaluationTemplates');
      const templatesSnapshot = await getDocs(templatesRef);
      const templatesData = templatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as EvaluationTemplate[];
      setTemplates(templatesData);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPatientEvaluations = (patientId: string) => {
    return evaluations.filter(e => e.patientId === patientId);
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">최근 환자</h3>
          <div className="space-y-4">
            {patients.slice(0, 5).map(patient => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-4 border rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedPatient(patient)}
              >
                <div>
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(patient.birthDate).toLocaleDateString()} ({patient.gender})
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {getPatientEvaluations(patient.id).length}회 평가
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">최근 평가</h3>
          <div className="space-y-4">
            {evaluations.slice(0, 5).map(evaluation => {
              const patient = patients.find(p => p.id === evaluation.patientId);
              return (
                <div
                  key={evaluation.id}
                  className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedPatient(patient || null);
                    setSelectedTemplate(templates.find(t => t.id === evaluation.templateId) || null);
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

      {selectedPatient && selectedTemplate && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">
              {selectedPatient.name} 환자 평가 분석
            </h3>
            <button
              onClick={() => {
                setSelectedPatient(null);
                setSelectedTemplate(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              닫기
            </button>
          </div>
          <EvaluationAnalytics
            evaluations={getPatientEvaluations(selectedPatient.id)}
            template={selectedTemplate}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard; 