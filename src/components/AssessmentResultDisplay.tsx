import React from 'react';
import { Assessment, AssessmentResult } from '@/types/assessment';

interface AssessmentResultDisplayProps {
  assessment: Assessment;
  result: AssessmentResult;
}

export default function AssessmentResultDisplay({
  assessment,
  result
}: AssessmentResultDisplayProps) {
  const formatValue = (value: string | number) => {
    switch (assessment.type) {
      case 'Grade':
        const grades = {
          '0': 'Zero (완전마비)',
          '1': 'Trace (근수축)',
          '2': 'Poor (중력제거)',
          '3': 'Fair (중력저항)',
          '4': 'Good (약한저항)',
          '5': 'Normal (정상)'
        };
        return `${value} - ${grades[value as keyof typeof grades] || value}`;
      
      case 'Binary':
        return value === 'positive' ? '양성' : '음성';
      
      case 'Range':
        return `${value}${assessment.unit ? ` ${assessment.unit}` : ''}`;
      
      default:
        return value;
    }
  };

  const isNormalRange = (value: string | number) => {
    if (assessment.type !== 'Range' || !assessment.normal_range) {
      return true;
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue >= assessment.normal_range.min && numValue <= assessment.normal_range.max;
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {assessment.name}
            {assessment.name_en && (
              <span className="ml-2 text-sm text-gray-500">({assessment.name_en})</span>
            )}
          </h3>
          {assessment.description && (
            <p className="text-sm text-gray-500">{assessment.description}</p>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-medium text-gray-500">측정값</span>
          <span className={`text-lg font-medium ${
            isNormalRange(result.value)
              ? 'text-green-600'
              : 'text-red-600'
          }`}>
            {formatValue(result.value)}
          </span>
        </div>

        {assessment.type === 'Range' && assessment.normal_range && (
          <div className="mt-1 flex justify-between items-baseline text-sm text-gray-500">
            <span>정상 범위</span>
            <span>{assessment.normal_range.min} - {assessment.normal_range.max} {assessment.unit}</span>
          </div>
        )}

        {result.notes && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">비고: </span>
            {result.notes}
          </div>
        )}

        <div className="mt-2 text-xs text-gray-400">
          측정일: {result.date.toLocaleString()}
        </div>
      </div>
    </div>
  );
} 