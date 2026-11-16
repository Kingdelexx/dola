'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Rocket } from 'lucide-react';

export default function Stage4Page() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.profile?.role === 'parent' || user.role === 'parent') {
        router.push('/parent-dashboard');
      } else {
        router.replace('/python-studio');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-[#F5EFEB] flex items-center justify-center text-[#263238] font-fredoka">
      <div className="bg-[#FAF6EE] border-4 border-[#D7CCC8] p-8 rounded-3xl shadow-xl flex flex-col items-center gap-4 animate-pulse">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF9C4] border-2 border-[#FFD54F] flex items-center justify-center animate-bounce shadow-sm">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 17C4 17 8 20 14 18C20 16 21 9 21 9C21 9 18 11 14 11C10 11 6 8 4 17Z"
              fill="#FFC107"
              stroke="#FF8F00"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[#263238]">Entering Banana Tales...</h2>
      </div>
    </div>
  );
}
