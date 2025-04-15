'use client';

import { useState } from 'react';
import { Assessment, AssessmentResult } from '@/types/assessment';
import { Patient } from '@/types/patient';
import { Diagnosis } from '@/types/diagnosis';

interface SoapGeneratorProps {
  patient: Patient;
  diagnosis?: Diagnosis | null;
  assessments: Assessment[];
  results: AssessmentResult[];
  onSave?: (soapText: string) => void;
}

export default function SoapGenerator({
  patient,
  diagnosis,
  assessments,
  results,
  onSave
}: SoapGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [soapText, setSoapText] = useState<string>('');
  const [showFullReport, setShowFullReport] = useState(false);

  // SOAP 보고서 생성
  const generateSOAP = async () => {
    try {
      setLoading(true);
      
      // 실제 구현에서는 여기서 외부 API (예: OpenAI)를 호출하거나 
      // 별도의 생성 로직을 구현할 수 있습니다.
      // 지금은 평가 결과를 바탕으로 간단한 템플릿 생성
      
      // 결과 데이터 정리
      const assessmentTexts = results.map(result => {
        const assessment = assessments.find(a => a.id === result.assessment_id);
        if (!assessment) return '';
        
        return `${assessment.name}: ${result.value}${assessment.unit ? ` ${assessment.unit}` : ''}`;
      }).filter(Boolean);
      
      // SOAP 형식의 보고서 생성
      const soap = {
        S: `환자(${patient.name}, ${patient.gender === 'male' ? '남' : '여'})는 ${diagnosis?.name || patient.diagnosis}으로 인한 기능 제한을 호소함.`,
        O: assessmentTexts.length > 0 ? assessmentTexts.join(', ') : '평가 데이터 없음',
        A: diagnosis ? 
           `${diagnosis.name}${diagnosis.ICF_codes ? `, ICF: ${diagnosis.ICF_codes.activity.join(', ')}` : ''}` : 
           patient.diagnosis,
        P: '재활 훈련 2주 진행 후 재평가 예정'
      };
      
      const soapReport = `[S] ${soap.S}\n[O] ${soap.O}\n[A] ${soap.A}\n[P] ${soap.P}`;
      setSoapText(soapReport);
      
    } catch (error) {
      console.error('SOAP 보고서 생성 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (onSave && soapText) {
      onSave(soapText);
    }
  };

  return (
    <div>
      {!soapText ? (
        <div className="text-center py-4">
          <button
            onClick={generateSOAP}
            disabled={loading || results.length === 0}
            className={`px-4 py-2 rounded ${
              loading || results.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⟳</span>
                생성 중...
              </>
            ) : (
              'SOAP 보고서 생성'
            )}
          </button>
          {results.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">평가 결과가 필요합니다</p>
          )}
        </div>
      ) : (
        <div>
          <div className={`border rounded-lg p-3 text-sm space-y-2 ${showFullReport ? '' : 'max-h-40 overflow-y-auto'}`}>
            {soapText.split('\n').map((line, index) => (
              <p key={index} className="whitespace-pre-wrap">
                <span className="font-bold">{line.substring(0, 3)}</span>
                {line.substring(3)}
              </p>
            ))}
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setShowFullReport(!showFullReport)}
              className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded hover:bg-gray-200"
            >
              {showFullReport ? '간략히 보기' : '전체 보기'}
            </button>
            
            <button
              onClick={handleSave}
              className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              저장
            </button>
            
            <button
              onClick={() => {
                try {
                  // 클립보드에 복사
                  navigator.clipboard.writeText(soapText);
                  alert('클립보드에 복사되었습니다.');
                } catch (err) {
                  console.error('클립보드 복사 실패:', err);
                }
              }}
              className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              복사
            </button>
            
            <button
              onClick={() => setSoapText('')}
              className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 