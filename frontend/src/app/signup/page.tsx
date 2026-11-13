'use client';

import React from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function SignUpSelectionPage() {
  return (
    <AuthLayout
      title="Get Started With DolaCode"
      subtitle="Welcome! Choose how you would like to begin your coding adventure."
      badge="Create Account"
      badgeColor="blue"
      maxWidth="max-w-xl"
      footerPrompt={{
        text: "Already have an account?",
        linkText: "Sign In Here",
        linkHref: "/login"
      }}
    >
      <div className="space-y-4 pt-2">
        {/* Choice 1: Sign Up (Parent / Teacher / Adult) - Matching Blue in Diagram 2 */}
        <Link
          href="/signup/role"
          className="group block p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 border-4 border-sky-300 hover:border-sky-400 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 active:scale-98"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center text-3xl shadow-md border-2 border-white shrink-0 group-hover:scale-105 transition-transform">
                📘
              </div>
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-sky-200/80 text-sky-950 text-[10px] font-black uppercase tracking-wider mb-1">
                  Parents &amp; Teachers
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-sky-950 transition-colors">
                  Sign Up
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  Set up a family account for your child or create classroom workspaces as a teacher.
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-sky-400 group-hover:bg-sky-500 text-slate-950 flex items-center justify-center shrink-0 shadow transition-all group-hover:translate-x-1">
              <ArrowRight size={20} />
            </div>
          </div>
        </Link>

        {/* Choice 2: Kids Sign Up - Matching Green in Diagram 2 */}
        <Link
          href="/signup/kid"
          className="group block p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-4 border-emerald-300 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 active:scale-98"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center text-3xl shadow-md border-2 border-white shrink-0 group-hover:scale-105 transition-transform">
                👦
              </div>
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-950 text-[10px] font-black uppercase tracking-wider mb-1">
                  Learners &amp; Students
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-emerald-950 transition-colors">
                  Kids Sign Up
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  I am a student ready to join my school classroom or start learning!
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
