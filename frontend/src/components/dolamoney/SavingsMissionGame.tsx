'use client';

import React, { useState } from 'react';
import { Sparkles, Flame, CheckCircle2, Trophy, ArrowRight, RotateCcw, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SavingsMissionGameProps {
  onComplete: (coinsEarned: number, xpEarned: number, streak: number, badgeAwarded?: string, goal?: { name: string; target: number; current: number }) => void;
  onClose: () => void;
}

interface GoalOption {
  id: string;
  name: string;
  target: number;
  icon: string;
  description: string;
}

export const SavingsMissionGame: React.FC<SavingsMissionGameProps> = ({ onComplete, onClose }) => {
  const goalOptions: GoalOption[] = [
    { id: 'books', name: 'STEM Adventure Books', target: 8000, icon: '📚', description: 'Fun science and coding books' },
    { id: 'game', name: 'Arcade Game Console', target: 15000, icon: '🎮', description: 'Multiplayer retro console' },
    { id: 'robot', name: 'AI Robotics Kit', target: 25000, icon: '🤖', description: 'Sensors, motors, and microcontrollers' },
    { id: 'bike', name: 'Bicycle Speedster', target: 30000, icon: '🚲', description: 'All-terrain adventure bicycle' }
  ];

  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [totalSaved, setTotalSaved] = useState<number>(0);
  const [savingsHistory, setSavingsHistory] = useState<{ week: number; saved: number; total: number }[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [milestoneCelebrated, setMilestoneCelebrated] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'pick_goal' | 'saving_loop' | 'completed'>('pick_goal');

  const weeklyIncome = 2000;
  const saveOptions = [500, 1000, 1500];

  const handleSelectGoal = (goal: GoalOption) => {
    setSelectedGoal(goal);
    setActiveTab('saving_loop');
    setCurrentWeek(1);
    setTotalSaved(0);
    setSavingsHistory([]);
    setStreak(0);
  };

  const handleDepositWeek = (amount: number) => {
    if (!selectedGoal) return;

    const newTotal = totalSaved + amount;
    const newStreak = streak + 1;
    setTotalSaved(newTotal);
    setStreak(newStreak);
    setSavingsHistory(prev => [...prev, { week: currentWeek, saved: amount, total: newTotal }]);

    const percent = Math.floor((newTotal / selectedGoal.target) * 100);

    // Milestones at 25%, 50%, 75%, 100%
    if (percent >= 100) {
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
      setTimeout(() => {
        setActiveTab('completed');
        onComplete(60, 120, newStreak, "Savings Star", {
          name: selectedGoal.name,
          target: selectedGoal.target,
          current: newTotal
        });
      }, 1000);
      return;
    }

    if ([25, 50, 75].some(m => percent >= m && !milestoneCelebrated.includes(m))) {
      const hitMilestone = [75, 50, 25].find(m => percent >= m && !milestoneCelebrated.includes(m))!;
      setMilestoneCelebrated(prev => [...prev, hitMilestone]);
      confetti({ particleCount: 40, spread: 60 });
    }

    setCurrentWeek(prev => prev + 1);
  };

  const percentComplete = selectedGoal ? Math.min(100, Math.floor((totalSaved / selectedGoal.target) * 100)) : 0;

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border-4 border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-white max-w-4xl mx-auto shadow-2xl relative">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-2xl shadow-lg border border-white/20">
            🏺
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-emerald-400 font-black">
              World 3 &bull; Savings Mission
            </div>
            <h2 className="text-2xl font-black text-white">
              {activeTab === 'pick_goal' ? 'Choose Your Savings Goal' : selectedGoal?.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {streak > 0 && (
            <div className="bg-orange-500/20 border border-orange-400/40 px-3 py-1.5 rounded-2xl flex items-center gap-1.5">
              <Flame size={18} className="text-orange-400 animate-pulse" />
              <span className="font-black text-orange-300 text-sm">{streak}-Week Streak!</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-sm transition-all"
          >
            ✕ Exit
          </button>
        </div>
      </div>

      {/* STEP 1: PICK A SAVINGS GOAL */}
      {activeTab === 'pick_goal' && (
        <div>
          <div className="text-center mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
              What would you like to save up for?
            </h3>
            <p className="text-slate-300 text-sm max-w-lg mx-auto">
              Setting a clear goal makes saving exciting and helps you practice delayed gratification!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {goalOptions.map((g) => (
              <div
                key={g.id}
                onClick={() => handleSelectGoal(g)}
                className="bg-slate-800/80 hover:bg-slate-800 border-2 border-slate-700 hover:border-emerald-400 p-5 rounded-2xl cursor-pointer transition-all hover:scale-102 flex items-center gap-4 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                  {g.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-white text-base">{g.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{g.description}</p>
                  <div className="text-lg font-black text-emerald-400 mt-2">
                    ₦{g.target.toLocaleString()}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 group-hover:bg-emerald-500 text-emerald-300 group-hover:text-slate-900 flex items-center justify-center font-bold text-sm transition-colors">
                  &rarr;
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: SAVING LOOP & VISUAL JAR */}
      {activeTab === 'saving_loop' && selectedGoal && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Column: Visual Savings Jar */}
          <div className="md:col-span-5 bg-slate-800/80 border border-slate-700 rounded-3xl p-6 text-center flex flex-col items-center justify-center">
            <div className="text-xs uppercase font-black tracking-wider text-slate-400 mb-2">
              Your Savings Jar
            </div>

            {/* The Visual Glass Jar */}
            <div className="w-40 h-56 border-4 border-cyan-400/60 rounded-b-3xl rounded-t-lg bg-cyan-950/20 backdrop-blur-sm relative overflow-hidden flex flex-col justify-end p-2 shadow-[0_0_30px_rgba(34,211,238,0.15)] my-2">
              {/* Jar Lid */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 border-b-2 border-amber-400 shadow-md" />

              {/* Liquid / Coin Fill Level */}
              <div
                className="w-full bg-gradient-to-t from-yellow-500 via-amber-400 to-yellow-300 rounded-b-2xl transition-all duration-700 relative flex items-center justify-center overflow-hidden"
                style={{ height: `${Math.max(8, percentComplete)}%` }}
              >
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:6px_6px]" />
                <span className="relative z-10 text-xs font-black text-slate-900">
                  {percentComplete}%
                </span>
              </div>
            </div>

            <div className="mt-2 text-xl font-black text-emerald-400">
              ₦{totalSaved.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">
              Goal: ₦{selectedGoal.target.toLocaleString()}
            </div>
          </div>

          {/* Right Column: Weekly Decision Making */}
          <div className="md:col-span-7 flex flex-col justify-between">
            {/* Allowance Notification */}
            <div className="bg-emerald-950/40 border border-emerald-400/30 p-4 rounded-2xl mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  Week {currentWeek} Allowance / Earnings
                </span>
                <span className="text-xs font-bold text-slate-400">
                  +{weeklyIncome} ₦
                </span>
              </div>
              <p className="text-sm font-semibold text-emerald-100">
                You received your weekly allowance of <strong>₦{weeklyIncome.toLocaleString()}</strong>. How much would you like to put into your Savings Jar?
              </p>
            </div>

            {/* Savings Options */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {saveOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleDepositWeek(opt)}
                  className="p-4 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-800/80 hover:from-emerald-600 hover:to-teal-700 border border-slate-700 hover:border-emerald-300 text-center transition-all hover:scale-105 active:scale-95 group shadow-lg"
                >
                  <div className="text-xs text-slate-400 group-hover:text-emerald-100 font-bold mb-1">Save</div>
                  <div className="text-lg font-black text-white">₦{opt.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 group-hover:text-emerald-200 mt-1">
                    Keep ₦{weeklyIncome - opt}
                  </div>
                </button>
              ))}
            </div>

            {/* Progress Bar & Milestone Badges */}
            <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-xs font-black mb-2">
                <span className="text-slate-300">Goal Progress</span>
                <span className="text-emerald-400">{percentComplete}% Complete</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-white/10 mb-3">
                <div
                  className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>

              {/* Milestones markers */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
                <span>Start</span>
                <span className={percentComplete >= 25 ? 'text-emerald-300 font-black' : ''}>25% 🌟</span>
                <span className={percentComplete >= 50 ? 'text-emerald-300 font-black' : ''}>50% 🎯</span>
                <span className={percentComplete >= 75 ? 'text-emerald-300 font-black' : ''}>75% 🚀</span>
                <span className={percentComplete >= 100 ? 'text-emerald-300 font-black' : ''}>100% 🏆</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: COMPLETED GOAL CELEBRATION */}
      {activeTab === 'completed' && selectedGoal && (
        <div className="text-center py-6 max-w-md mx-auto animate-scaleUp">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-900 mx-auto flex items-center justify-center text-5xl shadow-2xl border-4 border-white mb-4 animate-bounce">
            {selectedGoal.icon}
          </div>
          <h3 className="text-3xl font-black text-white mb-2">
            Goal Reached!
          </h3>
          <p className="text-emerald-200 text-sm font-semibold mb-6">
            Congratulations! Through consistent saving over {currentWeek} weeks, you saved full <strong>₦{selectedGoal.target.toLocaleString()}</strong> for your {selectedGoal.name}!
          </p>

          <div className="bg-black/30 rounded-2xl p-4 border border-white/10 mb-6 flex items-center justify-around">
            <div>
              <div className="text-2xl font-black text-yellow-300">+60</div>
              <div className="text-[10px] font-black uppercase text-slate-400">DolaCoins</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <div className="text-2xl font-black text-cyan-300">+120</div>
              <div className="text-[10px] font-black uppercase text-slate-400">XP Earned</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <div className="text-2xl">⭐</div>
              <div className="text-[10px] font-black uppercase text-yellow-400">Savings Star</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-900 font-black text-base uppercase tracking-wider shadow-xl transition-all transform active:scale-98"
          >
            Back to World Map &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
