'use client';

import React from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import { ArrowRight, UserCheck, Sparkles } from 'lucide-react';

export default function SignInSelectionPage() {
  return (
    <AuthLayout
      title="Sign In"
      subtitle="Who is signing in today? Choose your portal below to continue."
      badge="Welcome Back"
      badgeColor="amber"
      maxWidth="max-w-xl"
      footerPrompt={{
        text: "New to DolaCode?",
        linkText: "Create an Account",
        linkHref: "/signup"
      }}
    >
      <div className="space-y-4 pt-2">
        {/* Choice 1: Parent / Teacher */}
        <Link
          href="/login/adult"
          className="group block p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-4 border-amber-300 hover:border-amber-400 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 active:scale-98"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-3xl shadow-md border-2 border-white shrink-0 group-hover:scale-105 transition-transform">
                👨‍👩‍👧
              </div>
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-200/70 text-amber-900 text-[10px] font-black uppercase tracking-wider mb-1">
                  Adults &amp; Educators
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-amber-900 transition-colors">
                  Parent / Teacher
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  Manage family plans, track learning progress, and manage classroom rosters.
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-400 group-hover:bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow transition-all group-hover:translate-x-1">
              <ArrowRight size={20} />
            </div>
          </div>
        </Link>

        {/* Choice 2: Kids Sign In */}
        <Link
          href="/login/kid"
          className="group block p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-4 border-emerald-300 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 active:scale-98"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center text-3xl shadow-md border-2 border-white shrink-0 group-hover:scale-105 transition-transform">
                👧👦
              </div>
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900 text-[10px] font-black uppercase tracking-wider mb-1">
                  Young Coders
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-emerald-900 transition-colors">
                  Kids Sign In
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  Jump back into your coding missions, games, robot mazes, and apps!
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
