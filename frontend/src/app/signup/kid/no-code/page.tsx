'use client';

import React from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import { ArrowRight, Heart, ShieldCheck } from 'lucide-react';

export default function AskParentToSignUpPage() {
  return (
    <AuthLayout
      title="Ask a Parent to create an account for you!"
      subtitle="To keep you safe and unlock all our coding games, a parent or guardian must set up your account."
      badge="Parent Needed"
      badgeColor="amber"
      backHref="/signup/kid"
      backLabel="Back"
      maxWidth="max-w-md"
      footerPrompt={{
        text: "Did you actually receive a classroom code at school?",
        linkText: "Enter Class Code",
        linkHref: "/signup/kid/code"
      }}
    >
      <div className="text-center pt-2">
        {/* Illustration Matching Diagram 2 */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-300 via-orange-400 to-amber-500 text-white flex items-center justify-center text-5xl shadow-xl border-4 border-white mx-auto mb-5 animate-bounce">
          👨‍👧
        </div>

        {/* Friendly explanation */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 mb-6 text-left space-y-2.5">
          <div className="flex items-start gap-2.5">
            <span className="text-amber-500 text-lg leading-none mt-0.5">🌟</span>
            <p className="text-xs sm:text-sm text-slate-700 font-bold leading-relaxed">
              DolaCode is an interactive coding world built specially for kids.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-amber-500 text-lg leading-none mt-0.5">🔒</span>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              Your parent sets up your account and gives you an easy <strong>4-digit secret PIN</strong> so you can play independently anytime!
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-amber-500 text-lg leading-none mt-0.5">🎮</span>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              Show this screen to your mom, dad, or guardian right now.
            </p>
          </div>
        </div>

        {/* Big Orange Button: "Parent Sign Up" (Matching Diagram 2) */}
        <Link
          href="/signup/parent"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_5px_0_#c2410c] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Parent Sign Up</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </AuthLayout>
  );
}
