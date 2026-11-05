'use client';

import React, { useState } from 'react';
import { NairaNote } from './CurrencyNotes';
import { Sparkles, Trophy, ArrowRight, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MoneyMatchGameProps {
  onCompleteLevel: (level: number, coinsEarned: number, xpEarned: number, badgeAwarded?: string) => void;
  onClose: () => void;
  initialLevel?: number;
}

export const MoneyMatchGame: React.FC<MoneyMatchGameProps> = ({
  onCompleteLevel,
  onClose,
  initialLevel = 1
}) => {
  const [level, setLevel] = useState<number>(initialLevel);
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [walletNotes, setWalletNotes] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'retry' | null; message: string }>({ type: null, message: '' });
  const [score, setScore] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Sound chime helper
  const playChime = (success: boolean) => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = success ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(success ? 587.33 : 220, ctx.currentTime);
      if (success) {
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
      }
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio fallback
    }
  };

  // Level 1: Currency Recognition
  const l1Question = {
    target: 500,
    prompt: "Tap the green ₦500 note featuring Dr. Nnamdi Azikiwe!",
    options: [100, 500, 1000, 200]
  };

  // Level 2: Match Note to Value
  const l2Question = {
    target: 200,
    prompt: "A delicious meat pie costs ₦200. Which note matches this exact price?",
    options: [50, 100, 200, 500]
  };

  // Level 3: Build Exact Money Amounts
  const l3Target = 500;
  const currentWalletTotal = walletNotes.reduce((sum, val) => sum + val, 0);

  // Level 4: Comparison
  const l4Question = {
    prompt: "Which amount is BIGGER?",
    optionA: { label: "Wallet A: ₦200 + ₦200 + ₦100", value: 500, notes: [200, 200, 100] },
    optionB: { label: "Wallet B: ₦1,000 Note", value: 1000, notes: [1000] }
  };

  // Level 5: Making Change
  const l5Question = {
    cost: 300,
    paid: 500,
    changeNeeded: 200,
    prompt: "You bought a school drawing book for ₦300. You paid with ₦500. How much change do you get back?",
    options: [100, 200, 300, 50]
  };

  const handleLevel1Submit = (val: number) => {
    setSelectedNote(val);
    if (val === l1Question.target) {
      playChime(true);
      setFeedback({ type: 'success', message: 'Spot on! That is the Nigerian ₦500 note!' });
      triggerAdvance(1, 25, 50);
    } else {
      playChime(false);
      setFeedback({ type: 'retry', message: `Oops! That note is ₦${val}. Look for the teal-green ₦500 note!` });
    }
  };

  const handleLevel2Submit = (val: number) => {
    setSelectedNote(val);
    if (val === l2Question.target) {
      playChime(true);
      setFeedback({ type: 'success', message: 'Correct! ₦200 pays for the ₦200 snack exactly!' });
      triggerAdvance(2, 25, 50);
    } else {
      playChime(false);
      setFeedback({ type: 'retry', message: `That note is ₦${val}. Look for ₦200!` });
    }
  };

  const addNoteToWallet = (val: number) => {
    if (currentWalletTotal + val > l3Target) {
      playChime(false);
      setFeedback({
        type: 'retry',
        message: `Adding ₦${val} would make ₦${currentWalletTotal + val}, which is more than ₦${l3Target}! Try a smaller note.`
      });
      return;
    }

    const nextWallet = [...walletNotes, val];
    setWalletNotes(nextWallet);
    const newTotal = nextWallet.reduce((a, b) => a + b, 0);

    if (newTotal === l3Target) {
      playChime(true);
      setFeedback({
        type: 'success',
        message: `Hooray! You built exact ₦${l3Target}! You used: ${nextWallet.map(n => `₦${n}`).join(' + ')}`
      });
      triggerAdvance(3, 30, 60);
    } else {
      setFeedback({
        type: null,
        message: `You have ₦${newTotal} in your wallet. You still need ₦${l3Target - newTotal} to reach ₦${l3Target}!`
      });
    }
  };

  const removeLastNote = () => {
    if (walletNotes.length > 0) {
      const nextWallet = [...walletNotes];
      nextWallet.pop();
      setWalletNotes(nextWallet);
      const newTotal = nextWallet.reduce((a, b) => a + b, 0);
      setFeedback({
        type: null,
        message: `Note removed. You currently have ₦${newTotal} in your wallet.`
      });
    }
  };

  const handleLevel4Submit = (choice: 'A' | 'B') => {
    if (choice === 'B') {
      playChime(true);
      setFeedback({ type: 'success', message: 'Brilliant! Wallet B has ₦1,000, which is bigger than ₦500!' });
      triggerAdvance(4, 30, 60);
    } else {
      playChime(false);
      setFeedback({ type: 'retry', message: 'Wallet A has ₦200 + ₦200 + ₦100 = ₦500. Wallet B has ₦1,000. Try again!' });
    }
  };

  const handleLevel5Submit = (val: number) => {
    setSelectedNote(val);
    if (val === l5Question.changeNeeded) {
      playChime(true);
      setFeedback({
        type: 'success',
        message: `Well done! ₦500 paid minus ₦300 cost = ₦200 change!`
      });
      triggerAdvance(5, 40, 80, "Money Starter");
    } else {
      playChime(false);
      setFeedback({
        type: 'retry',
        message: `₦500 - ₦300 is not ₦${val}. Subtract ₦300 from ₦500!`
      });
    }
  };

  const triggerAdvance = (completedLvl: number, coins: number, xp: number, badge?: string) => {
    setScore(prev => prev + coins);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => {
      onCompleteLevel(completedLvl, coins, xp, badge);
      if (completedLvl < 5) {
        setLevel(completedLvl + 1);
        setSelectedNote(null);
        setWalletNotes([]);
        setFeedback({ type: null, message: '' });
      } else {
        setShowCelebration(true);
      }
    }, 1200);
  };

  return (
    <div className="bg-white border-4 border-emerald-300 rounded-[2.5rem] p-6 sm:p-9 text-slate-800 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center text-3xl shadow-lg border-2 border-white">
            🪙
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-emerald-700 font-black">
              World 1 &bull; Money Match
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Level {level} of 5: {
                level === 1 ? 'Recognise Nigerian Currency' :
                level === 2 ? 'Match Note to Value' :
                level === 3 ? 'Build Money Amounts' :
                level === 4 ? 'Compare Amounts' : 'Calculate Change'
              }
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-100 border-2 border-amber-300 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs">
            <span className="text-amber-500 text-lg">🪙</span>
            <span className="font-black text-amber-900 text-sm">+{score} DolaCoins</span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Level Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-3.5 mb-8 overflow-hidden p-0.5 border border-slate-200">
        <div
          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
          style={{ width: `${(level / 5) * 100}%` }}
        />
      </div>

      {/* Main Game Stage */}
      <div className="min-h-[320px] flex flex-col justify-between">
        {/* LEVEL 1 */}
        {level === 1 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase mb-4 border border-emerald-300">
              <Sparkles size={14} className="text-amber-500" /> Mission 1: Currency Recognition
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mb-6 max-w-xl mx-auto leading-relaxed">
              {l1Question.prompt}
            </p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 my-6">
              {l1Question.options.map((val) => (
                <NairaNote
                  key={val}
                  value={val}
                  size="md"
                  selected={selectedNote === val}
                  onClick={() => handleLevel1Submit(val)}
                />
              ))}
            </div>
          </div>
        )}

        {/* LEVEL 2 */}
        {level === 2 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase mb-4 border border-amber-300">
              <Sparkles size={14} className="text-amber-500" /> Mission 2: Value Matching
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mb-6 max-w-xl mx-auto leading-relaxed">
              {l2Question.prompt}
            </p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 my-6">
              {l2Question.options.map((val) => (
                <NairaNote
                  key={val}
                  value={val}
                  size="md"
                  selected={selectedNote === val}
                  onClick={() => handleLevel2Submit(val)}
                />
              ))}
            </div>
          </div>
        )}

        {/* LEVEL 3 */}
        {level === 3 && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 text-cyan-800 text-xs font-black uppercase mb-3 border border-cyan-300">
                <Sparkles size={14} className="text-amber-500" /> Mission 3: Build Exact Money Amounts
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                Target: Put exact <span className="text-emerald-600">₦{l3Target}</span> in your wallet!
              </h3>
              <p className="text-slate-600 text-sm font-medium mt-1">
                Tap notes to add them. You can use ₦500, or combination like ₦200 + ₦200 + ₦100!
              </p>
            </div>

            {/* Wallet Display Box */}
            <div className="bg-emerald-50/70 border-3 border-emerald-300 rounded-3xl p-5 mb-6 text-center shadow-inner">
              <div className="flex items-center justify-between mb-3 text-sm font-black">
                <span className="text-emerald-900 flex items-center gap-2">
                  👛 YOUR WALLET
                </span>
                <span className="text-emerald-700 text-lg">
                  Total: ₦{currentWalletTotal} / ₦{l3Target}
                </span>
              </div>

              {walletNotes.length === 0 ? (
                <div className="py-6 text-slate-500 text-sm font-medium">
                  Your wallet is empty. Tap notes in the drawer below to add them!
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-3 py-2">
                  {walletNotes.map((val, idx) => (
                    <NairaNote key={idx} value={val} size="sm" />
                  ))}
                </div>
              )}

              {walletNotes.length > 0 && currentWalletTotal < l3Target && (
                <div className="mt-3 flex justify-center">
                  <button
                    onClick={removeLastNote}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-rose-50 text-rose-600 text-xs font-black border-2 border-rose-200 transition-all shadow-xs cursor-pointer"
                  >
                    <RotateCcw size={12} /> Remove Last Note
                  </button>
                </div>
              )}
            </div>

            {/* Cash Drawer */}
            <div className="text-center bg-slate-50 border-2 border-slate-200 rounded-2xl p-4">
              <div className="text-xs uppercase font-black tracking-wider text-slate-500 mb-3">
                Cash Drawer (Tap to add to wallet)
              </div>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {[100, 200, 500].map((val) => (
                  <NairaNote
                    key={val}
                    value={val}
                    size="sm"
                    onClick={() => addNoteToWallet(val)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LEVEL 4 */}
        {level === 4 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-black uppercase mb-4 border border-purple-300">
              <Sparkles size={14} className="text-amber-500" /> Mission 4: Compare Money Amounts
            </div>
            <p className="text-2xl font-black text-slate-900 mb-6">
              {l4Question.prompt}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto my-4">
              {/* Option A */}
              <div
                onClick={() => handleLevel4Submit('A')}
                className="bg-white hover:bg-emerald-50 border-3 border-slate-200 hover:border-emerald-400 p-6 rounded-3xl cursor-pointer transition-all hover:scale-102 flex flex-col items-center justify-between gap-4 shadow-sm"
              >
                <div className="font-black text-slate-800">{l4Question.optionA.label}</div>
                <div className="flex gap-2">
                  {l4Question.optionA.notes.map((n, i) => (
                    <NairaNote key={i} value={n} size="sm" />
                  ))}
                </div>
                <button className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-800 font-black text-xs border border-slate-300 transition-colors">
                  Choose Wallet A
                </button>
              </div>

              {/* Option B */}
              <div
                onClick={() => handleLevel4Submit('B')}
                className="bg-white hover:bg-emerald-50 border-3 border-slate-200 hover:border-emerald-400 p-6 rounded-3xl cursor-pointer transition-all hover:scale-102 flex flex-col items-center justify-between gap-4 shadow-sm"
              >
                <div className="font-black text-slate-800">{l4Question.optionB.label}</div>
                <div className="flex gap-2">
                  {l4Question.optionB.notes.map((n, i) => (
                    <NairaNote key={i} value={n} size="sm" />
                  ))}
                </div>
                <button className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-800 font-black text-xs border border-slate-300 transition-colors">
                  Choose Wallet B
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LEVEL 5 */}
        {level === 5 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase mb-4 border border-emerald-300">
              <Sparkles size={14} className="text-amber-500" /> Mission 5: Calculate Change
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mb-2 max-w-xl mx-auto leading-relaxed">
              {l5Question.prompt}
            </p>
            <div className="flex items-center justify-center gap-4 my-4 text-sm font-black text-slate-700">
              <span className="bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">Cost: ₦{l5Question.cost}</span>
              <span>&bull;</span>
              <span className="bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">You Paid: ₦{l5Question.paid}</span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 my-6">
              {l5Question.options.map((val) => (
                <NairaNote
                  key={val}
                  value={val}
                  size="md"
                  selected={selectedNote === val}
                  onClick={() => handleLevel5Submit(val)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Feedback Message */}
        {feedback.message && (
          <div className={`mt-6 p-4 rounded-2xl flex items-center justify-center gap-3 font-black text-base animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-400'
              : feedback.type === 'retry'
              ? 'bg-rose-100 text-rose-900 border-2 border-rose-400'
              : 'bg-slate-100 text-slate-800 border-2 border-slate-300'
          }`}>
            {feedback.type === 'success' && <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />}
            {feedback.type === 'retry' && <XCircle size={24} className="text-rose-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Celebration Modal when all 5 levels complete */}
      {showCelebration && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-yellow-400 rounded-[2.5rem] p-8 max-w-md w-full text-center shadow-2xl relative animate-scaleUp">
            <div className="w-22 h-22 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-900 mx-auto flex items-center justify-center text-4xl shadow-xl border-4 border-white mb-4 animate-bounce">
              🏆
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-2">
              World 1 Conquered!
            </h3>
            <p className="text-slate-600 text-sm font-semibold mb-6">
              You mastered recognizing Nigerian Naira, counting denominations, and calculating change!
            </p>

            <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 mb-6 flex items-center justify-around">
              <div>
                <div className="text-2xl font-black text-amber-600">+{score}</div>
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">DolaCoins</div>
              </div>
              <div className="w-px h-10 bg-amber-200" />
              <div>
                <div className="text-2xl font-black text-cyan-600">+300</div>
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">XP Earned</div>
              </div>
              <div className="w-px h-10 bg-amber-200" />
              <div>
                <div className="text-2xl">🪙</div>
                <div className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Money Starter</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-base uppercase tracking-wider shadow-[0_4px_0_#d97706] hover:shadow-[0_6px_0_#d97706] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              Back to World Map &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
