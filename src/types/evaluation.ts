export interface Evaluation {
  id: string;
  patientId: string;
  date: Date;
  evaluatorId: string;
  evaluatorName: string;
  type: 'initial' | 'progress' | 'final';
  status: 'pending' | 'completed';
  results: {
    [key: string]: {
      value: number | string;
      unit?: string;
      notes?: string;
    };
  };
  notes?: string;
  recommendations?: string[];
  nextEvaluationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvaluationTemplate {
  id: string;
  name: string;
  description: string;
  fields: {
    [key: string]: {
      label: string;
      type: 'number' | 'text' | 'select';
      unit?: string;
      options?: string[];
      required: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
} 