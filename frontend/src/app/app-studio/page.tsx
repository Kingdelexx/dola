'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppPlayground from '@/components/app-studio/AppPlayground';
import LizzyChat from '@/components/LizzyChat';
import Link from 'next/link';
import { ArrowLeft, Rocket, Sparkles, Smartphone } from 'lucide-react';
import PaywallGuard from '@/components/subscription/PaywallGuard';

export default function AppStudioPage() {
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100 font-sans">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-pulse">
          <Rocket className="text-purple-400 animate-bounce" size={48} />
          <h2 className="text-lg font-black text-slate-200">Preparing DolaCode App Dev Studio...</h2>
        </div>
      </div>
    );
  }

  return (
    <PaywallGuard feature="app_studio">
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans overflow-hidden">
        {/* Top Header Navigation bar for App Studio */}
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
              <span className="text-lg">📱</span>
              <span className="font-extrabold text-sm md:text-base text-white tracking-wide">
                App Dev Studio
              </span>
              <span className="text-[10px] uppercase font-black tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full hidden sm:inline-block">
                World 5
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-full text-xs font-bold text-purple-400">
              <Sparkles size={14} className="animate-spin" />
              <span>Mobile Screens &amp; Events</span>
            </div>
          </div>
        </div>

        {/* Interactive App Playground Component */}
        <div className="flex-1 overflow-hidden">
          <AppPlayground />
        </div>

        {/* Lizzy AI Tutor Floating Chatbot */}
        <LizzyChat 
          stage={5}
          contextInfo="World 5 — App Dev Studio: Kids build mobile phone apps across 5 classes: Class 1 (App Builder Playground - screens, dragging buttons, pictures, labels, inputs for 'My First Hello App'), Class 2 (Magic Button Lab - events/actions, WHEN button tapped -> funny sounds, reactions, counters for 'Funny Soundboard App'), Class 3 (Smart Pet App - variables, conditions, state: happiness, hunger, energy for 'My Virtual Pet'), Class 4 (Quiz & Game Factory - multi-screen navigation, questions, scoring for 'My Own Quiz App'), and Class 5 (App Inventor Challenge - useful independent apps: Savings Tracker in Nigerian Naira ₦, Study Planner, Homework Organiser, Reading Tracker with shareable preview link). Encourage them playfully and guide them step-by-step!"
        />
      </div>
    </PaywallGuard>
  );
}
