'use client';

import React from 'react';
import { RotateCcw, Lightbulb, Waves, Mountain, ShieldAlert, Sparkles } from 'lucide-react';
import { SoundFX } from './SoundFX';

interface RetryModalProps {
  isOpen: boolean;
  reason: 'water' | 'bush' | 'rock' | 'incomplete';
  levelTitle: string;
  hint: string;
  onRetry: () => void;
}

export const RetryModal: React.FC<RetryModalProps> = ({
  isOpen,
  reason,
  levelTitle,
  hint,
  onRetry
}) => {
  if (!isOpen) return null;

  const handleRetryClick = () => {
    SoundFX.playFootstep();
    onRetry();
  };

  const getReasonConfig = () => {
    switch (reason) {
      case 'water':
        return {
          badge: 'Water Hazard',
          badgeBg: 'bg-sky-600 text-white border-sky-400',
          title: 'Splash! Monkey Fell in the River!',
          icon: <Waves size={36} className="text-sky-500 animate-bounce" />,
          advice: "Monkeys can't swim in deep water! Make sure to build wooden bridge planks with bridge.extend(...) before stepping forward.",
          accentColor: '#0288D1'
        };
      case 'rock':
        return {
          badge: 'Boulder Collision',
          badgeBg: 'bg-amber-600 text-white border-amber-400',
          title: 'Ouch! Bumped into a Boulder!',
          icon: <Mountain size={36} className="text-amber-600 animate-pulse" />,
          advice: 'Monkeys cannot walk through solid boulders! Use monkey.jump() to leap cleanly over 1-tile rocks.',
          accentColor: '#D84315'
        };
      case 'bush':
        return {
          badge: 'Prickly Hazard',
          badgeBg: 'bg-emerald-700 text-white border-emerald-500',
          title: 'Ouch! A Prickly Jungle Bush!',
          icon: <ShieldAlert size={36} className="text-emerald-600 animate-pulse" />,
          advice: "Keep the monkey on the dirt path! Use monkey.turn('left') or monkey.turn('right') to steer away from jungle bushes.",
          accentColor: '#2E7D32'
        };
      default:
        return {
          badge: 'Almost There',
          badgeBg: 'bg-yellow-600 text-white border-yellow-400',
          title: 'Not All Bananas Collected!',
          icon: <Sparkles size={36} className="text-amber-500 animate-spin" />,
          advice: 'You need to collect every golden banana to complete the level. Double check your steps or loop counts!',
          accentColor: '#FF9800'
        };
    }
  };

  const config = getReasonConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF6EE] rounded-3xl p-6 md:p-8 border-4 border-[#D7CCC8] shadow-[0_20px_50px_rgba(38,50,56,0.35)] text-center text-[#263238] font-fredoka">
        
        {/* Decorative Top Leaf/Hazard Badge */}
        <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-3 shadow-xs border-b-2 ${config.badgeBg}`}>
          <span>{config.badge}</span>
        </div>

        {/* Hazard Animated Icon */}
        <div className="flex justify-center items-center my-2">
          <div className="w-20 h-20 rounded-full bg-white border-4 border-[#E0D7C6] shadow-inner flex items-center justify-center">
            {config.icon}
          </div>
        </div>

        {/* Modal Title */}
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#263238] mb-1">
          {config.title}
        </h2>
        <p className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-4">
          {levelTitle}
        </p>

        {/* Advice / What Went Wrong */}
        <div className="bg-white/80 border-2 border-[#E0D7C6] rounded-2xl p-4 text-xs md:text-sm font-semibold text-[#5D4037] leading-relaxed mb-4 shadow-xs">
          {config.advice}
        </div>

        {/* Hint Box */}
        {hint && (
          <div className="bg-amber-50/90 border-2 border-amber-200 rounded-2xl p-3 text-xs text-amber-900 font-medium text-left mb-6 flex items-start gap-2.5">
            <Lightbulb size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-black text-amber-800 uppercase tracking-wider text-[10px] block mb-0.5">
                Jungle Tip:
              </span>
              <span>{hint}</span>
            </div>
          </div>
        )}

        {/* Primary Action Button: Try Again */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleRetryClick}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FF9800] to-[#FB8C00] hover:from-[#FFA726] hover:to-[#FF9800] text-white font-black text-base shadow-[0_6px_0_#E65100] active:translate-y-[4px] active:shadow-[0_2px_0_#E65100] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={20} className="animate-spin-reverse" />
            <span>Try Again &bull; Edit Code</span>
          </button>
        </div>

      </div>
    </div>
  );
};
export default RetryModal;
