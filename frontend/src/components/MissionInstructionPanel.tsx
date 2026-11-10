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
  Code2,
  Paintbrush,
  Zap,
  ShoppingCart,
  Compass
} from 'lucide-react';

export interface MissionData {
  slug: string;
  title: string;
  stage_order: number;
  instructions_markdown: string;
  starter_html: string;
  starter_css: string;
  starter_js?: string;
  solution_criteria: {
    required_tags?: string[];
    required_classes?: string[];
    required_css_rules?: string[];
    required_js_rules?: string[];
  };
  reward_xp: number;
}

export interface MissionItem {
  slug: string;
  title: string;
  classNum: number;
  className: string;
  isProject?: boolean;
  xp: number;
  icon: string;
}

export const ALL_MISSIONS: MissionItem[] = [
  // Class 1: Website Builder Island
  { slug: 'class-1-heading-island', title: '1.1 Island Title Beacon', classNum: 1, className: 'Class 1: Website Builder Island', xp: 50, icon: '🏝️' },
  { slug: 'class-1-story-paragraph', title: '1.2 Island Secret Story', classNum: 1, className: 'Class 1: Website Builder Island', xp: 50, icon: '📝' },
  { slug: 'class-1-picture-gallery', title: '1.3 Island Mascot Sticker', classNum: 1, className: 'Class 1: Website Builder Island', xp: 50, icon: '🖼️' },
  { slug: 'class-1-my-first-webpage', title: '1.4 Capstone: My First Webpage', classNum: 1, className: 'Class 1: Website Builder Island', isProject: true, xp: 100, icon: '🏆' },

  // Class 2: Colour Magic Kingdom
  { slug: 'class-2-colour-splash', title: '2.1 Castle Color Splash', classNum: 2, className: 'Class 2: Colour Magic Kingdom', xp: 60, icon: '🎨' },
  { slug: 'class-2-magic-borders', title: '2.2 Magic Borders & Shapes', classNum: 2, className: 'Class 2: Colour Magic Kingdom', xp: 60, icon: '🔮' },
  { slug: 'class-2-colourful-personal-website', title: '2.3 Capstone: My Colourful Personal Website', classNum: 2, className: 'Class 2: Colour Magic Kingdom', isProject: true, xp: 100, icon: '🏆' },

  // Class 3: Button Power City
  { slug: 'class-3-color-shifter', title: '3.1 Color Shifter Button', classNum: 3, className: 'Class 3: Button Power City', xp: 70, icon: '⚡' },
  { slug: 'class-3-treasure-revealer', title: '3.2 Secret Treasure Revealer', classNum: 3, className: 'Class 3: Button Power City', xp: 70, icon: '🔑' },
  { slug: 'class-3-interactive-birthday-website', title: '3.3 Capstone: Interactive Birthday Website', classNum: 3, className: 'Class 3: Button Power City', isProject: true, xp: 100, icon: '🎂' },

  // Class 4: My Online Shop
  { slug: 'class-4-shop-shelves', title: '4.1 Stocking The Store Shelves (₦)', classNum: 4, className: 'Class 4: My Online Shop', xp: 80, icon: '🛒' },
  { slug: 'class-4-my-first-online-store', title: '4.2 Capstone: My First Online Store', classNum: 4, className: 'Class 4: My Online Shop', isProject: true, xp: 120, icon: '🛍️' },

  // Class 5: Web Creator Challenge
  { slug: 'class-5-web-creator-challenge', title: '5.0 Capstone: Web Creator Challenge', classNum: 5, className: 'Class 5: Web Creator Challenge', isProject: true, xp: 150, icon: '🚀' },
];

