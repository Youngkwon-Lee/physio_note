import React, { useState } from 'react';
import { Evaluation, EvaluationTemplate } from '../types/evaluation';
import EvaluationChart from './EvaluationChart';
import EvaluationStats from './EvaluationStats';

interface EvaluationAnalyticsProps {
  evaluations: Evaluation[];
  template: EvaluationTemplate;
}

const EvaluationAnalytics: React.FC<EvaluationAnalyticsProps> = ({
  evaluations,
  template,
}) => {
  const [selectedField, setSelectedField] = useState<string | null>(null);

  // 숫자 타입의 필드만 필터링
  const numericFields = Object.entries(template.fields)
    .filter(([_, field]) => field.type === 'number')
    .map(([id, field]) => ({
      id,
      label: field.label,
    }));

  if (numericFields.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">평가 결과 분석</h2>
        <p className="text-gray-500">분석 가능한 숫자 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">평가 결과 분석</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            분석할 항목 선택
          </label>
          <select
            value={selectedField || ''}
            onChange={(e) => setSelectedField(e.target.value || null)}
            className="w-full p-2 border rounded"
          >
            <option value="">항목 선택</option>
            {numericFields.map(field => (
              <option key={field.id} value={field.id}>
                {field.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedField && (
        <>
          <EvaluationStats
            evaluations={evaluations}
            fieldId={selectedField}
            fieldLabel={template.fields[selectedField].label}
          />
          <EvaluationChart
            evaluations={evaluations}
            fieldId={selectedField}
            fieldLabel={template.fields[selectedField].label}
          />
        </>
      )}
    </div>
  );
};

export default EvaluationAnalytics; 