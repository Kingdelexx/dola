'use client';

import React from 'react';
import Link from 'next/link';
import MyLittleShop from '@/components/little-shop/MyLittleShop';
import { ArrowLeft, Store } from 'lucide-react';
import PaywallGuard from '@/components/subscription/PaywallGuard';

export default function MyLittleShopPage() {
  return (
    <PaywallGuard feature="stage1_games">
      <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-emerald-50 p-3 sm:p-6 flex flex-col justify-between">
        {/* Navigation Bar */}
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between mb-4">
          <Link
            href="/stage1"
            className="text-amber-800 hover:text-amber-950 font-black flex items-center gap-2 text-xs sm:text-sm bg-white/90 px-4 py-2 rounded-full border-2 border-amber-300 shadow-xs transition-all hover:scale-105"
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
          <MyLittleShop />
        </main>

        {/* Footer Branding */}
        <footer className="text-center py-4 text-xs font-bold text-amber-950/60">
          DolaCode Stage 1 Early Numeracy, Nigerian Currency &amp; Entrepreneurship • Ages 5–8
        </footer>
      </div>
    </PaywallGuard>
  );
}
