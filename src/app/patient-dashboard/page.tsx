'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Evaluation, AssessmentResult } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import AssessmentChart from '@/components/AssessmentChart';
import { getPatientAssessmentResults, getLatestAssessmentResult } from '@/lib/assessments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ExclamationTriangleIcon, FlagIcon } from '@heroicons/react/24/outline';

interface PatientSummary {
  name: string;
  age: number;
  gender: string;
  diagnosis: string;
  patientType: string[];
  flags: {
    redFlags: string[];
    yellowFlags: string[];
  };
}

interface FunctionalTab {
  id: string;
  label: string;
  icon: string;
  assessments: Assessment[];
}

const functionalTabs: FunctionalTab[] = [
  { id: 'mobility', label: '이동능력', icon: '🚶', assessments: [] },
  { id: 'adl', label: 'ADL', icon: '🛁', assessments: [] },
  { id: 'balance', label: '균형', icon: '⚖️', assessments: [] },
  { id: 'strength', label: '근력', icon: '💪', assessments: [] },
  { id: 'rom', label: 'ROM', icon: '🔄', assessments: [] },
  { id: 'cognitive', label: '인지', icon: '🧠', assessments: [] },
  { id: 'pain', label: '통증', icon: '🤕', assessments: [] },
  { id: 'cardio', label: '심폐', icon: '❤️', assessments: [] },
  { id: 'proprioception', label: '고유감각', icon: '🎯', assessments: [] },
  { id: 'sports', label: '스포츠', icon: '⚽', assessments: [] },
];

export default function PatientDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState('mobility');
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      try {
        setLoadingData(true);
        setError(null);

        // 환자 정보 로드
        // 평가 결과 로드
        const results = await getPatientAssessmentResults(patient?.id || '');
        setAssessmentResults(results);

        // 평가 데이터 로드 (최신 순으로 정렬)
        const evaluationsQuery = query(
          collection(db, 'evaluations'),
          where('patientId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const evaluationsSnapshot = await getDocs(evaluationsQuery);
        const evaluationsData = evaluationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
          nextEvaluationDate: doc.data().nextEvaluationDate?.toDate(),
        })) as Evaluation[];
        setEvaluations(evaluationsData);

      } catch (error) {
        console.error('데이터 로드 실패:', error);
        if (error instanceof Error && error.message.includes('requires an index')) {
          setError('데이터베이스 인덱스가 생성 중입니다. 잠시 후 다시 시도해주세요.');
        } else {
          setError('데이터를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [user, patient?.id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => router.refresh()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">환자 대시보드</h2>
          <p className="text-gray-600">
            아직 평가 데이터가 없습니다. 새로운 평가를 시작해보세요.
          </p>
          <button
            onClick={() => router.push('/evaluation')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            평가 시작하기
          </button>
        </div>
      </div>
    );
  }

  const renderPatientSummary = () => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">
              {patient?.name}
              <span className="ml-2 text-lg text-gray-500">
                ({patient?.gender === 'male' ? '남' : '여'}, {patient?.age}세)
              </span>
            </CardTitle>
            <div className="mt-2">
              <Badge variant="outline" className="mr-2">
                🏥 {patient?.diagnosis}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {patient?.flags?.redFlags.length > 0 && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Red Flags 발견</AlertTitle>
                <AlertDescription>
                  {patient.flags.redFlags.join(', ')}
                </AlertDescription>
              </Alert>
            )}
            {patient?.flags?.yellowFlags.length > 0 && (
              <Alert variant="warning">
                <FlagIcon className="h-4 w-4" />
                <AlertTitle>Yellow Flags 발견</AlertTitle>
                <AlertDescription>
                  {patient.flags.yellowFlags.join(', ')}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {patient?.patientType.map((type) => (
            <Badge key={type} variant="secondary">
              {type}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderFunctionalAssessment = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-5 gap-2">
        {functionalTabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {functionalTabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          <Card>
            <CardHeader>
              <CardTitle>{tab.label} 평가</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 평가 입력 폼 컴포넌트 */}
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      {renderPatientSummary()}
      {renderFunctionalAssessment()}
      
      {/* ICF 및 MSD 태깅 섹션 */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>기능 진단 결과</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ICF 및 MSD 태그 컴포넌트 */}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>목표 & 중재 계획</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 목표 및 중재 계획 컴포넌트 */}
          </CardContent>
        </Card>
      </div>

      {/* SOAP 노트 미리보기 */}
      <Card>
        <CardHeader>
          <CardTitle>SOAP 노트</CardTitle>
        </CardHeader>
        <CardContent>
          {/* SOAP 노트 미리보기 컴포넌트 */}
        </CardContent>
      </Card>

      {/* 평가 결과 차트 */}
      <Card>
        <CardHeader>
          <CardTitle>평가 결과 추이</CardTitle>
        </CardHeader>
        <CardContent>
          {assessmentResults.length > 0 && (
            <AssessmentChart
              data={assessmentResults.reduce((acc, result) => {
                const date = result.date.toLocaleDateString();
                if (!acc[date]) {
                  acc[date] = [];
                }
                acc[date].push(result.value as number);
                return acc;
              }, {} as Record<string, number[]>)}
              selectedCategory="전체"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 