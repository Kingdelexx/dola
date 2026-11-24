'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Star,
  Coins,
  Palette,
  Car,
  UtensilsCrossed,
  BookOpen,
  ThumbsUp,
  Award,
  TrendingUp,
  Smile,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EarnItGameProps {
  onComplete: (coinsEarned: number, xpEarned: number, badgeAwarded?: string) => void;
  onClose: () => void;
}

// Web Audio sound synthesizer for crisp arcade audio
const playEarnSound = (type: 'coin' | 'sparkle' | 'success' | 'scrub') => {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'coin') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'scrub') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(320, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'sparkle') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.25);
      });
    } else if (type === 'success') {
      [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
      });
    }
  } catch (e) {
    // Audio context may be restricted by browser policy
  }
};

export const EarnItGame: React.FC<EarnItGameProps> = ({ onComplete, onClose }) => {
  const [currentGigIndex, setCurrentGigIndex] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [gigCompleted, setGigCompleted] = useState<boolean>(false);
  const [allFinished, setAllFinished] = useState<boolean>(false);

  // Gig 1 state: Amara Graphic Design
  const [designChoices, setDesignChoices] = useState({
    theme: '',
    headline: '',
    effort: ''
  });

  // Gig 2 state: Tobi Car Wash (interactive spots)
  const [cleanSpots, setCleanSpots] = useState<string[]>([]);
  const [detailUpgrade, setDetailUpgrade] = useState<boolean>(false);

  // Gig 3 state: Ada Chin-Chin snack batch
  const [snackPricePerPack, setSnackPricePerPack] = useState<number>(400);

  // Gig 4 state: Kola Tutoring
  const [tutoringStrategy, setTutoringStrategy] = useState<string>('');

  const gigs = [
    {
      id: 1,
      character: "Amara",
      role: "Creative Digital Designer",
      avatar: "🎨",
      avatarBg: "from-pink-500 to-rose-600",
      client: "Mrs. Funke's Fresh Bakery",
      need: "Needs an attractive promotional flyer for her 5th Anniversary party with a 20% discount offer.",
      skillType: "Digital Skills & Creativity"
    },
    {
      id: 2,
      character: "Tobi",
      role: "Neighborhood Service Champion",
      avatar: "🚗",
      avatarBg: "from-blue-500 to-cyan-600",
      client: "Uncle Segun",
      need: "SUV is covered in dust and road trip mud! Needs a thorough wash before church on Sunday.",
      skillType: "Physical Service & Diligence"
    },
    {
      id: 3,
      character: "Ada",
      role: "Snack & Food Producer",
      avatar: "🍪",
      avatarBg: "from-amber-400 to-orange-500",
      client: "Community Sports Day Spectators",
      need: "Crafting 6 fresh, crunchy bags of Chin-Chin snacks to sell during the weekend soccer tournament.",
      skillType: "Crafting & Cost-Profit Math"
    },
    {
      id: 4,
      character: "Kola",
      role: "Junior Math & Coding Tutor",
      avatar: "💻",
      avatarBg: "from-purple-500 to-indigo-600",
      client: "Junior Learner Samuel & His Mum",
      need: "Samuel is struggling with times tables and Scratch repeat loops. Needs someone patient to explain it clearly.",
      skillType: "Teaching & Knowledge Sharing"
    }
  ];

  const currentGig = gigs[currentGigIndex];

  // GIG 1 SUBMIT
  const handleCompleteGig1 = () => {
    if (!designChoices.theme || !designChoices.headline || !designChoices.effort) return;
    const base = 1500;
    const bonus = designChoices.effort === 'quality' ? 500 : 0;
    const earned = base + bonus;
    setTotalEarned(prev => prev + earned);
    playEarnSound('coin');
    setGigCompleted(true);
  };

  // GIG 2 CAR CLEAN SPOT TOGGLE
  const handleCleanSpot = (spotId: string) => {
    if (cleanSpots.includes(spotId)) return;
    playEarnSound('scrub');
    setCleanSpots(prev => [...prev, spotId]);
  };

  // GIG 2 SUBMIT
  const handleCompleteGig2 = () => {
    if (cleanSpots.length < 4) return;
    const earned = detailUpgrade ? 2200 : 1500;
    setTotalEarned(prev => prev + earned);
    playEarnSound('coin');
    setGigCompleted(true);
  };

  // GIG 3 SUBMIT
  const ingredientCost = 1100;
  const packsCount = 6;
  const snackRevenue = snackPricePerPack * packsCount;
  const snackProfit = snackRevenue - ingredientCost;

  const handleCompleteGig3 = () => {
    setTotalEarned(prev => prev + snackProfit);
    playEarnSound('coin');
    setGigCompleted(true);
  };

  // GIG 4 SUBMIT
  const handleCompleteGig4 = () => {
    if (!tutoringStrategy) return;
    const earned = tutoringStrategy === 'patient_visual' ? 2500 : 1200;
    setTotalEarned(prev => prev + earned);
    playEarnSound('coin');
    setGigCompleted(true);
  };

  // ADVANCE TO NEXT GIG OR VICTORY
  const handleNextGig = () => {
    if (currentGigIndex < gigs.length - 1) {
      setCurrentGigIndex(prev => prev + 1);
      setGigCompleted(false);
      playEarnSound('sparkle');
    } else {
      setAllFinished(true);
      playEarnSound('success');
      confetti({ particleCount: 110, spread: 90, origin: { y: 0.5 } });
    }
  };

  const handleFinalClaim = () => {
    confetti({ particleCount: 75, spread: 70 });
    onComplete(60, 120, "Master Earner");
  };

  return (
    <div className="bg-white border-4 border-indigo-400 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 text-slate-800 max-w-4xl mx-auto shadow-2xl relative max-h-[92vh] overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-lg border-2 border-white shrink-0">
            🛠️
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-indigo-700 font-black">
              World 6 &bull; Earn It
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              Creating Real Value with Skills
            </h2>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-all cursor-pointer shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Progress & Earnings Meter */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 rounded-2xl border-2 border-indigo-100">
        <div>
          <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Mission Progress</span>
          <div className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
            <span>Gig {Math.min(currentGigIndex + 1, 4)} of 4</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Total Naira Earned</span>
          <div className="text-base sm:text-lg font-black text-emerald-600 flex items-center gap-1 mt-0.5">
            <span>₦{totalEarned.toLocaleString()}</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-indigo-100">
          <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">Skill Category</span>
          <div className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5 truncate">
            {currentGig.skillType}
          </div>
        </div>
      </div>

      {/* MAIN GAMEPLAY BODY */}
      {!allFinished ? (
        <div>
          {/* Gig Brief Banner */}
          <div className="bg-slate-50 border-2 border-slate-200 p-4 sm:p-5 rounded-2xl mb-6">
            <div className="flex items-start sm:items-center gap-3.5 mb-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${currentGig.avatarBg} text-white flex items-center justify-center text-2xl shadow-md border-2 border-white shrink-0`}>
                {currentGig.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base sm:text-lg text-slate-900">{currentGig.character}</h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                    {currentGig.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Client: <strong className="text-slate-700">{currentGig.client}</strong>
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-medium text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
              &ldquo;{currentGig.need}&rdquo;
            </p>
          </div>

          {/* ==============================================================
              GIG 1: AMARA GRAPHIC DESIGNER
              ============================================================== */}
          {currentGigIndex === 0 && !gigCompleted && (
            <div className="space-y-4">
              <h4 className="font-black text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Palette size={16} className="text-pink-500" /> Step 1: Craft the Flyer Design
              </h4>

              {/* Theme Selection */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">1. Choose Color Palette &amp; Mood:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'vibrant', label: 'Warm Cupcake Pink & Gold', desc: 'Appetizing & festive' },
                    { id: 'dark', label: 'Plain Dark Grey', desc: 'A bit dull for a bakery' },
                    { id: 'playful', label: 'Sunny Yellow & Mint', desc: 'Cheerful & friendly' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setDesignChoices(prev => ({ ...prev, theme: opt.id }))}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        designChoices.theme === opt.id
                          ? 'bg-pink-50 border-pink-500 shadow-sm ring-2 ring-pink-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-900">{opt.label}</div>
                      <div className="text-[10px] text-slate-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Headline Selection */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">2. Choose Catchy Headline:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'clear', label: '🎉 5 Years of Sweet Smiles — Enjoy 20% Off Cakes This Week!', best: true },
                    { id: 'vague', label: 'We sell cakes and bread at our shop, please come.', best: false }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setDesignChoices(prev => ({ ...prev, headline: opt.id }))}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        designChoices.headline === opt.id
                          ? 'bg-indigo-50 border-indigo-500 shadow-sm ring-2 ring-indigo-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-900">{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Effort & Quality Strategy */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">3. Effort &amp; Proofreading Strategy:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setDesignChoices(prev => ({ ...prev, effort: 'rush' }))}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      designChoices.effort === 'rush'
                        ? 'bg-amber-50 border-amber-500 shadow-sm'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-800">⚡ 5-Minute Rush Job</div>
                    <div className="text-[10px] text-slate-500">Quick delivery, but might miss spelling errors. Earns ₦1,500.</div>
                  </button>

                  <button
                    onClick={() => setDesignChoices(prev => ({ ...prev, effort: 'quality' }))}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      designChoices.effort === 'quality'
                        ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs text-emerald-800">⭐ Thorough Quality &amp; Proofread (+Bonus Tip!)</div>
                    <div className="text-[10px] text-slate-500">Double checks phone number &amp; colors. Earns ₦1,500 + ₦500 bonus tip!</div>
                  </button>
                </div>
              </div>

              <button
                disabled={!designChoices.theme || !designChoices.headline || !designChoices.effort}
                onClick={handleCompleteGig1}
                className="w-full mt-4 py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Deliver Flyer to Mrs. Funke &rarr;
              </button>
            </div>
          )}

          {/* ==============================================================
              GIG 2: TOBI CAR WASH SERVICE
              ============================================================== */}
          {currentGigIndex === 1 && !gigCompleted && (
            <div className="space-y-4">
              <h4 className="font-black text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Car size={16} className="text-blue-500" /> Tap Each Dirty Spot to Scrub Uncle Segun&apos;s SUV!
              </h4>

              <div className="bg-slate-900 rounded-2xl p-5 text-center text-white relative overflow-hidden border-4 border-slate-700 shadow-inner">
                <div className="text-5xl sm:text-6xl my-2">🚙</div>
                <p className="text-xs text-slate-300 font-medium mb-4">
                  Tap all 4 dirty areas below to apply soapy foam and rinse!
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto">
                  {[
                    { id: 'windshield', label: 'Windshield' },
                    { id: 'hood', label: 'Engine Hood' },
                    { id: 'doors', label: 'Side Doors' },
                    { id: 'wheels', label: 'Muddy Wheels' }
                  ].map(spot => {
                    const isClean = cleanSpots.includes(spot.id);
                    return (
                      <button
                        key={spot.id}
                        onClick={() => handleCleanSpot(spot.id)}
                        className={`p-3 rounded-xl font-black text-xs transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          isClean
                            ? 'bg-emerald-500 text-white shadow-md scale-95'
                            : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-sm animate-bounce'
                        }`}
                      >
                        <span>{isClean ? '✨ Clean' : '🧼 Scrub'}</span>
                        <span className="text-[10px] opacity-85">{spot.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Service upgrade option */}
              <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-xs text-blue-900">Add Tire Shine &amp; Interior Dashboard Wipe?</div>
                  <div className="text-[11px] text-blue-700">Delivering extra value increases your pay from ₦1,500 to ₦2,200!</div>
                </div>
                <button
                  onClick={() => setDetailUpgrade(!detailUpgrade)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    detailUpgrade
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-blue-700 border border-blue-300'
                  }`}
                >
                  {detailUpgrade ? '✓ Upgraded!' : '+ Add Detail'}
                </button>
              </div>

              <button
                disabled={cleanSpots.length < 4}
                onClick={handleCompleteGig2}
                className="w-full mt-4 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {cleanSpots.length < 4 ? `Scrub ${4 - cleanSpots.length} more spot(s)` : 'Finish Car Wash & Claim Pay →'}
              </button>
            </div>
          )}

          {/* ==============================================================
              GIG 3: ADA CHIN-CHIN SNACK BATCH
              ============================================================== */}
          {currentGigIndex === 2 && !gigCompleted && (
            <div className="space-y-4">
              <h4 className="font-black text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <UtensilsCrossed size={16} className="text-amber-500" /> Calculate Costs vs Selling Price
              </h4>

              {/* Production Cost Breakdown */}
              <div className="bg-amber-50/70 border-2 border-amber-200 p-4 rounded-2xl">
                <div className="text-xs font-black uppercase text-amber-900 mb-2">Ingredients &amp; Packaging Cost:</div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-xl border border-amber-200">
                    <span className="text-slate-500 text-[10px] block">Flour &amp; Sugar</span>
                    <strong className="text-slate-900">₦500</strong>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-amber-200">
                    <span className="text-slate-500 text-[10px] block">Oil &amp; Nutmeg</span>
                    <strong className="text-slate-900">₦400</strong>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-amber-200">
                    <span className="text-slate-500 text-[10px] block">6 Clear Bags</span>
                    <strong className="text-slate-900">₦200</strong>
                  </div>
                </div>
                <div className="text-right text-xs font-black text-amber-900 mt-2">
                  Total Cost: <span className="text-rose-600">₦1,100</span>
                </div>
              </div>

              {/* Interactive Pricing Picker */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Choose Selling Price per Crunchy Pack (Batch yields 6 packs):
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[300, 400, 500].map(price => (
                    <button
                      key={price}
                      onClick={() => setSnackPricePerPack(price)}
                      className={`p-3 rounded-2xl border-2 text-center transition-all ${
                        snackPricePerPack === price
                          ? 'bg-amber-100 border-amber-500 shadow-sm ring-2 ring-amber-300 font-black'
                          : 'bg-white border-slate-200 font-bold'
                      }`}
                    >
                      <div className="text-base text-slate-900">₦{price}</div>
                      <div className="text-[10px] text-slate-500">per pack</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Profit Math Preview */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block text-[11px]">Revenue (6 × ₦{snackPricePerPack}):</span>
                  <strong className="text-emerald-400 text-base">₦{snackRevenue.toLocaleString()}</strong>
                </div>
                <div className="text-center">
                  <span className="text-slate-400 block text-[11px]">Less Costs:</span>
                  <strong className="text-rose-400 text-base">- ₦1,100</strong>
                </div>
                <div className="text-right">
                  <span className="text-yellow-300 block text-[11px] font-black uppercase">Net Earned Profit:</span>
                  <strong className="text-amber-400 text-lg sm:text-xl font-black">₦{snackProfit.toLocaleString()}</strong>
                </div>
              </div>

              <button
                onClick={handleCompleteGig3}
                className="w-full mt-4 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Sell All 6 Packs &amp; Bank ₦{snackProfit.toLocaleString()} Profit &rarr;
              </button>
            </div>
          )}

          {/* ==============================================================
              GIG 4: KOLA CODING TUTOR
              ============================================================== */}
          {currentGigIndex === 3 && !gigCompleted && (
            <div className="space-y-4">
              <h4 className="font-black text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={16} className="text-purple-500" /> Choose Kola&apos;s Tutoring Strategy
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setTutoringStrategy('rush_answers')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    tutoringStrategy === 'rush_answers'
                      ? 'bg-rose-50 border-rose-400 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-black text-xs text-rose-700 mb-1">❌ Strategy A: Rush &amp; Give Answers</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Just tell Samuel the answers to finish homework quickly. Samuel doesn&apos;t learn the &ldquo;why&rdquo; and parent only pays basic ₦1,200.
                  </p>
                </button>

                <button
                  onClick={() => setTutoringStrategy('patient_visual')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    tutoringStrategy === 'patient_visual'
                      ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-200'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-black text-xs text-emerald-800 mb-1">⭐ Strategy B: Visual Blocks &amp; Patience</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Use Scratch loop blocks and pizza slices to explain multiplication visually. Samuel masters the concept! Parent pays ₦2,500 and books you for the term!
                  </p>
                </button>
              </div>

              <button
                disabled={!tutoringStrategy}
                onClick={handleCompleteGig4}
                className="w-full mt-4 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Deliver Tutoring Session &rarr;
              </button>
            </div>
          )}

          {/* ==============================================================
              GIG COMPLETED SUMMARY / CLIENT REACTION
              ============================================================== */}
          {gigCompleted && (
            <div className="bg-emerald-50 border-2 border-emerald-300 p-5 rounded-3xl animate-in zoom-in-95 duration-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-sm">
                👏
              </div>

              <h4 className="font-black text-lg text-slate-900">Gig Successfully Delivered!</h4>
              
              <div className="flex justify-center items-center gap-1 text-amber-500 text-lg">
                <Star className="fill-amber-400 text-amber-400" size={20} />
                <Star className="fill-amber-400 text-amber-400" size={20} />
                <Star className="fill-amber-400 text-amber-400" size={20} />
                <Star className="fill-amber-400 text-amber-400" size={20} />
                <Star className="fill-amber-400 text-amber-400" size={20} />
              </div>

              <div className="bg-white p-3 rounded-2xl border border-emerald-200 max-w-md mx-auto text-xs text-slate-700 font-medium leading-relaxed">
                {currentGigIndex === 0 && "Mrs. Funke says: 'The flyer is vibrant and clear! Customers are already walking in with the anniversary code!'"}
                {currentGigIndex === 1 && "Uncle Segun says: 'The SUV looks brand new inside and out! Here is your pay and I will hire you again next month!'"}
                {currentGigIndex === 2 && "The sports spectators devoured every single pack of Chin-Chin! Your cost math was spot on and your profit is earned!"}
                {currentGigIndex === 3 && "Samuel's mum called: 'Samuel scored 10/10 on his school coding test! Thank you for being such a patient teacher!'"}
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl max-w-md mx-auto text-xs text-indigo-900 font-bold flex items-center gap-2 text-left">
                <ShieldCheck size={20} className="text-indigo-600 shrink-0" />
                <span>
                  <strong>Financial Law:</strong> Income is created when you apply effort and talent to solve real problems for other people.
                </span>
              </div>

              <button
                onClick={handleNextGig}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {currentGigIndex < gigs.length - 1 ? 'Start Next Skill Mission →' : 'View Master Earner Certificate 🏆'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ==============================================================
           GRAND VICTORY / WORLD COMPLETE SCREEN
           ============================================================== */
        <div className="text-center space-y-5 animate-in zoom-in-95 duration-300 py-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-yellow-200 text-slate-950 flex items-center justify-center text-4xl mx-auto shadow-xl animate-bounce">
            🛠️
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
              World 6 Mastered!
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              You Are a Master Earner!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 font-medium">
              You applied design, physical service, product costing, and patient tutoring to earn real income!
            </p>
          </div>

          {/* Stats Showcase */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-black">Total Earned</span>
              <div className="text-xl font-black text-emerald-600">₦{totalEarned.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-black">Gigs Delivered</span>
              <div className="text-xl font-black text-indigo-600">4 / 4 Complete</div>
            </div>
          </div>

          {/* Badge Unlocked Banner */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl max-w-md mx-auto flex items-center gap-3.5 text-left">
            <span className="text-4xl">🛠️</span>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">Badge Unlocked</span>
              <h4 className="font-black text-sm text-slate-900">Master Earner</h4>
              <p className="text-[11px] text-slate-600">Applied practical skills to solve real-world problems and earn honest income.</p>
            </div>
          </div>

          <button
            onClick={handleFinalClaim}
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            Claim 60 DolaCoins &amp; Badge &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
export default EarnItGame;