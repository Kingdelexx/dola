'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  Trophy,
  Flame,
  ArrowLeft,
  Lock,
  Play,
  ShieldCheck,
  Star,
  Coins,
  CheckCircle2,
  Info,
  Store,
  Wallet,
  ShoppingBag,
  Building2,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

import { MoneyMatchGame } from '@/components/dolamoney/MoneyMatchGame';
import { SmartShopperGame } from '@/components/dolamoney/SmartShopperGame';
import { SavingsMissionGame } from '@/components/dolamoney/SavingsMissionGame';
import { MyLittleBusinessGame } from '@/components/dolamoney/MyLittleBusinessGame';
import { BudgetChallengeGame } from '@/components/dolamoney/BudgetChallengeGame';
import { BankAdventureGame } from '@/components/dolamoney/BankAdventureGame';
import { MoneyTrapsGame } from '@/components/dolamoney/MoneyTrapsGame';

interface DolaMoneyState {
  dola_coins: number;
  xp_earned: number;
  savings_streak: number;
  savings_total: number;
  current_world: number;
  completed_worlds: number[];
  world_levels: Record<string, number>;
  active_savings_goal: { name?: string; target?: number; current?: number } | null;
  business_stats: Record<string, unknown>;
  badges: string[];
}

export default function DolaMoneyQuestPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeGameModal, setActiveGameModal] = useState<number | null>(null);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [showBadgeModal, setShowBadgeModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [state, setState] = useState<DolaMoneyState>({
    dola_coins: 0,
    xp_earned: 0,
    savings_streak: 0,
    savings_total: 0,
    current_world: 1,
    completed_worlds: [],
    world_levels: {},
    active_savings_goal: null,
    business_stats: {},
    badges: []
  });

  // Fetch student progress
  useEffect(() => {
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://dola-backend.onrender.com'}/api/dolamoney/progress/`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.progress) {
          setState({
            dola_coins: data.progress.dola_coins || 0,
            xp_earned: data.progress.xp_earned || 0,
            savings_streak: data.progress.savings_streak || 0,
            savings_total: data.progress.savings_total || 0,
            current_world: data.progress.current_world || 1,
            completed_worlds: data.progress.completed_worlds || [],
            world_levels: data.progress.world_levels || {},
            active_savings_goal: data.progress.active_savings_goal || null,
            business_stats: data.progress.business_stats || {},
            badges: data.progress.badges || []
          });
        }
      })
      .catch(err => {
        console.error("Failed to load DolaMoney progress:", err);
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Persist progress to backend
  const saveProgress = async (patch: Partial<DolaMoneyState> & { stars_awarded?: number }) => {
    if (!token) return;

    const nextState = { ...state, ...patch };
    setState(nextState);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://dola-backend.onrender.com'}/api/dolamoney/save-progress/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(patch)
      });
    } catch (e) {
      console.error("Failed saving progress:", e);
    }
  };

  const handleWorldCompleted = (worldNum: number, coins: number, xp: number, badgeAwarded?: string, extra?: Record<string, unknown>) => {
    const updatedCoins = state.dola_coins + coins;
    const updatedXp = state.xp_earned + xp;
    const completed = Array.from(new Set([...state.completed_worlds, worldNum])).sort((a, b) => a - b);
    const badges = badgeAwarded && !state.badges.includes(badgeAwarded)
      ? [...state.badges, badgeAwarded]
      : state.badges;

    saveProgress({
      dola_coins: updatedCoins,
      xp_earned: updatedXp,
      completed_worlds: completed,
      current_world: Math.max(state.current_world, worldNum + 1),
      badges,
      stars_awarded: 5,
      ...extra
    });
  };

  const allBadges = [
    { name: "Money Starter", icon: "🪙", desc: "Recognise Nigerian currency notes and make your first exact amount!", world: 1 },
    { name: "Smart Shopper", icon: "🛒", desc: "Distinguish needs from wants and make smart spending choices!", world: 2 },
    { name: "Savings Star", icon: "⭐", desc: "Build a consistent savings streak and fill your savings jar!", world: 3 },
    { name: "Budget Boss", icon: "📊", desc: "Allocate a fixed budget wisely and handle unexpected changes!", world: 4 },
    { name: "Profit Pro", icon: "📈", desc: "Master cost, revenue, and profit in your little business!", world: 5 },
    { name: "Banking Explorer", icon: "🏦", desc: "Master deposits, withdrawals, and balances in DolaBank!", world: 7 },
    { name: "Goal Getter", icon: "🎯", desc: "Hit key savings milestones towards your dream goals!", world: 8 },
    { name: "Money Wise", icon: "🛡️", desc: "Spot tricky money traps and scams by consulting trusted adults!", world: 9 },
    { name: "Young Entrepreneur", icon: "🚀", desc: "Launch, price, and reinvest in your growing business venture!", world: 10 },
    { name: "DolaMoney Champion", icon: "👑", desc: "Conquer all Financial Literacy Game worlds with financial wisdom!", world: 10 }
  ];

  const worlds = [
    {
      num: 1,
      title: "Money Match",
      icon: "🪙",
      tagline: "Nigerian Currency & Notes",
      desc: "Recognise ₦1,000 to ₦5 notes, combine coins and bills, and count change accurately!",
      gradient: "from-emerald-400 via-teal-500 to-emerald-600",
      accentBg: "bg-emerald-900/30",
      accentText: "text-emerald-100",
      isDarkText: false,
      playable: true,
      badge: "Money Starter"
    },
    {
      num: 2,
      title: "Smart Shopper",
      icon: "🛒",
      tagline: "Needs vs Wants Shopping",
      desc: "Shop with a ₦3,000 budget, prioritize school supplies, and compare supermarket deals!",
      gradient: "from-amber-400 via-orange-500 to-rose-500",
      accentBg: "bg-orange-900/30",
      accentText: "text-amber-100",
      isDarkText: false,
      playable: true,
      badge: "Smart Shopper"
    },
    {
      num: 3,
      title: "Savings Mission",
      icon: "🏺",
      tagline: "Goals & Saving Streaks",
      desc: "Pick a dream goal (Bicycle, Game, Robotics), save weekly allowance, and fill your jar!",
      gradient: "from-sky-400 via-cyan-500 to-blue-600",
      accentBg: "bg-cyan-900/30",
      accentText: "text-cyan-100",
      isDarkText: false,
      playable: true,
      badge: "Savings Star"
    },
    {
      num: 4,
      title: "Budget Challenge",
      icon: "📊",
      tagline: "Class Picnic Allocation",
      desc: "Distribute a ₦10,000 picnic budget and rebalance categories when unexpected costs strike!",
      gradient: "from-indigo-500 via-purple-500 to-violet-600",
      accentBg: "bg-indigo-900/30",
      accentText: "text-indigo-100",
      isDarkText: false,
      playable: true,
      badge: "Budget Boss"
    },
    {
      num: 5,
      title: "My Little Business",
      icon: "🏪",
      tagline: "Buying, Selling & Profit",
      desc: "Run a lemonade or snack stall! Master Money In, Money Spent, and Money Left (Profit).",
      gradient: "from-yellow-300 via-amber-400 to-orange-500",
      accentBg: "bg-black/15",
      accentText: "text-slate-900",
      isDarkText: true,
      playable: true,
      badge: "Profit Pro"
    },
    {
      num: 6,
      title: "Earn It",
      icon: "🛠️",
      tagline: "Creating Value with Skills",
      desc: "See how Amara, Tobi, Ada, and Kola earn real income by applying their practical talents!",
      gradient: "from-blue-500 via-indigo-600 to-violet-600",
      accentBg: "bg-blue-900/30",
      accentText: "text-blue-100",
      isDarkText: false,
      playable: false,
      badge: "Young Entrepreneur"
    },
    {
      num: 7,
      title: "Bank Adventure",
      icon: "🏦",
      tagline: "DolaBank Account Secrets",
      desc: "Move money between your physical pocket wallet and digital bank account securely!",
      gradient: "from-teal-400 via-emerald-500 to-cyan-600",
      accentBg: "bg-teal-900/30",
      accentText: "text-teal-100",
      isDarkText: false,
      playable: true,
      badge: "Banking Explorer"
    },
    {
      num: 8,
      title: "Goal Builder",
      icon: "🎯",
      tagline: "Milestones & Long-Term Vision",
      desc: "Break giant dreams into 25%, 50%, 75% steps and celebrate every milestone reached!",
      gradient: "from-purple-500 via-fuchsia-500 to-pink-500",
      accentBg: "bg-purple-900/30",
      accentText: "text-purple-100",
      isDarkText: false,
      playable: false,
      badge: "Goal Getter"
    },
    {
      num: 9,
      title: "Money Traps",
      icon: "🛡️",
      tagline: "Scam Detection & Impulse Control",
      desc: "Spot suspicious get-rich-quick scams, resist impulse purchases, and ask trusted adults!",
      gradient: "from-rose-500 via-red-500 to-orange-500",
      accentBg: "bg-rose-900/30",
      accentText: "text-rose-100",
      isDarkText: false,
      playable: true,
      badge: "Money Wise"
    },
    {
      num: 10,
      title: "Young Entrepreneur",
      icon: "🚀",
      tagline: "The Grand Capstone Simulator",
      desc: "Launch your business, serve customers, calculate profits, and reinvest to expand!",
      gradient: "from-fuchsia-500 via-pink-500 to-amber-400",
      accentBg: "bg-fuchsia-900/30",
      accentText: "text-pink-100",
      isDarkText: false,
      playable: true,
      badge: "DolaMoney Champion"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-emerald-50 via-sky-50 to-purple-50 text-slate-800 font-sans selection:bg-emerald-400 selection:text-slate-950 pb-24 relative overflow-x-hidden">
      {/* Playful Floating Background Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-[8%] w-72 h-72 bg-emerald-300/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-amber-300/35 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-sky-300/30 rounded-full blur-3xl" />
        <div className="absolute top-2/3 right-1/4 w-72 h-72 bg-pink-300/25 rounded-full blur-3xl" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-4 border-emerald-200/80 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-black text-sm px-4 py-2 rounded-full border-2 border-slate-200 hover:border-emerald-300 shadow-sm transition-all"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>

          {/* DolaMoney Wallet Hub */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* DolaCoins Pill */}
            <div
              onClick={() => setShowWalletModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black border-2 border-white px-4 py-1.5 rounded-full shadow-[0_4px_0_#d97706] hover:shadow-[0_6px_0_#d97706] hover:translate-y-[-1px] active:translate-y-1 active:shadow-none transition-all cursor-pointer group"
            >
              <span className="text-xl group-hover:rotate-12 transition-transform">🪙</span>
              <div>
                <div className="text-[9px] uppercase font-black tracking-wider leading-none">DolaCoins</div>
                <div className="text-sm font-black">{state.dola_coins.toLocaleString()}</div>
              </div>
            </div>

            {/* Savings Streak Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black border-2 border-white px-4 py-1.5 rounded-full shadow-[0_4px_0_#c2410c]">
              <Flame size={18} className="text-yellow-200 animate-pulse" />
              <div>
                <div className="text-[9px] uppercase font-black text-orange-100 leading-none">Streak</div>
                <div className="text-sm font-black">{state.savings_streak} Wks</div>
              </div>
            </div>

            {/* Badges Pill */}
            <button
              onClick={() => setShowBadgeModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black border-2 border-white px-4 py-1.5 rounded-full shadow-[0_4px_0_#047857] hover:shadow-[0_6px_0_#047857] hover:translate-y-[-1px] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <Trophy size={16} className="text-yellow-300" />
              <div>
                <div className="text-[9px] uppercase font-black text-emerald-100 leading-none">Badges</div>
                <div className="text-sm font-black">{state.badges.length}/10</div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Showcase Card */}
      <section className="relative px-4 sm:px-8 pt-8 pb-8 max-w-5xl mx-auto">
        <div className="bg-white border-4 border-white rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_50px_-10px_rgba(16,185,129,0.22)] text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black uppercase tracking-wider mb-4 shadow-xs">
              <Sparkles size={14} className="text-amber-500" /> Gamified Financial Literacy &bull; 10 Worlds
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight mb-2">
              Financial Literacy Game
            </h1>

            <p className="text-xl sm:text-2xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 bg-clip-text text-transparent mb-3">
              Learn. Earn. Save. Spend. Build.
            </p>

            <p className="text-slate-600 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed mb-6">
              Learn practical financial literacy through games, simulations and choices in Nigerian Naira (<span className="font-black text-emerald-700">₦</span>). Every decision shows its real consequence!
            </p>

            {/* Educational Disclaimer Callout */}
            <div className="inline-flex items-center gap-2.5 bg-amber-50 border-2 border-amber-200 px-4 py-2 rounded-2xl text-xs text-amber-900 font-semibold max-w-2xl text-left">
              <ShieldCheck size={18} className="text-amber-600 shrink-0" />
              <span>
                <strong>Educational Notice:</strong> DolaCoins are in-platform reward points for completing lessons. They do not represent real money and cannot be bought or redeemed for cash.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* World Map Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Interactive World Map
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
              10 Progressive Worlds &bull; Play, make choices, and see what happens!
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 border-2 border-emerald-300 px-4 py-2 rounded-2xl shadow-xs">
            <Trophy size={14} className="text-amber-500" />
            <span>{state.completed_worlds.length} / 10 Worlds Mastered</span>
          </div>
        </div>

        {/* 10 Vivid Worlds Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {worlds.map((w) => {
            const isCompleted = state.completed_worlds.includes(w.num);
            const isCurrent = state.current_world === w.num;
            const hasBadge = state.badges.includes(w.badge);

            return (
              <div
                key={w.num}
                className={`
                  relative rounded-[2.2rem] p-6 sm:p-7 border-4 border-white transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-2
                  bg-gradient-to-br ${w.gradient} ${w.isDarkText ? 'text-slate-900' : 'text-white'}
                  shadow-[0_15px_35px_-5px_rgba(0,0,0,0.18)] hover:shadow-[0_25px_50px_-5px_rgba(0,0,0,0.25)]
                `}
              >
                {/* Background Watermark Icon */}
                <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-15 pointer-events-none text-9xl select-none group-hover:scale-110 transition-transform">
                  {w.icon}
                </div>

                {/* Card Top */}
                <div className="relative z-10 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/40 shrink-0">
                      {w.icon}
                    </span>

                    {isCompleted ? (
                      <span className="flex items-center gap-1 bg-white text-emerald-700 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm">
                        <CheckCircle2 size={12} className="text-emerald-600" /> Mastered
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-black tracking-wider bg-black/20 text-white px-2.5 py-1 rounded-full backdrop-blur-xs">
                        World {w.num}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-black drop-shadow-xs leading-tight mb-1">
                    {w.title}
                  </h3>
                  <div className={`text-xs font-black uppercase tracking-wider mb-2 ${w.accentText}`}>
                    {w.tagline}
                  </div>
                  <p className={`text-xs sm:text-sm font-semibold leading-relaxed ${w.isDarkText ? 'text-slate-800' : 'text-white/90'}`}>
                    {w.desc}
                  </p>
                </div>

                {/* Card Bottom / Action */}
                <div className="relative z-10 pt-4 border-t border-white/25 flex items-center justify-between gap-3">
                  <div className={`flex items-center gap-1.5 text-xs font-bold ${w.isDarkText ? 'text-slate-800' : 'text-white'}`}>
                    <Trophy size={14} className={hasBadge ? "text-yellow-300" : "opacity-60"} />
                    <span className={hasBadge ? "font-black underline decoration-yellow-300" : ""}>{w.badge}</span>
                  </div>

                  {w.playable ? (
                    <button
                      onClick={() => setActiveGameModal(w.num)}
                      className="px-5 py-2.5 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-wider shadow-[0_4px_0_rgba(0,0,0,0.15)] hover:shadow-[0_6px_0_rgba(0,0,0,0.15)] active:translate-y-1 active:shadow-none flex items-center gap-1.5 transition-all transform cursor-pointer"
                    >
                      <Play size={12} fill="currentColor" /> {isCompleted ? 'Play Again' : 'Play Mission'}
                    </button>
                  ) : (
                    <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-xs border border-white/20">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* GAME MODAL POPUP */}
      {activeGameModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto">
            {activeGameModal === 1 && (
              <MoneyMatchGame
                onCompleteLevel={(lvl, coins, xp, badge) => {
                  if (lvl === 5) {
                    handleWorldCompleted(1, coins, xp, badge);
                  }
                }}
                onClose={() => setActiveGameModal(null)}
              />
            )}

            {activeGameModal === 2 && (
              <SmartShopperGame
                onComplete={(coins, xp, badge) => {
                  handleWorldCompleted(2, coins, xp, badge);
                }}
                onClose={() => setActiveGameModal(null)}
              />
            )}

            {activeGameModal === 3 && (
              <SavingsMissionGame
                onComplete={(coins, xp, streak, badge, goal) => {
                  handleWorldCompleted(3, coins, xp, badge, {
                    savings_streak: streak,
                    active_savings_goal: goal || null
                  });
                }}
                onClose={() => setActiveGameModal(null)}
              />
            )}

            {activeGameModal === 4 && (
              <BudgetChallengeGame
                onComplete={(coins, xp, badge) => {
                  handleWorldCompleted(4, coins, xp, badge);
                  setActiveGameModal(null);
                }}
                onClose={() => setActiveGameModal(null)}
              />
            )}

            {activeGameModal === 5 && (
              <MyLittleBusinessGame
                onComplete={(coins, xp, profit, badge) => {
                  handleWorldCompleted(5, coins, xp, badge, {
                    business_stats: { last_profit: profit }
                  });
                }}
                onClose={() => setActiveGameModal(null)}
              />
            )}

            {activeGameModal === 7 && (
              <BankAdventureGame
                onComplete={(coins, xp, badge) => {
                  handleWorldCompleted(7, coins, xp, badge);
                  setActiveGameModal(null);
                }}
                onClose={() => setActiveGameModal(null)}
              />
            )}

            {activeGameModal === 9 && (
              <MoneyTrapsGame
                onComplete={(coins, xp, badge) => {
                  handleWorldCompleted(9, coins, xp, badge);
                  setActiveGameModal(null);
                }}
                onClose={() => setActiveGameModal(null)}
              />
            )}

            {activeGameModal === 10 && (
              <MyLittleBusinessGame
                onComplete={(coins, xp, profit) => {
                  handleWorldCompleted(10, coins + 40, xp + 100, "Young Entrepreneur");
                }}
                onClose={() => setActiveGameModal(null)}
              />
            )}
          </div>
        </div>
      )}

      {/* DOLAMONEY WALLET MODAL */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-scaleUp">
          <div className="bg-white border-4 border-amber-300 rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center">
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-900 mx-auto flex items-center justify-center text-4xl mb-4 shadow-xl border-4 border-white">
              👛
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-1">
              Your DolaMoney Wallet
            </h3>
            <p className="text-xs text-amber-600 font-black uppercase tracking-wider mb-6">
              Educational In-Platform Token Vault
            </p>

            <div className="bg-amber-50/80 rounded-2xl p-4 border-2 border-amber-200 mb-6 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-bold">Total DolaCoins Earned:</span>
                <span className="text-lg font-black text-amber-600">🪙 {state.dola_coins.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-bold">Active Savings Streak:</span>
                <span className="text-base font-black text-orange-600">🔥 {state.savings_streak} Weeks</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-bold">Financial Badges:</span>
                <span className="text-base font-black text-emerald-600">🏆 {state.badges.length} / 10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-bold">Worlds Completed:</span>
                <span className="text-base font-black text-indigo-600">🌍 {state.completed_worlds.length} / 10</span>
              </div>
            </div>

            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 mb-6 text-[11px] text-slate-600 text-left leading-relaxed">
              <strong>Notice:</strong> DolaCoins are virtual educational points awarded for completing financial lessons and simulations. They do not hold cash value and cannot be redeemed for real money.
            </div>

            <button
              onClick={() => setShowWalletModal(false)}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              Close Wallet
            </button>
          </div>
        </div>
      )}

      {/* 10 FINANCIAL BADGES SHOWCASE MODAL */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-scaleUp">
          <div className="bg-white border-4 border-emerald-300 rounded-[2.5rem] p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Financial Badges</h3>
                  <p className="text-xs text-emerald-600 font-black">
                    Earn all 10 badges by completing Financial Literacy Game missions!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBadgeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {allBadges.map((b) => {
                const unlocked = state.badges.includes(b.name);
                return (
                  <div
                    key={b.name}
                    className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                      unlocked
                        ? 'bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-300/40'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shrink-0 shadow-xs border border-slate-200">
                      {b.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-slate-900">{b.name}</span>
                        {unlocked && <CheckCircle2 size={14} className="text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-tight font-medium">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowBadgeModal(false)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#047857] transition-all cursor-pointer"
            >
              Back to Quest &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
