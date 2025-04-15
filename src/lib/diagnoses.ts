import { collection, getDocs, query, where, addDoc, doc, getDoc, deleteDoc, Timestamp, CollectionReference, updateDoc, Query } from 'firebase/firestore';
import { db } from './firebase';
import { Diagnosis, DiagnosisFilter, DiagnosisDocument } from '../types/diagnosis';
import { MSDDiagnoses } from '../data/msd-diagnoses';
import { toast } from 'react-hot-toast';

// Firestore 컬렉션 레퍼런스
const DIAGNOSES_COLLECTION = 'diagnoses';

// Firestore 컬렉션 참조
const diagnosesCollection = collection(db, DIAGNOSES_COLLECTION) as CollectionReference<DiagnosisDocument>;

/**
 * Firestore에 초기 진단 데이터를 추가합니다. 데이터가 없을 경우에만 추가합니다.
 */
export const initializeDiagnosesData = async (): Promise<void> => {
  try {
    // 기존 데이터 확인
    const existingData = await getDocs(diagnosesCollection);
    
    if (existingData.empty) {
      console.log('진단 데이터 초기화 시작');
      
      // 기존 데이터가 없을 경우 MSDDiagnoses 데이터를 추가
      const addPromises = MSDDiagnoses.map(async (diagnosis) => {
        // id 필드는 Firestore에서 자동 생성되므로 제외
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...diagnosisWithoutId } = diagnosis;
        
        // 필수 필드가 있는지 확인하고 추가
        const diagnosisDoc = {
          ...diagnosisWithoutId,
          name: diagnosisWithoutId.name || '',
          category: diagnosisWithoutId.category || 'MSD',
          ICF_codes: diagnosisWithoutId.ICF_codes || { body_function: [], body_structure: [], activity: [] },
          recommended_assessments: diagnosisWithoutId.recommended_assessments || [],
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        };
        
        return await addDoc(diagnosesCollection, diagnosisDoc);
      });
      
      await Promise.all(addPromises);
      console.log('진단 데이터 초기화 완료');
      toast.success('진단 데이터가 성공적으로 초기화되었습니다.');
    } else {
      console.log('진단 데이터가 이미 존재합니다');
    }
  } catch (error) {
    console.error('진단 데이터 초기화 오류:', error);
    toast.error('진단 데이터를 초기화하는 중 오류가 발생했습니다.');
    throw error;
  }
};

/**
 * 필터 조건에 맞는 진단 목록을 조회합니다.
 */
export const getDiagnoses = async (filter?: DiagnosisFilter): Promise<Diagnosis[]> => {
  try {
    let q: Query<DiagnosisDocument> = diagnosesCollection;
    
    if (filter) {
      if (filter.category) {
        q = query(diagnosesCollection, where('category', '==', filter.category));
      }
      
      if (filter.subCategory) {
        q = query(q, where('subCategory', '==', filter.subCategory));
      }
      
      if (filter.evidence_level) {
        q = query(q, where('evidence_level', '==', filter.evidence_level));
      }
    }
    
    const querySnapshot = await getDocs(q);
    
    // Firestore의 Timestamp를 JavaScript Date로 변환
    const diagnoses = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        created_at: data.created_at.toDate(),
        updated_at: data.updated_at.toDate()
      } as Diagnosis;
    });
    
    // 검색어 필터링 (클라이언트 사이드에서 수행)
    if (filter?.searchTerm) {
      const searchTermLower = filter.searchTerm.toLowerCase();
      return diagnoses.filter(diagnosis => {
        return (
          (diagnosis.name && diagnosis.name.toLowerCase().includes(searchTermLower)) ||
          (diagnosis.name_en && diagnosis.name_en.toLowerCase().includes(searchTermLower)) ||
          (diagnosis.description && diagnosis.description.toLowerCase().includes(searchTermLower))
        );
      });
    }
    
    return diagnoses;
  } catch (error) {
    console.error('진단 조회 오류:', error);
    toast.error('진단 목록을 불러오는 중 오류가 발생했습니다.');
    return [];
  }
};

/**
 * ID로 특정 진단을 조회합니다.
 */
export const getDiagnosisById = async (id: string): Promise<Diagnosis | null> => {
  try {
    const docRef = doc(diagnosesCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        created_at: data.created_at.toDate(),
        updated_at: data.updated_at.toDate()
      } as Diagnosis;
    } else {
      console.log('해당 ID의 진단을 찾을 수 없습니다:', id);
      toast.error('해당 진단을 찾을 수 없습니다.');
      return null;
    }
  } catch (error) {
    console.error('진단 조회 오류:', error);
    toast.error('진단 정보를 불러오는 중 오류가 발생했습니다.');
    return null;
  }
};

// 진단 추가
export const addDiagnosis = async (diagnosis: Omit<Diagnosis, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, DIAGNOSES_COLLECTION), {
      ...diagnosis,
      created_at: Timestamp.fromDate(new Date()),
      updated_at: Timestamp.fromDate(new Date())
    });
    
    toast.success('새 진단이 추가되었습니다.');
    return docRef.id;
  } catch (error) {
    console.error('진단 추가 중 오류 발생:', error);
    toast.error('진단을 추가하는 중 오류가 발생했습니다.');
    return null;
  }
};

// 진단 수정
export const updateDiagnosis = async (id: string, data: Partial<Omit<DiagnosisDocument, 'created_at'>>): Promise<void> => {
  try {
    const docRef = doc(diagnosesCollection, id);
    const updateData = {
      ...data,
      updated_at: Timestamp.now()
    };
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('진단 정보 업데이트 중 오류 발생:', error);
    throw error;
  }
};

// 진단 삭제
export const deleteDiagnosis = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, DIAGNOSES_COLLECTION, id);
    await deleteDoc(docRef);
    toast.success('진단이 삭제되었습니다.');
    return true;
  } catch (error) {
    console.error('진단 삭제 중 오류 발생:', error);
    toast.error('진단을 삭제하는 중 오류가 발생했습니다.');
    return false;
  }
}; 