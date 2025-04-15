'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface Assessment {
  id: string;
  patientId: string;
  date: string;
  assessmentResults: {
    itemId: string;
    value: string | number;
    notes?: string;
  }[];
  createdAt: Date;
}

interface AssessmentHistoryProps {
  patientId: string;
}

export default function AssessmentHistory({ patientId }: AssessmentHistoryProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const q = query(
          collection(db, 'assessments'),
          where('patientId', '==', patientId),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const assessmentList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Assessment[];
        
        setAssessments(assessmentList);
      } catch (error) {
        setError('평가 기록을 불러오는데 실패했습니다.');
        console.error('평가 기록 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [patientId]);

  if (loading) {
    return <div>평가 기록 로딩 중...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">아직 평가 기록이 없습니다.</p>
        <Link
          href={`/assessment?patientId=${patientId}`}
          className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          새로운 평가 시작
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">평가 기록</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {assessments.map((assessment) => (
            <li key={assessment.id}>
              <Link href={`/assessments/${assessment.id}`}>
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-indigo-600 truncate">
                        평가일: {new Date(assessment.createdAt).toLocaleDateString()}
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {assessment.assessmentResults.length}개 항목
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="flex items-center text-sm text-gray-500">
                          주요 평가: {assessment.assessmentResults.slice(0, 3).map(result => 
                            `${result.itemId}: ${result.value}`
                          ).join(', ')}
                          {assessment.assessmentResults.length > 3 && ' ...'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 