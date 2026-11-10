'use client';

import React from 'react';
import { 
  Sparkles, 
  MousePointerClick, 
  Type, 
  Image as ImageIcon, 
  Edit3, 
  Zap, 
  Volume2, 
  Heart, 
  Smile, 
  RotateCcw, 
  Smartphone, 
  HelpCircle, 
  Share2, 
  CheckCircle,
  PiggyBank,
  BookOpen,
  Calendar,
  Layers
} from 'lucide-react';
import { playAppSound } from './audioSynth';

interface AppWorkspaceToolbarProps {
  classNum: number;
  currentSlug: string;
  onAddComponent: (type: 'button' | 'label' | 'image' | 'input', customProps?: any) => void;
  onTriggerSound: (sound: 'laser' | 'boing' | 'cheer' | 'cowbell', name: string) => void;
  onPetAction: (action: 'feed' | 'play' | 'sleep') => void;
  onSwitchScreen: (screenId: string) => void;
  onLoadInventorTheme: (theme: 'savings' | 'study' | 'homework' | 'reading') => void;
  onOpenShareModal: () => void;
}

export default function AppWorkspaceToolbar({
  classNum,
  currentSlug,
  onAddComponent,
  onTriggerSound,
  onPetAction,
  onSwitchScreen,
  onLoadInventorTheme,
  onOpenShareModal
}: AppWorkspaceToolbarProps) {

  // ==========================================
  // CLASS 1: APP BUILDER PLAYGROUND
  // ==========================================
  if (classNum === 1) {
    return (
      <div className="bg-slate-900/95 border-b border-amber-500/30 px-3 py-2 flex flex-wrap items-center gap-1.5 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1 mr-1">
          <Sparkles size={13} className="text-amber-400" />
          <span>Tap to Add UI Component:</span>
        </span>

        {/* Add Label */}
        <button
          onClick={() => {
            playAppSound('click');
            onAddComponent('label', { text: 'Welcome to My Mobile App! 🌟', fontSize: 18, color: '#facc15' });
          }}
          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
        >
          <Type size={13} />
          <span>+ Label (Title)</span>
        </button>

        {/* Add Picture / Mascot */}
        <button
          onClick={() => {
            playAppSound('click');
            onAddComponent('image', { src: '/assets/stickers/happy-robot.svg', width: 90, height: 90 });
          }}
          className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
        >
          <ImageIcon size={13} />
          <span>+ Picture (Mascot)</span>
        </button>

        {/* Add Text Input Box */}
        <button
          onClick={() => {
            playAppSound('click');
            onAddComponent('input', { hint: 'Type your name here...' });
          }}
          className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-slate-950 border border-purple-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
        >
          <Edit3 size={13} />
          <span>+ Text Box (Input)</span>
        </button>

        {/* Add Action Button */}
        <button
          onClick={() => {
            playAppSound('click');
            onAddComponent('button', { text: 'Say Hello! 👋', backgroundColor: '#10b981' });
          }}
          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
        >
          <MousePointerClick size={13} />
          <span>+ Button (Action)</span>
        </button>
      </div>
    );
  }

  // ==========================================
  // CLASS 2: MAGIC BUTTON LAB
  // ==========================================
  if (classNum === 2) {
    return (
      <div className="bg-slate-900/95 border-b border-pink-500/30 px-3 py-2 flex flex-wrap items-center gap-1.5 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1 mr-1">
          <Zap size={13} />
          <span>Sound Triggers (WHEN Tapped):</span>
        </span>

        <button
          onClick={() => onTriggerSound('laser', 'Laser Zap')}
          className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1 active:scale-95 shadow-sm"
        >
          ⚡ Laser Zap
        </button>

        <button
          onClick={() => onTriggerSound('boing', 'Boing Jump')}
          className="px-2.5 py-1 bg-pink-500/20 hover:bg-pink-500 text-pink-300 hover:text-slate-950 border border-pink-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1 active:scale-95 shadow-sm"
        >
          🦘 Boing!
        </button>

        <button
          onClick={() => onTriggerSound('cheer', 'Victory Fanfare')}
          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1 active:scale-95 shadow-sm"
        >
          📣 Victory Cheer
        </button>

        <button
          onClick={() => onTriggerSound('cowbell', 'Cowbell Clang')}
          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1 active:scale-95 shadow-sm"
        >
          🔔 Cowbell
        </button>
      </div>
    );
  }

  // ==========================================
  // CLASS 3: SMART PET APP
  // ==========================================
  if (classNum === 3) {
    return (
      <div className="bg-slate-900/95 border-b border-emerald-500/30 px-3 py-2 flex flex-wrap items-center gap-2 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1 mr-1">
          <Heart size={13} />
          <span>Pet State Controls:</span>
        </span>

        <button
          onClick={() => onPetAction('feed')}
          className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95"
        >
          🍕 Feed Snack (-25% Hunger)
        </button>

        <button
          onClick={() => onPetAction('play')}
          className="px-3 py-1 bg-pink-500/20 hover:bg-pink-500 text-pink-300 hover:text-slate-950 border border-pink-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95"
        >
          🎾 Play Fetch (+20% Happiness)
        </button>

        <button
          onClick={() => onPetAction('sleep')}
          className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-slate-950 border border-blue-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95"
        >
          🛏️ Take Nap (+35% Energy)
        </button>
      </div>
    );
  }

  // ==========================================
  // CLASS 4: QUIZ & GAME FACTORY
  // ==========================================
  if (classNum === 4) {
    return (
      <div className="bg-slate-900/95 border-b border-cyan-500/30 px-3 py-2 flex flex-wrap items-center gap-2 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1 mr-1">
          <Layers size={13} />
          <span>Screen Navigator:</span>
        </span>

        <button
          onClick={() => onSwitchScreen('startScreen')}
          className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
        >
          📱 1. Start Screen
        </button>

        <button
          onClick={() => onSwitchScreen('quizScreen')}
          className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
        >
          ❓ 2. Quiz Screen
        </button>

        <button
          onClick={() => onSwitchScreen('resultsScreen')}
          className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
        >
          🏆 3. Results Screen
        </button>
      </div>
    );
  }

  // ==========================================
  // CLASS 5: APP INVENTOR CHALLENGE
  // ==========================================
  if (classNum === 5) {
    return (
      <div className="bg-slate-900/95 border-b border-purple-500/30 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1 mr-1">
            <Sparkles size={13} />
            <span>Choose App Theme:</span>
          </span>

          <button
            onClick={() => onLoadInventorTheme('savings')}
            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1"
          >
            💰 Savings Tracker (₦)
          </button>

          <button
            onClick={() => onLoadInventorTheme('study')}
            className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-slate-950 border border-indigo-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1"
          >
            📚 Study Planner
          </button>

          <button
            onClick={() => onLoadInventorTheme('homework')}
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1"
          >
            📝 Homework Organiser
          </button>

          <button
            onClick={() => onLoadInventorTheme('reading')}
            className="px-2.5 py-1 bg-pink-500/20 hover:bg-pink-500 text-pink-300 hover:text-slate-950 border border-pink-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1"
          >
            📖 Reading Tracker
          </button>
        </div>

        {/* Share & Export */}
        <button
          onClick={onOpenShareModal}
          className="px-3 py-1 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md hover:from-emerald-300 hover:to-teal-300 active:scale-95"
        >
          <Share2 size={13} />
          <span>Share &amp; Export App 📱</span>
        </button>
      </div>
    );
  }

  return null;
}
