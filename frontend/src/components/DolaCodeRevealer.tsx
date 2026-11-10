'use client';

import React from 'react';
import { Sparkles, X, Code2 } from 'lucide-react';

interface DolaCodeRevealerProps {
  revealedSnippet: string | null;
  explanation: string | null;
  onClose: () => void;
}

export default function DolaCodeRevealer({
  revealedSnippet,
  explanation,
  onClose
}: DolaCodeRevealerProps) {
  if (!revealedSnippet) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 border-b-2 border-amber-400 px-3 md:px-5 py-2 flex items-center justify-between gap-3 animate-fadeIn text-slate-100 select-none">
      <div className="flex items-center gap-2.5 overflow-hidden">
        <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
          <Code2 size={16} className="animate-pulse" />
        </div>
        <div className="flex flex-wrap items-center gap-2 truncate">
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 shrink-0 flex items-center gap-1">
            <Sparkles size={12} />
            <span>DolaCode Revealed:</span>
          </span>
          <code className="bg-slate-950/90 text-amber-300 px-2 py-0.5 rounded-md font-mono text-xs font-bold border border-amber-400/40 shrink-0">
            {revealedSnippet}
          </code>
          {explanation && (
            <span className="text-xs text-slate-300 font-medium truncate hidden sm:inline">
              &bull; {explanation}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-lg transition-all shrink-0"
        title="Dismiss Code Revealer"
      >
        <X size={15} />
      </button>
    </div>
  );
}
