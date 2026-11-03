"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Lock, Sparkles, Rocket, Star, Heart, ArrowRight, ShieldCheck,
  Gamepad2, UserCircle2, ChevronRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import SubscriptionModal from './SubscriptionModal';

interface PaywallGuardProps {
  feature: string; // e.g. 'stage2', 'stage3', 'stage4', 'stage1_parts', 'web-studio', 'stage1_games'
  currentPart?: number; // for stage 1 (1 is free chapter 1)
  children: React.ReactNode;
  fallbackHeadline?: string;
  fallbackSubtext?: string;
}

export default function PaywallGuard({
  feature,
  currentPart,
  children,
  fallbackHeadline = "Your DolaCode adventure is waiting!",
  fallbackSubtext = "Ask your parent to unlock your learning world."
}: PaywallGuardProps) {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  // If part 1 of stage 1, it is the free sample chapter
  const isSampleLesson = (feature === 'stage1_part1') || (feature === 'stage1' && currentPart === 0) || (currentPart === 1);

  const [isChecking, setIsChecking] = useState(!isSampleLesson);
  const [isAllowed, setIsAllowed] = useState(isSampleLesson);
  const [headline, setHeadline] = useState(fallbackHeadline);
  const [subtext, setSubtext] = useState(fallbackSubtext);
  const [ctaText, setCtaText] = useState("UNLOCK DOLACODE");
  const [ctaUrl, setCtaUrl] = useState("/subscribe");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('inactive');

  // Modals
  const [showStudentGuidance, setShowStudentGuidance] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);

  useEffect(() => {
    if (isSampleLesson) {
      setIsChecking(false);
      setIsAllowed(true);
      return;
    }

    if (authLoading) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setIsChecking(false);
      setIsAllowed(false);
      return;
    }

    let isMounted = true;

    async function verifyAccess() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/subscription/access-check/?feature=${encodeURIComponent(feature)}${currentPart ? `&part=${currentPart}` : ''}`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          if (data.allowed) {
            setIsAllowed(true);
          } else {
            setIsAllowed(false);
            if (data.headline) setHeadline(data.headline);
            if (data.subtext) setSubtext(data.subtext);
            if (data.cta_text) setCtaText(data.cta_text);
            if (data.cta_url) setCtaUrl(data.cta_url);
            if (data.status) setSubscriptionStatus(data.status);
          }
        } else {
          // 401 or 403 response: treat as locked
          setIsAllowed(false);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Access check error:", err);
        // Fallback: check locally stored user subscription access if network issue
        if (user?.subscription_access?.has_access) {
          setIsAllowed(true);
        } else {
          setIsAllowed(false);
        }
      } finally {
        if (isMounted) setIsChecking(false);
      }
    }

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, [feature, currentPart, authLoading, isSampleLesson, user]);

  // Loading state
  if (isChecking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-indigo-100 text-center space-y-4 max-w-sm w-full">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 animate-bounce">
            <Rocket size={32} />
          </div>
          <p className="font-extrabold text-slate-700 text-sm">
            Verifying your learning passport...
          </p>
        </div>
      </div>
    );
  }

  // Allowed: Render actual learning experience
  if (isAllowed) {
    return <>{children}</>;
  }

  // Handle CTA Click
  const handleUnlockClick = () => {
    if (!user) {
      router.push('/signup?redirect=/subscribe');
    } else if (user.profile?.role === 'parent') {
      setShowParentModal(true);
    } else {
      setShowStudentGuidance(true);
    }
  };

  // Locked: Render Paywall Guard Screen
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white font-sans relative overflow-hidden">
      
      {/* Playful background glows */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full bg-slate-900/90 backdrop-blur-xl border-4 border-purple-500/30 rounded-[2.5rem] p-8 sm:p-12 text-center shadow-2xl relative z-10 space-y-8 animate-fadeIn">
        
        {/* Floating Lock Badge */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-amber-400 rounded-3xl blur-md opacity-70 animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 border-4 border-white/30 flex items-center justify-center shadow-2xl">
            <Lock size={44} className="text-white drop-shadow-md" />
          </div>
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-950 rounded-full p-1.5 shadow-md">
            <Sparkles size={16} />
          </div>
        </div>

        {/* Required Headline & Subtext */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-black uppercase tracking-wider">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            Locked Adventure Stage
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-sm leading-tight">
            {headline}
          </h2>
          <p className="text-purple-200/90 text-base sm:text-lg font-medium max-w-lg mx-auto leading-relaxed">
            {subtext}
          </p>
        </div>

        {/* Feature Highlights included */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-slate-200">6 Numeracy Worlds</span>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-slate-200">Blockly &amp; Python</span>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-slate-200">Creative App Studio</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Primary Required Button */}
          <button
            onClick={handleUnlockClick}
            className="w-full py-5 px-8 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 hover:from-yellow-300 hover:to-pink-400 text-slate-950 font-black text-xl shadow-[0_8px_0_#9a3412] hover:translate-y-[-2px] active:translate-y-[4px] active:shadow-[0_2px_0_#9a3412] transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Rocket size={24} className="text-slate-950" />
            {ctaText}
            <ArrowRight size={22} className="text-slate-950" />
          </button>

          {/* Secondary Free Sample Lesson Button */}
          <Link
            href="/stage1"
            className="w-full py-3.5 px-6 rounded-full bg-white/10 hover:bg-white/20 border-2 border-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Gamepad2 size={18} className="text-sky-400" />
            Play Free Sample: Stage 1 Chapter 1 (Number Sense)
          </Link>
        </div>

        {/* Data Protection Reassurance */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-purple-300 font-medium">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
          <span>Your badges, XP, stars, and saved projects are safe and preserved!</span>
        </div>

      </div>

      {/* STUDENT GUIDANCE MODAL */}
      {showStudentGuidance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-white space-y-6 relative">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Star size={32} className="fill-amber-400" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-900">
                Ask Your Parent to Unlock!
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                You are currently logged in as student <strong className="text-indigo-600">{user?.username}</strong>. Subscriptions must be activated by a parent or guardian.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2 font-medium">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                <span>Ask your parent to sign in to their DolaCode parent account.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                <span>They choose a Monthly or Annual plan to unlock your coding world instantly!</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/subscribe"
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm text-center shadow-lg shadow-indigo-600/20"
              >
                View Plans with Parent
              </Link>
              <button
                onClick={() => {
                  logout();
                  router.push('/login?redirect=/subscribe');
                }}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Sign In as Parent
              </button>
              <button
                onClick={() => setShowStudentGuidance(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold pt-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PARENT CHECKOUT MODAL */}
      {showParentModal && (
        <SubscriptionModal
          isOpen={showParentModal}
          onClose={() => setShowParentModal(false)}
          parentEmail={user?.email}
          onSuccess={() => {
            setShowParentModal(false);
            setIsAllowed(true);
          }}
        />
      )}

    </div>
  );
}
