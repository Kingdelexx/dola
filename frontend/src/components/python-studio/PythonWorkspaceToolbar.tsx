'use client';

import React from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Share2, 
  Zap, 
  Shield, 
  Flame, 
  Coins, 
  Key, 
  Terminal, 
  Gauge, 
  Play
} from 'lucide-react';
import { playAppSound } from '../app-studio/audioSynth';

interface PythonWorkspaceToolbarProps {
  classNum: number;
  onInsertSnippet: (snippet: string) => void;
  onResetGame: () => void;
  onOpenShareModal: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

export default function PythonWorkspaceToolbar({
  classNum,
  onInsertSnippet,
  onResetGame,
  onOpenShareModal,
  playbackSpeed,
  onChangeSpeed
}: PythonWorkspaceToolbarProps) {

  const renderClassSnippets = () => {
    switch (classNum) {
      case 1:
        return (
          <>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('hero.move_right(1)\n');
              }}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + hero.move_right()
            </button>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('hero.move_up(1)\n');
              }}
              className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + hero.move_up()
            </button>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('hero.jump()\n');
              }}
              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + hero.jump()
            </button>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('hero.collect()\n');
              }}
              className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-slate-950 border border-purple-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + hero.collect()
            </button>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('hero.say("Crystals collected! 🌟")\n');
              }}
              className="px-2.5 py-1 bg-pink-500/20 hover:bg-pink-500 text-pink-300 hover:text-slate-950 border border-pink-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + hero.say()
            </button>
          </>
        );

      case 2:
        return (
          <>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('for step in range(5):\n    hero.build_bridge()\n    hero.move_right()\n    hero.collect()\n');
              }}
              className="px-2.5 py-1 bg-pink-500/20 hover:bg-pink-500 text-pink-300 hover:text-slate-950 border border-pink-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + for step in range(5):
            </button>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('hero.build_bridge()\n');
              }}
              className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + hero.build_bridge()
            </button>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('hero.move_right()\n');
              }}
              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + hero.move_right()
            </button>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('hero.collect()\n');
              }}
              className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-slate-950 border border-purple-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + hero.collect()
            </button>
          </>
        );

      case 3:
        return (
          <>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('coins = coins + 25\nhero.pick_up_gold(25)\n');
              }}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + coins = coins + 25
            </button>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('coins = coins - 15\nhero.buy_item("golden_key", 15)\n');
              }}
              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + buy_item("golden_key", 15)
            </button>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('hero.unlock_vault()\n');
              }}
              className="px-2.5 py-1 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-300 hover:text-slate-950 border border-yellow-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + hero.unlock_vault()
            </button>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('print("Coins remaining:", coins)\n');
              }}
              className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + print(coins)
            </button>
          </>
        );

      case 4:
        return (
          <>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('color = hero.scan_gate()\n');
              }}
              className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + color = hero.scan_gate()
            </button>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('if color == "red":\n    hero.use_laser("blue")\nelif color == "green":\n    hero.use_laser("yellow")\nelse:\n    hero.use_laser("white")\n');
              }}
              className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-slate-950 border border-purple-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + if / elif / else
            </button>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('hero.use_laser("blue")\n');
              }}
              className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + hero.use_laser()
            </button>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('hero.move_right(2)\n');
              }}
              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + hero.move_right(2)
            </button>
          </>
        );

      case 5:
        return (
          <>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('def attack_combo(hits):\n    for i in range(hits):\n        hero.cast_fireball(25)\n        hero.dodge()\n');
              }}
              className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-slate-950 border border-rose-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + def attack_combo()
            </button>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('def super_defense():\n    hero.raise_shield()\n    hero.say("Shields up! 🛡️")\n');
              }}
              className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-slate-950 border border-indigo-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + def super_defense()
            </button>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('hero.cast_fireball(25)\n');
              }}
              className="px-2.5 py-1 bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-slate-950 border border-orange-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + hero.cast_fireball(25)
            </button>
            <button
              onClick={() => {
                playAppSound('click');
                onInsertSnippet('hero.victory_dance()\n');
              }}
              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-sm"
            >
              + hero.victory_dance()
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900/95 border-b border-purple-500/30 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
      {/* Left: Code Snippet Palette */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1 mr-1">
          <Zap size={13} className="text-yellow-400" />
          <span>Tap to Insert Python:</span>
        </span>
        {renderClassSnippets()}
      </div>

      {/* Right: Controls & Speed */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        {/* Speed toggle pills */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-black">
          <span className="text-slate-500 px-1">Speed:</span>
          {[
            { label: '0.5x', speed: 0.5 },
            { label: '1x', speed: 1 },
            { label: '2x', speed: 2 }
          ].map(s => (
            <button
              key={s.label}
              onClick={() => onChangeSpeed(s.speed)}
              className={`px-1.5 py-0.5 rounded-lg transition-all ${
                playbackSpeed === s.speed
                  ? 'bg-purple-600 text-white font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Reset World */}
        <button
          onClick={onResetGame}
          title="Reset Character & World"
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-slate-700 flex items-center gap-1"
        >
          <RotateCcw size={13} />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Share Project */}
        <button
          onClick={onOpenShareModal}
          className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-purple-500/40 flex items-center gap-1"
        >
          <Share2 size={13} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
