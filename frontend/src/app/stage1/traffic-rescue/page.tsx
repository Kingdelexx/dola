'use client';

import React from 'react';
import Link from 'next/link';
import TrafficRescue from '@/components/traffic-rescue/TrafficRescue';
import { ArrowLeft } from 'lucide-react';
import PaywallGuard from '@/components/subscription/PaywallGuard';

export default function TrafficRescuePage() {
  return (
    <PaywallGuard feature="stage1_games">
      <div className="min-h-screen bg-slate-950 p-2 sm:p-5 flex flex-col justify-between">
        {/* Navigation Bar */}
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between mb-3 px-2">
          <Link
            href="/stage1"
            className="text-amber-300 hover:text-amber-200 font-black flex items-center gap-2 text-xs sm:text-sm bg-slate-800/90 px-4 py-2 rounded-full border border-slate-700 shadow transition-all hover:scale-105"
          >
            <ArrowLeft size={16} /> Back to Stage 1 Numeracy
          </Link>
          <Link
            href="/dashboard"
            className="text-slate-300 hover:text-white font-bold text-xs sm:text-sm bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 shadow"
          >
            Dashboard
          </Link>
        </div>

        {/* Main Game Arena */}
        <main className="w-full flex-1 flex items-center justify-center">
          <TrafficRescue />
        </main>

        {/* Footer Branding */}
        <footer className="text-center py-3 text-xs font-bold text-slate-500">
          DolaCode Stage 1 Logic, Sequencing, Conditions &amp; Traffic Rescue • Ages 5–8
        </footer>
      </div>
    </PaywallGuard>
  );
}
