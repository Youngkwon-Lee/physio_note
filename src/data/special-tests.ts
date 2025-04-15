import { Assessment } from '@/types/assessment';

export const SpecialTestAssessments: Assessment[] = [
  // 경추부 특수검사
  {
    id: 'spurling-test',
    name: '스펄링 검사',
    name_en: 'Spurling Test',
    category: 'SpecialTest',
    type: 'Binary',
    description: '경추 신경근병증을 평가하는 검사입니다.',
    instructions: [
      '환자를 앉은 자세로 유지합니다.',
      '경추를 신전하고 환측으로 회전 및 측방 굴곡시킵니다.',
      '머리 위에서 아래로 압박을 가합니다.',
      '상지로의 방사통이 재현되면 양성입니다.'
    ],
    references: [
      'Spurling RG, Scoville WB. Lateral rupture of the cervical intervertebral discs: a common cause of shoulder and arm pain. Surg Gynecol Obstet. 1944;78:350-358.'
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'compression-test',
    name: '경추 압박 검사',
    name_en: 'Cervical Compression Test',
    category: 'SpecialTest',
    type: 'Binary',
    description: '경추 신경근 압박을 평가하는 검사입니다.',
    instructions: [
      '환자를 앉은 자세로 유지합니다.',
      '검사자는 환자의 머리 위에서 양손으로 아래방향으로 압박을 가합니다.',
      '상지로의 방사통이나 증상이 재현되면 양성입니다.'
    ],
    references: [
      'Magee DJ. Orthopedic Physical Assessment. 6th ed. St. Louis, MO: Saunders Elsevier; 2014.'
    ],
    created_at: new Date(),
    updated_at: new Date()
  },

  // 어깨 특수검사
  {
    id: 'neer-test',
    name: '니어 충돌 검사',
    name_en: 'Neer Impingement Test',
    category: 'SpecialTest',
    type: 'Binary',
    description: '어깨 충돌증후군을 평가하는 검사입니다.',
    instructions: [
      '환자를 앉은 자세로 유지합니다.',
      '검사자는 한 손으로 견갑골을 고정하고 다른 손으로 환자의 팔을 수동적으로 굴곡시킵니다.',
      '통증이 발생하면 양성입니다.'
    ],
    references: [
      'Neer CS 2nd. Anterior acromioplasty for the chronic impingement syndrome in the shoulder: a preliminary report. J Bone Joint Surg Am. 1972;54(1):41-50.'
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'hawkins-kennedy-test',
    name: '호킨스-케네디 검사',
    name_en: 'Hawkins-Kennedy Test',
    category: 'SpecialTest',
    type: 'Binary',
    description: '어깨 충돌증후군을 평가하는 검사입니다.',
    instructions: [
      '환자를 앉은 자세로 유지합니다.',
      '어깨를 90도 굴곡하고 팔꿈치를 90도 굴곡합니다.',
      '이 자세에서 어깨를 내회전시킵니다.',
      '통증이 발생하면 양성입니다.'
    ],
    references: [
      'Hawkins RJ, Kennedy JC. Impingement syndrome in athletes. Am J Sports Med. 1980;8(3):151-158.'
    ],
    created_at: new Date(),
    updated_at: new Date()
  },

  // 요추부 특수검사
  {
    id: 'slr-test',
    name: '하지직거상 검사',
    name_en: 'Straight Leg Raise Test',
    category: 'SpecialTest',
    type: 'Binary',
    description: '요추 신경근병증을 평가하는 검사입니다.',
    instructions: [
      '환자를 바로 누운 자세로 유지합니다.',
      '환자의 다리를 펴서 들어올립니다.',
      '30-70도 사이에서 하지로의 방사통이 발생하면 양성입니다.'
    ],
    references: [
      'Devillé WL, van der Windt DA, Dzaferagić A, Bezemer PD, Bouter LM. The test of Lasègue: systematic review of the accuracy in diagnosing herniated discs. Spine. 2000;25(9):1140-1147.'
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'crossed-slr-test',
    name: '교차 하지직거상 검사',
    name_en: 'Crossed Straight Leg Raise Test',
    category: 'SpecialTest',
    type: 'Binary',
    description: '요추 신경근병증의 심각도를 평가하는 검사입니다.',
    instructions: [
      '환자를 바로 누운 자세로 유지합니다.',
      '건측 다리를 들어올립니다.',
      '환측으로의 방사통이 발생하면 양성입니다.'
    ],
    references: [
      'Devillé WL, van der Windt DA, Dzaferagić A, Bezemer PD, Bouter LM. The test of Lasègue: systematic review of the accuracy in diagnosing herniated discs. Spine. 2000;25(9):1140-1147.'
    ],
    created_at: new Date(),
    updated_at: new Date()
  }
]; 