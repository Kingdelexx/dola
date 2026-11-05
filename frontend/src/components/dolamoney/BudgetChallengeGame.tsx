'use client';

import React, { useState } from 'react';
import { Sparkles, PieChart, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BudgetChallengeGameProps {
  onComplete: (coinsEarned: number, xpEarned: number, badgeAwarded?: string) => void;
  onClose: () => void;
}

export const BudgetChallengeGame: React.FC<BudgetChallengeGameProps> = ({ onComplete, onClose }) => {
  const totalBudget = 10000;
  const [allocations, setAllocations] = useState<{ [key: string]: number }>({
    food: 4000,
    transport: 2500,
    drinks: 1500,
    games: 1000,
    emergency: 1000
  });
  const [hasShock, setHasShock] = useState<boolean>(false);
  const [shockResolved, setShockResolved] = useState<boolean>(false);

  const categories = [
    { key: 'food', name: 'Snacks & Food', icon: '🥪' },
    { key: 'transport', name: 'Bus Transport', icon: '🚌' },
    { key: 'drinks', name: 'Fresh Drinks', icon: '🧃' },
    { key: 'games', name: 'Fun Games & Prizes', icon: '🎯' },
    { key: 'emergency', name: 'Emergency / Safety Fund', icon: '🛡️' }
  ];

  const currentTotal = Object.values(allocations).reduce((a, b) => a + b, 0);
  const remaining = totalBudget - currentTotal;

  const adjustCategory = (key: string, delta: number) => {
    const current = allocations[key] || 0;
    const next = Math.max(0, current + delta);
    setAllocations({ ...allocations, [key]: next });
  };

  const handleTestBudget = () => {
    if (currentTotal > totalBudget) {
      alert(`Oops! You planned to spend ₦${currentTotal.toLocaleString()}, but you only have ₦${totalBudget.toLocaleString()}! Reduce one category.`);
      return;
    }
    if (!hasShock) {
      // Trigger unexpected expense shock
      setHasShock(true);
      setAllocations(prev => ({ ...prev, transport: prev.transport + 500 }));
    } else {
      if (currentTotal <= totalBudget) {
        setShockResolved(true);
        confetti({ particleCount: 70, spread: 80 });
        setTimeout(() => {
          onComplete(50, 100, "Budget Boss");
        }, 1200);
      }
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border-4 border-indigo-500/30 rounded-3xl p-6 sm:p-8 text-white max-w-4xl mx-auto shadow-2xl relative">
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center text-2xl shadow-lg border border-white/20">
            📊
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-indigo-400 font-black">
              World 4 &bull; Budget Challenge
            </div>
            <h2 className="text-2xl font-black text-white">
              The Class Picnic Budget
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-sm transition-all"
        >
          ✕ Exit
        </button>
      </div>

      {/* Top Banner */}
      <div className="bg-indigo-950/40 border border-indigo-400/30 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase text-indigo-300">Total Available Budget</div>
          <div className="text-3xl font-black text-white">₦{totalBudget.toLocaleString()}</div>
        </div>
        <div className="text-right">
          <div className={`text-xs font-black uppercase ${remaining < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {remaining < 0 ? 'Over Budget by' : 'Unallocated Remaining'}
          </div>
          <div className={`text-3xl font-black ${remaining < 0 ? 'text-rose-400' : 'text-emerald-300'}`}>
            ₦{Math.abs(remaining).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Shock Warning Banner */}
      {hasShock && !shockResolved && (
        <div className="p-4 bg-amber-500/20 border-2 border-amber-400 rounded-2xl mb-6 flex items-center gap-3 text-amber-200 animate-pulse">
          <AlertCircle size={24} className="text-amber-400 shrink-0" />
          <div className="text-sm font-semibold">
            <strong>Unexpected Expense!</strong> Transport fuel went up by ₦500! Your budget now exceeds ₦{totalBudget.toLocaleString()}. Adjust another category so your total stays within ₦{totalBudget.toLocaleString()}!
          </div>
        </div>
      )}

      {/* Category Sliders / Adjustment Controls */}
      <div className="space-y-3 mb-6">
        {categories.map((cat) => {
          const val = allocations[cat.key] || 0;
          return (
            <div key={cat.key} className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-[160px]">
                <span className="text-2xl">{cat.icon}</span>
                <span className="font-bold text-sm text-white">{cat.name}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => adjustCategory(cat.key, -500)}
                  className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-black text-base flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <span className="w-24 text-center font-black text-white text-base">
                  ₦{val.toLocaleString()}
                </span>
                <button
                  onClick={() => adjustCategory(cat.key, 500)}
                  className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-black text-base flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      {!shockResolved ? (
        <button
          onClick={handleTestBudget}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-base uppercase tracking-wider shadow-xl transition-all transform active:scale-98 cursor-pointer"
        >
          {hasShock ? 'Confirm Adjusted Budget &rarr;' : 'Submit Class Picnic Budget &rarr;'}
        </button>
      ) : (
        <div className="text-center py-4 bg-emerald-500/20 border-2 border-emerald-400 rounded-2xl">
          <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-2" />
          <h4 className="text-xl font-black text-white">Budget Boss Mastered!</h4>
          <p className="text-xs text-emerald-200 mt-1">
            You successfully adjusted your budget when unexpected expenses arrived!
          </p>
        </div>
      )}
    </div>
  );
};
