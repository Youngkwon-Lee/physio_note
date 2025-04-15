'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AssessmentResult } from '@/types/assessment';
import Link from 'next/link';

export default function ReportsList() {
  const [reports, setReports] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const q = query(collection(db, 'assessments'));
        const querySnapshot = await getDocs(q);
        const reportsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AssessmentResult[];
        setReports(reportsData);
      } catch (error) {
        console.error('평가 보고서 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {reports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">아직 등록된 평가 보고서가 없습니다.</p>
        </div>
      ) : (
        reports.map(report => (
          <div key={report.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">{report.patientName}</h2>
              <Link
                href={`/reports/${report.id}`}
                className="text-indigo-600 hover:text-indigo-900"
              >
                상세 보기
              </Link>
            </div>
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
        ))
      )}
    </div>
  );
} 