'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  ListOrdered, 
  BookOpen, 
  Rocket, 
  ChevronDown, 
  ChevronUp, 
  Compass,
  Smartphone
} from 'lucide-react';

export interface AppMissionData {
  slug: string;
  title: string;
  class_number: number;
  stage_order: number;
  instructions_markdown: string;
  starter_screens: any[];
  starter_code: string;
  solution_criteria: {
    required_elements?: string[];
    required_min_screens?: number;
    required_events?: string[];
    required_keywords?: string[];
  };
  reward_xp: number;
}

export const APP_CLASSES = [
  { num: 1, name: 'App Builder Playground', slug: 'class-1-hello-app', icon: '📱', subtitle: 'Screens & components', xp: 60, color: 'from-amber-500 to-orange-500' },
  { num: 2, name: 'Magic Button Lab', slug: 'class-2-soundboard-app', icon: '⚡', subtitle: 'Events & actions', xp: 75, color: 'from-pink-500 to-purple-500' },
  { num: 3, name: 'Smart Pet App', slug: 'class-3-virtual-pet', icon: '🐾', subtitle: 'Variables & state', xp: 90, color: 'from-emerald-500 to-teal-500' },
  { num: 4, name: 'Quiz & Game Factory', slug: 'class-4-quiz-app', icon: '🎮', subtitle: 'Multi-screen navigation', xp: 110, color: 'from-cyan-500 to-blue-500' },
  { num: 5, name: 'App Inventor Challenge', slug: 'class-5-app-inventor', icon: '🚀', subtitle: 'Original independent app', xp: 150, color: 'from-purple-500 to-indigo-600' },
];

interface AppInstructionPanelProps {
  currentSlug: string;
  challenge: AppMissionData | null;
  criteriaResults: { criterion: string; passed: boolean }[];
  isCompleted: boolean;
  onSelectMission: (slug: string) => void;
  onSubmitMission: () => void;
  isSubmitting: boolean;
}

export default function AppInstructionPanel({
  currentSlug,
  challenge,
  criteriaResults,
  isCompleted,
  onSelectMission,
  onSubmitMission,
  isSubmitting
}: AppInstructionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const activeClass = APP_CLASSES.find(c => c.slug === currentSlug) || APP_CLASSES[0];
  const currentIndex = APP_CLASSES.findIndex(c => c.slug === currentSlug);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectMission(APP_CLASSES[currentIndex - 1].slug);
    }
  };

  const handleNext = () => {
    if (currentIndex < APP_CLASSES.length - 1) {
      onSelectMission(APP_CLASSES[currentIndex + 1].slug);
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-100 transition-all select-none">
      {/* Class Quick-Select Pills Bar */}
      <div className="px-3 md:px-5 py-1.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Compass size={12} className="text-emerald-400" />
          <span>Classes:</span>
        </span>
        {APP_CLASSES.map((cls) => {
          const isActive = cls.slug === currentSlug;
          return (
            <button
              key={cls.num}
              onClick={() => onSelectMission(cls.slug)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              <span>{cls.icon}</span>
              <span className="truncate">Class {cls.num}: {cls.name}</span>
            </button>
          );
        })}
      </div>

      {/* Top Main Bar */}
      <div className="px-3 md:px-4 py-2 flex flex-wrap items-center justify-between gap-2 bg-slate-900/95">
        
        {/* Left: Class Selector Dropdown */}
        <div className="flex items-center gap-1.5 max-w-full">
          <div className="relative">
            <button
              onClick={() => setIsSelectorOpen(!isSelectorOpen)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 rounded-xl text-xs font-black text-emerald-300 flex items-center gap-1.5 transition-all shadow-sm active:scale-95 max-w-[230px] sm:max-w-xs"
            >
              <span className="text-sm">{activeClass.icon}</span>
              <span className="truncate">Class {activeClass.num}: {activeClass.name}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold shrink-0 hidden sm:inline">
                +{activeClass.xp}XP
              </span>
              <ChevronDown size={14} className={`transition-transform text-slate-400 shrink-0 ${isSelectorOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isSelectorOpen && (
              <div className="absolute top-full left-0 mt-2 z-50 w-[90vw] sm:w-80 bg-slate-900 border-2 border-slate-700/80 rounded-2xl shadow-2xl p-2 max-h-96 overflow-y-auto divide-y divide-slate-800/80">
                {APP_CLASSES.map((cls) => (
                  <button
                    key={cls.slug}
                    onClick={() => {
                      onSelectMission(cls.slug);
                      setIsSelectorOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 text-left rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 my-0.5 ${
                      cls.slug === currentSlug
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="truncate flex items-center gap-2">
                      <span className="text-sm">{cls.icon}</span>
                      <div className="truncate">
                        <span className="block truncate">Class {cls.num}: {cls.name}</span>
                        <span className={`text-[10px] ${cls.slug === currentSlug ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                          {cls.subtitle}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-black shrink-0 ${
                      cls.slug === currentSlug ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-emerald-400'
                    }`}>
                      +{cls.xp} XP
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center gap-0.5 bg-slate-950/60 p-0.5 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Previous Class"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-1 font-bold">
              {currentIndex + 1}/{APP_CLASSES.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === APP_CLASSES.length - 1}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Next Class"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Right: Submit Button & Guide Toggle */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Submit App Mission */}
          <button
            onClick={onSubmitMission}
            disabled={isSubmitting}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-md active:scale-95 ${
              isCompleted
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 size={14} />
                <span className="hidden sm:inline">Cleared!</span>
                <span className="sm:hidden">Done</span>
              </>
            ) : (
              <>
                <Rocket size={14} />
                <span>{isSubmitting ? '...' : 'Check App 🚀'}</span>
              </>
            )}
          </button>

          {/* Toggle Guide */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700 flex items-center gap-1 text-[11px] font-bold"
            title={isExpanded ? "Hide Guidelines" : "Show Guidelines"}
          >
            <span className="hidden sm:inline">Guide</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

      </div>

      {/* Expanded Instructions & Goals Body */}
      {isExpanded && challenge && (
        <div className="px-3 md:px-4 py-3 bg-slate-950/80 border-t border-slate-800/80 flex flex-col md:flex-row gap-3 justify-between items-start text-xs max-h-[40vh] overflow-y-auto">
          
          {/* Left: Markdown Instructions */}
          <div className="w-full md:flex-1 space-y-1.5">
            <div className="flex items-center gap-2 font-extrabold text-emerald-300">
              <BookOpen size={14} />
              <span>Class Guidelines &amp; Concepts:</span>
            </div>
            <div className="text-slate-300 leading-relaxed font-medium bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 whitespace-pre-line text-[11px] sm:text-xs">
              {challenge.instructions_markdown || 'Design your mobile app components and attach events to earn your badge!'}
            </div>
          </div>

          {/* Right: Live Criteria Checklist */}
          <div className="w-full md:w-64 shrink-0 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5 font-black text-emerald-400 text-[10px] uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <ListOrdered size={13} />
                <span>Criteria Checklist</span>
              </div>
              <span>{criteriaResults.filter(c => c.passed).length}/{criteriaResults.length || 2} Passed</span>
            </div>

            <div className="space-y-1">
              {criteriaResults.length > 0 ? (
                criteriaResults.map((result, idx) => (
                  <div
                    key={idx}
                    className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center justify-between gap-1.5 transition-all ${
                      result.passed
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <span className="truncate">{result.criterion}</span>
                    {result.passed ? (
                      <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle size={12} className="text-slate-600 shrink-0" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-slate-400 italic py-0.5">
                  Click &quot;Check App&quot; to test your mobile app against goals!
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
