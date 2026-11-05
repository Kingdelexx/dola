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
    <div className="bg-white border-4 border-indigo-300 rounded-[2.5rem] p-6 sm:p-9 text-slate-800 max-w-4xl mx-auto shadow-2xl relative">
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-3xl shadow-lg border-2 border-white">
            📊
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-indigo-700 font-black">
              World 4 &bull; Budget Challenge
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              The Class Picnic Budget
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-all cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Top Banner */}
      <div className="bg-indigo-50 border-2 border-indigo-200 p-5 rounded-3xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase text-indigo-700">Total Available Budget</div>
          <div className="text-3xl font-black text-slate-900">₦{totalBudget.toLocaleString()}</div>
        </div>
        <div className="text-right">
          <div className={`text-xs font-black uppercase ${remaining < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {remaining < 0 ? 'Over Budget by' : 'Unallocated Remaining'}
          </div>
          <div className={`text-3xl font-black ${remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            ₦{Math.abs(remaining).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Shock Warning Banner */}
      {hasShock && !shockResolved && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl mb-6 flex items-center gap-3 text-amber-900 font-medium animate-pulse">
          <AlertCircle size={24} className="text-amber-600 shrink-0" />
          <div className="text-sm">
            <strong>Unexpected Expense!</strong> Transport fuel went up by ₦500! Your budget now exceeds ₦{totalBudget.toLocaleString()}. Adjust another category so your total stays within ₦{totalBudget.toLocaleString()}!
          </div>
        </div>
      )}

      {/* Category Adjustment Controls */}
      <div className="space-y-3 mb-6">
        {categories.map((cat) => {
          const val = allocations[cat.key] || 0;
          return (
            <div key={cat.key} className="bg-slate-50 border-2 border-slate-200 p-4 rounded-3xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-[160px]">
                <span className="text-3xl">{cat.icon}</span>
                <span className="font-black text-sm text-slate-800">{cat.name}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => adjustCategory(cat.key, -500)}
                  className="w-9 h-9 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-black text-lg flex items-center justify-center border border-slate-300 shadow-xs transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-24 text-center font-black text-slate-900 text-lg">
                  ₦{val.toLocaleString()}
                </span>
                <button
                  onClick={() => adjustCategory(cat.key, 500)}
                  className="w-9 h-9 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-black text-lg flex items-center justify-center border border-slate-300 shadow-xs transition-colors cursor-pointer"
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
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-base uppercase tracking-wider shadow-[0_4px_0_#4338ca] hover:shadow-[0_6px_0_#4338ca] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
        >
          {hasShock ? 'Confirm Adjusted Budget &rarr;' : 'Submit Class Picnic Budget &rarr;'}
        </button>
      ) : (
        <div className="text-center py-5 bg-emerald-50 border-2 border-emerald-400 rounded-3xl">
          <CheckCircle2 size={40} className="text-emerald-600 mx-auto mb-2" />
          <h4 className="text-2xl font-black text-slate-900">Budget Boss Mastered!</h4>
          <p className="text-sm font-semibold text-emerald-800 mt-1">
            You successfully adjusted your budget when unexpected expenses arrived!
          </p>
        </div>
      )}
    </div>
  );
};
