"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Rocket, Play, LogOut, Code, Calendar, Star, Trophy, Sparkles, Gamepad2, Quote, Crown, Target, Mail, Lock, Brain, Bot, Store, ShieldCheck, UserCircle2 } from 'lucide-react';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import { gsap } from 'gsap';

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const containerRef = useRef(null);

  const quotes = [
    "Every expert was once a beginner. Keep coding! ⭐",
    "Bugs are just unexpected features. You can fix them! 🐛",
    "Code is like magic. You are the wizard! 🧙‍♂️",
    "Dream it. Code it. Play it! 🎮",
    "Your imagination is your only limit! 🚀",
    "Mistakes mean you are learning. Keep going! 💪"
  ];
  
  const [quote, setQuote] = useState(quotes[0]);
  const [stage1Progress, setStage1Progress] = useState(0);
  const [stage2Progress, setStage2Progress] = useState(0);
  const [stage3Completed, setStage3Completed] = useState(false);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [showStudentGuidance, setShowStudentGuidance] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);

  const isUnpaid = user?.subscription_access && !user.subscription_access.has_access;

  const handleUnlockClick = () => {
    if (user?.profile?.role === 'parent') {
      setShowParentModal(true);
    } else {
      setShowStudentGuidance(true);
    }
  };

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    
    // Load progress
    const s1 = user?.profile?.stage1_progress ?? (localStorage.getItem('stage1_progress') ? parseInt(localStorage.getItem('stage1_progress') || '0', 10) : 0);
    const s2 = user?.profile?.stage2_progress ?? (localStorage.getItem('stage2_progress') ? parseInt(localStorage.getItem('stage2_progress') || '0', 10) : 0);
    const s3 = localStorage.getItem('stage3_completed') === 'true';
    setStage1Progress(s1);
    setStage2Progress(s2);
    setStage3Completed(s3);
  }, [user]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/badges/`)
      .then(res => {
        if (!res.ok) throw new Error(`Network response was not ok: ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error("Response is not JSON");
      })
      .then(data => {
        if (data.badges) {
          setAllBadges(data.badges);
        }
      })
      .catch(err => console.error("Error fetching badges list:", err));
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.profile?.role === 'parent') {
        router.push('/parent-dashboard');
      } else if (user.profile?.role === 'teacher') {
        router.push('/teacher-dashboard');
      } else if (user.profile?.role === 'school_admin') {
        router.push('/school-dashboard');
      } else if (user.profile?.role === 'super_admin' || user.is_superuser) {
        router.push('/super-admin');
      } else if (user.profile?.role === 'student') {
        const hasClassroom = !!user.profile?.classroom;
        const hasStartingScore = user.profile?.starting_score !== null && user.profile?.starting_score !== undefined;
        if (!hasStartingScore && !hasClassroom) {
          router.push('/onboarding/challenge');
        }
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !loading) {
      const ctx = gsap.context(() => {
        gsap.from(".dash-element", { y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.5)" });
        gsap.from(".quote-bubble", { scale: 0.8, opacity: 0, duration: 0.8, ease: "elastic.out(1, 0.5)", delay: 0.4 });
        gsap.to(".floating-star", { y: "random(-10, 10)", rotation: "random(-20, 20)", duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: 0.2 });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border-4 border-pink-200 animate-pulse">
          <Rocket className="text-pink-500 animate-bounce mx-auto mb-4" size={64} />
          <h2 className="text-xl font-black text-slate-700">Loading your world...</h2>
        </div>
      </div>
    );
  }

  const isAdminOrTeacher = user?.profile?.role && ['teacher', 'school_admin', 'super_admin'].includes(user.profile.role);

  const isStage1Unlocked = true;
  const isStage2Unlocked = true;
  const isStage3Unlocked = true; // World 3 (Python Pro) Unlocked
  const isStage4Unlocked = (stage1Progress >= 80 && stage2Progress >= 11 && stage3Completed) || isAdminOrTeacher; // World 4 (App Studio) Locked

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 text-slate-800 p-6 md:p-10 font-sans overflow-x-hidden" ref={containerRef}>
      {/* Playful Background Elements */}
      <Star className="floating-star absolute top-20 right-[15%] text-yellow-400 w-12 h-12 opacity-60" />
      <Sparkles className="floating-star absolute bottom-32 left-[10%] text-pink-400 w-10 h-10 opacity-50" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-300/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-300/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 dash-element">
          <Link href="/" className="flex items-center bg-white px-5 py-2.5 rounded-full border-4 border-white shadow-[0_8px_0_rgba(0,0,0,0.05)] hover:translate-y-[-2px] transition-transform">
            <img src="/logo.png" alt="DolaCode Logo" className="w-[80px] h-auto object-contain" />
          </Link>
          <button onClick={logout} className="flex items-center gap-2 bg-white hover:bg-red-50 text-slate-600 hover:text-red-500 border-2 border-slate-200 hover:border-red-200 px-6 py-3 rounded-full font-bold transition-all shadow-sm">
            <LogOut size={20} /> Save & Exit
          </button>
        </div>

        {/* Welcome Profile Card */}
        <div className="bg-white border-4 border-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] mb-10 dash-element relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-yellow-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 relative z-10">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-300 to-yellow-400 rounded-full border-8 border-yellow-100 shadow-xl flex items-center justify-center shrink-0">
              <span className="text-6xl">🧑‍🚀</span>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 text-sm font-black mb-4 border-2 border-orange-200">
                <Crown size={18} className="fill-orange-500" /> Coder Level 1
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 text-slate-800">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">{user.username}!</span>
              </h1>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-slate-700 font-bold mb-6">
                {user.profile?.age && (
                  <span className="flex items-center gap-2 bg-sky-50 border-2 border-sky-100 px-4 py-2 rounded-xl shadow-sm">
                    <Calendar size={18} className="text-sky-500" /> Age: {user.profile.age}
                  </span>
                )}
                {user.profile?.learning_band && (
                  <span className="flex items-center gap-2 bg-emerald-50 border-2 border-emerald-100 px-4 py-2 rounded-xl shadow-sm text-emerald-800 font-extrabold capitalize">
                    <Brain size={18} className="text-emerald-500" /> Band: {user.profile.learning_band}
                  </span>
                )}
                <span className="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 px-4 py-2 rounded-xl shadow-sm">
                  <Mail size={18} className="text-slate-400" /> {user.email}
                </span>
              </div>

              {/* Stars & Streaks Stats Card */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
                <div className="flex items-center gap-3 bg-gradient-to-br from-amber-50 to-yellow-50 border-4 border-amber-200 px-5 py-3 rounded-2xl shadow-[0_4px_0_rgba(245,158,11,0.2)]">
                  <Star className="text-amber-500 fill-amber-400" size={28} />
                  <div>
                    <div className="text-[10px] text-amber-600 font-black uppercase tracking-wider leading-none">Learner Reward</div>
                    <div className="text-lg font-black text-slate-800 leading-tight">{user.profile?.points ?? 0} Stars</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gradient-to-br from-orange-50 to-amber-50 border-4 border-orange-200 px-5 py-3 rounded-2xl shadow-[0_4px_0_rgba(249,115,22,0.2)]">
                  <span className="text-2xl animate-pulse">🔥</span>
                  <div>
                    <div className="text-[10px] text-orange-600 font-black uppercase tracking-wider leading-none">Active Streak</div>
                    <div className="text-lg font-black text-slate-800 leading-tight">{user.profile?.current_streak ?? 0} Days</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gradient-to-br from-red-50 to-orange-50 border-4 border-red-200 px-5 py-3 rounded-2xl shadow-[0_4px_0_rgba(239,68,68,0.15)]">
                  <Trophy className="text-red-500 fill-red-100" size={28} />
                  <div>
                    <div className="text-[10px] text-red-600 font-black uppercase tracking-wider leading-none">Longest Streak</div>
                    <div className="text-lg font-black text-slate-800 leading-tight">{user.profile?.longest_streak ?? 0} Days</div>
                  </div>
                </div>
              </div>

              <div className="quote-bubble bg-gradient-to-r from-sky-400 to-blue-500 text-white p-5 rounded-2xl rounded-tl-none inline-block shadow-[0_8px_0_#2563eb] relative mt-2 border-4 border-white">
                <Quote size={24} className="absolute -top-3 -left-3 text-yellow-300 fill-yellow-300 drop-shadow-md rotate-12" />
                <p className="font-bold text-lg">{quote}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Notice for Independent / Unpaid Learners */}
        {user?.subscription_access && !user.subscription_access.has_access && (
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-[2.5rem] p-6 sm:p-8 mb-10 border-4 border-purple-400/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 dash-element relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-5 relative z-10 text-center md:text-left">
              <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-lg border-2 border-white/20">
                🚀
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-black uppercase tracking-wider mb-2">
                  <Sparkles size={12} className="text-yellow-400" /> Free Preview Mode &bull; Chapter 1 Unlocked
                </div>
                <h3 className="font-black text-2xl sm:text-3xl text-white tracking-tight leading-tight">
                  Your DolaCode adventure is waiting!
                </h3>
                <p className="text-purple-200/90 text-sm sm:text-base font-medium mt-1 max-w-xl">
                  Ask your parent to unlock your learning world.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full md:w-auto shrink-0">
              <button
                onClick={handleUnlockClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 hover:from-amber-500 hover:to-pink-600 text-white font-black text-sm uppercase tracking-wider shadow-[0_6px_0_#9d174d] hover:shadow-[0_8px_0_#9d174d] transition-all transform active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock size={16} />
                <span>UNLOCK DOLACODE</span>
              </button>
            </div>
          </div>
        )}

        {/* Interactive Mini-Games Showcase */}
        <div className="dash-element mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Dola's Pizza Shop */}
            <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-[2.5rem] p-6 text-white shadow-xl border-4 border-white flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 translate-x-8 translate-y-6 opacity-15 pointer-events-none text-8xl">
                🍕
              </div>
              <div className="relative z-10 mb-4">
                <div className="inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
                  <Sparkles size={13} className="text-yellow-300" /> Stage 1 Part 9
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/40 shrink-0">
                    🍕
                  </div>
                  <h3 className="text-xl font-black drop-shadow-sm">
                    Dola&apos;s Pizza Shop
                  </h3>
                </div>
                <p className="text-orange-100 text-xs sm:text-sm font-semibold leading-relaxed">
                  Serve friendly customers, drag and count slices, share with friends, and discover computational loops through cooking!
                </p>
              </div>
              <div className="relative z-10 pt-2">
                <Link
                  href="/stage1/pizza-shop"
                  className="w-full py-3 rounded-2xl bg-white text-orange-600 hover:text-orange-700 font-black text-sm shadow-md hover:shadow-lg transform active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span>Play Pizza Shop</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* 2. Robot Maze */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 rounded-[2.5rem] p-6 text-white shadow-xl border-4 border-white flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 translate-x-8 translate-y-6 opacity-15 pointer-events-none text-8xl">
                🤖
              </div>
              <div className="relative z-10 mb-4">
                <div className="inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
                  <Sparkles size={13} className="text-cyan-200" /> Stage 1 Part 10
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/40 shrink-0">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-black drop-shadow-sm">
                    Robot Maze
                  </h3>
                </div>
                <p className="text-teal-100 text-xs sm:text-sm font-semibold leading-relaxed">
                  Program Robo the friendly robot! Arrange visual arrows, master repeat loops, dodge obstacles, and debug code!
                </p>
              </div>
              <div className="relative z-10 pt-2">
                <Link
                  href="/stage1/robot-maze"
                  className="w-full py-3 rounded-2xl bg-white text-teal-700 hover:text-teal-800 font-black text-sm shadow-md hover:shadow-lg transform active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span>Play Robot Maze</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* 3. My Little Shop */}
            <div className="bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 rounded-[2.5rem] p-6 text-white shadow-xl border-4 border-white flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 translate-x-8 translate-y-6 opacity-15 pointer-events-none text-8xl">
                🏪
              </div>
              <div className="relative z-10 mb-4">
                <div className="inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
                  <Sparkles size={13} className="text-amber-200" /> Stage 1 Part 11
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/40 shrink-0">
                    <Store className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-black drop-shadow-sm">
                    My Little Shop
                  </h3>
                </div>
                <p className="text-emerald-100 text-xs sm:text-sm font-semibold leading-relaxed">
                  Run a colourful Nigerian neighbourhood shop! Count Naira, give exact change, manage stock, and use coding loops!
                </p>
              </div>
              <div className="relative z-10 pt-2">
                <Link
                  href="/stage1/my-little-shop"
                  className="w-full py-3 rounded-2xl bg-white text-emerald-800 hover:text-emerald-900 font-black text-sm shadow-md hover:shadow-lg transform active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span>Play Little Shop</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* 4. Frog Adventure */}
            <div className="bg-gradient-to-r from-lime-500 via-emerald-600 to-teal-600 rounded-[2.5rem] p-6 text-white shadow-xl border-4 border-white flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 translate-x-8 translate-y-6 opacity-15 pointer-events-none text-8xl">
                🐸
              </div>
              <div className="relative z-10 mb-4">
                <div className="inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
                  <Sparkles size={13} className="text-lime-200" /> Stage 1 Part 12
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/40 shrink-0">
                    🐸
                  </div>
                  <h3 className="text-xl font-black drop-shadow-sm">
                    Frog Adventure
                  </h3>
                </div>
                <p className="text-lime-100 text-xs sm:text-sm font-semibold leading-relaxed">
                  Guide Hoppy through ponds &amp; rainforests! Count jumps, turn directions, solve patterns, and debug code!
                </p>
              </div>
              <div className="relative z-10 pt-2">
                <Link
                  href="/stage1/frog-adventure"
                  className="w-full py-3 rounded-2xl bg-white text-emerald-800 hover:text-emerald-900 font-black text-sm shadow-md hover:shadow-lg transform active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span>Play Frog Adventure</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* 5. Traffic Rescue */}
            <div className="bg-gradient-to-r from-amber-500 via-rose-600 to-indigo-600 rounded-[2.5rem] p-6 text-white shadow-xl border-4 border-white flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 translate-x-8 translate-y-6 opacity-15 pointer-events-none text-8xl">
                🚦
              </div>
              <div className="relative z-10 mb-4">
                <div className="inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
                  <Sparkles size={13} className="text-amber-200" /> Stage 1 Part 13
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/40 shrink-0">
                    🚦
                  </div>
                  <h3 className="text-xl font-black drop-shadow-sm">
                    Traffic Rescue
                  </h3>
                </div>
                <p className="text-amber-100 text-xs sm:text-sm font-semibold leading-relaxed">
                  Control miniature city traffic! Coordinate traffic lights, protect zebra crossings, and automate roads with IF/THEN rules!
                </p>
              </div>
              <div className="relative z-10 pt-2">
                <Link
                  href="/stage1/traffic-rescue"
                  className="w-full py-3 rounded-2xl bg-white text-indigo-900 hover:text-indigo-950 font-black text-sm shadow-md hover:shadow-lg transform active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span>Play Traffic Rescue</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* 6. Pet Rescue */}
            <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 rounded-[2.5rem] p-6 text-white shadow-xl border-4 border-white flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 translate-x-8 translate-y-6 opacity-15 pointer-events-none text-8xl">
                🐶
              </div>
              <div className="relative z-10 mb-4">
                <div className="inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
                  <Sparkles size={13} className="text-pink-200" /> Stage 1 Part 14
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/40 shrink-0">
                    🐶
                  </div>
                  <h3 className="text-xl font-black drop-shadow-sm">
                    Pet Rescue
                  </h3>
                </div>
                <p className="text-pink-100 text-xs sm:text-sm font-semibold leading-relaxed">
                  Help friendly rescue animals! Count food, sort treats, build care routines, recognize patterns, and use IF/THEN rules!
                </p>
              </div>
              <div className="relative z-10 pt-2">
                <Link
                  href="/stage1/pet-rescue"
                  className="w-full py-3 rounded-2xl bg-white text-rose-700 hover:text-rose-800 font-black text-sm shadow-md hover:shadow-lg transform active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span>Play Pet Rescue</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Worlds/Stages Section */}
        <h2 className="text-3xl font-black mb-6 text-slate-800 flex items-center gap-3 dash-element">
          <Gamepad2 className="text-pink-500" size={32} /> Choose Your World
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stage 1 */}
          <div className="dash-element">
            <Link href="/stage1" className="block h-full group bg-white border-4 border-white p-6 rounded-[2rem] shadow-[0_15px_40px_-10px_rgba(99,102,241,0.3)] hover:shadow-[0_20px_50px_-10px_rgba(99,102,241,0.5)] hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-4 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50 to-transparent"></div>
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 border-4 border-white relative z-10 text-white">
                <Brain size={36} />
              </div>
              <h3 className="text-xl font-black mb-1 text-slate-800">World 1</h3>
              <p className="text-indigo-600 font-bold bg-indigo-50 px-3 py-0.5 rounded-full mb-3 text-sm">DolaCode Numeracy</p>
              {isUnpaid && (
                <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-block">
                  Free Sample Chapter 1 Available
                </div>
              )}
              <p className="text-slate-500 font-semibold leading-relaxed text-xs flex-1">Maths for coding readiness—numbers, logic, patterns, and digital thinking.</p>
              <div className="mt-4 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{Math.min(stage1Progress, 140)}/140 Complete</div>
              <div className="mt-4 bg-indigo-500 text-white w-full py-2.5 rounded-xl font-black text-base shadow-[0_4px_0_#4338ca] group-hover:bg-indigo-400 transition-colors">Play Now</div>
            </Link>
          </div>
          
          {/* Stage 2 */}
          <div className="dash-element">
            {isStage2Unlocked ? (
              <Link href="/stage2" className="block h-full group bg-white border-4 border-white p-6 rounded-[2rem] shadow-[0_15px_40px_-10px_rgba(236,72,153,0.3)] hover:shadow-[0_20px_50px_-10px_rgba(236,72,153,0.5)] hover:border-pink-200 transition-all duration-300 transform hover:-translate-y-4 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-pink-50 to-transparent"></div>
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-pink-200 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 border-4 border-white relative z-10 text-white">
                  <Play size={32} className="fill-white ml-1" />
                </div>
                <h3 className="text-xl font-black mb-1 text-slate-800">World 2</h3>
                <p className="text-pink-600 font-bold bg-pink-50 px-3 py-0.5 rounded-full mb-3 text-sm">Block Coding</p>
                {isUnpaid && (
                  <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-pink-700 bg-pink-100 border border-pink-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Lock size={10} /> Locked Adventure
                  </div>
                )}
                <p className="text-slate-500 font-semibold leading-relaxed text-xs flex-1">Snap colorful code blocks together to build games and solve maze challenges.</p>
                <div className="mt-4 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{Math.min(stage2Progress, 11)}/11 Complete</div>
                <div className="mt-4 bg-pink-500 text-white w-full py-2.5 rounded-xl font-black text-base shadow-[0_4px_0_#be185d] group-hover:bg-pink-400 transition-colors">Play Now</div>
              </Link>
            ) : (
              <div className="h-full bg-slate-100/70 border-4 border-dashed border-slate-200 p-6 rounded-[2rem] flex flex-col items-center text-center relative overflow-hidden opacity-75">
                <div className="absolute top-4 right-4 bg-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded text-xs flex items-center gap-1"><Lock size={12} /> Locked</div>
                <div className="w-20 h-20 bg-slate-200 rounded-3xl flex items-center justify-center mb-4 border-4 border-white relative z-10 text-slate-400 shadow-inner">
                  <Code size={36} />
                </div>
                <h3 className="text-xl font-black mb-1 text-slate-600">World 2</h3>
                <p className="text-slate-500 font-bold bg-slate-200 px-3 py-0.5 rounded-full mb-3 text-xs">Block Coding</p>
                <p className="text-slate-400 font-semibold leading-relaxed text-xs flex-1">Complete World 1: DolaCode Numeracy to unlock this block coding arena!</p>
                <div className="mt-4 bg-slate-200 text-slate-400 w-full py-2.5 rounded-xl font-black text-base">Locked</div>
              </div>
            )}
          </div>
          
          {/* World 3: Python Pro */}
          <div className="dash-element">
            {isStage3Unlocked ? (
              <Link href="/stage4" className="block h-full group bg-white border-4 border-white p-6 rounded-[2rem] shadow-[0_15px_40px_-10px_rgba(139,92,246,0.3)] hover:shadow-[0_20px_50px_-10px_rgba(139,92,246,0.5)] hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-4 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-50 to-transparent"></div>
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-purple-200 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 border-4 border-white relative z-10 text-white">
                  <Code size={32} />
                </div>
                <h3 className="text-xl font-black mb-1 text-slate-800">World 3</h3>
                <p className="text-purple-600 font-bold bg-purple-50 px-3 py-0.5 rounded-full mb-3 text-sm">Python Pro</p>
                {isUnpaid && (
                  <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 border border-purple-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Lock size={10} /> Locked Adventure
                  </div>
                )}
                <p className="text-slate-500 font-semibold leading-relaxed text-xs flex-1">Write real text-based Python code and build programs with an AI sidekick.</p>
                <div className="mt-4 bg-purple-500 text-white w-full py-2.5 rounded-xl font-black text-base shadow-[0_4px_0_#6d28d9] group-hover:bg-purple-400 transition-colors">Play Now</div>
              </Link>
            ) : (
              <div className="h-full bg-slate-100/70 border-4 border-dashed border-slate-200 p-6 rounded-[2rem] flex flex-col items-center text-center relative overflow-hidden opacity-75">
                <div className="absolute top-4 right-4 bg-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded text-xs flex items-center gap-1"><Lock size={12} /> Locked</div>
                <div className="w-20 h-20 bg-slate-200 rounded-3xl flex items-center justify-center mb-4 border-4 border-white relative z-10 text-slate-400 shadow-inner">
                  <Code size={36} />
                </div>
                <h3 className="text-xl font-black mb-1 text-slate-600">World 3</h3>
                <p className="text-slate-500 font-bold bg-slate-200 px-3 py-0.5 rounded-full mb-3 text-xs">Python Pro</p>
                <p className="text-slate-400 font-semibold leading-relaxed text-xs flex-1">Complete World 2: Block Coding to collaborate with a Python AI helper.</p>
                <div className="mt-4 bg-slate-200 text-slate-400 w-full py-2.5 rounded-xl font-black text-base">Locked</div>
              </div>
            )}
          </div>

          {/* World 4: Web Dev Studio */}
          <div className="dash-element">
            <Link href="/web-studio" className="block h-full group bg-white border-4 border-white p-6 rounded-[2rem] shadow-[0_15px_40px_-10px_rgba(245,158,11,0.3)] hover:shadow-[0_20px_50px_-10px_rgba(245,158,11,0.5)] hover:border-amber-200 transition-all duration-300 transform hover:-translate-y-4 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-50 to-transparent"></div>
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-amber-200 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 border-4 border-white relative z-10 text-white">
                <span className="text-3xl">🌐</span>
              </div>
              <h3 className="text-xl font-black mb-1 text-slate-800">World 4</h3>
              <p className="text-amber-600 font-bold bg-amber-50 px-3 py-0.5 rounded-full mb-3 text-sm">Web Dev Studio</p>
              {isUnpaid && (
                <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Lock size={10} /> Locked Adventure
                </div>
              )}
              <p className="text-slate-500 font-semibold leading-relaxed text-xs flex-1">Write HTML & CSS side-by-side to design magical websites with real-time live previews!</p>
              <div className="mt-4 bg-amber-500 text-slate-950 w-full py-2.5 rounded-xl font-black text-base shadow-[0_4px_0_#b45309] group-hover:bg-amber-400 transition-colors">Play Now</div>
            </Link>
          </div>
        </div>

        {/* Badges Gallery Section */}
        {allBadges.length > 0 && (
          <div className="bg-white border-4 border-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] mb-10 dash-element">
            <h2 className="text-3xl font-black mb-8 text-slate-800 flex items-center gap-3">
              <Trophy className="text-yellow-500" size={32} /> Badge Achievements
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {allBadges.map((badge) => {
                const isEarned = user.earned_badges?.some((ub: any) => ub.badge.id === badge.id);
                return (
                  <div 
                    key={badge.id} 
                    className={`flex flex-col items-center p-5 rounded-2xl border-4 transition-all duration-300 relative group cursor-pointer ${
                      isEarned 
                        ? 'bg-yellow-50/50 border-yellow-200 hover:scale-105 shadow-md shadow-yellow-100 hover:border-yellow-300' 
                        : 'bg-slate-50 border-slate-100 opacity-60 hover:opacity-80'
                    }`}
                  >
                    {/* Badge Icon */}
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-5xl mb-3 relative ${
                      isEarned 
                        ? 'bg-gradient-to-br from-yellow-100 to-amber-200 border-4 border-white shadow-inner animate-pulse' 
                        : 'bg-slate-200 text-slate-400 border-4 border-white shadow-inner'
                    }`}>
                      {badge.icon}
                      {!isEarned && (
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-slate-400 rounded-full border-2 border-white flex items-center justify-center text-xs text-white">
                          🔒
                        </div>
                      )}
                    </div>
                    
                    {/* Badge Info */}
                    <h3 className="font-black text-sm text-slate-800 text-center mb-1 leading-tight">
                      {badge.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold text-center leading-normal">
                      {badge.description}
                    </p>
                    
                    {isEarned && (
                      <span className="absolute top-2 right-2 text-xs">✅</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Student Guidance Modal */}
        {showStudentGuidance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border-4 border-purple-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-left">
              <button
                onClick={() => setShowStudentGuidance(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 font-bold"
              >
                ✕
              </button>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg border border-white/20">
                <UserCircle2 size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                Ask Your Parent to Unlock DolaCode!
              </h3>
              <p className="text-purple-200/90 text-sm leading-relaxed mb-4">
                DolaCode subscriptions are family-based to keep your account safe and learning adventure uninterrupted.
              </p>
              <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10 mb-6 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="font-black text-pink-400">1.</span>
                  <span>Share this link with your parent: <strong className="text-white">dolacode.com.ng/subscribe</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-black text-pink-400">2.</span>
                  <span>They log into their Parent Dashboard and activate a family plan.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-black text-pink-400">3.</span>
                  <span>All worlds, games, and coding tools unlock for you instantly!</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-300/80 bg-white/5 py-2.5 px-3.5 rounded-xl border border-white/5 mb-4">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span>Your stars, XP, and badges are 100% saved and will never be deleted.</span>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href="/subscribe"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-sm text-center shadow-lg transition-transform active:scale-95"
                >
                  Go to Pricing &amp; Plans Page
                </Link>
                <button
                  onClick={() => setShowStudentGuidance(false)}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Parent Subscription Modal */}
        <SubscriptionModal
          isOpen={showParentModal}
          onClose={() => setShowParentModal(false)}
          onSuccess={() => {
            setShowParentModal(false);
            window.location.reload();
          }}
        />

      </div>
    </div>
  );
}
