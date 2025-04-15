import { collection, getDocs, query, where, addDoc, serverTimestamp, doc, getDoc, QueryDocumentSnapshot, DocumentData, Query, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { db } from './firebase';
import { Assessment, AssessmentFilter, AssessmentResult } from '@/types/assessment';
import toast from 'react-hot-toast';
import { ROMAssessments } from '@/data/rom-assessments';
import { MMTAssessments } from '@/data/mmt-assessments';
import { SpecialTestAssessments } from '@/data/special-tests';
import { Diagnosis } from '@/types';
import { Timestamp } from 'firebase/firestore';

// Firestore 컬렉션 레퍼런스
const ASSESSMENTS_COLLECTION = 'assessments';
const ASSESSMENT_RESULTS_COLLECTION = 'assessment_results';

// 평가 항목 문서 데이터 변환 함수
const convertAssessmentDoc = (doc: QueryDocumentSnapshot<DocumentData>): Assessment => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    created_at: data.created_at?.toDate() || new Date(),
    updated_at: data.updated_at?.toDate() || new Date(),
  } as Assessment;
};

// 평가 결과 문서 데이터 변환 함수
const convertAssessmentResultDoc = (doc: QueryDocumentSnapshot<DocumentData>): AssessmentResult => {
  const data = doc.data();
  return {
    id: doc.id,
    assessment_id: data.assessment_id || '',
    sessionId: data.sessionId || '',
    patientId: data.patientId || '',
    value: data.value || '',
    notes: data.notes,
    date: data.date?.toDate() || new Date(),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

// 평가 항목 데이터 초기화 (관리자 전용)
export async function initializeAssessmentsData() {
  try {
    const assessmentsRef = collection(db, ASSESSMENTS_COLLECTION);
    
    // 기존 데이터가 있는지 확인
    const snapshot = await getDocs(assessmentsRef);
    if (!snapshot.empty) {
      console.log('평가 항목 데이터가 이미 존재합니다.');
      return false;
    }

    // 모든 평가 항목을 합침
    const allAssessments = [
      ...ROMAssessments,
      ...MMTAssessments,
      ...SpecialTestAssessments
    ];

    // 초기 데이터 추가
    const timestamp = serverTimestamp();
    const promises = allAssessments.map(assessment => 
      addDoc(assessmentsRef, {
        ...assessment,
        created_at: timestamp,
        updated_at: timestamp,
      })
    );

    await Promise.all(promises);
    console.log('평가 항목 데이터 초기화 완료');
    toast.success('평가 항목 데이터가 성공적으로 초기화되었습니다.');
    return true;
  } catch (error) {
    console.error('평가 항목 데이터 초기화 실패:', error);
    toast.error('평가 항목 데이터 초기화에 실패했습니다.');
    throw error;
  }
}

// 평가 항목 목록 조회
export async function getAssessments(filter?: AssessmentFilter): Promise<Assessment[]> {
  try {
    let q: Query = collection(db, ASSESSMENTS_COLLECTION);
    
    // 필터 적용
    if (filter?.category) {
      q = query(q, where('category', '==', filter.category));
    }
    if (filter?.type) {
      q = query(q, where('type', '==', filter.type));
    }

    const snapshot = await getDocs(q);
    
    // 검색어로 클라이언트 측 필터링
    let results = snapshot.docs.map(convertAssessmentDoc);
    
    if (filter?.searchTerm && filter.searchTerm.trim() !== '') {
      const term = filter.searchTerm.toLowerCase().trim();
      results = results.filter(assessment => 
        assessment.name?.toLowerCase().includes(term) ||
        assessment.name_en?.toLowerCase().includes(term) ||
        assessment.description?.toLowerCase().includes(term)
      );
    }
    
    return results;
  } catch (error) {
    console.error('평가 항목 목록 조회 실패:', error);
    toast.error('평가 항목 목록을 불러오는데 실패했습니다.');
    // 임시로 ROM 데이터 반환
    return ROMAssessments;
  }
}

// 진단에 대한 추천 평가 항목 조회
export async function getRecommendedAssessments(diagnosisId: string): Promise<Assessment[]> {
  try {
    // 1. 먼저 진단 정보에서 recommended_assessments 배열을 가져옴
    const diagnosisRef = doc(db, 'diagnoses', diagnosisId);
    const diagnosisSnap = await getDoc(diagnosisRef);
    
    if (!diagnosisSnap.exists()) {
      throw new Error('진단 정보를 찾을 수 없습니다.');
    }
    
    const diagnosisData = diagnosisSnap.data();
    const recommendedIds = diagnosisData?.recommended_assessments || [];
    
    if (recommendedIds.length === 0) {
      return [];
    }
    
    // 2. recommended_assessments에 있는 ID로 평가 항목 조회
    const assessmentsSnapshot = await getDocs(collection(db, ASSESSMENTS_COLLECTION));
    const allAssessments = assessmentsSnapshot.docs.map(convertAssessmentDoc);
    
    // ID가 일치하는 항목만 필터링
    const recommendedAssessments = allAssessments.filter(
      assessment => recommendedIds.includes(assessment.id)
    );
    
    return recommendedAssessments;
  } catch (error) {
    console.error('추천 평가 항목 조회 실패:', error);
    toast.error('추천 평가 항목을 불러오는데 실패했습니다.');
    throw error;
  }
}

// 평가 항목 상세 조회
export async function getAssessmentById(id: string): Promise<Assessment | null> {
  try {
    const docRef = doc(db, ASSESSMENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return convertAssessmentDoc(docSnap as unknown as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    console.error('평가 항목 상세 조회 실패:', error);
    toast.error('평가 항목 정보를 불러오는데 실패했습니다.');
    throw error;
  }
}

// 평가 항목 추가
export async function addAssessment(assessment: Omit<Assessment, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  try {
    const assessmentRef = collection(db, ASSESSMENTS_COLLECTION);
    const docRef = await addDoc(assessmentRef, {
      ...assessment,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    
    toast.success('평가 항목이 추가되었습니다.');
    return docRef.id;
  } catch (error) {
    console.error('평가 항목 추가 실패:', error);
    toast.error('평가 항목 추가에 실패했습니다.');
    throw error;
  }
}

// 평가 결과 저장
export async function saveAssessmentResult(
  result: Omit<AssessmentResult, "id" | "created_at" | "updated_at">
): Promise<string> {
  try {
    const now = Timestamp.now()
    const docRef = await addDoc(collection(db, "assessment_results"), {
      ...result,
      created_at: now,
      updated_at: now
    })
    return docRef.id
  } catch (error) {
    console.error("평가 결과 저장 실패:", error)
    throw new Error("평가 결과를 저장하는데 실패했습니다.")
  }
}

// 환자별 평가 결과 조회
export async function getPatientAssessmentResults(patientId: string) {
  try {
    const resultsRef = collection(db, ASSESSMENT_RESULTS_COLLECTION);
    const q = query(
      resultsRef,
      where('patientId', '==', patientId),
      orderBy('created_at', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AssessmentResult[];
  } catch (error) {
    console.error('평가 결과 조회 실패:', error);
    toast.error('평가 결과를 불러오는데 실패했습니다.');
    throw error;
  }
}

// 세션별 평가 결과 조회
export async function getSessionAssessmentResults(sessionId: string) {
  try {
    const resultsRef = collection(db, ASSESSMENT_RESULTS_COLLECTION);
    const q = query(
      resultsRef,
      where('sessionId', '==', sessionId),
      orderBy('created_at', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AssessmentResult[];
  } catch (error) {
    console.error('세션 평가 결과 조회 실패:', error);
    toast.error('세션의 평가 결과를 불러오는데 실패했습니다.');
    throw error;
  }
}

// 특정 평가 항목의 결과 이력 조회
export async function getAssessmentHistory(patientId: string, assessmentId: string) {
  try {
    const resultsRef = collection(db, ASSESSMENT_RESULTS_COLLECTION);
    const q = query(
      resultsRef,
      where('patientId', '==', patientId),
      where('assessment_id', '==', assessmentId),
      orderBy('created_at', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AssessmentResult[];
  } catch (error) {
    console.error('평가 이력 조회 실패:', error);
    toast.error('평가 이력을 불러오는데 실패했습니다.');
    throw error;
  }
}

// 최근 평가 결과 조회
export async function getLatestAssessmentResult(patientId: string, assessmentId: string) {
  try {
    const resultsRef = collection(db, ASSESSMENT_RESULTS_COLLECTION);
    const q = query(
      resultsRef,
      where('patientId', '==', patientId),
      where('assessment_id', '==', assessmentId),
      orderBy('created_at', 'desc'),
      firestoreLimit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as AssessmentResult;
  } catch (error) {
    console.error('최근 평가 결과 조회 실패:', error);
    toast.error('최근 평가 결과를 불러오는데 실패했습니다.');
    throw error;
  }
}

export async function getDiagnosisById(diagnosisId: string): Promise<Diagnosis | null> {
  try {
    const diagnosisDoc = await getDoc(doc(db, 'diagnoses', diagnosisId));
    if (!diagnosisDoc.exists()) {
      return null;
    }
    return {
      id: diagnosisDoc.id,
      ...diagnosisDoc.data(),
      createdAt: diagnosisDoc.data().createdAt?.toDate(),
      updatedAt: diagnosisDoc.data().updatedAt?.toDate(),
    } as Diagnosis;
  } catch (err) {
    console.error('진단 정보 조회 실패:', err);
    return null;
  }
} 