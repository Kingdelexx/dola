"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Rocket, Play, LogOut, Code, Calendar, Star, Trophy, Sparkles, Gamepad2, Quote, Crown, Target, Mail, Lock, Brain } from 'lucide-react';
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
  const [allBadges, setAllBadges] = useState<any[]>([]);

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    
    // Load progress
    const s1 = user?.profile?.stage1_progress ?? (localStorage.getItem('stage1_progress') ? parseInt(localStorage.getItem('stage1_progress') || '0', 10) : 0);
    const s2 = user?.profile?.stage2_progress ?? (localStorage.getItem('stage2_progress') ? parseInt(localStorage.getItem('stage2_progress') || '0', 10) : 0);
    setStage1Progress(s1);
    setStage2Progress(s2);
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
    if (!loading && !user) {
      router.push('/login');
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

  const isStage2Unlocked = true;
  const isStage3Unlocked = true;
  const isStage4Unlocked = true; 

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
          <Link href="/" className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border-4 border-white shadow-[0_8px_0_rgba(0,0,0,0.05)] hover:translate-y-[-2px] transition-transform">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center shadow-inner rotate-3">
              <Rocket className="text-white" size={24} />
            </div>
            <span className="font-black text-2xl text-slate-800">DolaCode</span>
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
                {user.profile?.coding_experience && (
                  <span className="flex items-center gap-2 bg-purple-50 border-2 border-purple-100 px-4 py-2 rounded-xl shadow-sm capitalize">
                    <Target size={18} className="text-purple-500" /> Exp: {user.profile.coding_experience}
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
              <p className="text-slate-500 font-semibold leading-relaxed text-xs flex-1">Maths for coding readiness—numbers, logic, patterns, and digital thinking.</p>
              <div className="mt-4 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{Math.min(stage1Progress, 80)}/80 Complete</div>
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
          
          {/* Stage 3 */}
          <div className="dash-element">
            {isStage3Unlocked ? (
              <Link href="/stage3" className="block h-full group bg-white border-4 border-white p-6 rounded-[2rem] shadow-[0_15px_40px_-10px_rgba(56,189,248,0.3)] hover:shadow-[0_20px_50px_-10px_rgba(56,189,248,0.5)] hover:border-sky-200 transition-all duration-300 transform hover:-translate-y-4 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sky-50 to-transparent"></div>
                <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-500 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-sky-200 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 border-4 border-white relative z-10 text-white">
                  <span className="text-3xl">📱</span>
                </div>
                <h3 className="text-xl font-black mb-1 text-slate-800">World 3</h3>
                <p className="text-sky-600 font-bold bg-sky-50 px-3 py-0.5 rounded-full mb-3 text-sm">App Studio</p>
                <p className="text-slate-500 font-semibold leading-relaxed text-xs flex-1">Design user interfaces, add buttons and sliders, and write code to build real apps.</p>
                <div className="mt-4 bg-sky-500 text-white w-full py-2.5 rounded-xl font-black text-base shadow-[0_4px_0_#0284c7] group-hover:bg-sky-400 transition-colors">Play Now</div>
              </Link>
            ) : (
              <div className="h-full bg-slate-100/70 border-4 border-dashed border-slate-200 p-6 rounded-[2rem] flex flex-col items-center text-center relative overflow-hidden opacity-75">
                <div className="absolute top-4 right-4 bg-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded text-xs flex items-center gap-1"><Lock size={12} /> Locked</div>
                <div className="w-20 h-20 bg-slate-200 rounded-3xl flex items-center justify-center mb-4 border-4 border-white relative z-10 text-slate-400 shadow-inner">
                  <span className="text-3xl">📱</span>
                </div>
                <h3 className="text-xl font-black mb-1 text-slate-600">World 3</h3>
                <p className="text-slate-500 font-bold bg-slate-200 px-3 py-0.5 rounded-full mb-3 text-xs">App Studio</p>
                <p className="text-slate-400 font-semibold leading-relaxed text-xs flex-1">Complete World 2: Block Coding to unlock your App Designer studio!</p>
                <div className="mt-4 bg-slate-200 text-slate-400 w-full py-2.5 rounded-xl font-black text-base">Locked</div>
              </div>
            )}
          </div>

          {/* Stage 4 */}
          <div className="dash-element">
            {isStage4Unlocked ? (
              <Link href="/stage4" className="block h-full group bg-white border-4 border-white p-6 rounded-[2rem] shadow-[0_15px_40px_-10px_rgba(139,92,246,0.3)] hover:shadow-[0_20px_50px_-10px_rgba(139,92,246,0.5)] hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-4 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-50 to-transparent"></div>
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-purple-200 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 border-4 border-white relative z-10 text-white">
                  <Code size={32} />
                </div>
                <h3 className="text-xl font-black mb-1 text-slate-800">World 4</h3>
                <p className="text-purple-600 font-bold bg-purple-50 px-3 py-0.5 rounded-full mb-3 text-sm">Python Pro</p>
                <p className="text-slate-500 font-semibold leading-relaxed text-xs flex-1">Write real text-based Python code and build programs with an AI sidekick.</p>
                <div className="mt-4 bg-purple-500 text-white w-full py-2.5 rounded-xl font-black text-base shadow-[0_4px_0_#6d28d9] group-hover:bg-purple-400 transition-colors">Play Now</div>
              </Link>
            ) : (
              <div className="h-full bg-slate-100/70 border-4 border-dashed border-slate-200 p-6 rounded-[2rem] flex flex-col items-center text-center relative overflow-hidden opacity-75">
                <div className="absolute top-4 right-4 bg-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded text-xs flex items-center gap-1"><Lock size={12} /> Locked</div>
                <div className="w-20 h-20 bg-slate-200 rounded-3xl flex items-center justify-center mb-4 border-4 border-white relative z-10 text-slate-400 shadow-inner">
                  <Code size={36} />
                </div>
                <h3 className="text-xl font-black mb-1 text-slate-600">World 4</h3>
                <p className="text-slate-500 font-bold bg-slate-200 px-3 py-0.5 rounded-full mb-3 text-xs">Python Pro</p>
                <p className="text-slate-400 font-semibold leading-relaxed text-xs flex-1">Complete World 3: App Studio to collaborate with a Python AI helper.</p>
                <div className="mt-4 bg-slate-200 text-slate-400 w-full py-2.5 rounded-xl font-black text-base">Locked</div>
              </div>
            )}
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

      </div>
    </div>
  );
}
