import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Evaluation, EvaluationTemplate } from '../types/evaluation';

interface EvaluationDetailProps {
  evaluationId: string;
  onClose: () => void;
}

const EvaluationDetail: React.FC<EvaluationDetailProps> = ({ evaluationId, onClose }) => {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [template, setTemplate] = useState<EvaluationTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedResults, setEditedResults] = useState<Evaluation['results']>({});

  useEffect(() => {
    loadEvaluation();
  }, [evaluationId]);

  const loadEvaluation = async () => {
    try {
      const evaluationRef = doc(db, 'evaluations', evaluationId);
      const evaluationDoc = await getDoc(evaluationRef);
      
      if (!evaluationDoc.exists()) {
        throw new Error('평가 결과를 찾을 수 없습니다.');
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
      setEditedResults(evaluationData.results);

      // 템플릿 로드
      const templateRef = doc(db, 'evaluationTemplates', evaluationData.templateId);
      const templateDoc = await getDoc(templateRef);
      
      if (templateDoc.exists()) {
        setTemplate({
          id: templateDoc.id,
          ...templateDoc.data(),
          createdAt: templateDoc.data().createdAt.toDate(),
          updatedAt: templateDoc.data().updatedAt.toDate(),
        } as EvaluationTemplate);
      }
    } catch (err) {
      setError('평가 결과를 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!evaluation) return;

    try {
      const evaluationRef = doc(db, 'evaluations', evaluation.id);
      await updateDoc(evaluationRef, {
        results: editedResults,
        status: 'completed',
        updatedAt: new Date(),
      });

      setEvaluation({
        ...evaluation,
        results: editedResults,
        status: 'completed',
        updatedAt: new Date(),
      });
      setIsEditing(false);
    } catch (err) {
      setError('평가 결과를 저장하는 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleResultChange = (fieldId: string, value: string | number) => {
    setEditedResults(prev => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        value,
      },
    }));
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!evaluation || !template) return <div>데이터를 찾을 수 없습니다.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">평가 상세 정보</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          닫기
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">평가 날짜</p>
            <p>{new Date(evaluation.date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">평가 유형</p>
            <p>{evaluation.type === 'initial' ? '초기 평가' : 
                evaluation.type === 'progress' ? '진행 평가' : '종료 평가'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">평가자</p>
            <p>{evaluation.evaluatorName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">상태</p>
            <p className={`inline-block px-2 py-1 rounded ${
              evaluation.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {evaluation.status === 'completed' ? '완료' : '진행중'}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">평가 결과</h3>
          <div className="space-y-4">
            {Object.entries(template.fields).map(([fieldId, field]) => (
              <div key={fieldId} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === 'number' && (
                  <input
                    type="number"
                    value={editedResults[fieldId]?.value as number || ''}
                    onChange={(e) => handleResultChange(fieldId, parseFloat(e.target.value))}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded"
                  />
                )}
                {field.type === 'text' && (
                  <input
                    type="text"
                    value={editedResults[fieldId]?.value as string || ''}
                    onChange={(e) => handleResultChange(fieldId, e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded"
                  />
                )}
                {field.type === 'select' && (
                  <select
                    value={editedResults[fieldId]?.value as string || ''}
                    onChange={(e) => handleResultChange(fieldId, e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">선택하세요</option>
                    {field.options?.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                )}
                {field.unit && (
                  <span className="text-sm text-gray-500 ml-2">{field.unit}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {evaluation.notes && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">비고</h3>
            <p className="text-gray-600">{evaluation.notes}</p>
          </div>
        )}

        {evaluation.recommendations && evaluation.recommendations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">추천사항</h3>
            <ul className="list-disc list-inside text-gray-600">
              {evaluation.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {evaluation.nextEvaluationDate && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">다음 평가 예정일</h3>
            <p className="text-gray-600">
              {new Date(evaluation.nextEvaluationDate).toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              수정
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedResults(evaluation.results);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                저장
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluationDetail; 