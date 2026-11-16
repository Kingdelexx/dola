'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BananaTalesGame from '@/components/banana-tales/BananaTalesGame';
import LizzyChat from '@/components/LizzyChat';
import PaywallGuard from '@/components/subscription/PaywallGuard';

export default function PythonStudioPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.profile?.role === 'parent' || user.role === 'parent') {
        router.push('/parent-dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
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
          <h2 className="text-lg font-bold text-[#263238]">Entering Banana Tales Jungle...</h2>
          <p className="text-xs text-[#8D6E63] font-medium">Preparing Python Engine &amp; 60fps Canvas</p>
        </div>
      </div>
    );
  }

  return (
    <PaywallGuard feature="stage4">
      <div className="min-h-screen bg-[#F5EFEB] flex flex-col overflow-hidden font-fredoka">
        {/* Full Banana Tales Frontend Shell & 60fps Canvas Engine */}
        <div className="flex-1 overflow-hidden">
          <BananaTalesGame />
        </div>

        {/* Lizzy AI Coding Tutor Chatbot */}
        <LizzyChat 
          stage={3}
          contextInfo="World 3 — Banana Tales: Kids learn real Python coding inspired by CodeMonkey's Banana Tales! They control a monkey character to navigate a 10x8 jungle grid, cross wooden bridges, dodge deep water and bushes, and collect golden bananas using monkey.step(n), monkey.turn('left'|'right'|'up'|'down'), for i in range(n): loops, and monkey.jump(). Guide them with encouraging, gentle hints and celebrate when they write clean, loop-optimized code!"
        />
      </div>
    </PaywallGuard>
  );
}
