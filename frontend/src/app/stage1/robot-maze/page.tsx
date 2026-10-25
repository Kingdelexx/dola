'use client';

import React from 'react';
import Link from 'next/link';
import RobotMaze from '@/components/robot-maze/RobotMaze';
import { ArrowLeft, Bot } from 'lucide-react';

export default function RobotMazePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-50 p-3 sm:p-6 flex flex-col justify-between">
      {/* Navigation Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between mb-4">
        <Link
          href="/stage1"
          className="text-teal-700 hover:text-teal-900 font-black flex items-center gap-2 text-xs sm:text-sm bg-white/90 px-4 py-2 rounded-full border-2 border-teal-200 shadow-xs transition-all hover:scale-105"
        >
          <ArrowLeft size={16} /> Back to Stage 1 Numeracy
        </Link>
        <Link
          href="/dashboard"
          className="text-slate-600 hover:text-slate-800 font-bold text-xs sm:text-sm bg-white/80 px-4 py-2 rounded-full border border-slate-200 shadow-xs"
        >
          Dashboard
        </Link>
      </div>

      {/* Main Game Arena */}
      <main className="w-full flex-1 flex items-center justify-center">
        <RobotMaze />
      </main>

      {/* Footer Branding */}
      <footer className="text-center py-4 text-xs font-bold text-teal-900/60">
        DolaCode Stage 1 Early Coding & Directional Logic • Ages 5–8
      </footer>
    </div>
  );
}
