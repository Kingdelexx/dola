'use client';

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MoneyTrapsGameProps {
  onComplete: (coinsEarned: number, xpEarned: number, badgeAwarded?: string) => void;
  onClose: () => void;
}

export const MoneyTrapsGame: React.FC<MoneyTrapsGameProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState<number>(1);
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);

  const handleStep1 = (choice: 'send' | 'ask_adult' | 'share_details') => {
    if (choice === 'ask_adult') {
      confetti({ particleCount: 50, spread: 60 });
      setFeedback({
        success: true,
        text: 'Spot on! Never send money or share bank passwords. If something sounds too good to be true, stop and check with a trusted parent or adult!'
      });
      setTimeout(() => {
        setStep(2);
        setFeedback(null);
      }, 2500);
    } else {
      setFeedback({
        success: false,
        text: 'Danger! Anyone promising to multiply money instantly is running a scam. Always ask a trusted parent or adult first!'
      });
    }
  };

  const handleStep2 = (choice: 'buy' | 'save') => {
    if (choice === 'save') {
      confetti({ particleCount: 70, spread: 80 });
      setFeedback({
        success: true,
        text: 'Outstanding impulse resistance! You kept your ₦5,000 safe for the school trip! Toys can wait, but school memories are forever.'
      });
      setTimeout(() => {
        onComplete(50, 100, "Money Wise");
      }, 2000);
    } else {
      setFeedback({
        success: false,
        text: 'Oh no! If you spend ₦4,500 on the toy, you will only have ₦500 left and will miss the exciting school excursion with your classmates! Let\'s choose to keep saving.'
      });
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border-4 border-rose-500/30 rounded-3xl p-6 sm:p-8 text-white max-w-4xl mx-auto shadow-2xl relative">
      <div className="flex items-center justify-between border-b border-rose-500/20 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-2xl shadow-lg border border-white/20">
            🛡️
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-rose-400 font-black">
              World 9 &bull; Money Traps & Smart Choices
            </div>
            <h2 className="text-2xl font-black text-white">
              {step === 1 ? 'Case 1: The Magic Multiplier Scam' : 'Case 2: The Impulse Trap'}
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

      {step === 1 && (
        <div className="max-w-xl mx-auto text-center py-4">
          <div className="bg-slate-800 border-2 border-rose-400/50 p-6 rounded-2xl mb-6 shadow-inner text-left">
            <div className="text-xs font-mono uppercase text-rose-300 font-black mb-2 flex items-center gap-1.5">
              <ShieldAlert size={16} /> Incoming Message:
            </div>
            <p className="text-lg font-bold text-white italic">
              &quot;Congratulations! You won! Send ₦1,000 now and we will transfer ₦10,000 to you immediately!&quot;
            </p>
          </div>

          <h3 className="text-xl font-black text-white mb-4">
            What should you do?
          </h3>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleStep1('send')}
              className="w-full p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left font-bold text-sm text-slate-300 transition-all"
            >
              A) Send ₦1,000 quickly so you don&apos;t miss the offer
            </button>
            <button
              onClick={() => handleStep1('ask_adult')}
              className="w-full p-4 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 border-2 border-emerald-400 text-left font-black text-base text-emerald-200 transition-all shadow-md"
            >
              B) Stop and ask a trusted parent or adult immediately
            </button>
            <button
              onClick={() => handleStep1('share_details')}
              className="w-full p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left font-bold text-sm text-slate-300 transition-all"
            >
              C) Send over your parent&apos;s bank details
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-xl mx-auto text-center py-4">
          <div className="bg-slate-800 border-2 border-amber-400/50 p-6 rounded-2xl mb-6 shadow-inner text-left">
            <div className="text-xs uppercase text-amber-300 font-black mb-2">
              The Scenario:
            </div>
            <p className="text-base font-semibold text-white">
              You have <strong>₦5,000</strong> saved for your upcoming school science trip next Friday. Walking past a toy shop, you spot a flashy RC car for <strong>₦4,500</strong>.
            </p>
          </div>

          <h3 className="text-xl font-black text-white mb-4">
            What is the smart choice?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleStep2('buy')}
              className="p-5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-center font-bold text-sm text-slate-300 transition-all"
            >
              🏎️ Buy the toy now on impulse
            </button>
            <button
              onClick={() => handleStep2('save')}
              className="p-5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 border-2 border-emerald-400 text-center font-black text-base text-emerald-200 transition-all shadow-md"
            >
              🚌 Keep saving for your school trip!
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <div className={`p-4 rounded-2xl text-center text-sm font-black flex items-center justify-center gap-2 ${
          feedback.success ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300' : 'bg-rose-500/20 border border-rose-400 text-rose-300'
        }`}>
          {feedback.success ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}
    </div>
  );
};
