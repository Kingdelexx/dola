'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import DolaPizzaShop from '@/components/pizza-shop/DolaPizzaShop';
import { ArrowLeft, UserPlus, LogIn, Sparkles } from 'lucide-react';

export default function PizzaShopPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-pink-50 flex items-center justify-center">
        <div className="animate-bounce text-5xl">🍕</div>
      </div>
    );
  }

  // If user is not signed up, prompt them to create a free account
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-pink-50 p-4 flex flex-col justify-between">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between mb-4">
          <Link
            href="/"
            className="text-orange-700 hover:text-orange-900 font-black flex items-center gap-2 text-xs sm:text-sm bg-white/90 px-4 py-2 rounded-full border-2 border-orange-200 shadow-xs"
          >
            <ArrowLeft size={16} /> Home
          </Link>
        </div>

        <main className="w-full flex-1 flex items-center justify-center py-8">
          <div className="bg-white border-4 border-orange-200 rounded-[2.5rem] p-8 sm:p-12 max-w-lg w-full text-center shadow-2xl space-y-6 relative overflow-hidden">
            <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center text-5xl mx-auto shadow-xl border-4 border-white animate-bounce">
              🍕
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-black uppercase tracking-wider">
                <Sparkles size={13} className="text-amber-500" /> Free Preview For Registered Users
              </div>
              <h2 className="text-3xl font-black text-slate-800">
                Sign Up to Play Dola&apos;s Pizza Shop!
              </h2>
              <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                Create your free DolaCode account to play Level 1 (Pizza Counting) and start your Brain Developer journey!
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/signup?redirect=/stage1/pizza-shop"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-all transform hover:scale-102"
              >
                <UserPlus size={18} />
                <span>Sign Up Free to Play Level 1</span>
              </Link>
              <Link
                href="/login?redirect=/stage1/pizza-shop"
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <LogIn size={18} />
                <span>Already Have an Account? Log In</span>
              </Link>
            </div>
          </div>
        </main>

        <footer className="text-center py-4 text-xs font-bold text-orange-900/60">
          DolaCode • Brain Developer Early Numeracy
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-pink-50 p-3 sm:p-6 flex flex-col justify-between">
      {/* Navigation Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between mb-4">
        <Link
          href="/brain-developer"
          className="text-orange-700 hover:text-orange-900 font-black flex items-center gap-2 text-xs sm:text-sm bg-white/90 px-4 py-2 rounded-full border-2 border-orange-200 shadow-xs transition-all hover:scale-105"
        >
          <ArrowLeft size={16} /> Brain Developer Arcade
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
        DolaCode Stage 1 Early Numeracy &amp; Computational Thinking • Brain Developer
      </footer>
    </div>
  );
}
