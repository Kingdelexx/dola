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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100 font-sans">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-pulse">
        <Rocket className="text-purple-400 animate-bounce" size={48} />
        <h2 className="text-lg font-black text-slate-200">Entering Python Pro Studio...</h2>
      </div>
    </div>
  );
}
