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
  ChevronUp
} from 'lucide-react';

export interface MissionData {
  slug: string;
  title: string;
  stage_order: number;
  instructions_markdown: string;
  starter_html: string;
  starter_css: string;
  solution_criteria: {
    required_tags?: string[];
    required_classes?: string[];
    required_css_rules?: string[];
  };
  reward_xp: number;
}

export const ALL_MISSIONS: { slug: string; title: string; stage: string; xp: number }[] = [
  { slug: 'secret-agent-id-badge', title: '01. Secret Agent ID Badge', stage: 'Stage 1: HTML Basics', xp: 50 },
  { slug: 'adopt-an-alien-pet', title: '02. Adopt an Alien Pet', stage: 'Stage 1: HTML Basics', xp: 50 },
  { slug: 'ice-cream-sundae-builder', title: '03. Ice Cream Sundae Builder', stage: 'Stage 1: HTML Basics', xp: 50 },
  { slug: 'rocket-launch-button', title: '04. Rocket Launch Button', stage: 'Stage 1: HTML Basics', xp: 50 },
  { slug: 'cyberpunk-neon-sign', title: '05. Cyberpunk Neon Sign', stage: 'Stage 2: CSS Magic', xp: 60 },
  { slug: 'space-porthole-window', title: '06. Space Capsule Window', stage: 'Stage 2: CSS Magic', xp: 60 },
  { slug: 'mood-ring-gradient', title: '07. Mood Ring Gradient Card', stage: 'Stage 2: CSS Magic', xp: 70 },
  { slug: 'hovering-power-button', title: '08. Hovering Super Button', stage: 'Stage 3: Interactive', xp: 80 },
  { slug: 'zero-gravity-astronaut', title: '09. Zero-Gravity Float', stage: 'Stage 3: Interactive', xp: 90 },
  { slug: 'monster-battle-card-capstone', title: '10. Monster Battle Capstone', stage: 'Stage 3: Capstone', xp: 100 },
];

interface MissionInstructionPanelProps {
  currentSlug: string;
  challenge: MissionData | null;
  criteriaResults: { criterion: string; passed: boolean }[];
  isCompleted: boolean;
  onSelectMission: (slug: string) => void;
  onSubmitMission: () => void;
  isSubmitting: boolean;
}

export default function MissionInstructionPanel({
  currentSlug,
  challenge,
  criteriaResults,
  isCompleted,
  onSelectMission,
  onSubmitMission,
  isSubmitting
}: MissionInstructionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default on mobile for extra editor room
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const currentIndex = ALL_MISSIONS.findIndex(m => m.slug === currentSlug);
  const activeMissionInfo = ALL_MISSIONS[currentIndex] || ALL_MISSIONS[0];

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectMission(ALL_MISSIONS[currentIndex - 1].slug);
    }
  };

  const handleNext = () => {
    if (currentIndex < ALL_MISSIONS.length - 1) {
      onSelectMission(ALL_MISSIONS[currentIndex + 1].slug);
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800/90 text-slate-100 transition-all select-none">
      {/* Top Main Bar */}
      <div className="px-3 md:px-4 py-2 flex flex-wrap items-center justify-between gap-2 bg-slate-900/95">
        
        {/* Left: Mission Level Selector Dropdown */}
        <div className="flex items-center gap-1.5 max-w-full">
          <div className="relative">
            <button
              onClick={() => setIsSelectorOpen(!isSelectorOpen)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 rounded-xl text-xs font-black text-amber-300 flex items-center gap-1.5 transition-all shadow-sm active:scale-95 max-w-[200px] sm:max-w-xs"
            >
              <Trophy size={14} className="text-amber-400 shrink-0" />
              <span className="truncate">{activeMissionInfo.title}</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1 py-0.2 rounded font-bold shrink-0 hidden sm:inline">
                +{activeMissionInfo.xp}XP
              </span>
              <ChevronDown size={14} className={`transition-transform text-slate-400 shrink-0 ${isSelectorOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Selector Dropdown Menu */}
            {isSelectorOpen && (
              <div className="absolute top-full left-0 mt-2 z-50 w-[88vw] sm:w-72 bg-slate-900 border-2 border-slate-700/80 rounded-2xl shadow-2xl p-2 max-h-80 overflow-y-auto divide-y divide-slate-800">
                {ALL_MISSIONS.map((m) => (
                  <button
                    key={m.slug}
                    onClick={() => {
                      onSelectMission(m.slug);
                      setIsSelectorOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 my-0.5 ${
                      m.slug === currentSlug
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="truncate">
                      <span className="block truncate">{m.title}</span>
                      <span className={`text-[10px] ${m.slug === currentSlug ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                        {m.stage}
                      </span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-black shrink-0 ${
                      m.slug === currentSlug ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-400'
                    }`}>
                      +{m.xp} XP
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Level Navigation Prev / Next */}
          <div className="flex items-center gap-0.5 bg-slate-950/60 p-0.5 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Previous Mission"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-1 font-bold">
              {currentIndex + 1}/{ALL_MISSIONS.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === ALL_MISSIONS.length - 1}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Next Mission"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Right: Submit Button & Toggle Instructions */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Submit Mission Button */}
          <button
            onClick={onSubmitMission}
            disabled={isSubmitting}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-md active:scale-95 ${
              isCompleted
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/20'
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
                <span>{isSubmitting ? '...' : 'Submit'}</span>
              </>
            )}
          </button>

          {/* Toggle Instructions Panel */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700 flex items-center gap-1 text-[11px] font-bold"
            title={isExpanded ? "Hide Goal Guidelines" : "Show Goal Guidelines"}
          >
            <span className="hidden sm:inline">Goals</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

      </div>

      {/* Expanded Instructions & Goals Body */}
      {isExpanded && challenge && (
        <div className="px-3 md:px-4 py-3 bg-slate-950/80 border-t border-slate-800/80 flex flex-col md:flex-row gap-3 justify-between items-start text-xs max-h-[40vh] overflow-y-auto">
          
          {/* Left: Markdown Instructions */}
          <div className="w-full md:flex-1 space-y-1.5">
            <div className="flex items-center gap-2 font-extrabold text-amber-300">
              <BookOpen size={14} />
              <span>Mission Goal Guidelines:</span>
            </div>
            <div className="text-slate-300 leading-relaxed font-medium bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 whitespace-pre-line text-[11px] sm:text-xs">
              {challenge.instructions_markdown || 'Complete the code on the left to fulfill the mission requirements!'}
            </div>
          </div>

          {/* Right: Live Criteria Checklist */}
          <div className="w-full md:w-64 shrink-0 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5 font-black text-amber-400 text-[10px] uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <ListOrdered size={13} />
                <span>Checklist</span>
              </div>
              <span>{criteriaResults.filter(c => c.passed).length}/{criteriaResults.length || 3} Passed</span>
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
                  Click &quot;Submit&quot; or type code to check goals live!
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
