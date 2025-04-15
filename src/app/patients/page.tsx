'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import PatientList from '@/components/PatientList';
import PatientForm from '@/components/PatientForm';
import PatientSearch from '@/components/PatientSearch';

export default function PatientsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">환자 목록</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          {showForm ? '목록 보기' : '환자 추가'}
        </button>
      </div>

      {showForm ? (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">새 환자 추가</h2>
          <PatientForm
            userId={user.uid}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <PatientSearch userId={user.uid} />
          <PatientList userId={user.uid} />
        </div>
      )}
    </div>
  );
} 