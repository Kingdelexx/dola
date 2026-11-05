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
    <div className="bg-white border-4 border-rose-300 rounded-[2.5rem] p-6 sm:p-9 text-slate-800 max-w-4xl mx-auto shadow-2xl relative">
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center text-3xl shadow-lg border-2 border-white">
            🛡️
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-rose-700 font-black">
              World 9 &bull; Money Traps & Smart Choices
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {step === 1 ? 'Case 1: The Magic Multiplier Scam' : 'Case 2: The Impulse Trap'}
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

      {step === 1 && (
        <div className="max-w-xl mx-auto text-center py-4">
          <div className="bg-rose-50 border-2 border-rose-200 p-6 rounded-3xl mb-6 shadow-inner text-left">
            <div className="text-xs font-mono uppercase text-rose-700 font-black mb-2 flex items-center gap-1.5">
              <ShieldAlert size={16} /> Incoming Message:
            </div>
            <p className="text-lg font-bold text-rose-950 italic">
              &quot;Congratulations! You won! Send ₦1,000 now and we will transfer ₦10,000 to you immediately!&quot;
            </p>
          </div>

          <h3 className="text-2xl font-black text-slate-900 mb-4">
            What should you do?
          </h3>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleStep1('send')}
              className="w-full p-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-left font-bold text-sm text-slate-700 transition-all cursor-pointer"
            >
              A) Send ₦1,000 quickly so you don&apos;t miss the offer
            </button>
            <button
              onClick={() => handleStep1('ask_adult')}
              className="w-full p-4.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-3 border-emerald-400 text-left font-black text-base text-emerald-950 transition-all shadow-md cursor-pointer"
            >
              B) Stop and ask a trusted parent or adult immediately
            </button>
            <button
              onClick={() => handleStep1('share_details')}
              className="w-full p-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-left font-bold text-sm text-slate-700 transition-all cursor-pointer"
            >
              C) Send over your parent&apos;s bank details
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-xl mx-auto text-center py-4">
          <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl mb-6 shadow-inner text-left">
            <div className="text-xs uppercase text-amber-800 font-black mb-2">
              The Scenario:
            </div>
            <p className="text-base font-semibold text-amber-950">
              You have <strong>₦5,000</strong> saved for your upcoming school science trip next Friday. Walking past a toy shop, you spot a flashy RC car for <strong>₦4,500</strong>.
            </p>
          </div>

          <h3 className="text-2xl font-black text-slate-900 mb-4">
            What is the smart choice?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleStep2('buy')}
              className="p-5 rounded-3xl bg-white hover:bg-slate-50 border-3 border-slate-200 text-center font-bold text-sm text-slate-700 transition-all cursor-pointer shadow-xs"
            >
              🏎️ Buy the toy now on impulse
            </button>
            <button
              onClick={() => handleStep2('save')}
              className="p-5 rounded-3xl bg-emerald-50 hover:bg-emerald-100 border-3 border-emerald-400 text-center font-black text-base text-emerald-950 transition-all shadow-md cursor-pointer"
            >
              🚌 Keep saving for your school trip!
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <div className={`p-4 rounded-2xl text-center text-sm font-black flex items-center justify-center gap-2 ${
          feedback.success ? 'bg-emerald-100 border-2 border-emerald-400 text-emerald-900' : 'bg-rose-100 border-2 border-rose-400 text-rose-900'
        }`}>
          {feedback.success ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}
    </div>
  );
};
