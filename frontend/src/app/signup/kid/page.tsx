'use client';

import React from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export default function KidsSignUpCodeQuestionPage() {
  return (
    <AuthLayout
      title="Do you have a Classroom Code?"
      subtitle="Did your school teacher give you a special code to join class?"
      badge="Kids Sign Up"
      badgeColor="emerald"
      backHref="/signup"
      backLabel="Back"
      maxWidth="max-w-xl"
      footerPrompt={{
        text: "Already signed up?",
        linkText: "Sign In Here",
        linkHref: "/login/kid"
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
        {/* Branch 1: NO (Matching Orange in Diagram 2) */}
        <Link
          href="/signup/kid/no-code"
          className="group p-6 rounded-3xl bg-gradient-to-b from-orange-50 to-amber-100 hover:from-orange-100 hover:to-amber-200 border-4 border-orange-300 hover:border-orange-400 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 active:scale-98 flex flex-col items-center text-center justify-between"
        >
          <div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-400 to-amber-500 text-white flex items-center justify-center text-3xl shadow-md border-2 border-white mx-auto mb-3 group-hover:scale-105 transition-transform">
              ❌
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-1">
              No
            </h2>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              I don&apos;t have a class code yet. I want to learn at home!
            </p>
          </div>
          <div className="mt-4 px-4 py-2 rounded-xl bg-orange-400 group-hover:bg-orange-500 text-slate-950 font-black text-xs uppercase flex items-center gap-1.5 shadow transition-all">
            <span>Ask a Parent</span>
            <ArrowRight size={14} />
          </div>
        </Link>

        {/* Branch 2: YES (Matching Green in Diagram 2) */}
        <Link
          href="/signup/kid/code"
          className="group p-6 rounded-3xl bg-gradient-to-b from-emerald-50 to-teal-100 hover:from-emerald-100 hover:to-teal-200 border-4 border-emerald-300 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 active:scale-98 flex flex-col items-center text-center justify-between"
        >
          <div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center text-3xl shadow-md border-2 border-white mx-auto mb-3 group-hover:scale-105 transition-transform">
              ✅
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-1">
              Yes
            </h2>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Yes, my teacher gave me a code written on the board!
            </p>
          </div>
          <div className="mt-4 px-4 py-2 rounded-xl bg-emerald-400 group-hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase flex items-center gap-1.5 shadow transition-all">
            <span>Enter Code</span>
            <ArrowRight size={14} />
          </div>
        </Link>
      </div>
    </AuthLayout>
  );
}
