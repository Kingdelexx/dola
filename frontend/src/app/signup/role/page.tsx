'use client';

import React from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import { ArrowRight } from 'lucide-react';

export default function AdultRoleSelectionPage() {
  return (
    <AuthLayout
      title="Choose Your Role"
      subtitle="Are you setting up an account for your child at home, or for your students at school?"
      badge="Adult Onboarding"
      badgeColor="purple"
      backHref="/signup"
      backLabel="Back"
      maxWidth="max-w-xl"
      footerPrompt={{
        text: "Are you a student signing up?",
        linkText: "Kids Sign Up",
        linkHref: "/signup/kid"
      }}
    >
      <div className="space-y-4 pt-2">
        {/* Choice 1: Parent (Matching Diagram 2 Purple Card) */}
        <Link
          href="/signup/parent"
          className="group block p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border-4 border-purple-300 hover:border-purple-400 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 active:scale-98"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-400 to-indigo-600 text-white flex items-center justify-center text-3xl shadow-md border-2 border-white shrink-0 group-hover:scale-105 transition-transform">
                👨‍👦
              </div>
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-purple-200/80 text-purple-950 text-[10px] font-black uppercase tracking-wider mb-1">
                  Home &amp; Family
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-purple-950 transition-colors">
                  Parent
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  Create a guardian profile and set up safe child profiles with simple PINs.
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-400 group-hover:bg-purple-500 text-white flex items-center justify-center shrink-0 shadow transition-all group-hover:translate-x-1">
              <ArrowRight size={20} />
            </div>
          </div>
        </Link>

        {/* Choice 2: Teacher (Matching Diagram 2 Orange/Yellow Card) */}
        <Link
          href="/signup/teacher"
          className="group block p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-4 border-amber-300 hover:border-amber-400 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 active:scale-98"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-3xl shadow-md border-2 border-white shrink-0 group-hover:scale-105 transition-transform">
                👩‍🏫
              </div>
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-950 text-[10px] font-black uppercase tracking-wider mb-1">
                  School &amp; Classroom
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-amber-950 transition-colors">
                  Teacher
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  Set up classrooms, get your shareable classroom join code, and monitor student assignments.
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-400 group-hover:bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow transition-all group-hover:translate-x-1">
              <ArrowRight size={20} />
            </div>
          </div>
        </Link>
      </div>
    </AuthLayout>
  );
}
