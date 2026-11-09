"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles, Check, ArrowRight, ShieldCheck, Star, Crown, Rocket,
  Brain, Code, Terminal, LayoutGrid, Gamepad2, Award, ChevronDown,
  ChevronUp, HelpCircle, Users, Heart, Zap, AlertCircle, CreditCard, Lock, Building
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';

interface Plan {
  id: number;
  plan_name: string;
  plan_description: string;
  amount: number;
  currency: string;
  billing_interval: string;
  billing_interval_display: string;
  paystack_plan_code?: string;
}

const DEFAULT_PLANS: Plan[] = [
  {
    id: 1,
    plan_name: "Monthly Explorer",
    plan_description: "Full access to all 4 coding worlds, 6 interactive numeracy games, and Lizzy AI tutor for all linked children.",
    amount: 10000,
    currency: "NGN",
    billing_interval: "monthly",
    billing_interval_display: "Monthly",
    paystack_plan_code: "PLN_dmt3enn7u1045sx"
  },
  {
    id: 3,
    plan_name: "Annual Champion (1 Year)",
    plan_description: "Best value for full-year coding mastery! Covers all coding stages, game studios, and weekly AI progress reports. Save ₦20,000 (2 months free).",
    amount: 100000,
    currency: "NGN",
    billing_interval: "annually",
    billing_interval_display: "Annually (1 Year)",
    paystack_plan_code: "PLN_27x0pbe5znqyzte"
  }
];

