import { Diagnosis } from '@/types/diagnosis';

export const MSDDiagnoses: Partial<Diagnosis>[] = [
  {
    id: 'cervical-headache',
    name: '경추성 두통',
    name_en: 'Cervicogenic Headache',
    category: 'MSD',
    subCategory: 'Cervical',
    description: '경추의 구조적, 기능적 문제로 인한 두통',
    ICF_codes: {
      body_function: ['b28010', 'b7101'],
      body_structure: ['s7103', 's7104'],
      activity: ['d4150', 'd4154']
    },
    recommended_assessments: [
      'cervical-rom',
      'cervical-mmt',
      'cranio-cervical-flexion',
      'cervical-joint-mobility',
      'cervical-position-sense'
    ],
    red_flags: [
      '심한 두통과 함께 구토 발생',
      '시야 장애 또는 복시',
      '발열을 동반한 후경부 통증',
      '의식 변화'
    ],
    yellow_flags: [
      '스트레스나 불안',
      '수면 장애',
      '업무 관련 스트레스'
    ],
    evidence_level: 'A',
    references: [
      'Jull G, et al. (2019). Management of Neck Pain Disorders',
      'IFOMPT Cervical Framework (2020)'
    ]
  },
  {
    id: 'lumbar-radiculopathy',
    name: '요추 신경근병증',
    name_en: 'Lumbar Radiculopathy',
    category: 'MSD',
    subCategory: 'Lumbar',
    description: '요추 신경근의 압박 또는 자극으로 인한 방사통',
    ICF_codes: {
      body_function: ['b28015', 'b7101', 'b7300'],
      body_structure: ['s7601', 's7602', 's1201'],
      activity: ['d4105', 'd4153', 'd4154']
    },
    recommended_assessments: [
      'slr-test',
      'lumbar-rom',
      'lumbar-mmt',
      'sensory-test',
      'reflex-test',
      'oswestry-disability-index'
    ],
    red_flags: [
      '마미증후군 증상',
      '진행성 신경학적 결손',
      '원인불명의 체중감소',
      '배뇨/배변 장애'
    ],
    yellow_flags: [
      '통증에 대한 과도한 두려움',
      '우울감',
      '직업 만족도 저하'
    ],
    evidence_level: 'A',
    references: [
      'Clinical Practice Guidelines Linked to the International Classification of Functioning, Disability, and Health from the Orthopaedic Section of the American Physical Therapy Association (2012)',
      'NICE Guidelines for Low Back Pain and Sciatica (2020)'
    ]
  },
  {
    id: 'shoulder-impingement',
    name: '어깨 충돌 증후군',
    name_en: 'Shoulder Impingement Syndrome',
    category: 'MSD',
    subCategory: 'Shoulder',
    description: '회전근개와 상완이두근이 견봉하 공간에서 압박되는 상태',
    ICF_codes: {
      body_function: ['b28016', 'b7100', 'b7200'],
      body_structure: ['s7201', 's7208'],
      activity: ['d4452', 'd4454']
    },
    recommended_assessments: [
      'shoulder-rom',
      'shoulder-mmt',
      'neer-test',
      'hawkins-kennedy-test',
      'empty-can-test',
      'spadi'
    ],
    red_flags: [
      '야간통 지속',
      '원인불명의 체중감소',
      '이전 암 병력'
    ],
    yellow_flags: [
      '과사용',
      '부적절한 작업 자세',
      '스트레스'
    ],
    evidence_level: 'B',
    references: [
      'Shoulder Disorders Guideline (2013)',
      'JOSPT Clinical Practice Guidelines (2018)'
    ]
  }
]; 