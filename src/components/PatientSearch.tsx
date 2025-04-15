'use client';

import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Patient } from '../types/patient';
import Link from 'next/link';

interface PatientSearchProps {
  userId: string;
}

export default function PatientSearch({ userId }: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const patientsRef = collection(db, 'patients');
      const nameQuery = query(
        patientsRef,
        where('userId', '==', userId),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff')
      );
      const diagnosisQuery = query(
        patientsRef,
        where('userId', '==', userId),
        where('diagnosis', '>=', searchTerm),
        where('diagnosis', '<=', searchTerm + '\uf8ff')
      );

      const [nameSnapshot, diagnosisSnapshot] = await Promise.all([
        getDocs(nameQuery),
        getDocs(diagnosisQuery)
      ]);

      const nameResults = nameSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Patient));
      const diagnosisResults = diagnosisSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Patient));

      // 중복 제거
      const combinedResults = [...nameResults, ...diagnosisResults];
      const uniqueResults = Array.from(new Map(combinedResults.map(item => [item.id, item])).values());

      setSearchResults(uniqueResults);
    } catch (err) {
      setError('환자 검색 중 오류가 발생했습니다.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="환자 이름 또는 진단명으로 검색"
          className="flex-1 p-2 border rounded"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? '검색 중...' : '검색'}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {searchResults.length > 0 ? (
        <ul className="space-y-2">
          {searchResults.map((patient) => (
            <li key={patient.id} className="border p-3 rounded hover:bg-gray-50">
              <Link href={`/patients/${patient.id}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{patient.name}</h3>
                    <p className="text-sm text-gray-600">{patient.diagnosis}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(patient.birthDate).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        searchTerm && !isLoading && <p className="text-gray-500">검색 결과가 없습니다.</p>
      )}
    </div>
  );
} 