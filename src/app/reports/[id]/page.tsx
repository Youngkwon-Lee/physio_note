'use client';

import { useState, useEffect, use } from 'react';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AssessmentResult } from '@/types/assessment';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ReportPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ReportPage({ params }: ReportPageProps) {
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

  const handleDelete = async () => {
    if (!confirm('정말로 이 평가 보고서를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'assessments', reportId));
      router.push('/reports');
    } catch (error) {
      console.error('평가 보고서 삭제 실패:', error);
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
          <Link href="/reports" className="text-indigo-600 hover:text-indigo-900">
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">평가 보고서 상세</h1>
        <div className="space-x-4">
          <Link
            href={`/reports/${reportId}/edit`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            수정
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            삭제
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{report.patientName}</h2>
        <div className="space-y-4">
          {report.results.map((result, index) => (
            <div key={index} className="border-b pb-4">
              <h3 className="font-medium mb-2">{result.category}</h3>
              <div className="grid grid-cols-2 gap-4">
                {result.items.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-gray-600">{item.name}:</span>
                    <span className="font-medium">{item.value}{item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Link href="/reports" className="text-indigo-600 hover:text-indigo-900">
          목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
} 