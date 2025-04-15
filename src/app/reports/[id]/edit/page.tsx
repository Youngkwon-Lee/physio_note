'use client';

import { useState, useEffect, use } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AssessmentResult } from '@/types/assessment';
import { useRouter } from 'next/navigation';

interface ReportEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ReportEditPage({ params }: ReportEditPageProps) {
  const unwrappedParams = use(params);
  const reportId = unwrappedParams.id;
  const [report, setReport] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const docRef = doc(db, 'assessments', reportId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setReport({
            id: docSnap.id,
            ...docSnap.data()
          } as AssessmentResult);
        } else {
          console.error('평가 보고서를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('평가 보고서 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const handleInputChange = (categoryIndex: number, itemIndex: number, value: string | number | boolean) => {
    if (!report) return;

    setReport(prev => {
      if (!prev) return null;
      const newReport = { ...prev };
      newReport.results[categoryIndex].items[itemIndex].value = value;
      return newReport;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;

    try {
      const docRef = doc(db, 'assessments', reportId);
      await updateDoc(docRef, {
        results: report.results,
        updatedAt: new Date()
      });
      
      router.push(`/reports/${reportId}`);
    } catch (error) {
      console.error('평가 보고서 수정 실패:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">평가 보고서를 찾을 수 없습니다.</h1>
          <button
            onClick={() => router.push('/reports')}
            className="text-indigo-600 hover:text-indigo-900"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">평가 보고서 수정</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {report.results.map((result, categoryIndex) => (
          <div key={categoryIndex} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">{result.category}</h3>
            
            <div className="space-y-4">
              {result.items.map((item, itemIndex) => (
                <div key={item.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {item.name}
                  </label>
                  
                  {typeof item.value === 'number' && (
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min={0}
                        max={item.unit === '°' ? 180 : 10}
                        value={item.value}
                        onChange={(e) => handleInputChange(categoryIndex, itemIndex, Number(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-500">
                        {item.value}{item.unit}
                      </span>
                    </div>
                  )}

                  {typeof item.value === 'string' && (
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => handleInputChange(categoryIndex, itemIndex, e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push(`/reports/${reportId}`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
} 