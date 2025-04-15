'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ASSESSMENT_GROUPS } from '@/types/assessment';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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

// PDF 스타일 정의
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  title: {
    fontSize: 24,
    marginBottom: 20
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10
  },
  text: {
    fontSize: 12,
    marginBottom: 5
  }
});

// PDF 문서 컴포넌트
const AssessmentPDF = ({ assessment }: { assessment: Assessment }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>평가 결과 보고서</Text>
        <Text style={styles.subtitle}>평가일: {new Date(assessment.createdAt).toLocaleDateString()}</Text>
        {ASSESSMENT_GROUPS.map(group => (
          <View key={group.id} style={styles.section}>
            <Text style={styles.subtitle}>{group.name}</Text>
            {group.items.map(item => {
              const result = assessment.assessmentResults.find(r => r.itemId === item.id);
              return result ? (
                <Text key={item.id} style={styles.text}>
                  {item.name}: {result.value} {item.unit || ''}
                  {result.notes && ` (${result.notes})`}
                </Text>
              ) : null;
            })}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params); // React.use로 params 언래핑
  const assessmentId = unwrappedParams.id;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const assessmentDoc = await getDoc(doc(db, 'assessments', assessmentId));
        if (assessmentDoc.exists()) {
          setAssessment({ id: assessmentDoc.id, ...assessmentDoc.data() } as Assessment);
        } else {
          setError('평가 결과를 찾을 수 없습니다.');
        }
      } catch (error) {
        setError('평가 결과를 불러오는데 실패했습니다.');
        console.error('평가 결과 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchAssessment();
    }
  }, [assessmentId, user, authLoading]);

  if (loading || authLoading) {
    return <div>로딩 중...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (error || !assessment) {
    return <div className="text-red-500">{error}</div>;
  }

  // 차트 데이터 준비
  const chartData = assessment.assessmentResults
    .filter(result => {
      const item = ASSESSMENT_GROUPS
        .flatMap(group => group.items)
        .find(item => item.id === result.itemId);
      return item && item.type === 'Range';
    })
    .map(result => {
      const item = ASSESSMENT_GROUPS
        .flatMap(group => group.items)
        .find(item => item.id === result.itemId);
      return {
        name: item?.name || result.itemId,
        value: Number(result.value)
      };
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href={`/patients/${assessment.patientId}`}
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← 환자 정보로 돌아가기
        </Link>
        <PDFDownloadLink
          document={<AssessmentPDF assessment={assessment} />}
          fileName={`assessment-${assessment.id}.pdf`}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {({ loading }) =>
            loading ? 'PDF 생성 중...' : 'PDF 다운로드'
          }
        </PDFDownloadLink>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6">평가 결과</h1>
        <div className="mb-8">
          <p className="text-gray-600">
            평가일: {new Date(assessment.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* 차트 표시 */}
        <div className="mb-8 h-80">
          <h2 className="text-xl font-semibold mb-4">측정값 차트</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 카테고리별 결과 표시 */}
        <div className="space-y-6">
          {ASSESSMENT_GROUPS.map(group => {
            const categoryResults = assessment.assessmentResults.filter(result =>
              group.items.some(item => item.id === result.itemId)
            );

            if (categoryResults.length === 0) return null;

            return (
              <div key={group.id} className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">{group.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map(item => {
                    const result = assessment.assessmentResults.find(
                      r => r.itemId === item.id
                    );
                    if (!result) return null;

                    return (
                      <div key={item.id} className="bg-gray-50 p-4 rounded-md">
                        <h3 className="text-sm font-medium text-gray-500">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-lg">
                          {result.value} {item.unit || ''}
                        </p>
                        {result.notes && (
                          <p className="mt-1 text-sm text-gray-500">
                            {result.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 