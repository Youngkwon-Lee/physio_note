'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Patient } from '@/types/patient';
import PatientEditForm from '@/components/PatientEditForm';
import AssessmentHistory from '@/components/AssessmentHistory';
import Link from 'next/link';

interface PatientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  const unwrappedParams = use(params);
  const patientId = unwrappedParams.id;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const patientDoc = await getDoc(doc(db, 'patients', patientId));
        if (patientDoc.exists()) {
          setPatient({ id: patientDoc.id, ...patientDoc.data() } as Patient);
        } else {
          setError('환자 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('환자 정보 조회 실패:', err);
        setError('환자 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (user && !authLoading) {
      fetchPatient();
    }
  }, [patientId, user, authLoading]);

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 환자를 삭제하시겠습니까?')) {
      return;
    }

    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, 'patients', patientId));
      router.push('/patients');
    } catch (err) {
      console.error('환자 삭제 실패:', err);
      alert('환자 삭제에 실패했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">환자를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/patients"
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← 환자 목록으로
        </Link>
        <div className="space-x-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            {isEditing ? '수정 취소' : '정보 수정'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400"
          >
            {deleteLoading ? '삭제 중...' : '환자 삭제'}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">환자 정보 수정</h2>
          <PatientEditForm
            patient={patient}
            onSuccess={() => {
              setIsEditing(false);
              router.refresh();
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold">{patient.name}</h1>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">생년월일</h3>
                  <p className="mt-1 text-lg">{patient.birthDate}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">성별</h3>
                  <p className="mt-1 text-lg">{patient.gender}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">연락처</h3>
                  <p className="mt-1 text-lg">{patient.phoneNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">진단명</h3>
                  <p className="mt-1 text-lg">{patient.diagnosis}</p>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href={`/assessment?patientId=${patient.id}`}
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700"
                >
                  평가하기
                </Link>
              </div>
            </div>
          </div>

          <AssessmentHistory patientId={patient.id} />
        </>
      )}
    </div>
  );
} 