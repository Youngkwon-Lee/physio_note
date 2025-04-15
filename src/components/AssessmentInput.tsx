'use client';

import React from 'react';
import { Assessment } from '@/types/assessment';

interface AssessmentInputProps {
  assessment: Assessment;
  value: string | number;
  onChange: (value: string | number) => void;
}

export const AssessmentInput: React.FC<AssessmentInputProps> = ({
  assessment,
  value,
  onChange
}) => {
  const renderInput = () => {
    switch (assessment.type) {
      case 'Range':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="rounded-md border border-gray-300 p-2 w-24"
            />
            <span className="text-gray-500">{assessment.unit}</span>
          </div>
        );

      case 'Grade':
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-md border border-gray-300 p-2"
          >
            <option value="">등급 선택...</option>
            <option value="0">0 - 근수축 없음</option>
            <option value="1">1 - 근수축만 있음</option>
            <option value="2">2 - 중력제거 상태에서 전관절 운동 가능</option>
            <option value="3">3 - 중력에 대항하여 전관절 운동 가능</option>
            <option value="4">4 - 약간의 저항에 대항하여 전관절 운동 가능</option>
            <option value="5">5 - 최대 저항에 대항하여 전관절 운동 가능</option>
          </select>
        );

      case 'Binary':
        return (
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="positive"
                checked={value === 'positive'}
                onChange={(e) => onChange(e.target.value)}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">양성</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="negative"
                checked={value === 'negative'}
                onChange={(e) => onChange(e.target.value)}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">음성</span>
            </label>
          </div>
        );

      case 'Score':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-md border border-gray-300 p-2 w-24"
          />
        );

      case 'VAS':
        return (
          <div className="w-full">
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>0 (통증 없음)</span>
              <span>10 (극심한 통증)</span>
            </div>
          </div>
        );

      case 'Text':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-md border border-gray-300 p-2 w-full"
            rows={3}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {assessment.name}
          {assessment.name_en && (
            <span className="ml-2 text-gray-500">({assessment.name_en})</span>
          )}
        </label>
        {assessment.normal_range && (
          <span className="text-sm text-gray-500">
            정상 범위: {assessment.normal_range.min} ~ {assessment.normal_range.max} {assessment.unit}
          </span>
        )}
      </div>
      {renderInput()}
      {assessment.instructions && (
        <div className="mt-2 text-sm text-gray-500">
          <details>
            <summary className="cursor-pointer">검사 방법</summary>
            <ul className="mt-2 list-disc list-inside">
              {assessment.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}; 