import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp,
  CollectionReference,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { Patient, PatientDocument } from '@/types/patient';
import { toast } from 'react-hot-toast';

const PATIENTS_COLLECTION = 'patients';

// Firestore 컬렉션 참조
const patientsCollection = collection(db, PATIENTS_COLLECTION) as CollectionReference<PatientDocument>;

// 문서 데이터 변환 함수
const convertPatientDoc = (doc: QueryDocumentSnapshot<PatientDocument>): Patient => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};

// 환자 목록 조회
export const getPatients = async (userId: string): Promise<Patient[]> => {
  try {
    const q = query(
      patientsCollection,
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertPatientDoc);
  } catch (error) {
    console.error('환자 목록 조회 오류:', error);
    toast.error('환자 목록을 불러오는 중 오류가 발생했습니다.');
    throw error;
  }
};

// 환자 상세 조회
export const getPatient = async (id: string): Promise<Patient | null> => {
  try {
    const docRef = doc(patientsCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertPatientDoc(docSnap as QueryDocumentSnapshot<PatientDocument>);
    }
    return null;
  } catch (error) {
    console.error('환자 조회 오류:', error);
    toast.error('환자 정보를 불러오는 중 오류가 발생했습니다.');
    throw error;
  }
};

// 환자 추가
export const addPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(patientsCollection, {
      ...patientData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    toast.success('환자 정보가 성공적으로 추가되었습니다.');
    return docRef.id;
  } catch (error) {
    console.error('환자 추가 오류:', error);
    toast.error('환자 정보를 추가하는 중 오류가 발생했습니다.');
    throw error;
  }
};

// 환자 정보 수정
export const updatePatient = async (id: string, patientData: Partial<Patient>): Promise<void> => {
  try {
    const docRef = doc(patientsCollection, id);
    await updateDoc(docRef, {
      ...patientData,
      updatedAt: Timestamp.now(),
    });
    
    toast.success('환자 정보가 성공적으로 수정되었습니다.');
  } catch (error) {
    console.error('환자 수정 오류:', error);
    toast.error('환자 정보를 수정하는 중 오류가 발생했습니다.');
    throw error;
  }
};

// 환자 삭제
export const deletePatient = async (id: string): Promise<void> => {
  try {
    const docRef = doc(patientsCollection, id);
    await deleteDoc(docRef);
    
    toast.success('환자 정보가 성공적으로 삭제되었습니다.');
  } catch (error) {
    console.error('환자 삭제 오류:', error);
    toast.error('환자 정보를 삭제하는 중 오류가 발생했습니다.');
    throw error;
  }
}; 