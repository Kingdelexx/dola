'use client';

import React from 'react';

export interface CurrencyNoteProps {
  value: number;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  count?: number;
  className?: string;
  disabled?: boolean;
}

export const NAIRA_NOTE_COLORS: Record<number, { bg: string; border: string; text: string; accent: string; label: string; hero: string }> = {
  1000: {
    bg: 'from-slate-700 via-sky-900 to-indigo-950',
    border: 'border-cyan-400',
    text: 'text-cyan-200',
    accent: 'text-amber-300',
    label: 'ONE THOUSAND NAIRA',
    hero: 'Dr. C. Isong & M. A. Mai-Bornu'
  },
  500: {
    bg: 'from-teal-800 via-emerald-800 to-teal-950',
    border: 'border-emerald-400',
    text: 'text-emerald-200',
    accent: 'text-yellow-300',
    label: 'FIVE HUNDRED NAIRA',
    hero: 'Dr. Nnamdi Azikiwe'
  },
  200: {
    bg: 'from-amber-800 via-orange-900 to-stone-900',
    border: 'border-amber-400',
    text: 'text-amber-200',
    accent: 'text-yellow-200',
    label: 'TWO HUNDRED NAIRA',
    hero: 'Sir Ahmadu Bello'
  },
  100: {
    bg: 'from-rose-800 via-purple-900 to-rose-950',
    border: 'border-rose-400',
    text: 'text-rose-200',
    accent: 'text-yellow-300',
    label: 'ONE HUNDRED NAIRA',
    hero: 'Chief Obafemi Awolowo'
  },
  50: {
    bg: 'from-blue-600 via-cyan-700 to-blue-900',
    border: 'border-cyan-300',
    text: 'text-blue-100',
    accent: 'text-white',
    label: 'FIFTY NAIRA',
    hero: 'People of Nigeria'
  },
  20: {
    bg: 'from-emerald-700 via-green-800 to-emerald-950',
    border: 'border-green-400',
    text: 'text-emerald-100',
    accent: 'text-yellow-200',
    label: 'TWENTY NAIRA',
    hero: 'Gen. Murtala Muhammed'
  },
  10: {
    bg: 'from-red-900 via-rose-950 to-stone-900',
    border: 'border-rose-400',
    text: 'text-rose-100',
    accent: 'text-amber-200',
    label: 'TEN NAIRA',
    hero: 'Fulani Milkmaids'
  },
  5: {
    bg: 'from-fuchsia-900 via-purple-950 to-stone-900',
    border: 'border-fuchsia-400',
    text: 'text-fuchsia-100',
    accent: 'text-yellow-200',
    label: 'FIVE NAIRA',
    hero: 'Nkpokiti Dancers'
  }
};

export const NairaNote: React.FC<CurrencyNoteProps> = ({
  value,
  selected = false,
  onClick,
  size = 'md',
  count,
  className = '',
  disabled = false
}) => {
  const meta = NAIRA_NOTE_COLORS[value] || {
    bg: 'from-slate-700 to-slate-900',
    border: 'border-slate-400',
    text: 'text-slate-100',
    accent: 'text-yellow-300',
    label: `${value} NAIRA`,
    hero: 'Nigeria'
  };

  const sizeClasses = {
    sm: 'w-36 h-20 text-[10px] p-2 rounded-xl',
    md: 'w-48 h-28 text-xs p-3 rounded-2xl',
    lg: 'w-64 h-36 text-sm p-4 rounded-3xl'
  }[size];

  const valueSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  }[size];

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        relative select-none transition-all duration-200 font-sans shadow-md
        bg-gradient-to-r ${meta.bg}
        border-2 ${selected ? 'border-yellow-400 ring-4 ring-yellow-300 scale-105 shadow-xl' : meta.border}
        ${!disabled && onClick ? 'cursor-pointer hover:scale-102 hover:shadow-lg active:scale-98' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${sizeClasses}
        ${className}
      `}
    >
      {/* Intricate Nigerian Pattern Watermark */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] rounded-inherit pointer-events-none" />

      {/* Header with CBN seal */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-1 mb-1">
        <span className="font-bold tracking-wider text-[9px] text-white/90 uppercase">
          Central Bank of Nigeria
        </span>
        <span className="text-[10px] font-black text-emerald-300">
          🇳🇬
        </span>
      </div>

      {/* Middle Body */}
      <div className="relative z-10 flex items-center justify-between mt-1">
        <div>
          <div className={`font-black tracking-tight text-white drop-shadow-md flex items-center gap-0.5 ${valueSizeClasses}`}>
            <span>₦{value.toLocaleString()}</span>
          </div>
          <div className="text-[8px] sm:text-[9px] font-semibold text-white/70 tracking-tight leading-none mt-0.5 uppercase">
            {meta.label}
          </div>
        </div>

        {/* Small Vignette Seal */}
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 border border-white/30 backdrop-blur-xs flex items-center justify-center text-center p-0.5 shadow-inner">
          <span className="text-[7px] sm:text-[8px] font-black leading-tight text-amber-200/90 text-center uppercase">
            {meta.hero.split(' ')[0]}
          </span>
        </div>
      </div>

      {/* Bottom bar with serial */}
      <div className="relative z-10 flex items-center justify-between mt-2 pt-1 border-t border-white/10 text-[8px] font-mono text-white/60">
        <span>CBN-₦{value}</span>
        <span className="font-black text-amber-300">₦{value}</span>
      </div>

      {/* Optional Count badge */}
      {typeof count === 'number' && count > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-400 text-slate-900 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
          {count}
        </div>
      )}
    </div>
  );
};

export const NairaCoin: React.FC<{
  value: number;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  count?: number;
  disabled?: boolean;
}> = ({ value, selected, onClick, size = 'md', count, disabled }) => {
  const sizeClasses = {
    sm: 'w-14 h-14 text-sm',
    md: 'w-20 h-20 text-lg',
    lg: 'w-24 h-24 text-2xl'
  }[size];

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        relative select-none transition-all duration-200 rounded-full font-black flex flex-col items-center justify-center
        bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 text-stone-900 shadow-md border-4 border-amber-300
        ${selected ? 'ring-4 ring-yellow-400 scale-105 shadow-xl' : ''}
        ${!disabled && onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${sizeClasses}
      `}
    >
      <div className="text-[9px] uppercase tracking-widest text-amber-900/80 font-bold -mb-1">
        Nigeria
      </div>
      <div>₦{value}</div>
      <div className="text-[8px] font-mono text-amber-900/70 font-bold">COIN</div>

      {typeof count === 'number' && count > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
          {count}
        </div>
      )}
    </div>
  );
};
