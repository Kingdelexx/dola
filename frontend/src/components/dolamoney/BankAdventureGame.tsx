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
    <div className="bg-white border-4 border-cyan-300 rounded-[2.5rem] p-6 sm:p-9 text-slate-800 max-w-4xl mx-auto shadow-2xl relative">
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 text-white flex items-center justify-center text-3xl shadow-lg border-2 border-white">
            🏦
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-cyan-700 font-black">
              World 7 &bull; Bank Adventure
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Welcome to DolaBank
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

      {/* Two Containers: Wallet vs Bank */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {/* Wallet Container */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-3 border-amber-300 rounded-[2.2rem] p-6 text-center shadow-md relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-amber-400 text-slate-950 mx-auto flex items-center justify-center text-3xl mb-3 shadow-md border-2 border-white">
            👛
          </div>
          <div className="text-xs font-black uppercase tracking-wider text-amber-800 mb-1">
            Physical Pocket Wallet
          </div>
          <div className="text-3xl font-black text-slate-900 my-2">
            ₦{wallet.toLocaleString()}
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Cash carried in your pocket for daily small purchases
          </p>
        </div>

        {/* Bank Account Container */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-3 border-cyan-300 rounded-[2.2rem] p-6 text-center shadow-md relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500 text-white mx-auto flex items-center justify-center text-3xl mb-3 shadow-md border-2 border-white">
            🏛️
          </div>
          <div className="text-xs font-black uppercase tracking-wider text-cyan-800 mb-1">
            DolaBank Secure Account
          </div>
          <div className="text-3xl font-black text-cyan-700 my-2">
            ₦{bank.toLocaleString()}
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Safe, digital balance kept secure inside the bank
          </p>
        </div>
      </div>

      {/* Interactive Missions */}
      <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-7 text-center mb-6">
        {step === 1 && (
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-black uppercase mb-3 border border-cyan-300">
              <Sparkles size={14} className="text-amber-500" /> Mission 1: Make a Deposit
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              Deposit ₦2,000 from your wallet into DolaBank!
            </h3>
            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto font-medium">
              <strong>DEPOSIT</strong> means putting money securely into the bank so it stays safe and protected.
            </p>

            <button
              onClick={() => handleDeposit(2000)}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#0284c7] hover:shadow-[0_6px_0_#0284c7] active:translate-y-1 active:shadow-none flex items-center gap-2 mx-auto transition-all cursor-pointer"
            >
              <ArrowDownRight size={18} /> Deposit ₦2,000 Now
            </button>
          </div>
        )}

        {step === 2 && !completed && (
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase mb-3 border border-amber-300">
              <Sparkles size={14} className="text-amber-500" /> Mission 2: Make a Withdrawal
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              Withdraw ₦1,000 from your bank back into your wallet!
            </h3>
            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto font-medium">
              <strong>WITHDRAW</strong> means taking out some of your money when you need cash for groceries.
            </p>

            <button
              onClick={() => handleWithdraw(1000)}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#d97706] hover:shadow-[0_6px_0_#d97706] active:translate-y-1 active:shadow-none flex items-center gap-2 mx-auto transition-all cursor-pointer"
            >
              <ArrowUpRight size={18} /> Withdraw ₦1,000 Now
            </button>
          </div>
        )}

        {completed && (
          <div className="py-4">
            <CheckCircle2 size={48} className="text-emerald-600 mx-auto mb-3" />
            <h3 className="text-3xl font-black text-slate-900 mb-2">
              Banking Explorer Unlocked!
            </h3>
            <p className="text-sm font-semibold text-emerald-800">
              You mastered the 3 pillars of banking: <strong>DEPOSIT</strong>, <strong>WITHDRAW</strong>, and <strong>BALANCE</strong>!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
