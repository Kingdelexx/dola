'use client';

import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Trophy, 
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playAppSound } from '../app-studio/audioSynth';

interface PythonShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  code: string;
  authorName?: string;
  classNum: number;
}

export default function PythonShareModal({
  isOpen,
  onClose,
  projectTitle,
  code,
  authorName = 'Junior Python Developer',
  classNum
}: PythonShareModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPy = () => {
    try {
      const blob = new Blob([code], { type: 'text/x-python;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'my-python-project'}.py`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      confetti({ particleCount: 70, spread: 60 });
      playAppSound('cheer');
    } catch (err) {
      console.error('Failed to download python script:', err);
    }
  };

  const handleCopyLink = () => {
    try {
      const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/python-studio` : '';
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      playAppSound('click');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-purple-500/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
              <Terminal size={22} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                World 3 &bull; Class {classNum}
              </span>
              <h3 className="text-lg font-black text-white drop-shadow-sm">
                Share Python Project
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white bg-slate-950/30 hover:bg-slate-950/50 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Certificate Badge Card */}
          <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-purple-500/30 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-400/20 border-2 border-amber-400 rounded-2xl flex items-center justify-center text-2xl shrink-0">
              🏆
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-400">
                <Sparkles size={11} /> Official DolaCode Python Creator
              </div>
              <h4 className="text-base font-black text-white">{projectTitle}</h4>
              <p className="text-xs text-purple-300">Authored by: {authorName}</p>
            </div>
          </div>

          {/* Code Preview snippet */}
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Python Source Code:</label>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-purple-300 max-h-36 overflow-y-auto leading-relaxed">
              {code || '# No Python code written yet'}
            </pre>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownloadPy}
              className="py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
            >
              <Download size={14} />
              <span>Download .py</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-black transition-all border border-slate-700 flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{isCopied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
