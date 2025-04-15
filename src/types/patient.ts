import { Timestamp } from 'firebase/firestore';

export interface Patient {
  id?: string;
  userId: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string;
  phoneNumber: string;
  address?: string;
  medicalHistory?: string;
  medications?: string;
  allergies?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientFormData extends Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> {}

export interface PatientDocument extends Omit<Patient, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FormErrors {
  [key: string]: string;
} 