import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// 환경 변수가 없을 경우 테스트용 값 사용 (개발용, 실제 배포 시 제거 필요)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAEvwZUGPpKVNeY7Dd4-uT8S_YkcMobOtU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "physio-digital-platform.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "physio-digital-platform",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "physio-digital-platform.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "211619609597",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:211619609597:web:f60d00cb8b225d6441f794",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-E1SEHW1HF8"
};

console.log('Firebase 설정:', { ...firebaseConfig, apiKey: 'API_KEY_HIDDEN' });

// Firebase 앱이 이미 초기화되어 있지 않은 경우에만 초기화
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, db, auth, analytics }; 