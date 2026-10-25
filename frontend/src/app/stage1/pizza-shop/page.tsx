'use client';

import React from 'react';
import Link from 'next/link';
import DolaPizzaShop from '@/components/pizza-shop/DolaPizzaShop';
import { ArrowLeft, Rocket } from 'lucide-react';

export default function PizzaShopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-pink-50 p-3 sm:p-6 flex flex-col justify-between">
      {/* Navigation Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between mb-4">
        <Link
          href="/stage1"
          className="text-orange-700 hover:text-orange-900 font-black flex items-center gap-2 text-xs sm:text-sm bg-white/90 px-4 py-2 rounded-full border-2 border-orange-200 shadow-xs transition-all hover:scale-105"
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
        <DolaPizzaShop />
      </main>

      {/* Footer Branding */}
      <footer className="text-center py-4 text-xs font-bold text-orange-900/60">
        DolaCode Stage 1 Early Numeracy & Computational Thinking • Ages 5–8
      </footer>
    </div>
  );
}
