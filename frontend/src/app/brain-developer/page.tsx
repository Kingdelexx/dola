'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Brain,
  Sparkles,
  Trophy,
  ArrowLeft,
  Play,
  Star,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Gamepad2,
  Compass,
  Cpu,
  Layers,
  HeartHandshake,
  Lightbulb,
  Award
} from 'lucide-react';

interface BrainGame {
  id: string;
  part: number;
  title: string;
  icon: string;
  tagline: string;
  concept: string;
  desc: string;
  gradient: string;
  cardBorder: string;
  shadowColor: string;
  badge: string;
  skills: string[];
  href: string;
  isFreePreview?: boolean;
}

const BRAIN_GAMES: BrainGame[] = [
  {
    id: 'pizza-shop',
    part: 9,
    title: "Dola's Pizza Shop",
    icon: '🍕',
    tagline: 'Fractions & Iteration Loops',
    concept: 'Proportions & Loop Logic',
    desc: 'Serve hungry customer orders! Slice pizzas into equal halves, quarters, and eighths, balance toppings, and discover how computers use repeat loops to prepare food.',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    cardBorder: 'border-orange-300/60',
    shadowColor: 'shadow-orange-500/20',
    badge: 'Fractions Chef',
    skills: ['Fractions (1/2, 1/4, 1/8)', 'Looping Through Orders', 'Equal Partitioning'],
    href: '/stage1/pizza-shop',
    isFreePreview: true,
  },
  {
    id: 'robot-maze',
    part: 10,
    title: 'Robot Maze',
    icon: '🤖',
    tagline: 'Sequencing & Debugging',
    concept: 'Algorithmic Execution',
    desc: 'Program Robo the friendly robot! Arrange directional movement arrows, execute repeat loops, avoid obstacles and lava, and debug faulty instructions to reach the gold flag.',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
    cardBorder: 'border-teal-300/60',
    shadowColor: 'shadow-teal-500/20',
    badge: 'Code Navigator',
    skills: ['Step-by-Step Sequencing', 'Repeat Loops (2x, 3x)', 'Error Debugging'],
    href: '/stage1/robot-maze',
  },
  {
    id: 'my-little-shop',
    part: 11,
    title: 'My Little Shop',
    icon: '🏪',
    tagline: 'Nigerian Naira (₦) Math & Stock',
    concept: 'Commerce & Computational Math',
    desc: 'Manage a lively Nigerian neighbourhood shop! Price goods in Naira (₦), calculate customer cash, give exact change, and use repetition loops to restock store shelves.',
    gradient: 'from-amber-500 via-emerald-600 to-teal-700',
    cardBorder: 'border-emerald-300/60',
    shadowColor: 'shadow-emerald-500/20',
    badge: 'Shopkeeper Pro',
    skills: ['Naira (₦) Mental Math', 'Change Calculation', 'Stock Restock Loops'],
    href: '/stage1/my-little-shop',
  },
  {
    id: 'frog-adventure',
    part: 12,
    title: 'Frog Adventure',
    icon: '🐸',
    tagline: 'Coordinates & Grid Patterns',
    concept: 'Spatial Navigation',
    desc: 'Guide Hoppy the adventurous frog across ponds and rainforests! Master 2D (X, Y) coordinates, calculate jump distances, spot geometric patterns, and dodge obstacles.',
    gradient: 'from-lime-500 via-emerald-600 to-teal-600',
    cardBorder: 'border-lime-300/60',
    shadowColor: 'shadow-lime-500/20',
    badge: 'Grid Master',
    skills: ['2D (X, Y) Coordinates', 'Jump Distance Vectors', 'Pattern Prediction'],
    href: '/stage1/frog-adventure',
  },
  {
    id: 'traffic-rescue',
    part: 13,
    title: 'Traffic Rescue',
    icon: '🚦',
    tagline: 'Conditional Rules (IF / THEN)',
    concept: 'Decision Logic & Timing',
    desc: 'Take command of city traffic! Program smart traffic signals with IF/THEN rules, clear emergency vehicle routes, protect pedestrian crossings, and prevent gridlock.',
    gradient: 'from-amber-500 via-rose-600 to-indigo-600',
    cardBorder: 'border-rose-300/60',
    shadowColor: 'shadow-rose-500/20',
    badge: 'Logic Controller',
    skills: ['IF / THEN Conditions', 'Emergency Overrides', 'Pedestrian Safety Logic'],
    href: '/stage1/traffic-rescue',
  },
  {
    id: 'pet-rescue',
    part: 14,
    title: 'Pet Rescue',
    icon: '🐶',
    tagline: 'Sorting, Care Routines & Logic',
    concept: 'State Management & Caring',
    desc: 'Rescue and nurture friendly animals! Sort nutritious treats by diet, chain multi-step care routines together, and apply logical rules to nurse pets back to peak health.',
    gradient: 'from-rose-500 via-pink-600 to-amber-500',
    cardBorder: 'border-pink-300/60',
    shadowColor: 'shadow-pink-500/20',
    badge: 'Pet Hero',
    skills: ['Multi-Property Sorting', 'Chained Routines', 'Care Logic Algorithms'],
    href: '/stage1/pet-rescue',
  },
];