export const CLASSES_LIST = [
  { num: 1, name: 'Website Builder Island', subtitle: 'HTML without memorising', icon: '🏝️', defaultSlug: 'class-1-heading-island', color: 'from-amber-500 to-orange-500' },
  { num: 2, name: 'Colour Magic Kingdom', subtitle: 'CSS through design', icon: '🎨', defaultSlug: 'class-2-colour-splash', color: 'from-pink-500 to-purple-500' },
  { num: 3, name: 'Button Power City', subtitle: 'JavaScript actions', icon: '⚡', defaultSlug: 'class-3-color-shifter', color: 'from-cyan-500 to-blue-500' },
  { num: 4, name: 'My Online Shop', subtitle: 'HTML, CSS & JS with Naira ₦', icon: '🛒', defaultSlug: 'class-4-shop-shelves', color: 'from-emerald-500 to-teal-500' },
  { num: 5, name: 'Web Creator Challenge', subtitle: 'Original responsive site', icon: '🚀', defaultSlug: 'class-5-web-creator-challenge', color: 'from-purple-500 to-indigo-600' },
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const currentIndex = ALL_MISSIONS.findIndex(m => m.slug === currentSlug);
  const activeMission = ALL_MISSIONS[currentIndex] || ALL_MISSIONS[0];

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
    <div className="bg-slate-900 border-b border-slate-800 text-slate-100 transition-all select-none">
      {/* Class Quick-Select Pills Bar */}
      <div className="px-3 md:px-5 py-1.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Compass size={12} className="text-amber-400" />
          <span>Classes:</span>
        </span>
        {CLASSES_LIST.map((cls) => {
          const isActive = activeMission.classNum === cls.num;
          return (
            <button
              key={cls.num}
              onClick={() => onSelectMission(cls.defaultSlug)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
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
        
        {/* Left: Mission Level Selector Dropdown */}
        <div className="flex items-center gap-1.5 max-w-full">
          <div className="relative">
            <button
              onClick={() => setIsSelectorOpen(!isSelectorOpen)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 rounded-xl text-xs font-black text-amber-300 flex items-center gap-1.5 transition-all shadow-sm active:scale-95 max-w-[220px] sm:max-w-xs"
            >
              <span className="text-sm">{activeMission.icon}</span>
              <span className="truncate">{activeMission.title}</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1 py-0.2 rounded font-bold shrink-0 hidden sm:inline">
                +{activeMission.xp}XP
              </span>
              <ChevronDown size={14} className={`transition-transform text-slate-400 shrink-0 ${isSelectorOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Selector Dropdown Menu grouped by Class */}
            {isSelectorOpen && (
              <div className="absolute top-full left-0 mt-2 z-50 w-[90vw] sm:w-80 bg-slate-900 border-2 border-slate-700/80 rounded-2xl shadow-2xl p-2 max-h-96 overflow-y-auto divide-y divide-slate-800/80">
                {CLASSES_LIST.map((cls) => {
                  const classMissions = ALL_MISSIONS.filter(m => m.classNum === cls.num);
                  return (
                    <div key={cls.num} className="py-1.5 first:pt-0 last:pb-0">
                      <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <span>{cls.icon}</span>
                        <span>Class {cls.num}: {cls.name}</span>
                      </div>
                      <div className="space-y-0.5 mt-0.5">
                        {classMissions.map((m) => (
                          <button
                            key={m.slug}
                            onClick={() => {
                              onSelectMission(m.slug);
                              setIsSelectorOpen(false);
                            }}
                            className={`w-full px-2.5 py-1.5 text-left rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 ${
                              m.slug === currentSlug
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <div className="truncate flex items-center gap-1.5">
                              <span className="text-xs">{m.icon}</span>
                              <span className="truncate">{m.title}</span>
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-black shrink-0 ${
                              m.slug === currentSlug ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-400'
                            }`}>
                              +{m.xp} XP
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
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
                <span>{isSubmitting ? '...' : 'Check Goal 🚀'}</span>
              </>
            )}
          </button>

          {/* Toggle Instructions Panel */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700 flex items-center gap-1 text-[11px] font-bold"
            title={isExpanded ? "Hide Instructions" : "Show Instructions"}
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
            <div className="flex items-center gap-2 font-extrabold text-amber-300">
              <BookOpen size={14} />
              <span>Lesson Guidelines:</span>
            </div>
            <div className="text-slate-300 leading-relaxed font-medium bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 whitespace-pre-line text-[11px] sm:text-xs">
              {challenge.instructions_markdown || 'Complete the interactive exercise to earn your badge!'}
            </div>
          </div>

          {/* Right: Live Criteria Checklist */}
          <div className="w-full md:w-64 shrink-0 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5 font-black text-amber-400 text-[10px] uppercase tracking-wider">
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
                  Click &quot;Check Goal&quot; or update code to test requirements!
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
