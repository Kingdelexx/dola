'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import WebPlayground from '@/components/WebPlayground';
import LizzyChat from '@/components/LizzyChat';
import Link from 'next/link';
import { ArrowLeft, Rocket, Sparkles } from 'lucide-react';

export default function WebStudioPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.profile?.role === 'parent') {
        router.push('/parent-dashboard');
      } else if (user.profile?.role === 'student') {
        const hasClassroom = !!user.profile?.classroom;
        const hasStartingScore = user.profile?.starting_score !== null && user.profile?.starting_score !== undefined;
        if (!hasStartingScore && !hasClassroom) {
          router.push('/onboarding/challenge');
        }
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100 font-sans">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-pulse">
          <Rocket className="text-amber-400 animate-bounce" size={48} />
          <h2 className="text-lg font-black text-slate-200">Preparing Dolacode Web Studio...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans overflow-hidden">
      {/* Top Header Navigation bar for Web Studio */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700 active:scale-95 shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </Link>
          <div className="h-5 w-px bg-slate-800 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🌐</span>
            <span className="font-extrabold text-sm md:text-base text-white tracking-wide">
              Web Dev Studio
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-bold text-amber-400">
            <Sparkles size={14} className="animate-spin" />
            <span>HTML & CSS Explorer</span>
          </div>
        </div>
      </div>

      {/* Interactive Web Playground Component */}
      <div className="flex-1 overflow-hidden">
        <WebPlayground />
      </div>

      {/* Lizzy AI Tutor Floating Chatbot */}
      <LizzyChat 
        stage={4}
        contextInfo="Web Dev Studio: Kids writing HTML and CSS code side-by-side with live iframe preview. Help them with HTML tags like <h1>, <p>, <img>, <button> and CSS properties like background, color, border, padding, and text-align."
      />
    </div>
  );
}
