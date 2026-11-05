'use client';

import React, { useState } from 'react';
import { Landmark, Wallet, ArrowDownRight, ArrowUpRight, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BankAdventureGameProps {
  onComplete: (coinsEarned: number, xpEarned: number, badgeAwarded?: string) => void;
  onClose: () => void;
}

export const BankAdventureGame: React.FC<BankAdventureGameProps> = ({ onComplete, onClose }) => {
  const [wallet, setWallet] = useState<number>(5000);
  const [bank, setBank] = useState<number>(10000);
  const [step, setStep] = useState<number>(1);
  const [completed, setCompleted] = useState<boolean>(false);

  const handleDeposit = (amount: number) => {
    if (wallet < amount) return;
    setWallet(prev => prev - amount);
    setBank(prev => prev + amount);
    confetti({ particleCount: 50, spread: 60 });
    setStep(2);
  };

  const handleWithdraw = (amount: number) => {
    if (bank < amount) return;
    setBank(prev => prev - amount);
    setWallet(prev => prev + amount);
    confetti({ particleCount: 60, spread: 70 });
    setCompleted(true);
    setTimeout(() => {
      onComplete(50, 100, "Banking Explorer");
    }, 1500);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border-4 border-cyan-500/30 rounded-3xl p-6 sm:p-8 text-white max-w-4xl mx-auto shadow-2xl relative">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg border border-white/20">
            🏦
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-cyan-400 font-black">
              World 7 &bull; Bank Adventure
            </div>
            <h2 className="text-2xl font-black text-white">
              Welcome to DolaBank
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

      {/* Two Containers: Wallet vs Bank */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {/* Wallet Container */}
        <div className="bg-gradient-to-br from-slate-800 to-amber-950/40 border-2 border-amber-400/40 rounded-3xl p-6 text-center shadow-lg relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 mx-auto flex items-center justify-center text-3xl mb-3 border border-amber-400/30">
            👛
          </div>
          <div className="text-xs font-black uppercase tracking-wider text-amber-300 mb-1">
            Physical Wallet
          </div>
          <div className="text-3xl font-black text-white my-2">
            ₦{wallet.toLocaleString()}
          </div>
          <p className="text-xs text-slate-300">
            Cash carried in your pocket for daily small expenses
          </p>
        </div>

        {/* Bank Account Container */}
        <div className="bg-gradient-to-br from-slate-800 to-cyan-950/40 border-2 border-cyan-400/40 rounded-3xl p-6 text-center shadow-lg relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-300 mx-auto flex items-center justify-center text-3xl mb-3 border border-cyan-400/30">
            🏛️
          </div>
          <div className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-1">
            DolaBank Secure Account
          </div>
          <div className="text-3xl font-black text-cyan-300 my-2">
            ₦{bank.toLocaleString()}
          </div>
          <p className="text-xs text-slate-300">
            Safe, digital balance kept secure inside the bank
          </p>
        </div>
      </div>

      {/* Interactive Missions */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 text-center mb-6">
        {step === 1 && (
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black uppercase mb-3 border border-cyan-400/30">
              <Sparkles size={14} /> Mission 1: Make a Deposit
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
              Deposit ₦2,000 from your wallet into DolaBank!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-md mx-auto">
              <strong>DEPOSIT</strong> means putting money securely into the bank so it stays safe and grows.
            </p>

            <button
              onClick={() => handleDeposit(2000)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-900 font-black text-sm uppercase tracking-wider shadow-lg flex items-center gap-2 mx-auto transition-all transform active:scale-95"
            >
              <ArrowDownRight size={18} /> Deposit ₦2,000 Now
            </button>
          </div>
        )}

        {step === 2 && !completed && (
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase mb-3 border border-amber-400/30">
              <Sparkles size={14} /> Mission 2: Make a Withdrawal
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
              Withdraw ₦1,000 from your bank back into your wallet!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-md mx-auto">
              <strong>WITHDRAW</strong> means taking out some of your money when you need cash for purchases.
            </p>

            <button
              onClick={() => handleWithdraw(1000)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 font-black text-sm uppercase tracking-wider shadow-lg flex items-center gap-2 mx-auto transition-all transform active:scale-95"
            >
              <ArrowUpRight size={18} /> Withdraw ₦1,000 Now
            </button>
          </div>
        )}

        {completed && (
          <div className="py-4">
            <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-3" />
            <h3 className="text-2xl font-black text-white mb-2">
              Banking Explorer Unlocked!
            </h3>
            <p className="text-sm text-emerald-200">
              You mastered the 3 pillars of banking: <strong>DEPOSIT</strong>, <strong>WITHDRAW</strong>, and <strong>BALANCE</strong>!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
