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
    <div className="bg-white border-4 border-cyan-300 rounded-[2.5rem] p-6 sm:p-9 text-slate-800 max-w-4xl mx-auto shadow-2xl relative">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-sky-400 to-cyan-500 text-white flex items-center justify-center text-3xl shadow-lg border-2 border-white">
            🏺
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-cyan-700 font-black">
              World 3 &bull; Savings Mission
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {activeTab === 'pick_goal' ? 'Choose Your Savings Goal' : selectedGoal?.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs font-black text-xs">
              <Flame size={16} className="text-yellow-200 animate-pulse" />
              <span>{streak}-Week Streak!</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* STEP 1: PICK A SAVINGS GOAL */}
      {activeTab === 'pick_goal' && (
        <div>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              What would you like to save up for?
            </h3>
            <p className="text-slate-600 text-sm font-medium max-w-lg mx-auto">
              Setting a clear goal makes saving exciting and helps you practice delayed gratification!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {goalOptions.map((g) => (
              <div
                key={g.id}
                onClick={() => handleSelectGoal(g)}
                className="bg-slate-50 hover:bg-cyan-50/60 border-3 border-slate-200 hover:border-cyan-400 p-5 rounded-3xl cursor-pointer transition-all hover:scale-102 flex items-center gap-4 group shadow-sm"
              >
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform shadow-xs border border-slate-200">
                  {g.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-slate-900 text-base">{g.name}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{g.description}</p>
                  <div className="text-lg font-black text-cyan-600 mt-2">
                    ₦{g.target.toLocaleString()}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-cyan-100 group-hover:bg-cyan-500 text-cyan-800 group-hover:text-white flex items-center justify-center font-black text-base transition-colors shadow-xs">
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
          <div className="md:col-span-5 bg-gradient-to-b from-sky-50 to-cyan-50/60 border-3 border-cyan-200 rounded-[2.5rem] p-6 text-center flex flex-col items-center justify-center shadow-inner">
            <div className="text-xs uppercase font-black tracking-wider text-cyan-800 mb-2">
              Your Savings Jar
            </div>

            {/* The Visual Glass Jar */}
            <div className="w-40 h-56 border-4 border-cyan-400 rounded-b-3xl rounded-t-lg bg-white/70 backdrop-blur-xs relative overflow-hidden flex flex-col justify-end p-2 shadow-[0_10px_25px_rgba(6,182,212,0.25)] my-2">
              {/* Jar Lid */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 border-b-2 border-amber-300 shadow-xs" />

              {/* Coin Fill Level */}
              <div
                className="w-full bg-gradient-to-t from-yellow-500 via-amber-400 to-yellow-300 rounded-b-2xl transition-all duration-700 relative flex items-center justify-center overflow-hidden shadow-inner"
                style={{ height: `${Math.max(10, percentComplete)}%` }}
              >
                <span className="relative z-10 text-xs font-black text-slate-950">
                  {percentComplete}%
                </span>
              </div>
            </div>

            <div className="mt-2 text-2xl font-black text-cyan-700">
              ₦{totalSaved.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 font-bold">
              Goal: ₦{selectedGoal.target.toLocaleString()}
            </div>
          </div>

          {/* Right Column: Weekly Decision Making */}
          <div className="md:col-span-7 flex flex-col justify-between">
            {/* Allowance Notification */}
            <div className="bg-emerald-50 border-2 border-emerald-300 p-5 rounded-3xl mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                  Week {currentWeek} Allowance / Earnings
                </span>
                <span className="text-xs font-black text-emerald-700">
                  +{weeklyIncome} ₦
                </span>
              </div>
              <p className="text-sm font-semibold text-emerald-950">
                You received your weekly allowance of <strong>₦{weeklyIncome.toLocaleString()}</strong>. How much would you like to put into your Savings Jar?
              </p>
            </div>

            {/* Savings Options */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {saveOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleDepositWeek(opt)}
                  className="p-4 rounded-3xl bg-white hover:bg-cyan-50 border-3 border-slate-200 hover:border-cyan-400 text-center transition-all hover:scale-105 active:scale-95 group shadow-sm cursor-pointer"
                >
                  <div className="text-xs text-slate-500 font-bold mb-1">Save</div>
                  <div className="text-xl font-black text-slate-900 group-hover:text-cyan-600">₦{opt.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1">
                    Keep ₦{weeklyIncome - opt}
                  </div>
                </button>
              ))}
            </div>

            {/* Progress Bar & Milestone Badges */}
            <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-3xl">
              <div className="flex items-center justify-between text-xs font-black mb-2">
                <span className="text-slate-700">Goal Progress</span>
                <span className="text-cyan-600">{percentComplete}% Complete</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-300 mb-3">
                <div
                  className="bg-gradient-to-r from-sky-400 via-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>

              {/* Milestones markers */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
                <span>Start</span>
                <span className={percentComplete >= 25 ? 'text-amber-500 font-black' : ''}>25% 🌟</span>
                <span className={percentComplete >= 50 ? 'text-cyan-600 font-black' : ''}>50% 🎯</span>
                <span className={percentComplete >= 75 ? 'text-indigo-600 font-black' : ''}>75% 🚀</span>
                <span className={percentComplete >= 100 ? 'text-emerald-600 font-black' : ''}>100% 🏆</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: COMPLETED GOAL CELEBRATION */}
      {activeTab === 'completed' && selectedGoal && (
        <div className="text-center py-6 max-w-md mx-auto animate-scaleUp">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 mx-auto flex items-center justify-center text-5xl shadow-xl border-4 border-white mb-4 animate-bounce">
            {selectedGoal.icon}
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-2">
            Goal Reached!
          </h3>
          <p className="text-slate-600 text-sm font-semibold mb-6">
            Congratulations! Through consistent saving over {currentWeek} weeks, you saved full <strong>₦{selectedGoal.target.toLocaleString()}</strong> for your {selectedGoal.name}!
          </p>

          <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 mb-6 flex items-center justify-around">
            <div>
              <div className="text-2xl font-black text-amber-600">+60</div>
              <div className="text-[10px] font-black uppercase text-slate-500">DolaCoins</div>
            </div>
            <div className="w-px h-10 bg-amber-200" />
            <div>
              <div className="text-2xl font-black text-cyan-600">+120</div>
              <div className="text-[10px] font-black uppercase text-slate-500">XP Earned</div>
            </div>
            <div className="w-px h-10 bg-amber-200" />
            <div>
              <div className="text-2xl">⭐</div>
              <div className="text-[10px] font-black uppercase text-amber-600">Savings Star</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base uppercase tracking-wider shadow-[0_4px_0_#047857] hover:shadow-[0_6px_0_#047857] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            Back to World Map &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
