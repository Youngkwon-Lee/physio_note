'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('로그아웃 성공');
      router.push('/login');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  return (
    <nav className="bg-blue-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold">
            물리치료 평가 플랫폼
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            {user && (
              <>
                <Link href="/dashboard" className="hover:text-blue-200 transition-colors">
                  대시보드
                </Link>
                <Link href="/patients" className="hover:text-blue-200 transition-colors">
                  환자 관리
                </Link>
                <Link href="/assessment" className="hover:text-blue-200 transition-colors">
                  평가
                </Link>
                <Link href="/reports" className="hover:text-blue-200 transition-colors">
                  보고서
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors"
                >
                  로그아웃
                </button>
              </>
            )}
          </div>
          
          {/* 모바일 메뉴 버튼 */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
        
        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2">
            {user ? (
              <div className="flex flex-col space-y-3">
                <Link href="/dashboard" className="hover:text-blue-200 transition-colors py-2">
                  대시보드
                </Link>
                <Link href="/patients" className="hover:text-blue-200 transition-colors py-2">
                  환자 관리
                </Link>
                <Link href="/assessment" className="hover:text-blue-200 transition-colors py-2">
                  평가
                </Link>
                <Link href="/reports" className="hover:text-blue-200 transition-colors py-2">
                  보고서
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-left transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link href="/login" className="hover:text-blue-200 transition-colors py-2">
                  로그인
                </Link>
                <Link href="/register" className="hover:text-blue-200 transition-colors py-2">
                  회원가입
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
} 