import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Evaluation, EvaluationTemplate } from '../types/evaluation';
import { useAuth } from '../contexts/AuthContext';

interface EvaluationManagerProps {
  patientId: string;
}

const EvaluationManager: React.FC<EvaluationManagerProps> = ({ patientId }) => {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [newEvaluation, setNewEvaluation] = useState<Partial<Evaluation>>({
    type: 'initial',
    status: 'pending',
    results: {},
  });

  useEffect(() => {
    loadEvaluations();
    loadTemplates();
  }, [patientId]);

  const loadEvaluations = async () => {
    try {
      const evaluationsRef = collection(db, 'evaluations');
      const q = query(evaluationsRef, where('patientId', '==', patientId));
      const querySnapshot = await getDocs(q);
      const evaluationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
        nextEvaluationDate: doc.data().nextEvaluationDate?.toDate(),
      })) as Evaluation[];
      setEvaluations(evaluationsData);
    } catch (err) {
      setError('평가 결과를 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const templatesRef = collection(db, 'evaluationTemplates');
      const querySnapshot = await getDocs(templatesRef);
      const templatesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as EvaluationTemplate[];
      setTemplates(templatesData);
    } catch (err) {
      setError('평가 템플릿을 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleCreateEvaluation = async () => {
    if (!selectedTemplate || !user) return;

    try {
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) return;

      const evaluationData: Omit<Evaluation, 'id'> = {
        patientId,
        date: new Date(),
        evaluatorId: user.uid,
        evaluatorName: user.displayName || 'Unknown',
        type: newEvaluation.type as 'initial' | 'progress' | 'final',
        status: 'pending',
        results: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'evaluations'), evaluationData);
      setEvaluations([...evaluations, { ...evaluationData, id: docRef.id }]);
      setSelectedTemplate('');
      setNewEvaluation({
        type: 'initial',
        status: 'pending',
        results: {},
      });
    } catch (err) {
      setError('평가를 생성하는 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleUpdateEvaluation = async (evaluationId: string, updates: Partial<Evaluation>) => {
    try {
      const evaluationRef = doc(db, 'evaluations', evaluationId);
      await updateDoc(evaluationRef, {
        ...updates,
        updatedAt: new Date(),
      });
      setEvaluations(evaluations.map(eval => 
        eval.id === evaluationId ? { ...eval, ...updates } : eval
      ));
    } catch (err) {
      setError('평가를 업데이트하는 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">새 평가 생성</h2>
        <div className="space-y-4">
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">템플릿 선택</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          <select
            value={newEvaluation.type}
            onChange={(e) => setNewEvaluation({ ...newEvaluation, type: e.target.value as any })}
            className="w-full p-2 border rounded"
          >
            <option value="initial">초기 평가</option>
            <option value="progress">진행 평가</option>
            <option value="final">종료 평가</option>
          </select>
          <button
            onClick={handleCreateEvaluation}
            disabled={!selectedTemplate}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            평가 생성
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">평가 목록</h2>
        <div className="space-y-4">
          {evaluations.map(evaluation => (
            <div key={evaluation.id} className="border p-4 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    {new Date(evaluation.date).toLocaleDateString()} - {evaluation.type}
                  </h3>
                  <p className="text-sm text-gray-500">
                    평가자: {evaluation.evaluatorName}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded ${
                  evaluation.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {evaluation.status === 'completed' ? '완료' : '진행중'}
                </span>
              </div>
              {evaluation.notes && (
                <p className="mt-2 text-gray-600">{evaluation.notes}</p>
              )}
              {evaluation.nextEvaluationDate && (
                <p className="mt-2 text-sm text-gray-500">
                  다음 평가 예정일: {new Date(evaluation.nextEvaluationDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvaluationManager; 