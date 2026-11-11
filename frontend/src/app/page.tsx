"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import 'animate.css';
import {
  Blocks, Terminal, Bot, Rocket, Star, Sparkles, ChevronRight,
  Play, MousePointerClick, Unlock, Ghost, LayoutGrid, Quote, UserCircle2,
  Plus, Minus, Mail, MapPin, Cloud, Trophy, Gamepad2, Sun, Crown, Heart,
  Coins, Brain, ShieldCheck, Users, ArrowRight, Laptop, CheckCircle2, Store,
  Flame, Award, Lightbulb, Zap, Code
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const featuresRef = useRef(null);
  const shapesRef = useRef(null);
  const demoRef = useRef(null);

  const ctaButtonRef = useRef(null);

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Playful floating clouds and shapes
      gsap.to(".floating-shape", {
        y: "random(-25, 25)",
        x: "random(-20, 20)",
        rotation: "random(-10, 10)",
        duration: "random(3, 5)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.15,
      });

      // Hero Elements bounce-in
      gsap.from(titleRef.current, { y: 60, opacity: 0, duration: 1.2, ease: "bounce.out", delay: 0.2 });
      gsap.from(subtitleRef.current, { y: 40, opacity: 0, duration: 1, ease: "power3.out", delay: 0.4 });
      gsap.from(buttonsRef.current, { scale: 0.5, opacity: 0, duration: 1, ease: "elastic.out(1, 0.5)", delay: 0.6 });

      // Demo Loop (More energetic)
      const demoTl = gsap.timeline({ repeat: -1 });
      demoTl.to(".demo-sprite", { x: 180, duration: 1.2, ease: "power2.inOut" })
        .to(".demo-sprite", { y: -80, duration: 0.4, ease: "power1.out" })
        .to(".demo-sprite", { y: 0, duration: 0.6, ease: "bounce.out" })
        .to(".demo-sprite", { x: 0, duration: 1.2, ease: "power2.inOut", delay: 0.5 })
        .to(".demo-sprite", { rotation: 360, duration: 0.8, ease: "back.out(1.5)" }, "-=1.2");

      const codeTl = gsap.timeline({ repeat: -1 });
      codeTl.fromTo(".fake-block-1", { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "back.out(2)" })
        .fromTo(".fake-block-2", { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "back.out(2)" }, "+=0.3")
        .to(".fake-block-1, .fake-block-2", { opacity: 0, delay: 2.5 });



      // CTA Wiggle
      gsap.to(ctaButtonRef.current, {
        rotation: "random(-3, 3)",
        scale: 1.05,
        duration: 0.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 2
      });

    }, heroRef);
    return () => ctx.revert();
  }, []);


  const faqs = [
    {
      question: "What exactly will my child learn?",
      answer: "DolaCode provides a structured, progressive learning journey: Stage 1 (Math & Computational Thinking) develops logic, patterns, and problem solving; Stage 2 (Visual Block Coding) teaches algorithms, loops, and game logic; Stage 3 (App Studio) teaches UI design and building real interactive web apps; Stage 4 (Python Pro) introduces real text-based Python programming; and our Financial Literacy Game teaches practical financial literacy (currency, budgeting, saving, profit, and simple entrepreneurship in Nigerian Naira ₦)."
    },
    {
      question: "Will my child actually enjoy it?",
      answer: "Yes! DolaCode is built like an engaging adventure game rather than a boring lecture. Children play missions, rescue pets, run virtual shops, solve interactive puzzles, earn DolaCoins, collect badges, and level up. With friendly real-time encouragement and fun rewards, learning feels exciting and rewarding rather than frustrating."
    },
    {
      question: "Can I see what my child is learning?",
      answer: "Absolutely. Parents have complete visibility through a dedicated Parent Dashboard. You can monitor weekly learning streaks, completed modules, projects built, and financial milestones. You can also create simple 4-digit PINs for hassle-free child sign-in without sharing sensitive passwords."
    },
    {
      question: "Why should I pay when there are free videos online?",
      answer: "Watching free videos is passive — children quickly lose focus, skip around, or copy code without understanding the underlying logic. DolaCode is 100% interactive and hands-on: children code directly in their browser, experiment, fix bugs, and build real projects. You get a curated, age-appropriate curriculum, interactive guidance, and a safe, ad-free environment without distractions or unsafe online rabbit holes."
    },
    {
      question: "What age is this platform designed for?",
      answer: "DolaCode is built specifically for kids and teens aged 5 to 16. Younger learners (ages 5–8) build strong numeracy and block coding foundations, while older learners (ages 9–16) advance through app building, game design, text-based Python programming, and practical money management in our Financial Literacy Game."
    },
    {
      question: "Do I need prior coding experience?",
      answer: "Not at all! Our curriculum assumes zero prior knowledge. Children start with playful logic and visual blocks in Stages 1 and 2, learn how computers think, and smoothly transition to building working apps in Stage 3 and writing professional Python code in Stage 4."
    },
    {
      question: "Does it work on iPads and Chromebooks?",
      answer: "Yes! The platform runs entirely in your web browser with nothing to download or install. It works seamlessly on iPads, Android tablets, Chromebooks, Windows PCs, and Macs."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-sky-100 text-slate-800 overflow-hidden font-sans selection:bg-pink-300 selection:text-pink-900" ref={heroRef}>
      {/* Playful Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" ref={shapesRef}>
        <div className="absolute top-0 left-0 w-full h-[80vh] bg-gradient-to-b from-sky-300 to-sky-100" />
        <Cloud className="floating-shape absolute top-24 left-[10%] text-white opacity-80" size={120} />
        <Cloud className="floating-shape absolute top-40 right-[15%] text-white opacity-60" size={160} />
        <Cloud className="floating-shape absolute top-72 left-[30%] text-white opacity-70" size={90} />
        <Sun className="floating-shape absolute top-16 right-[30%] text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]" size={100} />
        <Star className="floating-shape absolute top-32 left-1/4 text-yellow-400" size={40} />
        <Star className="floating-shape absolute top-64 right-1/4 text-pink-400" size={32} />
        <Star className="floating-shape absolute bottom-32 right-1/3 text-purple-400" size={48} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center p-4 lg:px-8 bg-white/70 backdrop-blur-xl sticky top-4 mx-4 lg:mx-12 rounded-full border-[3px] border-white shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
        <Link href="/" className="flex items-center group">
          <img src="/logo.png" alt="DolaCode Logo" className="w-[80px] h-auto object-contain group-hover:scale-105 transition-transform" />
        </Link>
        <div className="space-x-3 flex items-center">
          <a
            href="https://chat.whatsapp.com/JjgzmtZn7bJ2pwl4LdUCbO?s=cl&p=a&iam=2"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow transition-all hover:scale-105"
            title="Join DolaCode WhatsApp Community"
          >
            <FaWhatsapp size={16} />
            <span>Community</span>
          </a>
          <Link href="/subscribe" className="px-4 py-2 rounded-full font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70 transition-colors">
            Pricing
          </Link>
          {!loading && user ? (
            <>
              {user.is_superuser && (
                <Link href="/admin-dashboard" className="px-5 py-2.5 rounded-full font-bold text-purple-600 hover:bg-purple-50 transition-colors">Admin</Link>
              )}
              <Link href="/dashboard" className="px-5 py-2.5 rounded-full font-bold text-sky-600 hover:bg-sky-50 transition-colors">Dashboard</Link>
              <button onClick={logout} className="px-6 py-2.5 rounded-full font-bold bg-slate-100 text-slate-700 hover:bg-red-100 hover:text-red-600 hover:scale-105 transition-all transform shadow-sm">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-6 py-2.5 rounded-full font-bold text-slate-600 hover:bg-slate-100 hover:text-sky-600 transition-colors hidden sm:block">Log In</Link>
              <Link href="/signup" className="px-6 py-2.5 rounded-full font-black bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-300 hover:to-orange-300 hover:scale-105 transition-all transform shadow-[0_6px_0_#ea580c] hover:translate-y-[-2px] active:translate-y-[4px] active:shadow-[0_2px_0_#ea580c]">
                Play Now!
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-14 pb-28 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border-2 border-white px-4 py-1.5 rounded-full text-xs font-black text-purple-900 shadow-sm">
              <Sparkles size={16} className="text-amber-500 animate-spin" />
              <span>Ages 5–16 &bull; STEM, Coding &amp; Financial Literacy</span>
            </div>
            <h1 ref={titleRef} className="text-5xl lg:text-7xl font-black leading-[1.1] text-slate-800 drop-shadow-sm">
              Code your own <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Games</span> and <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">Adventures!</span>
            </h1>
            <p ref={subtitleRef} className="text-lg sm:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Join the next generation of young tech creators! Master playful numeracy, visual block coding, web app creation, real Python, and our all-new <strong>Financial Literacy Game</strong>.
            </p>
            <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href={user ? "/dashboard" : "/signup"} className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-black text-lg text-white shadow-[0_8px_0_#c026d3] hover:translate-y-[-2px] hover:shadow-[0_10px_0_#c026d3] active:translate-y-[6px] active:shadow-[0_2px_0_#c026d3] transition-all w-full sm:w-auto text-center flex items-center justify-center gap-2.5 cursor-pointer">
                <Gamepad2 size={24} className="group-hover:rotate-12 transition-transform" />
                <span>{user ? "Go to Dashboard" : "Start Playing Free"}</span>
              </Link>
              <Link href="/dolamoney" className="px-7 py-4 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 rounded-full font-black text-base shadow-[0_6px_0_#d97706] hover:translate-y-[-2px] active:translate-y-[4px] active:shadow-none transition-all w-full sm:w-auto text-center flex items-center justify-center gap-2 border-2 border-white cursor-pointer">
                <Coins size={20} className="text-slate-900" />
                <span>Financial Literacy Game 🪙</span>
              </Link>
            </div>
            {/* Quick platform highlights */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5 bg-white/70 px-3 py-1 rounded-full border border-slate-200">
                <CheckCircle2 size={14} className="text-emerald-500" /> 5 Coding Worlds
              </span>
              <span className="flex items-center gap-1.5 bg-white/70 px-3 py-1 rounded-full border border-slate-200">
                <CheckCircle2 size={14} className="text-emerald-500" /> 6 Brain Developer Games
              </span>
              <span className="flex items-center gap-1.5 bg-white/70 px-3 py-1 rounded-full border border-slate-200">
                <CheckCircle2 size={14} className="text-emerald-500" /> 10 Financial Literacy Worlds (₦)
              </span>
              <span className="flex items-center gap-1.5 bg-white/70 px-3 py-1 rounded-full border border-slate-200">
                <ShieldCheck size={14} className="text-purple-500" /> 100% Kid Safe &amp; Ad-Free
              </span>
            </div>
          </div>
          <div className="relative flex justify-center items-center h-[400px] lg:h-[500px]">
            <img
              src="/kids_coding_hero.png"
              alt="Kids Coding"
              className="w-full max-w-[500px] animate__animated animate__zoomIn drop-shadow-[0_20px_50px_rgba(236,72,153,0.3)] rounded-[3rem] border-[6px] border-white rotate-2 hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </div>
      </main>

      {/* Features Section - Gamified Cards */}
      <section className="relative z-20 pt-20 pb-32 bg-white rounded-t-[3rem] lg:rounded-t-[5rem] px-4 sm:px-6 border-t-[8px] border-sky-200" ref={featuresRef}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 space-y-6">
            <div className="inline-block bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold mb-2 shadow-xs">
              <Trophy size={20} className="inline mr-2 -mt-1" /> Level Up Your Skills
            </div>
            <h2 className="text-4xl lg:text-6xl font-black text-slate-800 tracking-tight">Why kids <span className="text-pink-500">love</span> Dolacode</h2>

            {/* Attached DolaCode Illustration Logo */}
            <div className="flex justify-center my-6">
              <img
                src="/why_kids_love_dolacode.png"
                alt="DolaCode - Learn, Create, Build the Future"
                className="w-full max-w-[650px] h-auto object-contain drop-shadow-xl hover:scale-102 transition-transform duration-300 rounded-3xl"
              />
            </div>

            {/* Bright & Responsive "About the Dolacode Application" Section */}
            <div className="w-full max-w-4xl mx-auto mt-8 bg-gradient-to-br from-purple-50 via-pink-50 to-sky-50 text-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 text-left border-4 border-purple-300/80 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-200/80 pb-4">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="DolaCode Logo" className="w-[80px] h-auto object-contain bg-white p-2 rounded-xl shadow-xs" />
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-purple-950 tracking-tight">About the Dolacode Application</h3>
                    <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">Developed by Devnaija Academy</p>
                  </div>
                </div>
                <span className="bg-purple-200/60 text-purple-800 font-extrabold text-xs px-3 py-1 rounded-full border border-purple-300/60 shrink-0">
                  Verified Educational Platform
                </span>
              </div>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
                <strong>Dolacode</strong> is an interactive STEM and programming education application for kids, parents, and school educators. Dolacode enables students to learn computational thinking, block-based coding, Python programming, and app creation through gamified modules.
              </p>
              <div className="bg-white/80 p-4 sm:p-5 rounded-2xl border border-purple-200 text-slate-700 text-xs sm:text-sm leading-relaxed font-medium space-y-1">
                <p className="font-bold text-purple-900 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-amber-500" /> Google Account Integration:
                </p>
                <p>
                  Users sign in to Dolacode using Google OAuth to securely authenticate, create student or educator profiles, save coding stage progress, store project workspace files, and link parent/teacher progress monitoring dashboards.
                </p>
              </div>
            </div>
          </div>
          {/* 5 Core Coding Worlds */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {/* World 1 */}
            <div className="feature-card bg-white rounded-[2rem] p-6 border-4 border-indigo-200 hover:border-indigo-400 shadow-[0_15px_30px_-5px_rgba(99,102,241,0.15)] hover:shadow-[0_20px_40px_-5px_rgba(99,102,241,0.3)] transition-all duration-300 transform hover:-translate-y-4 group cursor-pointer flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-200 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 border-4 border-white text-white">
                  <Brain size={32} />
                </div>
                <div className="inline-block bg-indigo-50 text-indigo-700 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
                  14 Parts &bull; 6 Games
                </div>
                <h3 className="text-xl font-black mb-2 text-slate-800 group-hover:text-indigo-600 transition-colors">1. DolaCode Numeracy</h3>
                <p className="text-slate-600 leading-relaxed font-semibold text-xs">
                  Maths &amp; computational readiness. 14 progressive chapters covering number sense, operations, spatial grids, fractions, and 6 standalone interactive games!
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                <span>Playful Foundation</span>
                <ChevronRight size={16} />
              </div>
            </div>

            {/* World 2 */}
            <div className="feature-card bg-white rounded-[2rem] p-6 border-4 border-pink-200 hover:border-pink-400 shadow-[0_15px_30px_-5px_rgba(236,72,153,0.15)] hover:shadow-[0_20px_40px_-5px_rgba(236,72,153,0.3)] transition-all duration-300 transform hover:-translate-y-4 group cursor-pointer flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-pink-200 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 border-4 border-white text-white animate-pulse">
                  <Blocks size={32} />
                </div>
                <div className="inline-block bg-pink-50 text-pink-700 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
                  Visual Logic
                </div>
                <h3 className="text-xl font-black mb-2 text-slate-800 group-hover:text-pink-600 transition-colors">2. Visual Block Coding</h3>
                <p className="text-slate-600 leading-relaxed font-semibold text-xs">
                  Snap colorful Blockly blocks together like digital Legos! Master sequencing, repeat loops, variables, and conditional IF/THEN rules without typing mistakes.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-pink-600">
                <span>Game Logic</span>
                <ChevronRight size={16} />
              </div>
            </div>

            {/* World 3 */}
            <div className="feature-card bg-white rounded-[2rem] p-6 border-4 border-purple-200 hover:border-purple-400 shadow-[0_15px_30px_-5px_rgba(139,92,246,0.15)] hover:shadow-[0_20px_40px_-5px_rgba(139,92,246,0.3)] transition-all duration-300 transform hover:-translate-y-4 group cursor-pointer flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-purple-200 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 border-4 border-white text-white">
                  <Terminal size={32} />
                </div>
                <div className="inline-block bg-purple-50 text-purple-700 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
                  5 Python Classes
                </div>
                <h3 className="text-xl font-black mb-2 text-slate-800 group-hover:text-purple-600 transition-colors">3. Python Pro</h3>
                <p className="text-slate-600 leading-relaxed font-semibold text-xs">
                  Code-control animation! Write typed Python to control robots across 5 game classes: Robo Motion Island, Power Loop Realm, Variable Vault, Decision Dungeon, and Cyber Dragon Boss Battle!
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                <span>Code Animation</span>
                <ChevronRight size={16} />
              </div>
            </div>

            {/* World 4 */}
            <div className="feature-card bg-white rounded-[2rem] p-6 border-4 border-amber-200 hover:border-amber-400 shadow-[0_15px_30px_-5px_rgba(245,158,11,0.15)] hover:shadow-[0_20px_40px_-5px_rgba(245,158,11,0.3)] transition-all duration-300 transform hover:-translate-y-4 group cursor-pointer flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-amber-200 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 border-4 border-white text-white">
                  <span className="text-2xl">🌐</span>
                </div>
                <div className="inline-block bg-amber-50 text-amber-700 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
                  5 Web Classes
                </div>
                <h3 className="text-xl font-black mb-2 text-slate-800 group-hover:text-amber-600 transition-colors">4. Web Dev Studio</h3>
                <p className="text-slate-600 leading-relaxed font-semibold text-xs">
                  Master HTML, CSS &amp; JavaScript! Drag headings &amp; images, style colour magic, build interactive buttons, and create your own online store with Nigerian Naira (₦)!
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                <span>Web Creators</span>
                <ChevronRight size={16} />
              </div>
            </div>

            {/* World 5 */}
            <div className="feature-card bg-white rounded-[2rem] p-6 border-4 border-purple-300 hover:border-purple-500 shadow-[0_15px_30px_-5px_rgba(168,85,247,0.15)] hover:shadow-[0_20px_40px_-5px_rgba(168,85,247,0.3)] transition-all duration-300 transform hover:-translate-y-4 group cursor-pointer flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-purple-200 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 border-4 border-white text-white">
                  <span className="text-2xl">📱</span>
                </div>
                <div className="inline-block bg-purple-50 text-purple-700 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
                  5 App Classes
                </div>
                <h3 className="text-xl font-black mb-2 text-slate-800 group-hover:text-purple-600 transition-colors">5. App Dev Studio</h3>
                <p className="text-slate-600 leading-relaxed font-semibold text-xs">
                  Build mobile phone apps! Drag UI components, connect magic events, care for a smart virtual pet, build quizzes, and invent useful savings trackers in Naira (₦)!
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                <span>Mobile Inventors</span>
                <ChevronRight size={16} />
              </div>
            </div>
          </div>

          {/* Financial Literacy Game Hero Spotlight */}
          <div className="mt-14 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white rounded-[2.5rem] p-6 sm:p-10 border-4 border-emerald-300/80 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -right-6 -bottom-6 text-9xl opacity-15 pointer-events-none select-none">
              🪙
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center lg:text-left max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-300/40 text-emerald-200 text-xs font-black uppercase tracking-wider">
                  <Coins size={14} className="text-yellow-300" /> New Financial Literacy Adventure &bull; 10 Worlds
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  Financial Literacy Game: <span className="text-yellow-300">Learn. Earn. Save. Spend. Build.</span>
                </h3>
                <p className="text-emerald-100 text-sm sm:text-base font-medium leading-relaxed">
                  Teach practical financial intelligence to children aged 6–12 through games, simulations, and real decisions using Nigerian Naira (₦). No boring economics theory—just pure fun, DolaCoins, and real-life habits!
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs font-bold text-emerald-100">
                  <span className="bg-white/15 px-3 py-1 rounded-full border border-white/20">🪙 Money Match</span>
                  <span className="bg-white/15 px-3 py-1 rounded-full border border-white/20">🛒 Smart Shopper (Needs vs Wants)</span>
                  <span className="bg-white/15 px-3 py-1 rounded-full border border-white/20">🏺 Savings Jar Streaks</span>
                  <span className="bg-white/15 px-3 py-1 rounded-full border border-white/20">📊 Budget Challenge</span>
                  <span className="bg-white/15 px-3 py-1 rounded-full border border-white/20">🍋 Little Business (Costs &amp; Profit)</span>
                  <span className="bg-white/15 px-3 py-1 rounded-full border border-white/20">🏦 DolaBank Adventures</span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/dolamoney"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_6px_0_#92400e] hover:shadow-[0_8px_0_#92400e] transition-all transform active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Coins size={20} />
                  <span>Play Financial Literacy Game</span>
                  <span>&rarr;</span>
                </Link>
                <span className="text-[11px] text-emerald-200 font-semibold text-center">
                  Includes Virtual Wallet, Badges &amp; Streaks
                </span>
              </div>
            </div>
          </div>

          {/* 6 Interactive Adventure Games Arcade */}
          <div className="mt-16">
            <div className="text-center mb-10 space-y-3">
              <div className="inline-block bg-pink-100 text-pink-700 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider">
                <Brain size={16} className="inline mr-1.5 -mt-0.5" /> Brain Developer Arcade
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                Play &amp; Learn With <span className="text-pink-500">Brain Developer Games</span>
              </h3>
              <p className="text-slate-600 text-sm sm:text-base font-medium max-w-2xl mx-auto">
                Children build solid mathematical and computational intuition while playing hands-on story missions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. Pizza Shop */}
              <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-[2rem] p-6 text-white shadow-lg border-4 border-white flex flex-col justify-between group hover:scale-102 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-black/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      Fractions &amp; Loops
                    </span>
                    <span className="text-3xl">🍕</span>
                  </div>
                  <h4 className="text-xl font-black mb-1">Dola&apos;s Pizza Shop</h4>
                  <p className="text-orange-100 text-xs font-semibold leading-relaxed">
                    Serve friendly orders, slice pizzas, balance fractions, share evenly with friends, and discover loops through baking!
                  </p>
                </div>
                <Link
                  href="/stage1/pizza-shop"
                  className="mt-4 w-full py-2.5 rounded-xl bg-white text-orange-600 hover:text-orange-700 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Play Pizza Shop</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* 2. Robot Maze */}
              <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-[2rem] p-6 text-white shadow-lg border-4 border-white flex flex-col justify-between group hover:scale-102 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-black/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      Algorithms &amp; Debugging
                    </span>
                    <span className="text-3xl">🤖</span>
                  </div>
                  <h4 className="text-xl font-black mb-1">Robot Maze</h4>
                  <p className="text-teal-100 text-xs font-semibold leading-relaxed">
                    Program Robo through maze grids! Arrange directional arrows, use repeat loops, avoid obstacles, and test code.
                  </p>
                </div>
                <Link
                  href="/stage1/robot-maze"
                  className="mt-4 w-full py-2.5 rounded-xl bg-white text-teal-700 hover:text-teal-800 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Play Robot Maze</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* 3. My Little Shop */}
              <div className="bg-gradient-to-br from-amber-500 via-emerald-600 to-teal-600 rounded-[2rem] p-6 text-white shadow-lg border-4 border-white flex flex-col justify-between group hover:scale-102 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-black/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      Currency (₦) &amp; Retail
                    </span>
                    <span className="text-3xl">🏪</span>
                  </div>
                  <h4 className="text-xl font-black mb-1">My Little Shop</h4>
                  <p className="text-emerald-100 text-xs font-semibold leading-relaxed">
                    Manage a colorful Nigerian corner shop! Count Naira notes, calculate change, restock items, and master loop math.
                  </p>
                </div>
                <Link
                  href="/stage1/my-little-shop"
                  className="mt-4 w-full py-2.5 rounded-xl bg-white text-emerald-800 hover:text-emerald-900 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Play Little Shop</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* 4. Frog Adventure */}
              <div className="bg-gradient-to-br from-lime-500 via-emerald-600 to-teal-600 rounded-[2rem] p-6 text-white shadow-lg border-4 border-white flex flex-col justify-between group hover:scale-102 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-black/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      Number Line Jumps
                    </span>
                    <span className="text-3xl">🐸</span>
                  </div>
                  <h4 className="text-xl font-black mb-1">Frog Adventure</h4>
                  <p className="text-lime-100 text-xs font-semibold leading-relaxed">
                    Guide Hoppy across river lilypads! Count jumps, turn directions, follow sequence patterns, and debug leap paths.
                  </p>
                </div>
                <Link
                  href="/stage1/frog-adventure"
                  className="mt-4 w-full py-2.5 rounded-xl bg-white text-emerald-800 hover:text-emerald-900 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Play Frog Adventure</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* 5. Traffic Rescue */}
              <div className="bg-gradient-to-br from-amber-500 via-rose-600 to-indigo-600 rounded-[2rem] p-6 text-white shadow-lg border-4 border-white flex flex-col justify-between group hover:scale-102 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-black/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      Signals &amp; IF/THEN Rules
                    </span>
                    <span className="text-3xl">🚦</span>
                  </div>
                  <h4 className="text-xl font-black mb-1">Traffic Rescue</h4>
                  <p className="text-amber-100 text-xs font-semibold leading-relaxed">
                    Control mini city intersections! Program traffic lights, protect zebra crossings, and prevent gridlocks with logic.
                  </p>
                </div>
                <Link
                  href="/stage1/traffic-rescue"
                  className="mt-4 w-full py-2.5 rounded-xl bg-white text-indigo-900 hover:text-indigo-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Play Traffic Rescue</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* 6. Pet Rescue */}
              <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-amber-500 rounded-[2rem] p-6 text-white shadow-lg border-4 border-white flex flex-col justify-between group hover:scale-102 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-black/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      Coordinates &amp; Sorting
                    </span>
                    <span className="text-3xl">🐶</span>
                  </div>
                  <h4 className="text-xl font-black mb-1">Pet Rescue</h4>
                  <p className="text-pink-100 text-xs font-semibold leading-relaxed">
                    Care for cute rescue animals! Map coordinates, sort treats, follow care algorithms, and learn IF/THEN condition rules.
                  </p>
                </div>
                <Link
                  href="/stage1/pet-rescue"
                  className="mt-4 w-full py-2.5 rounded-xl bg-white text-rose-700 hover:text-rose-800 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Play Pet Rescue</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section - Playful Interface Preview */}
      <section className="relative z-10 py-32 bg-sky-400 px-6 overflow-hidden" ref={demoRef}>
        {/* Animated clouds for background */}
        <Cloud className="absolute top-10 left-10 text-white/30" size={150} />
        <Cloud className="absolute bottom-10 right-10 text-white/30" size={200} />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-6xl font-black text-white drop-shadow-md">See it in <span className="text-yellow-300">Action!</span></h2>
          </div>

          <div className="relative mx-auto max-w-5xl bg-white rounded-[2.5rem] border-8 border-white shadow-[0_0_0_8px_rgba(255,255,255,0.2)] overflow-hidden flex flex-col md:flex-row h-[450px]">
            {/* Editor Side */}
            <div className="w-full md:w-1/2 bg-slate-50 border-r-4 border-slate-200 p-8 flex flex-col gap-5 relative overflow-hidden">
              <div className="flex gap-3 mb-2">
                <div className="w-4 h-4 rounded-full bg-red-400"></div>
                <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                <div className="w-4 h-4 rounded-full bg-green-400"></div>
              </div>
              <div className="fake-block-1 bg-sky-500 text-white font-bold text-lg p-4 rounded-xl w-[85%] shadow-[0_4px_0_#0284c7] border-2 border-sky-600 flex items-center gap-3">
                <Play size={24} className="fill-white" /> When Green Flag Clicked
              </div>
              <div className="fake-block-2 bg-orange-400 text-white font-bold text-lg p-4 rounded-xl w-[75%] ml-8 shadow-[0_4px_0_#c2410c] border-2 border-orange-500 flex items-center gap-3 relative">
                <div className="absolute -top-4 left-4 w-4 h-6 bg-orange-500"></div>
                Move <span className="bg-white text-orange-500 px-3 py-1 rounded-full text-sm">10</span> Steps
              </div>
              <div className="bg-purple-500 text-white font-bold text-lg p-4 rounded-xl w-[65%] ml-8 shadow-[0_4px_0_#7e22ce] border-2 border-purple-600 opacity-60 flex items-center gap-3 relative">
                <div className="absolute -top-4 left-4 w-4 h-6 bg-purple-600"></div>
                Jump <span className="bg-white text-purple-500 px-3 py-1 rounded-full text-sm">High</span>
              </div>
            </div>
            {/* Stage Side */}
            <div className="w-full md:w-1/2 bg-gradient-to-b from-sky-200 to-sky-300 relative overflow-hidden flex items-center justify-center border-t-4 md:border-t-0 border-slate-200">
              <div className="absolute bottom-0 left-0 w-full h-[40%] bg-emerald-400 border-t-8 border-emerald-500 rounded-t-[100%]"></div>
              <div className="demo-sprite relative z-10 text-slate-800 flex flex-col items-center">
                <div className="bg-white p-4 rounded-full shadow-xl border-4 border-pink-400">
                  <Ghost size={80} className="text-pink-500 fill-pink-200" />
                </div>
                <div className="w-16 h-4 bg-black/10 rounded-[100%] mt-4"></div>
              </div>
              <div className="absolute top-6 right-6 bg-white p-3 rounded-2xl shadow-lg border-4 border-yellow-300 flex items-center gap-3 rotate-3">
                <Star size={28} className="text-yellow-400 fill-yellow-400" />
                <span className="font-black text-xl text-slate-800">100</span>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* FAQ Section - Friendly accordion */}
      <section className="relative z-10 py-32 bg-purple-50 px-6 border-t-8 border-purple-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-6xl font-black text-purple-900">Got <span className="text-pink-500">Questions?</span></h2>
            <p className="text-xl text-purple-700 font-medium">We've got answers!</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`bg-white border-4 ${openFaq === index ? 'border-pink-400 shadow-[0_8px_0_#f472b6] translate-y-[-4px]' : 'border-purple-200 shadow-sm'} rounded-[1.5rem] overflow-hidden transition-all duration-300`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className={`font-black text-xl ${openFaq === index ? 'text-pink-600' : 'text-purple-900'}`}>
                    {faq.question}
                  </span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border-2 ${openFaq === index ? 'bg-pink-100 border-pink-400 text-pink-600' : 'bg-purple-100 border-purple-200 text-purple-600'}`}>
                    {openFaq === index ? <Minus size={20} /> : <Plus size={20} />}
                  </div>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${openFaq === index ? 'grid-rows-[1fr] opacity-100 pb-6 px-8' : 'grid-rows-[0fr] opacity-0 px-8 pb-0'}`}
                >
                  <div className="overflow-hidden">
                    <p className="text-slate-600 font-medium text-lg leading-relaxed pt-4 border-t-2 border-slate-100">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Big Call to Action Section */}
      <section className="relative z-10 bg-pink-500 py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* <div className="inline-flex items-center justify-center gap-3 mb-8 text-yellow-900 font-black bg-yellow-400 px-6 py-3 rounded-full shadow-[0_4px_0_#ca8a04] rotate-[-2deg]">
            <Star size={24} className="fill-yellow-900" /> Join 10,000+ Kids Coding Today!
          </div> */}
          <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight mb-8 drop-shadow-lg">
            Ready to Build Your First <span className="text-yellow-300">Game?</span>
          </h2>
          <p className="text-2xl text-pink-100 mb-12 max-w-2xl mx-auto font-medium">
            Start coding for free right now. No credit card required, just your imagination!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              ref={ctaButtonRef}
              href={user ? "/dashboard" : "/signup"}
              className="px-12 py-6 bg-yellow-400 text-yellow-900 rounded-full font-black text-3xl shadow-[0_10px_0_#ca8a04] hover:bg-yellow-300 hover:shadow-[0_12px_0_#ca8a04] active:translate-y-[8px] active:shadow-[0_2px_0_#ca8a04] transition-all w-full sm:w-auto border-4 border-white"
            >
              {user ? "Continue Playing" : "Play For Free!"}
            </Link>
          </div>
        </div>
      </section>

      {/* WhatsApp Community Section */}
      <section className="relative z-10 py-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 text-white overflow-hidden border-t-8 border-emerald-400">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-black uppercase tracking-wider">
              <FaWhatsapp size={16} className="text-white" /> Official Parent &amp; Educator Community
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Join the DolaCode Community on WhatsApp
            </h3>
            <p className="text-emerald-100 text-base max-w-xl font-medium">
              Connect with fellow parents, STEM educators, and coding mentors. Receive weekly coding activities, parenting tips, platform updates, and direct support.
            </p>
          </div>
          <a
            href="https://chat.whatsapp.com/JjgzmtZn7bJ2pwl4LdUCbO?s=cl&p=a&iam=2"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-8 py-4 bg-white text-emerald-700 hover:bg-emerald-50 rounded-2xl font-black text-base shadow-[0_6px_0_#065f46] hover:translate-y-[-2px] active:translate-y-[2px] transition-all flex items-center gap-3 cursor-pointer"
          >
            <FaWhatsapp size={24} className="text-emerald-600" />
            <span>Join WhatsApp Community</span>
          </a>
        </div>
      </section>

      {/* Playful Footer */}
      <footer className="bg-slate-900 text-slate-300 py-20 px-6 border-t-[12px] border-sky-400 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center">
              <img src="/logo.png" alt="DolaCode Logo" className="w-[80px] h-auto object-contain bg-white/90 p-2 rounded-xl shadow-sm" />
            </div>
            <p className="font-medium text-slate-400 leading-relaxed">
              Empowering the next generation of creators through fun, interactive, and intelligent coding adventures!
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://chat.whatsapp.com/JjgzmtZn7bJ2pwl4LdUCbO?s=cl&p=a&iam=2" target="_blank" rel="noopener noreferrer" title="Join DolaCode WhatsApp Community" className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 text-emerald-400 hover:text-white transition-all transform hover:-translate-y-2"><FaWhatsapp size={22} /></a>
              <a href="https://www.facebook.com/DevnaijaAcademykids" target="_blank" rel="noopener noreferrer" title="Devnaija Kids Facebook" className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center hover:bg-blue-500 hover:border-blue-500 hover:text-white transition-all transform hover:-translate-y-2"><FaFacebook size={20} /></a>
              <a href="https://www.instagram.com/devnaijaacademykids13/" target="_blank" rel="noopener noreferrer" title="Devnaija Kids Instagram" className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center hover:bg-pink-500 hover:border-pink-500 hover:text-white transition-all transform hover:-translate-y-2"><FaInstagram size={20} /></a>
              <a href="https://www.youtube.com/@DevnaijaKids-z8p" target="_blank" rel="noopener noreferrer" title="Devnaija Kids YouTube" className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center hover:bg-red-500 hover:border-red-500 hover:text-white transition-all transform hover:-translate-y-2"><FaYoutube size={20} /></a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-black text-lg mb-6 uppercase tracking-widest text-sky-400">Worlds</h4>
            <ul className="space-y-3 font-bold text-sm">
              <li><Link href="/stage1" className="hover:text-pink-400 hover:pl-2 transition-all block">1. DolaCode Numeracy</Link></li>
              <li><Link href="/stage2" className="hover:text-pink-400 hover:pl-2 transition-all block">2. Block Coding</Link></li>
              <li><Link href="/python-studio" className="hover:text-pink-400 hover:pl-2 transition-all block">3. Python Pro</Link></li>
              <li><Link href="/web-studio" className="hover:text-pink-400 hover:pl-2 transition-all block">4. Web Dev Studio</Link></li>
              <li><Link href="/app-studio" className="hover:text-pink-400 hover:pl-2 transition-all block">5. App Dev Studio</Link></li>
              <li>
                <Link href="/dolamoney" className="hover:text-yellow-300 hover:pl-2 transition-all block text-yellow-400 font-black">
                  🪙 Financial Literacy Game (₦)
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-black text-lg mb-6 uppercase tracking-widest text-purple-400">Company</h4>
            <ul className="space-y-4 font-bold">
              <li><Link href="/about" className="hover:text-purple-300 hover:pl-2 transition-all block">About Us</Link></li>
              <li><Link href="/subscribe" className="hover:text-purple-300 hover:pl-2 transition-all block">Pricing &amp; Plans</Link></li>
              <li>
                <a 
                  href="https://chat.whatsapp.com/JjgzmtZn7bJ2pwl4LdUCbO?s=cl&p=a&iam=2" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-emerald-400 hover:text-emerald-300 hover:pl-2 transition-all flex items-center gap-1.5 font-bold"
                >
                  <FaWhatsapp size={15} /> WhatsApp Community
                </a>
              </li>
              <li><Link href="/child-safety" className="hover:text-purple-300 hover:pl-2 transition-all block">Child Safety</Link></li>
              <li><Link href="/contact" className="hover:text-purple-300 hover:pl-2 transition-all block">Contact</Link></li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div>
            <h4 className="text-white font-black text-lg mb-6 uppercase tracking-widest text-yellow-400">Say Hello</h4>
            <ul className="space-y-4 font-bold">
              <li><Link href="/terms" className="hover:text-yellow-300 hover:pl-2 transition-all block">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-yellow-300 hover:pl-2 transition-all block">Privacy Policy</Link></li>
              <li><Link href="/child-safety" className="hover:text-yellow-300 hover:pl-2 transition-all block">Child Safety Policy</Link></li>
              <li className="flex items-center gap-3 mt-6 text-slate-400 bg-slate-800 p-3 rounded-xl border border-slate-700"><Mail size={18} className="text-sky-400" /> hello@devnaija.com</li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 border-t-2 border-slate-800 text-center text-sm font-bold flex flex-col md:flex-row justify-between items-center text-slate-500">
          <p>© 2026 DolaCode Platform. All rights reserved.</p>
          <p className="mt-4 md:mt-0 flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full">Designed with <Heart size={16} className="text-pink-500 fill-pink-500" /> for kids everywhere.</p>
        </div>
      </footer>
    </div>
  );
}

