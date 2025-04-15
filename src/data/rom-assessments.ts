import { Assessment } from '@/types/assessment';
import { Timestamp } from 'firebase/firestore';

export const ROMAssessments: Assessment[] = [
  {
    id: 'cervical-flexion',
    name: '경추 굴곡',
    name_en: 'Cervical Flexion',
    category: 'ROM',
    type: 'Range',
    unit: 'degree',
    description: '경추의 굴곡 범위를 측정합니다.',
    normal_range: {
      min: 0,
      max: 45
    },
    instructions: [
      '환자를 앉은 자세로 유지합니다.',
      '턱을 가슴에 닿도록 굴곡시킵니다.',
      '각도계를 사용하여 측정합니다.'
    ],
    references: [
      'Norkin CC, White DJ. Measurement of Joint Motion: A Guide to Goniometry. 5th ed. Philadelphia, PA: F.A. Davis; 2016.'
    ],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now()
  },
  {
    id: 'cervical-extension',
    name: '경추 신전',
    name_en: 'Cervical Extension',
    category: 'ROM',
    type: 'Range',
    unit: 'degree',
    description: '경추의 신전 범위를 측정합니다.',
    normal_range: {
      min: 0,
      max: 45
    },
    instructions: [
      '환자를 앉은 자세로 유지합니다.',
      '머리를 뒤로 젖힙니다.',
      '각도계를 사용하여 측정합니다.'
    ],
    references: [
      'Norkin CC, White DJ. Measurement of Joint Motion: A Guide to Goniometry. 5th ed. Philadelphia, PA: F.A. Davis; 2016.'
    ],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now()
  },
  {
    id: 'shoulder-flexion',
    name: '어깨 굴곡',
    name_en: 'Shoulder Flexion',
    category: 'ROM',
    type: 'Range',
    unit: 'degree',
    description: '어깨 관절의 굴곡 범위를 측정합니다.',
    normal_range: {
      min: 0,
      max: 180
    },
    instructions: [
      '환자를 앉은 자세로 유지합니다.',
      '팔을 앞으로 올립니다.',
      '각도계를 사용하여 측정합니다.'
    ],
    references: [
      'Norkin CC, White DJ. Measurement of Joint Motion: A Guide to Goniometry. 5th ed. Philadelphia, PA: F.A. Davis; 2016.'
    ],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now()
  },
  {
    id: 'shoulder-abduction',
    name: '어깨 외전',
    name_en: 'Shoulder Abduction',
    category: 'ROM',
    type: 'Range',
    unit: 'degree',
    description: '어깨 관절의 외전 범위를 측정합니다.',
    normal_range: {
      min: 0,
      max: 180
    },
    instructions: [
      '환자를 앉은 자세로 유지합니다.',
      '팔을 옆으로 올립니다.',
      '각도계를 사용하여 측정합니다.'
    ],
    references: [
      'Norkin CC, White DJ. Measurement of Joint Motion: A Guide to Goniometry. 5th ed. Philadelphia, PA: F.A. Davis; 2016.'
    ],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now()
  },
  {
    id: 'knee-flexion',
    name: '무릎 굴곡',
    name_en: 'Knee Flexion',
    category: 'ROM',
    type: 'Range',
    unit: 'degree',
    description: '무릎 관절의 굴곡 범위를 측정합니다.',
    normal_range: {
      min: 0,
      max: 135
    },
    instructions: [
      '환자를 앉은 자세로 유지합니다.',
      '무릎을 굽힙니다.',
      '각도계를 사용하여 측정합니다.'
    ],
    references: [
      'Norkin CC, White DJ. Measurement of Joint Motion: A Guide to Goniometry. 5th ed. Philadelphia, PA: F.A. Davis; 2016.'
    ],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now()
  },
  {
    id: 'knee-extension',
    name: '무릎 신전',
    name_en: 'Knee Extension',
    category: 'ROM',
    type: 'Range',
    unit: 'degree',
    description: '무릎 관절의 신전 범위를 측정합니다.',
    normal_range: {
      min: 0,
      max: 0
    },
    instructions: [
      '환자를 앉은 자세로 유지합니다.',
      '무릎을 펴줍니다.',
      '각도계를 사용하여 측정합니다.'
    ],
    references: [
      'Norkin CC, White DJ. Measurement of Joint Motion: A Guide to Goniometry. 5th ed. Philadelphia, PA: F.A. Davis; 2016.'
    ],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now()
  }
]; 