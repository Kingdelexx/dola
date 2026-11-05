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
    { name: "DolaMoney Champion", icon: "👑", desc: "Conquer all DolaMoney Quest worlds with financial wisdom!", world: 10 }
  ];

  const worlds = [
    {
      num: 1,
      title: "Money Match",
      icon: "🪙",
      tagline: "Nigerian Currency & Denominations",
      desc: "Recognise ₦1,000 to ₦5 notes, count money combinations, and calculate exact change.",
      color: "from-emerald-500 to-teal-700",
      accent: "text-emerald-400",
      playable: true,
      badge: "Money Starter"
    },
    {
      num: 2,
      title: "Smart Shopper",
      icon: "🛒",
      tagline: "Needs vs. Wants & Decisions",
      desc: "Shop with a ₦3,000 budget, prioritize school supplies, and compare shop prices.",
      color: "from-amber-500 to-orange-700",
      accent: "text-amber-400",
      playable: true,
      badge: "Smart Shopper"
    },
    {
      num: 3,
      title: "Savings Mission",
      icon: "🏺",
      tagline: "Goals & Delayed Gratification",
      desc: "Pick a dream goal (Bicycle, Game, Robotics), save weekly allowance, and build streaks.",
      color: "from-cyan-500 to-blue-700",
      accent: "text-cyan-400",
      playable: true,
      badge: "Savings Star"
    },
    {
      num: 4,
      title: "Budget Challenge",
      icon: "📊",
      tagline: "Planning & Trade-offs",
      desc: "Plan a ₦10,000 class picnic, allocate across categories, and handle unexpected cost spikes.",
      color: "from-indigo-500 to-purple-700",
      accent: "text-indigo-400",
      playable: true,
      badge: "Budget Boss"
    },
    {
      num: 5,
      title: "My Little Business",
      icon: "🏪",
      tagline: "Buying, Selling & Profit",
      desc: "Run a lemonade or snack stall! Calculate Money In, Money Spent, and Money Left (Profit).",
      color: "from-yellow-500 to-amber-700",
      accent: "text-yellow-400",
      playable: true,
      badge: "Profit Pro"
    },
    {
      num: 6,
      title: "Earn It",
      icon: "🛠️",
      tagline: "Creating Value with Skills",
      desc: "Follow Amara, Tobi, Ada, and Kola as they earn income solving problems with skills.",
      color: "from-blue-500 to-indigo-700",
      accent: "text-blue-400",
      playable: false,
      badge: "Young Entrepreneur"
    },
    {
      num: 7,
      title: "Bank Adventure",
      icon: "🏦",
      tagline: "DolaBank Deposits & Withdrawals",
      desc: "Move money between your physical wallet and DolaBank account to keep funds secure.",
      color: "from-teal-500 to-cyan-700",
      accent: "text-teal-400",
      playable: true,
      badge: "Banking Explorer"
    },
    {
      num: 8,
      title: "Goal Builder",
      icon: "🎯",
      tagline: "Milestones & Long-term Vision",
      desc: "Break big goals into 25%, 50%, 75% steps and celebrate every milestone along the way.",
      color: "from-purple-500 to-pink-700",
      accent: "text-purple-400",
      playable: false,
      badge: "Goal Getter"
    },
    {
      num: 9,
      title: "Money Traps",
      icon: "🛡️",
      tagline: "Scam Detection & Impulse Control",
      desc: "Spot suspicious get-rich-quick scams, resist impulse purchases, and ask trusted adults.",
      color: "from-rose-500 to-red-700",
      accent: "text-rose-400",
      playable: true,
      badge: "Money Wise"
    },
    {
      num: 10,
      title: "Young Entrepreneur",
      icon: "🚀",
      tagline: "The Grand Capstone Simulator",
      desc: "Launch your business, serve customers, calculate profits, and reinvest to expand!",
      color: "from-fuchsia-600 to-pink-700",
      accent: "text-pink-400",
      playable: true,
      badge: "DolaMoney Champion"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500 selection:text-slate-900 pb-20">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-slate-300 hover:text-white font-black text-sm transition-all"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>

          {/* DolaMoney Wallet Bar */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* DolaCoins Pill */}
            <div
              onClick={() => setShowWalletModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-950/60 to-yellow-950/40 border border-yellow-500/40 px-3.5 py-1.5 rounded-2xl cursor-pointer hover:border-yellow-400 hover:scale-105 transition-all shadow-md group"
            >
              <span className="text-xl group-hover:rotate-12 transition-transform">🪙</span>
              <div>
                <div className="text-[9px] uppercase font-black text-yellow-400 leading-none">DolaCoins</div>
                <div className="text-sm font-black text-white">{state.dola_coins.toLocaleString()}</div>
              </div>
            </div>

            {/* Savings Streak Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-orange-500/30 px-3.5 py-1.5 rounded-2xl">
              <Flame size={18} className="text-orange-400 animate-pulse" />
              <div>
                <div className="text-[9px] uppercase font-black text-orange-400 leading-none">Streak</div>
                <div className="text-sm font-black text-white">{state.savings_streak} Weeks</div>
              </div>
            </div>

            {/* Badges Pill */}
            <button
              onClick={() => setShowBadgeModal(true)}
              className="flex items-center gap-2 bg-slate-800/80 border border-emerald-500/30 px-3.5 py-1.5 rounded-2xl hover:border-emerald-400 hover:scale-105 transition-all cursor-pointer"
            >
              <Trophy size={16} className="text-yellow-400" />
              <div>
                <div className="text-[9px] uppercase font-black text-emerald-400 leading-none">Badges</div>
                <div className="text-sm font-black text-white">{state.badges.length}/10</div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="relative px-4 sm:px-8 pt-8 pb-10 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-amber-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles size={14} className="text-yellow-400" /> Gamified Financial Literacy
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-3">
          DolaMoney Quest
        </h1>

        <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent mb-4">
          Learn. Earn. Save. Spend. Build.
        </p>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Master the power of money through real choices, interactive businesses, and playful simulations in Nigerian Naira (₦). Every choice has a result!
        </p>

        {/* Educational Disclaimer Callout */}
        <div className="mt-6 inline-flex items-center gap-2 bg-slate-900/80 border border-white/10 px-4 py-2 rounded-2xl text-xs text-slate-400">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
          <span>
            <strong>Note for Learners & Parents:</strong> DolaCoins are educational in-game rewards. They do not represent real money and cannot be bought or redeemed for cash.
          </span>
        </div>
      </section>

      {/* World Map Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white">Interactive World Map</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              10 Progressive Worlds &bull; Play, make choices, and see what happens!
            </p>
          </div>
          <div className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
            {state.completed_worlds.length} / 10 Worlds Conquered
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {worlds.map((w) => {
            const isCompleted = state.completed_worlds.includes(w.num);
            const isCurrent = state.current_world === w.num;
            const hasBadge = state.badges.includes(w.badge);

            return (
              <div
                key={w.num}
                className={`
                  relative rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col justify-between overflow-hidden
                  ${isCompleted
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900/90 to-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                    : isCurrent
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900/90 to-amber-950/40 border-amber-500/50 ring-2 ring-amber-400/30 shadow-xl'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }
                `}
              >
                {/* World Number Badge */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-2xl shadow-inner border border-white/10">
                      {w.icon}
                    </span>
                    <div>
                      <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                        World {w.num}
                      </div>
                      <h3 className="text-lg font-black text-white leading-tight">
                        {w.title}
                      </h3>
                    </div>
                  </div>

                  {isCompleted && (
                    <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                      <CheckCircle2 size={12} /> Mastered
                    </span>
                  )}
                </div>

                {/* Body Details */}
                <div className="relative z-10 mb-6">
                  <div className={`text-xs font-black uppercase tracking-wider mb-2 ${w.accent}`}>
                    {w.tagline}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {w.desc}
                  </p>
                </div>

                {/* Footer with Badge & Action */}
                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Trophy size={14} className={hasBadge ? "text-yellow-400" : "text-slate-600"} />
                    <span className={hasBadge ? "font-bold text-yellow-300" : ""}>{w.badge}</span>
                  </div>

                  {w.playable ? (
                    <button
                      onClick={() => setActiveGameModal(w.num)}
                      className={`
                        px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all transform active:scale-95 shadow-md cursor-pointer
                        ${isCompleted
                          ? 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-900'
                        }
                      `}
                    >
                      <Play size={12} fill="currentColor" /> {isCompleted ? 'Play Again' : 'Enter World'}
                    </button>
                  ) : (
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 px-3 py-1 rounded-lg bg-white/5 border border-white/5">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-4 border-yellow-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-900 mx-auto flex items-center justify-center text-3xl mb-4 shadow-lg border-2 border-white">
              👛
            </div>
            <h3 className="text-2xl font-black text-white mb-1">
              Your DolaMoney Wallet
            </h3>
            <p className="text-xs text-yellow-300 font-bold uppercase tracking-wider mb-6">
              Educational In-Platform Token Vault
            </p>

            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 mb-6 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">Total DolaCoins Earned:</span>
                <span className="text-lg font-black text-yellow-400">🪙 {state.dola_coins.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">Active Savings Streak:</span>
                <span className="text-base font-black text-orange-400">🔥 {state.savings_streak} Weeks</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">Financial Badges:</span>
                <span className="text-base font-black text-emerald-400">🏆 {state.badges.length} / 10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">Worlds Completed:</span>
                <span className="text-base font-black text-cyan-400">🌍 {state.completed_worlds.length} / 10</span>
              </div>
            </div>

            <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3.5 mb-6 text-[11px] text-amber-200/90 text-left leading-relaxed">
              <strong>Notice:</strong> DolaCoins are virtual educational points awarded for completing financial lessons and simulations. They do not hold cash value and cannot be redeemed for real money.
            </div>

            <button
              onClick={() => setShowWalletModal(false)}
              className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-sm uppercase tracking-wider transition-all"
            >
              Close Wallet
            </button>
          </div>
        </div>
      )}

      {/* 10 FINANCIAL BADGES SHOWCASE MODAL */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-4 border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                <div>
                  <h3 className="text-2xl font-black text-white">Financial Badges</h3>
                  <p className="text-xs text-emerald-400 font-bold">
                    Earn all 10 badges by completing DolaMoney Quest missions!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBadgeModal(false)}
                className="text-slate-400 hover:text-white font-bold"
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
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                      unlocked
                        ? 'bg-emerald-950/40 border-emerald-400 shadow-md ring-1 ring-emerald-400/30'
                        : 'bg-slate-800/40 border-slate-700/60 opacity-60'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl shrink-0">
                      {b.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-white">{b.name}</span>
                        {unlocked && <CheckCircle2 size={14} className="text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-tight">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowBadgeModal(false)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-900 font-black text-sm uppercase tracking-wider transition-all"
            >
              Back to Quest
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