const CURRICULUM_PILLARS = [
  {
    icon: '🧩',
    title: 'Concrete Before Abstract',
    desc: 'Kids touch, slice, steer, and solve tangible challenges before ever typing abstract syntax.',
  },
  {
    icon: '🔄',
    title: 'Algorithmic Thinking',
    desc: 'Master sequencing, repeat loops, and branching IF/THEN decisions through direct gameplay feedback.',
  },
  {
    icon: '💡',
    title: 'Fearless Debugging',
    desc: 'Safe sandboxes teach children that mistakes are normal clues that help us test, fix, and improve code.',
  },
  {
    icon: '📐',
    title: 'Real Mathematical Intuition',
    desc: 'Fractions, coordinate grids, and Naira money math become exciting superpowers rather than scary drills.',
  },
];

export default function BrainDeveloperPage() {
  const { user } = useAuth();
  const hasSubscription = user?.subscription_access?.has_access ?? false;
  const userStars = user?.profile?.points ?? 0;
  const streak = user?.profile?.current_streak ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/70 via-purple-50/60 via-sky-50/60 to-amber-50/50 text-slate-800 font-sans selection:bg-indigo-300 selection:text-slate-950 pb-24 relative overflow-x-hidden">
      {/* Decorative Floating Background Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-12 left-[10%] w-72 h-72 bg-indigo-300/25 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-purple-300/25 rounded-full blur-3xl" />
        <div className="absolute bottom-12 left-1/4 w-80 h-80 bg-sky-300/25 rounded-full blur-3xl" />
        <div className="absolute top-2/3 right-1/4 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-4 border-indigo-200/80 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-black text-sm px-4 py-2 rounded-full border-2 border-slate-200 hover:border-indigo-300 shadow-xs transition-all shrink-0"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>

          {/* Player Stats Pills */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Brain Games Pill */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-indigo-50 text-indigo-900 font-black border-2 border-indigo-200 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm shadow-xs">
              <Brain size={18} className="text-indigo-600" />
              <span>6 Games</span>
            </div>

            {/* Stars Pill */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black border-2 border-white px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm shadow-xs">
              <Star size={16} className="text-amber-800 fill-amber-800" />
              <span>{userStars.toLocaleString()} Stars</span>
            </div>

            {/* Subscription status badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-300 font-black text-xs">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>{hasSubscription ? 'All Games Unlocked' : 'Level 1 Free Preview'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Hero Header Section */}
        <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 text-white rounded-[2.5rem] p-6 sm:p-10 mb-10 border-4 border-indigo-300/60 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -right-6 -bottom-6 text-9xl opacity-15 pointer-events-none select-none">
            🧠
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
              <div className="w-24 h-24 bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 text-slate-900 rounded-3xl flex items-center justify-center text-5xl shrink-0 shadow-2xl border-4 border-white group-hover:scale-105 group-hover:rotate-6 transition-transform">
                🧠
              </div>
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-300/40 text-indigo-200 text-xs font-black uppercase tracking-wider mb-2">
                  <Sparkles size={14} className="text-yellow-300" />
                  Brain Developer Arcade &bull; 6 Interactive Story Games
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  Brain Developer
                </h1>
                <p className="text-indigo-100 font-bold text-base sm:text-lg mt-1">
                  Numeracy, Spatial Logic &amp; Computational Problem-Solving
                </p>
                <p className="text-indigo-50/85 text-xs sm:text-sm mt-2 leading-relaxed">
                  Welcome to the Brain Developer Arcade! Here, children master computational intuition through playful, hands-on stories. Slice pizza fractions, guide maze robots, run a Nigerian shop in Naira (₦), leap across frog ponds, program traffic signals, and nurse rescue pets back to health!
                </p>
              </div>
            </div>

            {/* Quick Actions & Highlights */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0 relative z-10">
              <Link
                href="/stage1/pizza-shop"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_5px_0_#b45309] hover:shadow-[0_7px_0_#b45309] transition-all transform active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Play size={16} className="fill-slate-950" />
                <span>Play Free Level 1 Preview</span>
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-white/30 backdrop-blur-md transition-all flex items-center justify-center gap-2 text-center"
              >
                <Layers size={16} />
                <span>Return to Dashboard</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 6 Adventure Game Cards Grid */}
        <section className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black uppercase tracking-wider mb-1">
                <Gamepad2 size={14} className="text-indigo-600" />
                The 6 Adventure Games
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Choose Your Game Mission
              </h2>
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-600 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping" />
              All 6 games build real coding &amp; math superpowers
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {BRAIN_GAMES.map((game) => (
              <div
                key={game.id}
                className={`bg-gradient-to-br ${game.gradient} text-white rounded-[2.5rem] p-6 sm:p-7 shadow-xl ${game.shadowColor} border-4 ${game.cardBorder} flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
              >
                {/* Background Watermark Icon */}
                <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-15 pointer-events-none text-8xl select-none group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  {game.icon}
                </div>

                {/* Card Header & Content */}
                <div className="relative z-10 mb-5">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border border-white/20">
                      <Sparkles size={12} className="text-yellow-300" />
                      Part {game.part} &bull; {game.concept}
                    </span>

                    {game.isFreePreview && (
                      <span className="bg-yellow-400 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs animate-bounce">
                        Free Preview
                      </span>
                    )}
                  </div>

                  {/* Title and Icon */}
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/40 shrink-0 group-hover:rotate-6 transition-transform">
                      {game.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight leading-tight drop-shadow-sm">
                        {game.title}
                      </h3>
                      <p className="text-white/80 font-bold text-xs">
                        {game.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/90 text-xs sm:text-sm font-medium leading-relaxed mb-4">
                    {game.desc}
                  </p>

                  {/* Skills Pills */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-black uppercase tracking-wider text-white/70">
                      Skills Learned:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {game.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 bg-black/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[11px] font-bold border border-white/15"
                        >
                          <CheckCircle2 size={11} className="text-yellow-300 shrink-0" />
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="relative z-10 pt-3 border-t border-white/20">
                  <Link
                    href={game.href}
                    className="w-full py-3 px-4 rounded-2xl bg-white text-slate-900 hover:bg-yellow-300 font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer"
                  >
                    <Play size={16} className="fill-slate-900" />
                    <span>Play {game.title}</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>

                  {game.isFreePreview ? (
                    <div className="text-center mt-2 text-[11px] font-bold text-yellow-200 drop-shadow-xs">
                      ✨ Level 1 Free Preview &bull; Levels 2–6 Subscription
                    </div>
                  ) : !hasSubscription ? (
                    <div className="text-center mt-2 text-[11px] font-bold text-white/80 flex items-center justify-center gap-1">
                      <Lock size={12} />
                      <span>Full Access with Subscription</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Brain Developer Curriculum Section */}
        <section className="bg-white rounded-[2.5rem] p-6 sm:p-10 border-4 border-indigo-100 shadow-xl mb-12">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black uppercase tracking-wider mb-2">
              <Lightbulb size={14} className="text-purple-600" />
              Pedagogy &amp; Impact
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Why Brain Developer Works
            </h3>
            <p className="text-slate-600 text-sm sm:text-base font-medium mt-1">
              Brain Developer bridges foundational mathematics and computational thinking. Here is how each game empowers young learners before they type a single line of text code:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CURRICULUM_PILLARS.map((pillar, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-gradient-to-b from-indigo-50/50 to-white border-2 border-indigo-100/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl mb-3">{pillar.icon}</div>
                  <h4 className="font-black text-slate-800 text-base mb-1.5">
                    {pillar.title}
                  </h4>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Banner Linking Back to Dashboard */}
        <section className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white rounded-[2rem] p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border-4 border-indigo-400/40">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shrink-0">
              🚀
            </div>
            <div>
              <h4 className="font-black text-xl text-white">
                Ready for the Next Coding Stages?
              </h4>
              <p className="text-indigo-200 text-xs sm:text-sm font-medium mt-0.5">
                Explore Stage 2 Visual Block Coding, Stage 3 Python Pro, and the Financial Literacy Game!
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-white hover:bg-yellow-300 text-indigo-900 hover:text-slate-950 font-black text-sm shadow-md transition-all shrink-0 flex items-center gap-2"
          >
            <span>Back to Dashboard</span>
            <ArrowRight size={16} />
          </Link>
        </section>
      </main>
    </div>
  );
}
