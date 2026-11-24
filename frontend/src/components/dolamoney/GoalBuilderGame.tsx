'use client';

import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  Trophy,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Star,
  Coins,
  ShieldCheck,
  TrendingUp,
  Award,
  Flame,
  AlertCircle,
  HelpCircle,
  Flag,
  Laptop,
  Bot,
  Palette,
  Bike
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GoalBuilderGameProps {
  onComplete: (coinsEarned: number, xpEarned: number, badgeAwarded?: string, goal?: { name: string; target: number; current: number }) => void;
  onClose: () => void;
}

interface GoalPreset {
  id: string;
  name: string;
  target: number;
  icon: string;
  desc: string;
  tag: string;
}

// Web Audio sound synthesizer for crisp audio feedback
const playGoalSound = (type: 'deposit' | 'milestone' | 'temptation_resist' | 'victory') => {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'deposit') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'milestone') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.35);
      });
    } else if (type === 'temptation_resist') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'victory') {
      [440, 554.37, 659.25, 880, 1108.73].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.22, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.5);
      });
    }
  } catch (e) {
    // Audio policy fallback
  }
};

export const GoalBuilderGame: React.FC<GoalBuilderGameProps> = ({ onComplete, onClose }) => {
  const goalPresets: GoalPreset[] = [
    {
      id: 'laptop',
      name: 'DolaCode Coding Laptop',
      target: 60000,
      icon: '💻',
      desc: 'High-speed quad-core laptop for Python, Pygame & Web Studio development',
      tag: 'STEM & Career'
    },
    {
      id: 'robotics',
      name: 'Autonomous AI Robot Buggy',
      target: 40000,
      icon: '🤖',
      desc: 'Ultrasonic obstacle sensors, dual motors & programmable microcontroller',
      tag: 'Hardware & AI'
    },
    {
      id: 'tablet',
      name: 'Digital Art & Animation Tablet',
      target: 32000,
      icon: '🎨',
      desc: 'Stylus pen & drawing surface to build 2D game sprites and digital comics',
      tag: 'Creative Media'
    },
    {
      id: 'bicycle',
      name: 'Speedster Mountain Bike',
      target: 48000,
      icon: '🚲',
      desc: 'All-terrain 7-gear bike with safety helmet for neighborhood adventures',
      tag: 'Health & Fitness'
    }
  ];

  const [activeStage, setActiveStage] = useState<'pick_goal' | 'journey' | 'victory'>('pick_goal');
  const [selectedGoal, setSelectedGoal] = useState<GoalPreset>(goalPresets[0]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [currentSaved, setCurrentSaved] = useState<number>(0);
  const [milestonesHit, setMilestonesHit] = useState<number[]>([]);
  const [temptationsResisted, setTemptationsResisted] = useState<number>(0);
  const [roundFeedback, setRoundFeedback] = useState<{ title: string; desc: string; type: 'success' | 'warning' } | null>(null);

  // 6 interactive strategy rounds
  const rounds = [
    {
      round: 1,
      title: "Week 1: Birthday & Chores Kickstart",
      scenario: "You received ₦15,000 from your birthday and family chores! How much will you allocate to your dream goal?",
      choices: [
        {
          label: "🚀 Save ₦12,000 (Keep ₦3,000 for ice cream)",
          amount: 12000,
          desc: "Fantastic choice! Starting with a strong foundation gives you early momentum.",
          isOptimal: true
        },
        {
          label: "Spend ₦10,000 on toys, Save ₦5,000",
          amount: 5000,
          desc: "You saved a little, but spending ₦10,000 on small toys slows your big dream down.",
          isOptimal: false
        }
      ]
    },
    {
      round: 2,
      title: "Week 2: The Flash Sale Temptation! 🎮",
      scenario: "A shiny video game is on a 'limited-time flash sale' for ₦8,000. All your classmates are talking about it!",
      choices: [
        {
          label: "🛡️ Resist Impulse! Put ₦8,000 into Goal Fund",
          amount: 8000,
          desc: "Iron Will! You avoided impulse spending and directed the money straight to your dream goal!",
          isResist: true,
          isOptimal: true
        },
        {
          label: "💸 Buy the game right now",
          amount: 2000,
          desc: "You got the game, but your goal fund only grows by ₦2,000 this week.",
          isResist: false,
          isOptimal: false
        }
      ]
    },
    {
      round: 3,
      title: "Week 3: Neighborhood Side Gig 🛠️",
      scenario: "Uncle Segun offers you ₦10,000 to help organize his home book library and digitize his old photos.",
      choices: [
        {
          label: "⭐ Do high-quality work and save ₦9,000",
          amount: 9000,
          desc: "Superb diligence! Working hard and banking your earnings pushes you past the halfway mark!",
          isOptimal: true
        },
        {
          label: "Save ₦4,000, spend ₦6,000 on cinema treats",
          amount: 4000,
          desc: "You enjoyed the cinema, but banking ₦9,000 would have gotten you to 50% much faster.",
          isOptimal: false
        }
      ]
    },
    {
      round: 4,
      title: "Week 4: Fast Food vs Home Meal 🍕",
      scenario: "Friends invite you to an expensive restaurant outing costing ₦6,000.",
      choices: [
        {
          label: "🥗 Pack delicious homemade snacks, Save ₦5,000",
          amount: 5000,
          desc: "Smart move! You still spent time with friends while protecting your goal fund!",
          isResist: true,
          isOptimal: true
        },
        {
          label: "Spend the full ₦6,000 at the restaurant",
          amount: 1500,
          desc: "A fun lunch, but only ₦1,500 remains for your goal fund.",
          isResist: false,
          isOptimal: false
        }
      ]
    },
    {
      round: 5,
      title: "Week 5: Parent Milestone Incentive Match! 🎁",
      scenario: "Your parents noticed your consistent savings streak! They offer a ₦10,000 incentive bonus match if you stay disciplined!",
      choices: [
        {
          label: "🎉 Accept match + add ₦6,000 allowance (Total +₦16,000)",
          amount: 16000,
          desc: "Incredible! Delayed gratification earned you respect and matching funds from family!",
          isOptimal: true
        },
        {
          label: "Take match, but spend allowance on video arcade (+₦10,000)",
          amount: 10000,
          desc: "You still received the parent bonus, but missed adding your own contribution.",
          isOptimal: false
        }
      ]
    },
    {
      round: 6,
      title: "Week 6: The Final Sprint Commission 🏁",
      scenario: "You complete a web design project for a local school and earn your final milestone payout!",
      choices: [
        {
          label: "🏆 Bank full commission (+₦12,000) to hit 100%!",
          amount: 12000,
          desc: "MISSION ACCOMPLISHED! You conquered the summit and realized your dream!",
          isOptimal: true
        },
        {
          label: "Bank ₦8,000, spend ₦4,000",
          amount: 8000,
          desc: "Very close to the top! Every penny counts towards full ownership.",
          isOptimal: false
        }
      ]
    }
  ];

  const currentRound = rounds[currentRoundIndex];
  const target = selectedGoal.target;
  const percentComplete = Math.min(100, Math.floor((currentSaved / target) * 100));

  const milestones = [
    { percent: 25, label: "The Spark", amount: Math.floor(target * 0.25) },
    { percent: 50, label: "Halfway Peak", amount: Math.floor(target * 0.5) },
    { percent: 75, label: "High Road", amount: Math.floor(target * 0.75) },
    { percent: 100, label: "Dream Realized!", amount: target }
  ];

  const handleStartJourney = (goal: GoalPreset) => {
    setSelectedGoal(goal);
    setCurrentSaved(0);
    setCurrentRoundIndex(0);
    setMilestonesHit([]);
    setTemptationsResisted(0);
    setRoundFeedback(null);
    setActiveStage('journey');
    playGoalSound('deposit');
  };

  const handleMakeChoice = (choice: { amount: number; desc: string; isResist?: boolean; isOptimal: boolean }) => {
    const nextSaved = Math.min(target, currentSaved + choice.amount);
    const nextPercent = Math.min(100, Math.floor((nextSaved / target) * 100));
    setCurrentSaved(nextSaved);

    if (choice.isResist) {
      setTemptationsResisted(prev => prev + 1);
      playGoalSound('temptation_resist');
    } else {
      playGoalSound('deposit');
    }

    // Check newly unlocked milestones
    const newMilestones: number[] = [];
    milestones.forEach(m => {
      if (nextPercent >= m.percent && !milestonesHit.includes(m.percent)) {
        newMilestones.push(m.percent);
      }
    });

    if (newMilestones.length > 0) {
      setMilestonesHit(prev => [...prev, ...newMilestones]);
      playGoalSound('milestone');
      confetti({ particleCount: 50, spread: 60 });
    }

    setRoundFeedback({
      title: choice.isOptimal ? "Smart Decision! ⭐" : "Decent Effort!",
      desc: choice.desc,
      type: choice.isOptimal ? 'success' : 'warning'
    });
  };

  const handleAdvanceRound = () => {
    setRoundFeedback(null);
    if (currentRoundIndex < rounds.length - 1 && percentComplete < 100) {
      setCurrentRoundIndex(prev => prev + 1);
    } else {
      // Completed goal
      setActiveStage('victory');
      playGoalSound('victory');
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
    }
  };

  const handleClaimFinalReward = () => {
    confetti({ particleCount: 80, spread: 75 });
    onComplete(70, 140, "Goal Getter", {
      name: selectedGoal.name,
      target: selectedGoal.target,
      current: currentSaved
    });
  };

  return (
    <div className="bg-white border-4 border-purple-400 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 text-slate-800 max-w-4xl mx-auto shadow-2xl relative max-h-[92vh] overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-pink-500 text-white flex items-center justify-center text-2xl shadow-lg border-2 border-white shrink-0">
            🎯
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-purple-700 font-black">
              World 8 &bull; Goal Builder
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              Milestones &amp; Long-Term Vision
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-all cursor-pointer shrink-0"
        >
          ✕
        </button>
      </div>

      {/* ==============================================================
          STAGE 1: PICK DREAM GOAL
          ============================================================== */}
      {activeStage === 'pick_goal' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              Choose Your Big Dream Goal 🌟
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Big dreams feel impossible all at once. By breaking them into <strong>25%, 50%, 75% steps</strong>, delayed gratification becomes an exciting adventure!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goalPresets.map(preset => (
              <div
                key={preset.id}
                onClick={() => handleStartJourney(preset)}
                className="bg-purple-50/50 hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-400 rounded-3xl p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl group-hover:scale-110 transition-transform">{preset.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-purple-200/60 text-purple-800 px-2.5 py-1 rounded-full">
                      {preset.tag}
                    </span>
                  </div>

                  <h4 className="font-black text-lg text-slate-900 mb-1">{preset.name}</h4>
                  <p className="text-xs text-slate-600 font-medium mb-4 leading-relaxed">{preset.desc}</p>
                </div>

                <div className="pt-3 border-t border-purple-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-black uppercase block">Target Amount</span>
                    <strong className="text-purple-700 text-lg font-black">₦{preset.target.toLocaleString()}</strong>
                  </div>

                  <button className="px-4 py-2 rounded-xl bg-purple-600 group-hover:bg-purple-700 text-white font-black text-xs uppercase shadow-sm transition-colors">
                    Build Goal &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==============================================================
          STAGE 2: THE MILESTONE MOUNTAIN JOURNEY
          ============================================================== */}
      {activeStage === 'journey' && (
        <div className="space-y-6">
          {/* Active Goal Summary Bar */}
          <div className="bg-gradient-to-r from-purple-50 via-fuchsia-50 to-pink-50 border-2 border-purple-200 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="text-4xl">{selectedGoal.icon}</span>
              <div>
                <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">Dream Project</span>
                <h3 className="font-black text-base sm:text-lg text-slate-900 leading-tight">{selectedGoal.name}</h3>
                <p className="text-xs text-slate-500 font-medium">Target: ₦{target.toLocaleString()}</p>
              </div>
            </div>

            <div className="text-center sm:text-right w-full sm:w-auto">
              <div className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Saved So Far</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                ₦{currentSaved.toLocaleString()}{' '}
                <span className="text-xs text-purple-600 font-bold">({percentComplete}%)</span>
              </div>
            </div>
          </div>

          {/* Milestone Mountain Track (25%, 50%, 75%, 100%) */}
          <div className="bg-slate-900 rounded-3xl p-5 text-white border-4 border-slate-700 shadow-inner">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider mb-2 text-slate-300">
              <span className="flex items-center gap-1.5"><Flag size={14} className="text-purple-400" /> Milestone Mountain</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <ShieldCheck size={14} /> Temptations Resisted: {temptationsResisted}
              </span>
            </div>

            {/* Glowing Progress Track */}
            <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden p-1 border-2 border-slate-700 my-3">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-emerald-400 rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${percentComplete}%` }}
              />
            </div>

            {/* 4 Flag Milestones */}
            <div className="grid grid-cols-4 gap-1 text-center pt-2 border-t border-slate-800">
              {milestones.map(m => {
                const isReached = percentComplete >= m.percent;
                return (
                  <div key={m.percent} className="flex flex-col items-center">
                    <span className={`text-base sm:text-lg transition-transform ${isReached ? 'scale-125 animate-bounce' : 'opacity-40 grayscale'}`}>
                      {isReached ? '🚩' : '⚪'}
                    </span>
                    <span className={`text-[10px] sm:text-xs font-black mt-1 ${isReached ? 'text-amber-400' : 'text-slate-500'}`}>
                      {m.percent}%
                    </span>
                    <span className="text-[9px] text-slate-400 hidden sm:block truncate max-w-[80px]">
                      ₦{m.amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Decision Card or Feedback */}
          {!roundFeedback ? (
            <div className="bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-purple-700 tracking-wider">
                  {currentRound.title}
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  Step {currentRoundIndex + 1} of {rounds.length}
                </span>
              </div>

              <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-relaxed">
                {currentRound.scenario}
              </h4>

              <div className="space-y-3 pt-2">
                {currentRound.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleMakeChoice(choice)}
                    className="w-full p-4 rounded-2xl bg-white hover:bg-purple-50/70 border-2 border-slate-200 hover:border-purple-400 text-left transition-all hover:shadow-md cursor-pointer group flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                        {choice.label}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Deposits: <strong className="text-emerald-600">+₦{choice.amount.toLocaleString()}</strong> to goal fund
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-purple-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Round Feedback / Learning Card */
            <div className={`p-5 rounded-3xl border-2 animate-in zoom-in-95 duration-200 text-center space-y-3 ${
              roundFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-amber-50 border-amber-300'
            }`}>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl mx-auto shadow-sm">
                {roundFeedback.type === 'success' ? '🎯' : '💡'}
              </div>

              <h4 className="font-black text-base text-slate-900">{roundFeedback.title}</h4>
              <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-lg mx-auto leading-relaxed">
                {roundFeedback.desc}
              </p>

              <button
                onClick={handleAdvanceRound}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer mt-2"
              >
                {currentRoundIndex < rounds.length - 1 && percentComplete < 100
                  ? 'Continue Next Strategy Week →'
                  : 'Celebrate Dream Completion! 🏆'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==============================================================
          STAGE 3: GRAND GOAL GETTER CELEBRATION
          ============================================================== */}
      {activeStage === 'victory' && (
        <div className="text-center space-y-5 animate-in zoom-in-95 duration-300 py-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-500 to-pink-500 border-4 border-purple-200 text-white flex items-center justify-center text-4xl mx-auto shadow-xl animate-bounce">
            🎯
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-widest text-purple-700 bg-purple-100 border border-purple-200 px-3 py-1 rounded-full">
              World 8 Mastered!
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              You Reached 100% of Your Dream Goal!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 font-medium">
              You conquered all 4 milestone peaks (25%, 50%, 75%, 100%) and proved the power of delayed gratification!
            </p>
          </div>

          {/* Goal Recap Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 max-w-sm mx-auto grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-slate-500 font-black uppercase">Goal Name</span>
              <div className="text-sm font-black text-slate-900 truncate">{selectedGoal.name}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-black uppercase">Total Saved</span>
              <div className="text-base font-black text-emerald-600">₦{currentSaved.toLocaleString()}</div>
            </div>
          </div>

          {/* Badge Showcase */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl max-w-md mx-auto flex items-center gap-3.5 text-left">
            <span className="text-4xl">🎯</span>
            <div>
              <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider">Badge Unlocked</span>
              <h4 className="font-black text-sm text-slate-900">Goal Getter</h4>
              <p className="text-[11px] text-slate-600">Mastered the milestone method and turned an ambitious dream into reality!</p>
            </div>
          </div>

          <button
            onClick={handleClaimFinalReward}
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-base rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            Claim 70 DolaCoins &amp; Badge &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
export default GoalBuilderGame;