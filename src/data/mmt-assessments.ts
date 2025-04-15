import { Assessment } from '@/types/assessment';

export const MMTAssessments: Assessment[] = [
  // 경추부
  {
    id: 'cervical-flexors',
    name: '경추 굴곡근',
    name_en: 'Cervical Flexors',
    category: 'MMT',
    type: 'Grade',
    description: '경추 굴곡근의 근력을 평가합니다.',
    instructions: [
      '환자를 바로 누운 자세로 유지합니다.',
      '머리를 들어올리도록 지시합니다.',
      'MMT 등급에 따라 평가합니다.'
    ],
    references: [
      'Kendall FP, McCreary EK, Provance PG, et al. Muscles: Testing and Function with Posture and Pain. 5th ed. Baltimore, MD: Lippincott Williams & Wilkins; 2005.'
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'cervical-extensors',
    name: '경추 신전근',
    name_en: 'Cervical Extensors',
    category: 'MMT',
    type: 'Grade',
    description: '경추 신전근의 근력을 평가합니다.',
    instructions: [
      '환자를 엎드린 자세로 유지합니다.',
      '머리를 들어올리도록 지시합니다.',
      'MMT 등급에 따라 평가합니다.'
    ],
    references: [
      'Kendall FP, McCreary EK, Provance PG, et al. Muscles: Testing and Function with Posture and Pain. 5th ed. Baltimore, MD: Lippincott Williams & Wilkins; 2005.'
    ],
    created_at: new Date(),
    updated_at: new Date()
  },

  // 어깨
  {
    id: 'shoulder-flexors',
    name: '어깨 굴곡근',
    name_en: 'Shoulder Flexors',
    category: 'MMT',
    type: 'Grade',
    description: '어깨 굴곡근(전삼각근, 대흉근)의 근력을 평가합니다.',
    instructions: [
      '환자를 앉은 자세로 유지합니다.',
      '팔을 앞으로 들어올리도록 지시합니다.',
      '저항을 주어 근력을 평가합니다.'
    ],
    references: [
      'Kendall FP, McCreary EK, Provance PG, et al. Muscles: Testing and Function with Posture and Pain. 5th ed. Baltimore, MD: Lippincott Williams & Wilkins; 2005.'
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'shoulder-abductors',
    name: '어깨 외전근',
    name_en: 'Shoulder Abductors',
    category: 'MMT',
    type: 'Grade',
    description: '어깨 외전근(중삼각근)의 근력을 평가합니다.',
    instructions: [
      '환자를 앉은 자세로 유지합니다.',
      '팔을 옆으로 들어올리도록 지시합니다.',
      '저항을 주어 근력을 평가합니다.'
    ],
    references: [
      'Kendall FP, McCreary EK, Provance PG, et al. Muscles: Testing and Function with Posture and Pain. 5th ed. Baltimore, MD: Lippincott Williams & Wilkins; 2005.'
    ],
    created_at: new Date(),
    updated_at: new Date()
  },

  // 팔꿈치
  {
    id: 'elbow-flexors',
    name: '팔꿈치 굴곡근',
    name_en: 'Elbow Flexors',
    category: 'MMT',
    type: 'Grade',
    description: '팔꿈치 굴곡근(이두근)의 근력을 평가합니다.',
    instructions: [
      '환자를 앉은 자세로 유지합니다.',
      '팔꿈치를 구부리도록 지시합니다.',
      '저항을 주어 근력을 평가합니다.'
    ],
    references: [
      'Kendall FP, McCreary EK, Provance PG, et al. Muscles: Testing and Function with Posture and Pain. 5th ed. Baltimore, MD: Lippincott Williams & Wilkins; 2005.'
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'elbow-extensors',
    name: '팔꿈치 신전근',
    name_en: 'Elbow Extensors',
    category: 'MMT',
    type: 'Grade',
    description: '팔꿈치 신전근(삼두근)의 근력을 평가합니다.',
    instructions: [
      '환자를 앉은 자세로 유지합니다.',
      '팔꿈치를 펴도록 지시합니다.',
      '저항을 주어 근력을 평가합니다.'
    ],
    references: [
      'Kendall FP, McCreary EK, Provance PG, et al. Muscles: Testing and Function with Posture and Pain. 5th ed. Baltimore, MD: Lippincott Williams & Wilkins; 2005.'
    ],
    created_at: new Date(),
    updated_at: new Date()
  },

  // 고관절
  {
    id: 'hip-flexors',
    name: '고관절 굴곡근',
    name_en: 'Hip Flexors',
    category: 'MMT',
    type: 'Grade',
    description: '고관절 굴곡근(장요근)의 근력을 평가합니다.',
    instructions: [
      '환자를 바로 누운 자세로 유지합니다.',
      '다리를 들어올리도록 지시합니다.',
      '저항을 주어 근력을 평가합니다.'
    ],
    references: [
      'Kendall FP, McCreary EK, Provance PG, et al. Muscles: Testing and Function with Posture and Pain. 5th ed. Baltimore, MD: Lippincott Williams & Wilkins; 2005.'
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'hip-extensors',
    name: '고관절 신전근',
    name_en: 'Hip Extensors',
    category: 'MMT',
    type: 'Grade',
    description: '고관절 신전근(대둔근)의 근력을 평가합니다.',
    instructions: [
      '환자를 엎드린 자세로 유지합니다.',
      '다리를 들어올리도록 지시합니다.',
      '저항을 주어 근력을 평가합니다.'
    ],
    references: [
      'Kendall FP, McCreary EK, Provance PG, et al. Muscles: Testing and Function with Posture and Pain. 5th ed. Baltimore, MD: Lippincott Williams & Wilkins; 2005.'
    ],
    created_at: new Date(),
    updated_at: new Date()
  }
]; 