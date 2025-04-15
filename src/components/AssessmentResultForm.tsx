import React, { useState } from 'react';
import { Assessment, AssessmentResult } from '@/types/assessment';
import { saveAssessmentResult } from '@/lib/assessments';
import toast from 'react-hot-toast';

interface AssessmentResultFormProps {
  assessment: Assessment;
  patientId: string;
  evaluatorId: string;
  sessionId: string;
  onSave?: (result: AssessmentResult) => void;
  initialValue?: string | number;
}

export default function AssessmentResultForm({
  assessment,
  patientId,
  evaluatorId,
  sessionId,
  onSave,
  initialValue
}: AssessmentResultFormProps) {
  const [value, setValue] = useState<string>(initialValue?.toString() || '');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!value.trim()) {
      toast.error('평가 결과를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = {
        assessment_id: assessment.id,
        patientId,
        evaluatorId,
        sessionId,
        value: assessment.type === 'Range' ? parseFloat(value) : value,
        notes: notes.trim() || undefined,
        date: new Date()
      };

      const resultId = await saveAssessmentResult(result);
      
      toast.success('평가 결과가 저장되었습니다.');
      if (onSave) {
        onSave({ id: resultId, ...result } as AssessmentResult);
      }
    } catch (error) {
      console.error('평가 결과 저장 실패:', error);
      toast.error('평가 결과 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = () => {
    switch (assessment.type) {
      case 'Range':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            min={assessment.normal_range?.min}
            max={assessment.normal_range?.max}
            step="0.1"
            className="w-full px-3 py-2 border rounded-md"
            disabled={isSubmitting}
          />
        );
      
      case 'Grade':
        return (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            disabled={isSubmitting}
          >
            <option value="">등급 선택</option>
            <option value="0">0 - Zero (완전마비)</option>
            <option value="1">1 - Trace (근수축)</option>
            <option value="2">2 - Poor (중력제거)</option>
            <option value="3">3 - Fair (중력저항)</option>
            <option value="4">4 - Good (약한저항)</option>
            <option value="5">5 - Normal (정상)</option>
          </select>
        );
      
      case 'Binary':
        return (
          <div className="space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="positive"
                checked={value === 'positive'}
                onChange={(e) => setValue(e.target.value)}
                disabled={isSubmitting}
                className="mr-2"
              />
              양성
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="negative"
                checked={value === 'negative'}
                onChange={(e) => setValue(e.target.value)}
                disabled={isSubmitting}
                className="mr-2"
              />
              음성
            </label>
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            disabled={isSubmitting}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {assessment.name}
          {assessment.name_en && (
            <span className="ml-2 text-sm text-gray-500">({assessment.name_en})</span>
          )}
        </label>
        {assessment.description && (
          <p className="mt-1 text-sm text-gray-500">{assessment.description}</p>
        )}
        <div className="mt-1">
          {renderInput()}
          {assessment.unit && (
            <span className="ml-2 text-sm text-gray-500">{assessment.unit}</span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          비고
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full px-3 py-2 border rounded-md"
          rows={2}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          {isSubmitting ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  );
} 