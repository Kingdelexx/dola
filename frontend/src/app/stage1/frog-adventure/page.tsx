'use client';

import React from 'react';
import Link from 'next/link';
import FrogAdventure from '@/components/frog-adventure/FrogAdventure';
import { ArrowLeft } from 'lucide-react';
import PaywallGuard from '@/components/subscription/PaywallGuard';

export default function FrogAdventurePage() {
  return (
    <PaywallGuard feature="stage1_games">
      <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-sky-100 p-3 sm:p-6 flex flex-col justify-between">
        {/* Navigation Bar */}
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between mb-4">
          <Link
            href="/stage1"
            className="text-emerald-900 hover:text-emerald-950 font-black flex items-center gap-2 text-xs sm:text-sm bg-white/90 px-4 py-2 rounded-full border-2 border-emerald-300 shadow-xs transition-all hover:scale-105"
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
          <FrogAdventure />
        </main>

        {/* Footer Branding */}
        <footer className="text-center py-4 text-xs font-bold text-emerald-950/60">
          DolaCode Stage 1 Early Numeracy, Coordinates, Patterns &amp; Coding Adventure • Ages 5–8
        </footer>
      </div>
    </PaywallGuard>
  );
}
