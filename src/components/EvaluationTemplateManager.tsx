import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EvaluationTemplate } from '../types/evaluation';

const EvaluationTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EvaluationTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<EvaluationTemplate>>({
    name: '',
    description: '',
    fields: {},
  });

  useEffect(() => {
    loadTemplates();
  }, []);

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
      setError('템플릿을 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const templateData = {
        ...newTemplate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'evaluationTemplates'), templateData);
      setTemplates([...templates, { ...templateData, id: docRef.id } as EvaluationTemplate]);
      setIsCreating(false);
      setNewTemplate({
        name: '',
        description: '',
        fields: {},
      });
    } catch (err) {
      setError('템플릿을 생성하는 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const templateRef = doc(db, 'evaluationTemplates', editingTemplate.id);
      await updateDoc(templateRef, {
        ...editingTemplate,
        updatedAt: new Date(),
      });

      setTemplates(templates.map(t => 
        t.id === editingTemplate.id ? editingTemplate : t
      ));
      setEditingTemplate(null);
    } catch (err) {
      setError('템플릿을 업데이트하는 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteDoc(doc(db, 'evaluationTemplates', templateId));
      setTemplates(templates.filter(t => t.id !== templateId));
    } catch (err) {
      setError('템플릿을 삭제하는 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleAddField = () => {
    const fieldId = `field_${Date.now()}`;
    setNewTemplate(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldId]: {
          label: '',
          type: 'text',
          required: false,
        },
      },
    }));
  };

  const handleFieldChange = (fieldId: string, key: string, value: any) => {
    setNewTemplate(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldId]: {
          ...prev.fields?.[fieldId],
          [key]: value,
        },
      },
    }));
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">평가 템플릿 관리</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          새 템플릿 생성
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">새 템플릿 생성</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">템플릿 이름</label>
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">설명</label>
              <textarea
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            <div>
              <h4 className="text-md font-medium mb-2">평가 항목</h4>
              <div className="space-y-4">
                {Object.entries(newTemplate.fields || {}).map(([fieldId, field]) => (
                  <div key={fieldId} className="border p-4 rounded space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">항목 이름</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => handleFieldChange(fieldId, 'label', e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">유형</label>
                        <select
                          value={field.type}
                          onChange={(e) => handleFieldChange(fieldId, 'type', e.target.value)}
                          className="w-full p-2 border rounded"
                        >
                          <option value="text">텍스트</option>
                          <option value="number">숫자</option>
                          <option value="select">선택</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => handleFieldChange(fieldId, 'required', e.target.checked)}
                          className="mr-2"
                        />
                        필수 항목
                      </label>
                      {field.type === 'select' && (
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700">선택 옵션 (쉼표로 구분)</label>
                          <input
                            type="text"
                            value={field.options?.join(', ') || ''}
                            onChange={(e) => handleFieldChange(fieldId, 'options', e.target.value.split(',').map(o => o.trim()))}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleAddField}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
                >
                  항목 추가
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsCreating(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                취소
              </button>
              <button
                onClick={handleCreateTemplate}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div key={template.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{template.name}</h3>
                <p className="text-sm text-gray-500">{template.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingTemplate(template)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  삭제
                </button>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700">평가 항목</h4>
              <ul className="mt-2 space-y-1">
                {Object.entries(template.fields).map(([fieldId, field]) => (
                  <li key={fieldId} className="text-sm text-gray-600">
                    {field.label} ({field.type})
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvaluationTemplateManager; 