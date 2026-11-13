'use client';

import React from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import { ArrowRight, KeyRound, School } from 'lucide-react';

export default function KidsSignInChoicePage() {
  return (
    <AuthLayout
      title="How do you sign in?"
      subtitle="Choose the way you usually sign in to play and code on DolaCode!"
      badge="Kids Portal"
      badgeColor="emerald"
      backHref="/login"
      backLabel="Back"
      maxWidth="max-w-xl"
      footerPrompt={{
        text: "Need your parent to set you up?",
        linkText: "Ask a Parent",
        linkHref: "/signup/kid/no-code"
      }}
    >
      <div className="space-y-4 pt-2">
        {/* Option A: Classroom Code */}
        <Link
          href="/login/kid/code"
          className="group block p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-4 border-orange-300 hover:border-orange-400 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 active:scale-98"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-400 to-amber-500 text-white flex items-center justify-center text-3xl shadow-md border-2 border-white shrink-0 group-hover:scale-105 transition-transform">
                🏫
              </div>
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-orange-200/80 text-orange-950 text-[10px] font-black uppercase tracking-wider mb-1">
                  Option A
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-orange-950 transition-colors">
                  Classroom Code
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  My school teacher gave me a 4-digit code to join my class coding mission!
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-400 group-hover:bg-orange-500 text-slate-950 flex items-center justify-center shrink-0 shadow transition-all group-hover:translate-x-1">
              <ArrowRight size={20} />
            </div>
          </div>
        </Link>

        {/* Option B: Username & Password */}
        <Link
          href="/login/kid/direct"
          className="group block p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-4 border-emerald-300 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 active:scale-98"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center text-3xl shadow-md border-2 border-white shrink-0 group-hover:scale-105 transition-transform">
                🔑
              </div>
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-950 text-[10px] font-black uppercase tracking-wider mb-1">
                  Option B
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-emerald-950 transition-colors">
                  Username &amp; Password
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  I have my own secret User ID / Username and secret Picture Password or PIN!
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-400 group-hover:bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow transition-all group-hover:translate-x-1">
              <ArrowRight size={20} />
            </div>
          </div>
        </Link>
      </div>
    </AuthLayout>
  );
}
