'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PatientFormData, FormErrors } from '@/types/patient';
import { addPatient } from '@/lib/patients';
import { useAuth } from '@/contexts/AuthContext';

export default function PatientForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<PatientFormData>({
    userId: user?.uid || '',
    name: '',
    gender: 'male',
    birthDate: '',
    phoneNumber: '',
    address: '',
    medicalHistory: '',
    medications: '',
    allergies: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }
    if (!formData.birthDate) {
      newErrors.birthDate = '생년월일을 입력해주세요';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = '전화번호를 입력해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await addPatient(formData);
      router.push('/patients');
    } catch (error) {
      console.error('환자 정보 추가 오류:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            이름 *
        </label>
        <input
          type="text"
            name="name"
          id="name"
          value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.name ? 'border-red-500' : ''
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
            성별 *
        </label>
        <select
            name="gender"
          id="gender"
          value={formData.gender}
            onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="male">남성</option>
          <option value="female">여성</option>
            <option value="other">기타</option>
        </select>
      </div>

        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
            생년월일 *
          </label>
          <input
            type="date"
            name="birthDate"
            id="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.birthDate ? 'border-red-500' : ''
            }`}
          />
          {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>}
        </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
            전화번호 *
        </label>
        <input
          type="tel"
            name="phoneNumber"
          id="phoneNumber"
          value={formData.phoneNumber}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.phoneNumber ? 'border-red-500' : ''
            }`}
          />
          {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
      </div>

        <div className="sm:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            주소
        </label>
        <input
          type="text"
            name="address"
            id="address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">
            과거 병력
          </label>
          <textarea
            name="medicalHistory"
            id="medicalHistory"
            rows={3}
            value={formData.medicalHistory}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="medications" className="block text-sm font-medium text-gray-700">
            복용 중인 약물
          </label>
          <textarea
            name="medications"
            id="medications"
            rows={3}
            value={formData.medications}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
            알레르기
          </label>
          <textarea
            name="allergies"
            id="allergies"
            rows={3}
            value={formData.allergies}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            비고
          </label>
          <textarea
            name="notes"
            id="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          저장
        </button>
      </div>
    </form>
  );
} 