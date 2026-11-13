'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Star } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  footerPrompt?: {
    text: string;
    linkText: string;
    linkHref: string;
  };
  maxWidth?: string;
}

export default function AuthLayout({
  title,
  subtitle,
  badge,
  badgeColor = 'amber',
  backHref,
  backLabel = 'Back',
  children,
  footerPrompt,
  maxWidth = 'max-w-xl'
}: AuthLayoutProps) {
  const badgeClasses = {
    amber: 'bg-amber-100 text-amber-800 border-amber-300',
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    blue: 'bg-sky-100 text-sky-800 border-sky-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    rose: 'bg-rose-100 text-rose-800 border-rose-300',
  }[badgeColor];

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-800 flex flex-col justify-between p-4 sm:p-6 relative overflow-x-hidden font-sans selection:bg-amber-200">
      {/* Decorative Doodles and Shapes (Matching the Diagram Style) */}
      <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0">
        {/* Top-left Stars & Paper Plane */}
        <div className="absolute top-6 left-6 text-amber-400 text-2xl animate-pulse">⭐</div>
        <div className="absolute top-16 left-16 text-yellow-400 text-lg">✨</div>
        <div className="absolute top-28 left-8 text-sky-400 text-2xl rotate-12">✈️</div>

        {/* Top-right Paper Plane & Pencil */}
        <div className="absolute top-6 right-12 text-sky-400 text-3xl -rotate-12">✈️</div>
        <div className="absolute top-24 right-6 text-amber-500 text-2xl rotate-45">✏️</div>
        <div className="absolute top-36 right-16 text-slate-400 text-xl">📎</div>

        {/* Bottom Doodles */}
        <div className="absolute bottom-10 left-8 text-amber-400 text-3xl">⭐</div>
        <div className="absolute bottom-24 left-16 text-emerald-400 text-2xl -rotate-45">✏️</div>
        <div className="absolute bottom-8 left-28 text-slate-400 text-xl">📎</div>
        <div className="absolute bottom-12 right-12 text-rose-400 text-3xl rotate-12">⭐</div>
        <div className="absolute bottom-24 right-20 text-emerald-500 text-2xl">✏️</div>

        {/* Soft Background Radial Blurs */}
        <div className="absolute top-[-5%] left-[20%] w-[350px] h-[350px] bg-amber-200/25 rounded-full blur-3xl" />
        <div className="absolute bottom-[5%] right-[20%] w-[400px] h-[400px] bg-emerald-200/20 rounded-full blur-3xl" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-20 max-w-5xl w-full mx-auto flex items-center justify-between mb-4">
        {backHref ? (
          <Link
            href={backHref}
            className="flex items-center gap-2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm px-4 py-2 rounded-full border-2 border-amber-200 shadow-xs hover:shadow transition-all hover:scale-105"
          >
            <ArrowLeft size={16} />
            <span>{backLabel}</span>
          </Link>
        ) : (
          <div />
        )}

        {/* DolaCode Logo */}
        <Link href="/" className="flex items-center group">
          <img
            src="/logo.png"
            alt="DolaCode Logo"
            className="w-[90px] h-auto object-contain group-hover:scale-105 transition-transform"
          />
        </Link>
      </header>

      {/* Main Form/Choice Card */}
      <main className="relative z-10 w-full flex-1 flex items-center justify-center my-4">
        <div className={`${maxWidth} w-full bg-white border-4 border-amber-100 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.06)] p-6 sm:p-10 text-center relative`}>
          {/* Badge */}
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border mb-3 shadow-xs">
              <Sparkles size={12} />
              <span>{badge}</span>
            </div>
          )}

          {/* Heading */}
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-slate-600 text-xs sm:text-sm font-semibold max-w-md mx-auto mb-6 leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* Content Body */}
          <div className="text-left">
            {children}
          </div>

          {/* Footer prompt / Switcher */}
          {footerPrompt && (
            <div className="mt-8 pt-5 border-t-2 border-slate-100 text-center text-xs sm:text-sm font-bold text-slate-500">
              {footerPrompt.text}{' '}
              <Link
                href={footerPrompt.linkHref}
                className="text-amber-600 hover:text-amber-700 underline font-black ml-1 hover:opacity-80 transition-opacity"
              >
                {footerPrompt.linkText}
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 text-center py-2 text-[11px] font-bold text-slate-400">
        DolaCode &bull; Safe, interactive coding adventures for young innovators
      </footer>
    </div>
  );
}
