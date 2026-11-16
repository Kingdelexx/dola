'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SoundFX } from './SoundFX';

interface VictoryModalProps {
  isOpen: boolean;
  levelId: number;
  levelTitle: string;
  linesUsed: number;
  optimalLines: number;
  bananasCollected: number;
  totalBananas: number;
  onNextLevel: () => void;
  onReplay: () => void;
  hasNextLevel: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  levelId,
  levelTitle,
  linesUsed,
  optimalLines,
  bananasCollected,
  totalBananas,
  onNextLevel,
  onReplay,
  hasNextLevel
}) => {
  if (!isOpen) return null;

  // Star calculation
  let stars = 1;
  if (linesUsed <= optimalLines) {
    stars = 3;
  } else if (linesUsed <= optimalLines + 2) {
    stars = 2;
  }

  // Trigger celebration audio and confetti on modal open
  useEffect(() => {
    // Play cheerful fanfare on level completion
    SoundFX.playFanfare();

    // Storybook jungle confetti
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD54F', '#FF9800', '#7CB342', '#8D6E63', '#4FC3F7']
    });
  }, []);

  const getPraiseMessage = () => {
    if (stars === 3) return 'Python Master! You found the optimal code solution!';
    if (stars === 2) return 'Great Job! Try using Python loops to earn 3 stars!';
    return 'Level Solved! Can you optimize your code with fewer lines?';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF6EE] rounded-3xl p-6 md:p-8 border-4 border-[#D7CCC8] shadow-[0_20px_50px_rgba(38,50,56,0.3)] text-center text-[#263238] font-fredoka">
        
        {/* Decorative Top Leaf Badge */}
        <div className="inline-flex items-center gap-2 bg-[#7CB342] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 shadow-sm border-b-2 border-[#558B2F]">
          <span>Jungle Victory</span>
        </div>

        {/* Modal Title */}
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#263238] mb-1">
          Level Completed!
        </h2>
        <p className="text-sm font-medium text-[#5D4037] mb-5">
          {levelTitle}
        </p>

        {/* 3-Star Rating Indicator with bounce */}
        <div className="flex justify-center items-center gap-3 mb-4">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stars;
            return (
              <div
                key={starIdx}
                className={`relative transition-all duration-300 transform ${
                  isEarned ? 'scale-110 drop-shadow-md' : 'opacity-40 grayscale'
                }`}
                style={{ transitionDelay: `${starIdx * 120}ms` }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="transform hover:rotate-12 transition-transform">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill={isEarned ? '#FFB300' : '#BCAAA4'}
                    stroke={isEarned ? '#E65100' : '#8D6E63'}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {isEarned && (
                    <circle cx="10" cy="8" r="1.5" fill="#FFF9C4" />
                  )}
                </svg>
              </div>
            );
          })}
        </div>

        <p className="text-sm font-bold text-[#7CB342] mb-5 px-4">
          {getPraiseMessage()}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-[#F5EFEB] p-3.5 rounded-2xl border-2 border-[#E0D7C6]">
          <div className="text-center">
            <div className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider">Bananas</div>
            <div className="text-xl font-black text-[#FF8F00] flex items-center justify-center gap-1 mt-0.5">
              <span>{bananasCollected}</span>
              <span className="text-xs text-[#8D6E63]">/ {totalBananas}</span>
            </div>
          </div>
          <div className="text-center border-l-2 border-[#E0D7C6]">
            <div className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider">Lines of Code</div>
            <div className="text-xl font-black text-[#263238] flex items-center justify-center gap-1 mt-0.5">
              <span>{linesUsed}</span>
              <span className="text-xs font-semibold text-[#7CB342]">(Target: {optimalLines})</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onReplay}
            className="flex-1 py-3 px-4 rounded-2xl btn-arcade btn-arcade-parchment text-sm"
          >
            Improve Code
          </button>

          {hasNextLevel ? (
            <button
              onClick={onNextLevel}
              className="flex-1 py-3 px-5 rounded-2xl btn-arcade btn-arcade-mango text-base font-bold shadow-md"
            >
              Next Level →
            </button>
          ) : (
            <button
              onClick={onReplay}
              className="flex-1 py-3 px-5 rounded-2xl btn-arcade btn-arcade-green text-base font-bold"
            >
              Replay All
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
