'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Diagnosis, DiagnosisCategory, MSDSubCategory } from '@/types/diagnosis';
import { MSDDiagnoses } from '@/data/msd-diagnoses';
import { initializeDiagnosesData, getDiagnoses } from '@/lib/diagnoses';
import toast from 'react-hot-toast';

interface DiagnosisSelectorProps {
  onSelect: (diagnosis: Diagnosis) => void;
  selectedId?: string;
}

export default function DiagnosisSelector({ onSelect, selectedId }: DiagnosisSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DiagnosisCategory | ''>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<MSDSubCategory | ''>('');
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const loadDiagnoses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDiagnoses();
      
      if (result.length === 0 && !initialized) {
        // Firestore에 진단 데이터가 없는 경우 초기화
        try {
          await initializeDiagnosesData();
          setInitialized(true);
          // 초기화 후 다시 불러오기
          const data = await getDiagnoses();
          setDiagnoses(data);
        } catch (err) {
          console.error('진단 데이터 초기화 실패:', err);
          setError('진단 데이터를 초기화하는데 실패했습니다.');
        }
      } else {
        setDiagnoses(result);
      }
    } catch (err) {
      console.error('진단 데이터 로드 실패:', err);
      setError('진단 데이터를 불러오는데 실패했습니다.');
      // 오류 시 로컬 데이터 사용
      setDiagnoses(MSDDiagnoses as Diagnosis[]);
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  useEffect(() => {
    loadDiagnoses();
  }, [loadDiagnoses]);

  // 선택된 카테고리와 검색어에 따라 진단 필터링
  const filteredDiagnoses = useMemo(() => {
    return diagnoses.filter(diagnosis => {
      // 카테고리 필터
      if (selectedCategory && diagnosis.category !== selectedCategory) {
        return false;
      }
      
      // 하위 카테고리 필터 (MSD 카테고리인 경우)
      if (selectedSubCategory && diagnosis.subCategory !== selectedSubCategory) {
        return false;
      }
      
      // 검색어 필터
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          diagnosis.name?.toLowerCase().includes(term) ||
          diagnosis.name_en?.toLowerCase().includes(term) ||
          diagnosis.description?.toLowerCase().includes(term)
        );
      }
      
      return true;
    });
  }, [diagnoses, selectedCategory, selectedSubCategory, searchTerm]);

  const handleSelectDiagnosis = (diagnosis: Diagnosis) => {
    onSelect(diagnosis);
    toast.success(`"${diagnosis.name}" 진단이 선택되었습니다.`);
  };

  const handleRetry = () => {
    loadDiagnoses();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p>진단 데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 bg-red-50 rounded-lg p-4">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={handleRetry}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* 카테고리 선택 */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">진단 카테고리</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value as DiagnosisCategory | '');
              setSelectedSubCategory(''); // 카테고리 변경 시 하위 카테고리 초기화
            }}
            className="w-full rounded-md border border-gray-300 p-2"
          >
            <option value="">모든 카테고리</option>
            <option value="MSD">근골격계</option>
            <option value="Neuro">신경계</option>
            <option value="Cardio">심폐계</option>
            <option value="Geriatric">노인</option>
            <option value="Sports">스포츠</option>
          </select>
        </div>
        
        {/* MSD 선택 시 하위 카테고리 표시 */}
        {selectedCategory === 'MSD' && (
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">하위 카테고리</label>
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value as MSDSubCategory | '')}
              className="w-full rounded-md border border-gray-300 p-2"
            >
              <option value="">모든 하위 카테고리</option>
              <option value="Cervical">경추</option>
              <option value="Thoracic">흉추</option>
              <option value="Lumbar">요추</option>
              <option value="Shoulder">어깨</option>
              <option value="Elbow">팔꿈치</option>
              <option value="Wrist">손목</option>
              <option value="Hip">고관절</option>
              <option value="Knee">무릎</option>
              <option value="Ankle">발목</option>
            </select>
          </div>
        )}
        
        {/* 검색 */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="진단명, 설명 검색..."
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>
      
      {/* 필터링된 진단 목록 */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">진단 목록</h3>
        
        {filteredDiagnoses.length === 0 ? (
          <p className="text-center py-6 bg-gray-50 rounded-lg">검색 조건에 맞는 진단이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDiagnoses.map(diagnosis => (
              <button
                key={diagnosis.id}
                onClick={() => handleSelectDiagnosis(diagnosis)}
                className={`text-left p-4 rounded-lg border hover:border-primary transition-colors ${
                  selectedId === diagnosis.id 
                    ? 'bg-primary-50 border-primary shadow-sm' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex justify-between">
                  <h4 className="font-medium text-gray-900">{diagnosis.name}</h4>
                  {diagnosis.evidence_level && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      diagnosis.evidence_level === 'A' 
                        ? 'bg-green-100 text-green-800' 
                        : diagnosis.evidence_level === 'B'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      근거 수준: {diagnosis.evidence_level}
                    </span>
                  )}
                </div>
                
                {diagnosis.name_en && (
                  <p className="text-sm text-gray-500 italic">{diagnosis.name_en}</p>
                )}
                
                {diagnosis.description && (
                  <p className="mt-2 text-sm text-gray-600">{diagnosis.description}</p>
                )}
                
                {diagnosis.red_flags && diagnosis.red_flags.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-red-600">주의사항:</p>
                    <ul className="text-xs text-red-600 mt-1">
                      {diagnosis.red_flags.slice(0, 2).map((flag, index) => (
                        <li key={index}>• {flag}</li>
                      ))}
                      {diagnosis.red_flags.length > 2 && (
                        <li>• 외 {diagnosis.red_flags.length - 2}개</li>
                      )}
                    </ul>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 