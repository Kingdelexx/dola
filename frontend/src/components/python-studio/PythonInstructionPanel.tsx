'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Rocket, 
  ChevronDown, 
  ChevronUp, 
  Compass,
  Play,
  RotateCcw,
  Target
} from 'lucide-react';

export interface PythonChallengeData {
  slug: string;
  title: string;
  class_number: number;
  stage_order: number;
  instructions_markdown: string;
  what_to_achieve: string;
  starter_code: string;
  game_config: any;
  solution_criteria: {
    required_methods?: string[];
    required_keywords?: string[];
  };
  reward_xp: number;
}

export const PYTHON_CLASSES = [
  { num: 1, name: 'Robo Motion Island', slug: 'class-1-robo-motion', icon: '🤖', subtitle: 'Commands & Sequencing', xp: 60, color: 'from-amber-500 to-orange-500' },
  { num: 2, name: 'Power Loop Realm', slug: 'class-2-power-loops', icon: '⚡', subtitle: 'For Loops & Repetition', xp: 75, color: 'from-pink-500 to-purple-500' },
  { num: 3, name: 'Variable Vault', slug: 'class-3-variable-vault', icon: '💰', subtitle: 'Variables & Math Ops', xp: 90, color: 'from-emerald-500 to-teal-500' },
  { num: 4, name: 'Decision Dungeon', slug: 'class-4-decision-dungeon', icon: '🧠', subtitle: 'If / Elif / Else Logic', xp: 110, color: 'from-cyan-500 to-blue-500' },
  { num: 5, name: 'Code Master Challenge', slug: 'class-5-code-master', icon: '🐉', subtitle: 'Functions & Boss Battle', xp: 150, color: 'from-purple-500 to-indigo-600' },
];

interface PythonInstructionPanelProps {
  currentSlug: string;
  challenge: PythonChallengeData | null;
  criteriaResults: { criterion: string; passed: boolean }[];
  isCompleted: boolean;
  onSelectMission: (slug: string) => void;
  onSubmitMission: () => void;
  onRunCode: () => void;
  isSubmitting: boolean;
  isRunning: boolean;
}

export default function PythonInstructionPanel({
  currentSlug,
  challenge,
  criteriaResults,
  isCompleted,
  onSelectMission,
  onSubmitMission,
  onRunCode,
  isSubmitting,
  isRunning
}: PythonInstructionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeClass = PYTHON_CLASSES.find(c => c.slug === currentSlug) || PYTHON_CLASSES[0];
  const currentIndex = PYTHON_CLASSES.findIndex(c => c.slug === currentSlug);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectMission(PYTHON_CLASSES[currentIndex - 1].slug);
    }
  };

  const handleNext = () => {
    if (currentIndex < PYTHON_CLASSES.length - 1) {
      onSelectMission(PYTHON_CLASSES[currentIndex + 1].slug);
    }
  };

  const allPassed = criteriaResults.length > 0 && criteriaResults.every(r => r.passed);

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-100 transition-all select-none">
      {/* Class Quick-Select Pills Bar */}
      <div className="px-3 md:px-5 py-1.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Compass size={12} className="text-purple-400" />
          <span>Python Classes:</span>
        </span>
        {PYTHON_CLASSES.map((cls) => {
          const isActive = cls.slug === currentSlug;
          return (
            <button
              key={cls.num}
              onClick={() => onSelectMission(cls.slug)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-md shadow-purple-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              <span>{cls.icon}</span>
              <span>Class {cls.num}: {cls.name}</span>
              <span className="text-[10px] px-1 py-0.2 bg-black/30 rounded-md font-mono text-purple-200">
                +{cls.xp} XP
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Header with Mission Info & What to Achieve */}
      <div className="px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-300"
              title="Previous Class"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === PYTHON_CLASSES.length - 1}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-300"
              title="Next Class"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base">{activeClass.icon}</span>
              <h1 className="text-sm md:text-base font-black text-white tracking-wide">
                {challenge?.title || activeClass.name}
              </h1>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 size={12} /> Completed
                </span>
              )}
            </div>
            <p className="text-xs text-purple-300 font-medium hidden sm:block">
              {activeClass.subtitle}
            </p>
          </div>
        </div>

        {/* Action Buttons: Run Code & Submit Mission */}
        <div className="flex items-center gap-2">
          {/* Run Code Button */}
          <button
            onClick={onRunCode}
            disabled={isRunning}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-md ${
              isRunning
                ? 'bg-purple-800 text-purple-300 cursor-wait'
                : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white'
            }`}
          >
            <Play size={13} className={isRunning ? 'animate-spin' : 'fill-current'} />
            <span>{isRunning ? 'Running Script...' : 'Run Animation 🚀'}</span>
          </button>

          {/* Submit Mission Button */}
          <button
            onClick={onSubmitMission}
            disabled={isSubmitting || !allPassed}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-md ${
              allPassed
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 hover:from-emerald-300 hover:to-teal-400 font-extrabold shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
            }`}
          >
            <Trophy size={13} className={allPassed ? 'text-amber-950' : 'text-slate-500'} />
            <span>{isSubmitting ? 'Submitting...' : `Submit & Earn +${challenge?.reward_xp || activeClass.xp} XP`}</span>
          </button>

          {/* Toggle Instructions Accordion */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700 flex items-center gap-1"
          >
            <BookOpen size={14} className="text-purple-400" />
            <span className="hidden md:inline">Goal &amp; Guide</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* "What to Achieve at the End" Highlight Bar */}
      <div className="px-4 md:px-6 py-1.5 bg-indigo-950/40 border-t border-indigo-900/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <Target size={14} className="text-amber-400 shrink-0" />
          <span className="font-extrabold text-amber-300 uppercase tracking-wider text-[10px] shrink-0">
            What to Achieve:
          </span>
          <span className="text-slate-200 font-semibold text-xs overflow-hidden text-ellipsis">
            {challenge?.what_to_achieve || `Complete Class ${activeClass.num} challenge project.`}
          </span>
        </div>

        {/* Criteria status pills counter */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className="text-[11px] font-bold text-slate-400">
            Goals: {criteriaResults.filter(r => r.passed).length}/{criteriaResults.length}
          </span>
          {allPassed ? (
            <CheckCircle2 size={15} className="text-emerald-400" />
          ) : (
            <XCircle size={15} className="text-amber-400" />
          )}
        </div>
      </div>

      {/* Expanded Accordion: Full Instructions & Criteria Checklist */}
      {isExpanded && (
        <div className="px-4 md:px-6 py-4 bg-slate-950/90 border-t border-slate-800 grid md:grid-cols-2 gap-4">
          {/* Instructions Box */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <BookOpen size={14} />
              <span>Mission Instructions &amp; Python Concepts</span>
            </h3>
            <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line font-medium">
              {challenge?.instructions_markdown || 'Follow the Python commands to control Leo the Explorer.'}
            </div>
          </div>

          {/* Real-time Checklist */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Project Criteria Checklist</span>
            </h3>
            <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800 space-y-2 max-h-48 overflow-y-auto">
              {criteriaResults.map((crit, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center gap-2 p-1.5 rounded-xl text-xs font-bold transition-all ${
                    crit.passed 
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                      : 'bg-slate-800/60 text-slate-400 border border-slate-700/60'
                  }`}
                >
                  {crit.passed ? (
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-slate-500 shrink-0" />
                  )}
                  <span>{crit.criterion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