export default function SubscribePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [plansError, setPlansError] = useState('');

  // Subscription modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  // Student role alert modal
  const [showStudentAlert, setShowStudentAlert] = useState(false);

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/payments/plans/`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.plans && data.plans.length > 0) {
          // Filter out legacy termly plans
          const validPlans = data.plans.filter((p: Plan) => p.billing_interval !== 'quarterly');
          if (validPlans.length > 0) {
            setPlans(validPlans);
          }
        }
      })
      .catch(err => {
        console.error("Error fetching pricing plans, keeping defaults:", err);
      });
  }, []);

  // Dynamic Savings Calculation (only display when database prices support the claim)
  const monthlyPlan = plans.find(p => p.billing_interval === 'monthly');
  const annualPlan = plans.find(p => p.billing_interval === 'annually');

  let annualSavingsPercent: number | null = null;
  let annualSavingsAmount: number | null = null;
  let annualEquivalentMonthly: number | null = null;

  if (monthlyPlan && annualPlan && monthlyPlan.amount > 0) {
    const fullYearAtMonthlyRate = monthlyPlan.amount * 12;
    if (annualPlan.amount < fullYearAtMonthlyRate) {
      const diff = fullYearAtMonthlyRate - annualPlan.amount;
      annualSavingsPercent = Math.round((diff / fullYearAtMonthlyRate) * 100);
      annualSavingsAmount = diff;
      annualEquivalentMonthly = Math.round(annualPlan.amount / 12);
    }
  }

  // Handle CTA Click
  const handleSelectPlan = (planId: number) => {
    setSelectedPlanId(planId);

    if (authLoading) return;

    if (!user) {
      // Direct unauthenticated visitors to signup/login flow with return redirect
      router.push(`/signup?redirect=/subscribe`);
      return;
    }

    if (user.profile?.role === 'student') {
      setShowStudentAlert(true);
      return;
    }

    // Authenticated parent or admin: proceed to checkout modal
    setIsModalOpen(true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-indigo-50/40 to-white text-slate-800 font-sans selection:bg-pink-200 selection:text-pink-900">
      
      {/* Navigation Bar */}
      <nav className="relative z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <img 
            src="/logo.png" 
            alt="DolaCode Logo" 
            className="w-[85px] h-auto object-contain group-hover:scale-105 transition-transform" 
          />
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link 
            href="/#features" 
            className="text-xs sm:text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors hidden md:block"
          >
            Curriculum
          </Link>
          <a 
            href="#pricing" 
            className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors hidden sm:block"
          >
            Pricing Plans
          </a>
          <a 
            href="#faq" 
            className="text-xs sm:text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors hidden sm:block"
          >
            FAQ
          </a>

          {!authLoading && user ? (
            <div className="flex items-center gap-2">
              {user.profile?.role === 'parent' ? (
                <Link
                  href="/parent-dashboard"
                  className="px-4 py-2 rounded-full font-bold text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-all shadow-xs"
                >
                  Parent Portal
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-full font-bold text-xs bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 transition-all shadow-xs"
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                className="px-3.5 py-2 rounded-full font-bold text-xs bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login?redirect=/subscribe"
                className="px-4 py-2 rounded-full font-bold text-xs sm:text-sm text-slate-700 hover:text-indigo-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup?redirect=/subscribe"
                className="px-5 py-2.5 rounded-full font-black text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-md shadow-orange-500/20 active:scale-95 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-14 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Floating Trust Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-800 text-xs font-black uppercase tracking-wider">
            <Sparkles size={14} className="text-indigo-600" /> Complete STEM &amp; Coding Suite
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <ShieldCheck size={14} className="text-emerald-600" /> Nigerian Curriculum Aligned (Ages 5–16)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/80 border border-pink-200 text-pink-800 text-xs font-black uppercase tracking-wider">
            <Users size={14} className="text-pink-600" /> 1 Plan Covers All Linked Children
          </span>
        </div>

        {/* Required Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Give Your Child a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Head Start</span> in Technology.
        </h1>

        {/* Required Supporting Text */}
        <p className="mt-5 text-base sm:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
          Unlock a world of interactive mathematics, coding games, Python projects and creative technology learning with DolaCode.
        </p>

        {/* Hero CTA & Quick Highlights */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#pricing"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-black text-base shadow-xl shadow-indigo-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 group"
          >
            <span>View Pricing Plans</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#curriculum"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 font-bold text-base shadow-xs active:scale-98 transition-all"
          >
            Explore What Children Learn
          </a>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
          <span className="flex items-center gap-1.5"><Check size={16} className="text-emerald-500" /> 1-Click Paystack NGN checkout</span>
          <span className="flex items-center gap-1.5"><Check size={16} className="text-emerald-500" /> Cancel anytime</span>
          <span className="flex items-center gap-1.5 hidden sm:flex"><Check size={16} className="text-emerald-500" /> 24/7 AI tutor Lizzy included</span>
        </div>
      </section>

      {/* Learning Benefits Section */}
      <section id="curriculum" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Comprehensive Curriculum
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3">
            Everything Your Child Needs to Excel
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium mt-2">
            A structured, progressive pathway from early foundational math to real-world software engineering.
          </p>
        </div>

        {/* 6 Required Learning Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 1. Gamified Numeracy */}
          <div className="bg-white border-2 border-indigo-100 rounded-3xl p-7 shadow-lg shadow-indigo-500/5 hover:border-indigo-300 hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl shadow-md shadow-indigo-500/20 mb-5 group-hover:scale-105 transition-transform">
                <Brain size={28} />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-black text-[10px] uppercase tracking-wider mb-2">
                Stage 1 • Math &amp; Logic
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                1. Gamified Numeracy
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Master numbers, counting sequences, arithmetic, fractions, decimals, percentages, and logical reasoning through vibrant, story-driven computational puzzles.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 text-xs font-bold text-indigo-600 flex items-center gap-1.5">
              <span>Includes 14 progressive modules</span> &rarr;
            </div>
          </div>

          {/* 2. Interactive Block Coding */}
          <div className="bg-white border-2 border-pink-100 rounded-3xl p-7 shadow-lg shadow-pink-500/5 hover:border-pink-300 hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center text-2xl shadow-md shadow-pink-500/20 mb-5 group-hover:scale-105 transition-transform">
                <Code size={28} />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 font-black text-[10px] uppercase tracking-wider mb-2">
                Stage 2 • Visual Blocks
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                2. Interactive Block Coding
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Snap visual code blocks together with Google Blockly to solve robot mazes, animate characters, and understand core algorithmic loops without syntax frustration.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 text-xs font-bold text-pink-600 flex items-center gap-1.5">
              <span>Scratch-compatible visual engine</span> &rarr;
            </div>
          </div>

          {/* 3. Python Quest */}
          <div className="bg-white border-2 border-purple-100 rounded-3xl p-7 shadow-lg shadow-purple-500/5 hover:border-purple-300 hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-md shadow-purple-500/20 mb-5 group-hover:scale-105 transition-transform">
                <Terminal size={28} />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-black text-[10px] uppercase tracking-wider mb-2">
                Stage 3 &amp; 4 • Real Code
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                3. Python Quest
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Bridge seamlessly to writing genuine text-based Python code with in-browser WebAssembly execution, friendly error explanations, and guided missions.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 text-xs font-bold text-purple-600 flex items-center gap-1.5">
              <span>Zero local installation needed</span> &rarr;
            </div>
          </div>

          {/* 4. Creative App Development */}
          <div className="bg-white border-2 border-amber-100 rounded-3xl p-7 shadow-lg shadow-amber-500/5 hover:border-amber-300 hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-2xl shadow-md shadow-amber-500/20 mb-5 group-hover:scale-105 transition-transform">
                <LayoutGrid size={28} />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-black text-[10px] uppercase tracking-wider mb-2">
                Web Studio • App Design
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                4. Creative App Development
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Design custom websites and mobile app prototypes using HTML, CSS, JavaScript, and visual layout studios with live real-time preview side-by-side.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 text-xs font-bold text-amber-600 flex items-center gap-1.5">
              <span>Real-time live browser preview</span> &rarr;
            </div>
          </div>

          {/* 5. Hands-on Coding Projects */}
          <div className="bg-white border-2 border-teal-100 rounded-3xl p-7 shadow-lg shadow-teal-500/5 hover:border-teal-300 hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center text-2xl shadow-md shadow-teal-500/20 mb-5 group-hover:scale-105 transition-transform">
                <Gamepad2 size={28} />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-black text-[10px] uppercase tracking-wider mb-2">
                6 Standalone Games
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                5. Hands-on Coding Projects
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Play and create with our interactive mini-games: Pizza Shop, Robot Maze, Nigerian Neighbourhood Shop, Frog Adventure, Traffic Rescue, and Pet Rescue.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 text-xs font-bold text-teal-600 flex items-center gap-1.5">
              <span>Culturally relatable Nigerian themes</span> &rarr;
            </div>
          </div>

          {/* 6. Learning Progress and Achievements */}
          <div className="bg-white border-2 border-sky-100 rounded-3xl p-7 shadow-lg shadow-sky-500/5 hover:border-sky-300 hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center text-2xl shadow-md shadow-sky-500/20 mb-5 group-hover:scale-105 transition-transform">
                <Award size={28} />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 font-black text-[10px] uppercase tracking-wider mb-2">
                Parent Analytics
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                6. Progress &amp; Achievements
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Real-time parent monitoring dashboard, weekly AI growth reports, star milestones, streak counters, and digital badges celebrating every breakthrough.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 text-xs font-bold text-sky-600 flex items-center gap-1.5">
              <span>Weekly AI parent digest included</span> &rarr;
            </div>
          </div>

        </div>
      </section>

      {/* Pricing Section (Dynamic Database-Driven) */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            Simple Family Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-4 tracking-tight">
            Invest in Your Child&apos;s Digital Future
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium mt-3">
            Transparent pricing in Nigerian Naira (NGN). One plan covers <span className="font-bold text-slate-800 underline decoration-indigo-400">all linked children</span> in your household.
          </p>
        </div>

        {plansError && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-bold flex items-center justify-center gap-2 mb-8">
            <AlertCircle size={18} />
            <span>{plansError}</span>
          </div>
        )}

        {loadingPlans ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-sm">Loading latest subscription plans...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => {
              const isAnnual = plan.billing_interval === 'annually';
              const isMonthly = plan.billing_interval === 'monthly';
              const isPopular = isAnnual;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-[2.5rem] p-8 flex flex-col justify-between transition-all duration-300 ${
                    isPopular
                      ? 'bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-2xl shadow-indigo-500/20 border-4 border-indigo-500/40 lg:-translate-y-2'
                      : 'bg-white text-slate-800 shadow-xl border-4 border-white hover:border-indigo-200'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                      isPopular 
                        ? 'bg-pink-500 text-white shadow-xs' 
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                      {plan.billing_interval_display} Membership
                    </span>

                    {/* Annual Savings Badge (Displayed only when supported by database prices) */}
                    {isAnnual && annualSavingsPercent && annualSavingsPercent > 0 && (
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-xs animate-pulse">
                        Save {annualSavingsPercent}% (2 Mos Free)
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl font-black mb-2">{plan.plan_name}</h3>
                    <p className={`text-xs sm:text-sm font-medium leading-relaxed mb-6 ${isPopular ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {plan.plan_description}
                    </p>

                    {/* Price Header */}
                    <div className="mb-6 pb-6 border-b border-slate-200/20">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl sm:text-5xl font-black tracking-tight">
                          ₦{plan.amount.toLocaleString()}
                        </span>
                        <span className={`text-xs font-bold ${isPopular ? 'text-indigo-300' : 'text-slate-500'}`}>
                          / {plan.billing_interval === 'monthly' ? 'month' : plan.billing_interval === 'annually' ? 'year' : 'term'}
                        </span>
                      </div>

                      {/* Display breakdown when annual plan has verified savings */}
                      {isAnnual && annualEquivalentMonthly && (
                        <p className="text-[11px] text-emerald-400 font-bold mt-1">
                          Equivalent to ~₦{annualEquivalentMonthly.toLocaleString()} / month {annualSavingsAmount ? `(Save ₦${annualSavingsAmount.toLocaleString()}/yr)` : ''}
                        </p>
                      )}
                    </div>

                    {/* Features Checklist */}
                    <ul className="space-y-3 mb-8 text-xs sm:text-sm font-semibold">
                      <li className="flex items-start gap-2.5">
                        <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>All 4 Coding Worlds (Numeracy &rarr; Python)</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>6 Interactive Mathematics &amp; Logic Games</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Covers <span className="underline decoration-pink-400">all linked children</span> under 1 account</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>24/7 Lizzy AI Coding Sidekick &amp; Hints</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Parent Portal with Weekly Progress Reports</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Digital achievement badges &amp; certificates</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Cancel anytime with 1-click in portal</span>
                      </li>
                    </ul>
                  </div>

                  {/* Required CTA Button */}
                  <div>
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      className={`w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                        isPopular
                          ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white shadow-pink-500/25'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                      }`}
                    >
                      <Zap size={18} />
                      <span>Unlock DolaCode</span>
                      <ArrowRight size={16} />
                    </button>
                    <p className={`text-[10px] text-center mt-2.5 font-medium ${isPopular ? 'text-slate-400' : 'text-slate-400'}`}>
                      Secure Paystack checkout (Debit Card, Transfer, USSD)
                    </p>
                  </div>
                </div>
              );
            })}

            {/* School & Institutional Custom Pricing Card */}
            <div className="relative rounded-[2.5rem] p-8 flex flex-col justify-between transition-all duration-300 bg-white text-slate-800 shadow-xl border-4 border-emerald-100 hover:border-emerald-300">
              {/* Top Badges */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Institutions &amp; Schools
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  Volume Pricing
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black mb-2 text-slate-900">Schools &amp; Academies</h3>
                <p className="text-xs sm:text-sm font-medium leading-relaxed mb-6 text-slate-500">
                  Tailored digital coding &amp; numeracy curriculum for primary and secondary schools, computer labs, and multi-classroom deployments across Nigeria.
                </p>

                {/* Price Header */}
                <div className="mb-6 pb-6 border-b border-slate-200/40">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                      Custom Pricing
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-600 font-bold mt-1">
                    Schools reach out for custom volume pricing &amp; lab packages
                  </p>
                </div>

                {/* Features Checklist */}
                <ul className="space-y-3 mb-8 text-xs sm:text-sm font-semibold">
                  <li className="flex items-start gap-2.5">
                    <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Dedicated School Admin &amp; Teacher Dashboards</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Classroom Management &amp; Custom Join Codes</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Bulk Student Roster Upload &amp; Account Setup</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Nigerian &amp; Cambridge Curriculum Alignment</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Teacher Training, Lesson Plans &amp; Ongoing Support</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Comprehensive Termly Class Progress Reports</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Flexible Billing (Per-Pupil or Annual Site License)</span>
                  </li>
                </ul>
              </div>

              {/* School CTA Button */}
              <div>
                <Link
                  href="/contact?subject=School%20Pricing%20Inquiry"
                  className="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                >
                  <Building size={18} />
                  <span>Contact for School Pricing</span>
                  <ArrowRight size={16} />
                </Link>
                <p className="text-[10px] text-center mt-2.5 font-medium text-slate-400">
                  Schools will reach out for custom pricing and dedicated support
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm font-medium mt-1">
            Everything you need to know about DolaCode family subscriptions.
          </p>
        </div>

        <div className="space-y-4">
          
          {/* FAQ 1: How subscription works */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xs">
            <button
              onClick={() => toggleFaq(0)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-black text-slate-900 text-base hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <HelpCircle size={18} className="text-indigo-600 shrink-0" />
                How does the DolaCode subscription work?
              </span>
              {openFaqIndex === 0 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openFaqIndex === 0 && (
              <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3">
                When you subscribe, your parent account is activated immediately. Any children you link in your Parent Portal receive instant, full access to all 4 learning worlds (DolaCode Numeracy, Block Coding, Python Quest, App Studio), 6 standalone interactive games, and our 24/7 Lizzy AI coding tutor. Subscriptions renew automatically, and you can cancel anytime.
              </div>
            )}
          </div>

          {/* FAQ 2: What children learn */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xs">
            <button
              onClick={() => toggleFaq(1)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-black text-slate-900 text-base hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Brain size={18} className="text-pink-600 shrink-0" />
                What exactly will my child learn?
              </span>
              {openFaqIndex === 1 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openFaqIndex === 1 && (
              <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3">
                DolaCode provides a structured 4-stage coding continuum plus practical financial literacy: Stage 1 (Math &amp; Computational Readiness), Stage 2 (Visual Block Coding with Blockly), Stage 3 (App Studio for web and mobile interfaces), Stage 4 (Python Pro text coding with Lizzy AI guidance), and our all-new DolaMoney Quest (Nigerian Naira currency recognition, budgeting, smart shopping, saving, and entrepreneurship).
              </div>
            )}
          </div>

          {/* FAQ 3: Enjoyment */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xs">
            <button
              onClick={() => toggleFaq(2)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-black text-slate-900 text-base hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Heart size={18} className="text-rose-500 shrink-0" />
                Will my child actually enjoy it?
              </span>
              {openFaqIndex === 2 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openFaqIndex === 2 && (
              <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3">
                Yes! DolaCode is designed from the ground up like a vibrant video game. Instead of dry lectures or tedious worksheets, kids rescue pets, operate pizza kitchens, race frogs, build real games, and launch apps. They earn DolaCoins, collect badges, and receive friendly hints from Lizzy AI whenever they need help, keeping motivation high.
              </div>
            )}
          </div>

          {/* FAQ 4: Parent Visibility */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xs">
            <button
              onClick={() => toggleFaq(3)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-black text-slate-900 text-base hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-sky-600 shrink-0" />
                Can I see what my child is learning?
              </span>
              {openFaqIndex === 3 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openFaqIndex === 3 && (
              <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3">
                Yes, completely! You have access to a dedicated Parent Dashboard where you can monitor real-time weekly activity streaks, completed modules, projects built, and financial literacy milestones. You can also assign easy 4-digit PINs for seamless child sign-in without sharing sensitive passwords.
              </div>
            )}
          </div>

          {/* FAQ 5: Free videos online comparison */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xs">
            <button
              onClick={() => toggleFaq(4)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-black text-slate-900 text-base hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Zap size={18} className="text-amber-500 shrink-0" />
                Why should I pay when there are free videos online?
              </span>
              {openFaqIndex === 4 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openFaqIndex === 4 && (
              <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3">
                Watching free videos is passive — children quickly lose focus, skip ahead, or simply copy code without understanding the concepts. DolaCode is 100% interactive and hands-on: children write code directly in their browser, experiment, solve challenges, and build real projects. You get a structured step-by-step curriculum, 24/7 personalized guidance from Lizzy AI, parent progress tracking, and a safe, ad-free environment without distractions or unsafe online rabbit holes.
              </div>
            )}
          </div>

          {/* FAQ 6: Multiple children */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xs">
            <button
              onClick={() => toggleFaq(5)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-black text-slate-900 text-base hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Users size={18} className="text-emerald-600 shrink-0" />
                Can I add multiple children under one subscription?
              </span>
              {openFaqIndex === 5 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openFaqIndex === 5 && (
              <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3">
                <strong>Yes, absolutely!</strong> Unlike other platforms that charge per child, DolaCode operates on a family-first model. One active parent subscription covers all linked children under your account at no extra charge. Each child has their own individual student login, profile, and progress tracking.
              </div>
            )}
          </div>

          {/* FAQ 7: How recurring payments work */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xs">
            <button
              onClick={() => toggleFaq(6)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-black text-slate-900 text-base hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <CreditCard size={18} className="text-purple-600 shrink-0" />
                How do recurring payments work with Paystack?
              </span>
              {openFaqIndex === 6 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openFaqIndex === 6 && (
              <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3">
                All transactions are processed securely in Nigerian Naira (NGN) through Paystack, Nigeria&apos;s leading payment gateway. You can pay with your Nigerian Mastercard, Visa, or Verve debit card, bank transfer, or USSD. For card payments, renewals occur automatically at the end of each billing period (monthly or annually). We never store your card details on our servers.
              </div>
            )}
          </div>

          {/* FAQ 8: How cancellation works */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xs">
            <button
              onClick={() => toggleFaq(7)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-black text-slate-900 text-base hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Lock size={18} className="text-amber-600 shrink-0" />
                How does cancellation work?
              </span>
              {openFaqIndex === 7 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openFaqIndex === 7 && (
              <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3">
                You can cancel your subscription at any time with one click inside your Parent Dashboard. There are zero cancellation fees or penalties. When you cancel, your children will continue to enjoy full uninterrupted access until the end of the billing period you already paid for.
              </div>
            )}
          </div>

          {/* FAQ 9: School access */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xs">
            <button
              onClick={() => toggleFaq(8)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-black text-slate-900 text-base hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Crown size={18} className="text-sky-600 shrink-0" />
                What if my child&apos;s school is already using DolaCode?
              </span>
              {openFaqIndex === 8 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openFaqIndex === 8 && (
              <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3">
                If your child is enrolled in an approved partner school and has joined an active classroom with a class code, their access is sponsored by the school! You do not need to purchase a parent subscription for school-sponsored students. You can still link your child to monitor their weekly homework and performance for free.
              </div>
            )}
          </div>

          {/* FAQ 10: School Custom Pricing */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xs">
            <button
              onClick={() => toggleFaq(9)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-black text-slate-900 text-base hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Building size={18} className="text-emerald-600 shrink-0" />
                Do you offer custom pricing for schools and institutions?
              </span>
              {openFaqIndex === 9 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openFaqIndex === 9 && (
              <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3">
                <strong>Yes, absolutely!</strong> We partner directly with primary schools, secondary schools, computer academies, and coding clubs across Nigeria. School packages include custom per-pupil pricing, teacher administrative dashboards, bulk student onboarding, curriculum alignment, and dedicated training for ICT educators. Please reach out to our educational team via our{" "}
                <Link href="/contact?subject=School%20Pricing%20Inquiry" className="text-indigo-600 font-bold hover:underline">
                  Contact Page
                </Link>{" "}
                or call us at 09152690938 to discuss your school&apos;s requirements.
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Final Conversion Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 rounded-[3rem] p-8 sm:p-14 text-white text-center relative overflow-hidden shadow-2xl border-4 border-white/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <Rocket size={14} className="text-yellow-300" /> Start Today
            </span>
            <h2 className="text-3xl sm:text-4xl font-black">
              Ready to Watch Your Child Build the Future?
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base font-medium">
              Join thousands of Nigerian parents giving their children the gift of computational thinking, mathematics mastery, and coding confidence.
            </p>

            <div className="pt-4">
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-slate-900 font-black text-base shadow-xl active:scale-95 transition-all"
              >
                <span>Unlock DolaCode Now</span>
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="DolaCode" className="w-[85px] h-auto object-contain brightness-0 invert" />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering the next generation of African tech leaders with gamified mathematics, block coding, and Python programming.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a href="https://chat.whatsapp.com/JjgzmtZn7bJ2pwl4LdUCbO?s=cl&p=a&iam=2" target="_blank" rel="noopener noreferrer" title="Join DolaCode WhatsApp Community" className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 text-emerald-400 hover:text-white transition-all"><FaWhatsapp size={16} /></a>
              <a href="https://www.facebook.com/DevnaijaAcademykids" target="_blank" rel="noopener noreferrer" title="Devnaija Kids Facebook" className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-500 hover:border-blue-500 hover:text-white transition-all"><FaFacebook size={15} /></a>
              <a href="https://www.instagram.com/devnaijaacademykids13/" target="_blank" rel="noopener noreferrer" title="Devnaija Kids Instagram" className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-pink-500 hover:border-pink-500 hover:text-white transition-all"><FaInstagram size={15} /></a>
              <a href="https://www.youtube.com/@DevnaijaKids-z8p" target="_blank" rel="noopener noreferrer" title="Devnaija Kids YouTube" className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-red-500 hover:border-red-500 hover:text-white transition-all"><FaYoutube size={15} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-widest text-sky-400 mb-4">Curriculum</h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
              <li><Link href="/stage1" className="hover:text-white transition-colors">1. DolaCode Numeracy</Link></li>
              <li><Link href="/stage2" className="hover:text-white transition-colors">2. Block Coding</Link></li>
              <li><Link href="/stage4" className="hover:text-white transition-colors">3. Python Quest</Link></li>
              <li><Link href="/stage3" className="hover:text-white transition-colors">4. App Studio</Link></li>
              <li><Link href="/web-studio" className="hover:text-white transition-colors">5. Web Studio</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-widest text-purple-400 mb-4">Parent Portal</h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
              <li><Link href="/parent-dashboard" className="hover:text-white transition-colors">Parent Dashboard</Link></li>
              <li><Link href="/subscribe" className="hover:text-white transition-colors">Pricing &amp; Plans</Link></li>
              <li>
                <a 
                  href="https://chat.whatsapp.com/JjgzmtZn7bJ2pwl4LdUCbO?s=cl&p=a&iam=2" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-emerald-400 hover:text-emerald-300 transition-colors font-bold"
                >
                  WhatsApp Community
                </a>
              </li>
              <li><Link href="/child-safety" className="hover:text-white transition-colors">Child Safety Policy</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-widest text-yellow-400 mb-4">Legal</h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li className="pt-2 text-slate-500 text-[11px]">hello@devnaija.com</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-center text-xs font-medium text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; 2026 DolaCode Platform. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed with <Heart size={14} className="text-pink-500 fill-pink-500" /> for young tech leaders.
          </p>
        </div>
      </footer>

      {/* Checkout Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialPlanId={selectedPlanId}
        parentEmail={user?.email}
        onSuccess={() => {
          setIsModalOpen(false);
          router.push('/parent-dashboard?payment=complete');
        }}
      />

      {/* Student Account Alert Modal */}
      {showStudentAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-white text-center space-y-4">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-3xl mx-auto">
              👨‍👩‍👧
            </div>
            <h3 className="text-xl font-black text-slate-900">Parent Account Required</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              You are currently logged in as a <strong>student</strong> (<span className="text-indigo-600 font-bold">{user?.username}</span>). Subscriptions must be purchased and managed by a parent.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 font-medium">
              Ask your parent or guardian to sign in or register as a parent to activate your membership!
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowStudentAlert(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Got It
              </button>
              <button
                onClick={() => {
                  logout();
                  router.push('/login?redirect=/subscribe');
                }}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs cursor-pointer shadow-md shadow-indigo-600/20"
              >
                Log In as Parent
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
