'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PythonPlayground from '@/components/python-studio/PythonPlayground';
import LizzyChat from '@/components/LizzyChat';
import Link from 'next/link';
import { ArrowLeft, Rocket, Sparkles, Terminal } from 'lucide-react';
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100 font-sans">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-pulse">
          <Terminal className="text-purple-400 animate-bounce" size={48} />
          <h2 className="text-lg font-black text-slate-200">Preparing DolaCode Python Pro Studio...</h2>
        </div>
      </div>
    );
  }

  return (
    <PaywallGuard feature="stage4">
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans overflow-hidden">
        {/* Top Header Navigation bar */}
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
              <span className="text-lg">🐍</span>
              <span className="font-extrabold text-sm md:text-base text-white tracking-wide">
                Python Pro
              </span>
              <span className="text-[10px] uppercase font-black tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full hidden sm:inline-block">
                World 3
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-full text-xs font-bold text-purple-400">
              <Sparkles size={14} className="animate-spin" />
              <span>Code-Control Game Animation</span>
            </div>
          </div>
        </div>

        {/* Interactive Python Playground Component */}
        <div className="flex-1 overflow-hidden">
          <PythonPlayground />
        </div>

        {/* Lizzy AI Tutor Floating Chatbot */}
        <LizzyChat 
          stage={3}
          contextInfo="World 3 — Python Pro: Kids learn real typed Python through code-controlled game animations across 5 classes: Class 1 (Robo Motion Island - Statements & Sequencing: hero.move_right(), hero.jump(), hero.collect(), hero.say()), Class 2 (Power Loop Realm - For loops & Repetition: for step in range(5): hero.build_bridge()), Class 3 (Variable Vault - Variables & Math: coins = coins + 25, coins = coins - 15, buy_item, unlock_vault), Class 4 (Decision Dungeon - Conditionals: if color == 'red': hero.use_laser()), and Class 5 (Code Master Challenge - Custom functions: def attack_combo():, def super_defense():, and defeating the Cyber Dragon boss). Explain concepts playfully, keep tips concise, and guide them line-by-line without giving away full code!"
        />
      </div>
    </PaywallGuard>
  );
}
