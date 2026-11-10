'use client';

import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Trophy, 
  Share2,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playAppSound } from './audioSynth';

interface AppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  screens: any[];
  code: string;
  authorName?: string;
}

export default function AppShareModal({
  isOpen,
  onClose,
  appName,
  screens,
  code,
  authorName = 'App Developer'
}: AppShareModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const currentScreen = screens[0] || { name: 'Main Screen', backgroundColor: '#0f172a', elements: [] };

  const handleDownloadBundle = () => {
    try {
      const appData = {
        name: appName,
        author: authorName,
        createdAt: new Date().toISOString(),
        screens,
        code
      };
      const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${appName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'my-mobile-app'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      confetti({ particleCount: 70, spread: 60 });
      playAppSound('reward');
    } catch (e) {
      // Suppress
    }
  };

  const handleCopyShare = () => {
    const text = `📱 Check out my mobile app "${appName}" built in DolaCode App Dev Studio (World 5)! Built with interactive components, events & state! 🚀`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    playAppSound('click');
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-emerald-400/50 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-slate-100 max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
              <Smartphone size={22} className="text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                  App Simulator Showcase
                </span>
                <span className="text-xs font-bold text-emerald-200">
                  By {authorName}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight truncate max-w-xs sm:max-w-md">
                {appName || 'My Mobile App'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBundle}
              className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95 shrink-0"
              title="Download app project file"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export .json</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white bg-slate-950/30 hover:bg-slate-950/50 rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Live Simulator Preview Body */}
        <div className="flex-1 bg-slate-950/60 p-4 sm:p-6 flex flex-col items-center justify-center overflow-auto">
          {/* Phone Mockup Frame */}
          <div className="w-[280px] h-[480px] bg-slate-900 border-8 border-slate-700 rounded-[36px] shadow-2xl relative overflow-hidden flex flex-col">
            {/* Phone Notch */}
            <div className="h-5 bg-slate-950 flex items-center justify-center shrink-0">
              <div className="w-16 h-3 bg-slate-800 rounded-full"></div>
            </div>

            {/* Screen View */}
            <div 
              className="flex-1 relative overflow-hidden p-3"
              style={{ backgroundColor: currentScreen.backgroundColor || '#0f172a' }}
            >
              {currentScreen.elements?.map((el: any) => {
                const s = el.style || {};
                return (
                  <div
                    key={el.id}
                    style={{
                      position: 'absolute',
                      left: `${s.x || 20}px`,
                      top: `${s.y || 40}px`,
                      width: `${s.width || 120}px`,
                      height: `${s.height || 40}px`,
                      fontSize: `${s.fontSize || 14}px`,
                      color: s.color || '#ffffff',
                      backgroundColor: s.backgroundColor || 'transparent',
                      borderRadius: `${s.borderRadius || 0}px`,
                      textAlign: s.textAlign || 'left',
                      fontWeight: s.fontWeight || 'normal',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: s.textAlign === 'center' ? 'center' : 'flex-start',
                      padding: '4px 8px'
                    }}
                  >
                    {el.type === 'button' ? (
                      <button 
                        onClick={() => playAppSound('boing')}
                        className="w-full h-full shadow-md active:scale-95 transition-transform"
                        style={{
                          backgroundColor: s.backgroundColor || '#10b981',
                          color: s.color || '#ffffff',
                          borderRadius: `${s.borderRadius || 12}px`,
                          fontWeight: 'bold',
                          fontSize: `${s.fontSize || 14}px`
                        }}
                      >
                        {el.text || 'Button'}
                      </button>
                    ) : el.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={el.src || '/assets/stickers/happy-robot.svg'} alt="Sticker" className="w-full h-full object-contain" />
                    ) : el.type === 'input' ? (
                      <input 
                        type="text" 
                        readOnly 
                        value={el.value || ''}
                        placeholder={el.hint || 'Text input...'}
                        className="w-full h-full px-2 rounded-lg bg-slate-800/80 text-white text-xs border border-slate-700"
                      />
                    ) : (
                      <span>{el.text || 'Label'}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Phone Home Bar */}
            <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0">
              <div className="w-20 h-1 bg-slate-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-emerald-400" />
            <span className="font-bold text-slate-300">Certified Junior App Developer</span>
          </div>
          <button
            onClick={handleCopyShare}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
          >
            {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{isCopied ? 'Link Copied!' : 'Copy Share Link'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
