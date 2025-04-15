import React from 'react';
import { Evaluation } from '../types/evaluation';

interface EvaluationStatsProps {
  evaluations: Evaluation[];
  fieldId: string;
  fieldLabel: string;
}

const EvaluationStats: React.FC<EvaluationStatsProps> = ({
  evaluations,
  fieldId,
  fieldLabel,
}) => {
  // 평가 결과 데이터 가공
  const validEvaluations = evaluations
    .filter(evaluation => evaluation.results[fieldId]?.value !== undefined)
    .map(evaluation => ({
      ...evaluation,
      value: Number(evaluation.results[fieldId].value),
    }));

  if (validEvaluations.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">{fieldLabel} 통계</h3>
        <p className="text-gray-500">데이터가 없습니다.</p>
      </div>
    );
  }

  // 통계 계산
  const values = validEvaluations.map(e => e.value);
  const initialValue = validEvaluations.find(e => e.type === 'initial')?.value;
  const latestValue = validEvaluations[validEvaluations.length - 1].value;
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
  const improvement = initialValue ? ((latestValue - initialValue) / initialValue) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">{fieldLabel} 통계</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">초기값</p>
          <p className="text-xl font-semibold">
            {initialValue?.toFixed(2) || 'N/A'}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">최신값</p>
          <p className="text-xl font-semibold">{latestValue.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">개선률</p>
          <p className={`text-xl font-semibold ${improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {improvement.toFixed(1)}%
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">최소값</p>
          <p className="text-xl font-semibold">{minValue.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">최대값</p>
          <p className="text-xl font-semibold">{maxValue.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">평균값</p>
          <p className="text-xl font-semibold">{avgValue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default EvaluationStats; 