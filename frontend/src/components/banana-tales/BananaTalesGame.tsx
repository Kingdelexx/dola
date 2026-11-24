'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, RotateCcw, Lightbulb, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { BANANA_LEVELS } from './levels';
import { BananaLevel, GameAction } from './types';
import { executePythonWithSkulpt } from './skulptRunner';
import { countCodeLines } from './interpreter';
import { BananaTalesCanvas } from './BananaTalesCanvas';
import { CodeEditor, CodeEditorHandle } from './CodeEditor';
import { VictoryModal } from './VictoryModal';
import { RetryModal } from './RetryModal';
import { SoundFX } from './SoundFX';

export default function BananaTalesGame() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const currentLevel: BananaLevel = BANANA_LEVELS[currentLevelIndex] || BANANA_LEVELS[0];

  // Code state
  const [code, setCode] = useState(currentLevel.starterCode);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [jungleGuideAdvice, setJungleGuideAdvice] = useState<string | null>(null);
  const [activeLine, setActiveLine] = useState<number | null>(null);

  // Audio mute state (procedural Web Audio API)
  const [isMuted, setIsMuted] = useState(SoundFX.isMuted);

  // Execution & Engine state
  const [isRunning, setIsRunning] = useState(false);
  const [isExecutingPython, setIsExecutingPython] = useState(false);
  const [actionQueue, setActionQueue] = useState<GameAction[]>([]);
  const [bananasCollected, setBananasCollected] = useState(0);

  // Victory modal & level progress state
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [retryModalState, setRetryModalState] = useState<{
    isOpen: boolean;
    reason: 'water' | 'bush' | 'rock' | 'incomplete';
  } | null>(null);
  const [resetNonce, setResetNonce] = useState(0);
  const [levelStars, setLevelStars] = useState<Record<number, number>>(() =>
    Object.fromEntries(BANANA_LEVELS.map((lvl) => [lvl.id, 0]))
  );
  const [showHint, setShowHint] = useState(false);

  // Reference to code editor for inserting chips at cursor
  const editorRef = useRef<CodeEditorHandle>(null);

  // Load starter code and reset state when switching levels
  useEffect(() => {
    setCode(currentLevel.starterCode);
    setErrorMsg(null);
    setErrorLine(null);
    setJungleGuideAdvice(null);
    setActiveLine(null);
    setIsRunning(false);
    setIsExecutingPython(false);
    setActionQueue([]);
    setBananasCollected(0);
    setIsVictoryModalOpen(false);
    setShowHint(false);
  }, [currentLevelIndex]);

  // Command reference chips to insert at cursor
  const commandChips = [
    { label: 'monkey.step(1)', snippet: 'monkey.step(1)' },
    { label: 'monkey.step(2)', snippet: 'monkey.step(2)' },
    { label: 'monkey.step(4)', snippet: 'monkey.step(4)' },
    { label: 'monkey.turn("right")', snippet: 'monkey.turn("right")' },
    { label: 'monkey.turn("left")', snippet: 'monkey.turn("left")' },
    { label: 'monkey.jump()', snippet: 'monkey.jump()' },
    { label: 'bridge.extend(1)', snippet: 'bridge.extend(1)' },
    { label: 'bridge.extend(2)', snippet: 'bridge.extend(2)' },
    { label: 'bridge.extend(3)', snippet: 'bridge.extend(3)' },
    { label: 'for i in range(4):', snippet: 'for i in range(4):\n    monkey.step(1)\n    monkey.turn("right")' },
  ];

  const handleInsertSnippet = (snippet: string) => {
    SoundFX.playFootstep();
    editorRef.current?.insertSnippet(snippet);
  };

  const handleToggleMute = () => {
    const nextMuted = SoundFX.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      SoundFX.playFootstep();
    }
  };

  // Run Button Handler: Executes Python instantly via Skulpt, then plays back animationQueue at 60fps
  const handleRunCode = async () => {
    if (isRunning || isExecutingPython) return;
    setErrorMsg(null);
    setErrorLine(null);
    setJungleGuideAdvice(null);
    setActiveLine(null);
    setRetryModalState(null);
    setIsExecutingPython(true);

    try {
      // Execute Python code in Skulpt (non-blocking)
      const parseResult = await executePythonWithSkulpt(code);
      setIsExecutingPython(false);

      if (parseResult.error) {
        setErrorMsg(parseResult.error);
        setErrorLine(parseResult.errorLine);
        setJungleGuideAdvice(parseResult.errorAdvice || parseResult.error);
        SoundFX.playCollisionBonk();
        return;
      }

      if (parseResult.actions.length === 0) {
        setErrorMsg('No monkey actions');
        setJungleGuideAdvice('Oops! Your Python code ran, but the monkey has no actions to perform! Try typing monkey.step(1) or bridge.extend(1).');
        SoundFX.playCollisionBonk();
        return;
      }

      SoundFX.playFootstep();

      // Reset grid/monkey state cleanly right before playback
      setResetNonce(prev => prev + 1);

      // Queue actions for 60fps playback
      setActionQueue(parseResult.actions);
      setIsRunning(true);
    } catch (err: any) {
      setIsExecutingPython(false);
      const msg = err.message || 'Python execution error';
      setErrorMsg(msg);
      setJungleGuideAdvice(`Oops! Could not run your Python code: ${msg}`);
      SoundFX.playCollisionBonk();
    }
  };

  // Reset Button Handler
  const handleReset = () => {
    setIsRunning(false);
    setIsExecutingPython(false);
    setActionQueue([]);
    setBananasCollected(0);
    setErrorMsg(null);
    setErrorLine(null);
    setJungleGuideAdvice(null);
    setActiveLine(null);
    setIsVictoryModalOpen(false);
    setRetryModalState(null);
    setResetNonce(prev => prev + 1);
    SoundFX.playFootstep();
  };

  // Handle Level Completion from Canvas
  const handleExecutionComplete = (
    success: boolean, 
    collectedCount: number, 
    failureReason?: 'water' | 'bush' | 'rock' | 'incomplete'
  ) => {
    setIsRunning(false);
    setActiveLine(null);
    setBananasCollected(collectedCount);

    if (success && collectedCount >= currentLevel.bananas.length) {
      // Calculate stars based on lines of code used vs optimal lines
      const linesUsed = countCodeLines(code);
      let stars = 1;
      if (linesUsed <= currentLevel.optimalLines) {
        stars = 3;
      } else if (linesUsed <= currentLevel.optimalLines + 2) {
        stars = 2;
      }

      setLevelStars(prev => ({
        ...prev,
        [currentLevel.id]: Math.max(prev[currentLevel.id] || 0, stars)
      }));

      // Open celebratory victory modal
      setTimeout(() => {
        setIsVictoryModalOpen(true);
      }, 500);
    } else {
      // Trigger defeat/retry modal when monkey fails to clear the level or drowns/hits hazard
      const reason = failureReason || (collectedCount < currentLevel.bananas.length ? 'incomplete' : 'bush');
      setTimeout(() => {
        setRetryModalState({
          isOpen: true,
          reason
        });
      }, 350);
    }
  };

  const handleNextLevel = () => {
    if (currentLevelIndex < BANANA_LEVELS.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
    }
  };

  const handleReplay = () => {
    setIsVictoryModalOpen(false);
    handleReset();
  };

  const currentLevelEarnedStars = levelStars[currentLevel.id] || 0;

  return (
    <div className="flex flex-col min-h-screen md:h-screen w-full overflow-y-auto md:overflow-hidden bg-[#F5EFEB] text-[#263238] font-fredoka select-none">
      
      {/* ==============================================================
          TOP BAR: Game Title, Level Selector Pills, 3-Star Score Indicator, Sound Mute
          ============================================================== */}
      <header className="h-14 md:h-16 px-3 sm:px-4 md:px-6 bg-[#FAF6EE] border-b-2 border-[#D7CCC8] shadow-sm flex items-center justify-between shrink-0 z-20">
        
        {/* Left: Back to Dashboard & Game Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className="btn-arcade btn-arcade-parchment px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-[#5D4037]"
            title="Return to Dashboard"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div className="h-6 w-0.5 bg-[#D7CCC8] mx-1 hidden sm:block"></div>

          {/* Game Brand with Vector Golden Banana SVG */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FFF9C4] border-2 border-[#FFD54F] flex items-center justify-center shadow-xs shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 17C4 17 8 20 14 18C20 16 21 9 21 9C21 9 18 11 14 11C10 11 6 8 4 17Z"
                  fill="#FFC107"
                  stroke="#FF8F00"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="20" cy="9" r="1.5" fill="#5D4037" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-[#263238] leading-none">
                  Banana Tales
                </h1>
                <span className="bg-[#7CB342] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden md:inline-block">
                  Python Engine (Skulpt)
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#8D6E63] hidden sm:block">
                World 3 • 20-Level Python Curriculum (Stages 1–7 Guided, 8+ Pro Coder)
              </p>
            </div>
          </div>
        </div>

        {/* Center: Desktop Level Selector Pills (Levels 1–20 with Pro Coder Stars) */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#F5EFEB] p-1.5 rounded-2xl border-2 border-[#E0D7C6] max-w-xl overflow-x-auto scrollbar-none">
          {BANANA_LEVELS.map((lvl, idx) => {
            const isActive = idx === currentLevelIndex;
            const stars = levelStars[lvl.id] || 0;
            const isPro = lvl.id > 7;
            return (
              <button
                key={lvl.id}
                onClick={() => {
                  if (!isRunning && !isExecutingPython) setCurrentLevelIndex(idx);
                }}
                disabled={isRunning || isExecutingPython}
                title={isPro ? `${lvl.title} (Pro Coder: Type Your Own Code)` : lvl.title}
                className={`relative px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                  isActive
                    ? 'btn-arcade btn-arcade-mango shadow-sm scale-105'
                    : isPro
                    ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
                    : 'bg-[#FAF6EE] text-[#5D4037] hover:bg-white border border-[#D7CCC8]'
                }`}
              >
                <span>L{lvl.id}</span>
                {isPro && <span className="text-[9px]">⭐</span>}
                {stars > 0 && (
                  <span className={`text-[10px] ${isActive ? 'text-white' : 'text-[#FF9800]'}`}>
                    {'★'.repeat(stars)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: 3-Star Score Indicator, Web Audio Mute Toggle & Hint Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          {/* 3-Star Score Indicator */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-[#F5EFEB] px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border border-slate-300 sm:border-2 sm:border-[#E0D7C6]">
            {[1, 2, 3].map((starIdx) => {
              const isFilled = starIdx <= currentLevelEarnedStars;
              return (
                <svg
                  key={starIdx}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`${isFilled ? 'drop-shadow-xs' : 'opacity-35'} sm:w-[18px] sm:h-[18px]`}
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill={isFilled ? '#FFB300' : '#BCAAA4'}
                    stroke={isFilled ? '#E65100' : '#8D6E63'}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              );
            })}
          </div>

          {/* Procedural Web Audio Mute / Unmute Toggle Button */}
          <button
            onClick={handleToggleMute}
            className={`btn-arcade px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all ${
              isMuted
                ? 'bg-red-50 text-red-600 border border-red-200 border-b-4 border-b-red-400'
                : 'btn-arcade-parchment text-[#5D4037]'
            }`}
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {isMuted ? (
              <VolumeX size={15} className="text-red-500" />
            ) : (
              <Volume2 size={15} className="text-[#7CB342]" />
            )}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound'}</span>
          </button>

          {/* Hint Toggle Button */}
          <button
            onClick={() => setShowHint(!showHint)}
            className={`btn-arcade px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 ${
              showHint ? 'btn-arcade-green' : 'btn-arcade-parchment'
            }`}
            title="Toggle Level Hint"
          >
            <Lightbulb size={15} />
            <span className="hidden md:inline">Hint</span>
          </button>
        </div>

      </header>

      {/* Mobile-Only Level Selector Strip */}
      <div className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-[#FAF6EE] border-b-2 border-[#D7CCC8] overflow-x-auto scrollbar-none shrink-0 z-10 shadow-inner">
        {BANANA_LEVELS.map((lvl, idx) => {
          const isActive = idx === currentLevelIndex;
          const stars = levelStars[lvl.id] || 0;
          const isPro = lvl.id > 7;
          return (
            <button
              key={lvl.id}
              onClick={() => {
                if (!isRunning && !isExecutingPython) setCurrentLevelIndex(idx);
              }}
              disabled={isRunning || isExecutingPython}
              className={`relative px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                isActive
                  ? 'btn-arcade btn-arcade-mango shadow-sm scale-105'
                  : isPro
                  ? 'bg-amber-50 text-amber-900 border border-amber-300'
                  : 'bg-white text-[#5D4037] border border-[#D7CCC8]'
              }`}
            >
              <span>L{lvl.id}</span>
              {isPro && <span className="text-[9px]">⭐</span>}
              {stars > 0 && (
                <span className={`text-[10px] ${isActive ? 'text-white' : 'text-[#FF9800]'}`}>
                  {'★'.repeat(stars)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Optional Hint Dropdown Banner */}
      {showHint && (
        <div className="bg-[#FFF9C4] border-b-2 border-[#FFD54F] px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs font-bold text-[#5D4037] animate-in slide-in-from-top-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[#E65100] font-black">TIP:</span>
            <span>{currentLevel.hint}</span>
          </div>
          <button 
            onClick={() => setShowHint(false)}
            className="text-[#8D6E63] hover:text-[#263238] font-bold text-xs"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* ==============================================================
          MAIN WORKSPACE: Left Panel (Canvas) + Right Panel (Editor)
          ============================================================== */}
      <main className="flex-1 flex flex-col md:flex-row overflow-visible md:overflow-hidden p-2 sm:p-3 gap-3">
        
        {/* ============================================================
            LEFT PANEL: 60fps HTML5 Canvas Game Stage
            ============================================================ */}
        <section className="w-full md:w-[55%] h-[320px] sm:h-[390px] md:h-full shrink-0 flex flex-col bg-[#FAF6EE] rounded-2xl sm:rounded-3xl border-2 border-[#D7CCC8] shadow-sm overflow-hidden">
          
          {/* Canvas Sub-Header */}
          <div className="h-9 sm:h-11 px-3 sm:px-4 border-b-2 border-[#E0D7C6] bg-[#FAF6EE] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7CB342]">
                Stage: {currentLevel.title}
              </span>
              <span className="text-xs text-[#8D6E63] hidden sm:inline">•</span>
              <span className="text-xs font-semibold text-[#8D6E63] hidden sm:inline truncate">
                {currentLevel.subtitle}
              </span>
            </div>

            <div className="text-xs font-bold text-[#FF8F00] flex items-center gap-1.5 shrink-0">
              <Sparkles size={14} />
              <span>Target: {currentLevel.bananas.length} Banana{currentLevel.bananas.length > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Canvas Area with 60fps Animation & Real-Time Action Playback */}
          <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-[#EFE8DC]/50">
            <BananaTalesCanvas
              level={currentLevel}
              actionQueue={actionQueue}
              isRunning={isRunning}
              resetNonce={resetNonce}
              onExecutionComplete={handleExecutionComplete}
              onActiveLineChange={setActiveLine}
              onReset={handleReset}
            />
          </div>

        </section>

        {/* ============================================================
            RIGHT PANEL: Python Code Editor & Command Reference
            ============================================================ */}
        <section className="w-full md:w-[45%] min-h-[480px] md:min-h-0 md:h-full shrink-0 flex flex-col bg-[#FAF6EE] rounded-2xl sm:rounded-3xl border-2 border-[#D7CCC8] shadow-sm overflow-hidden">
          
          {/* Code Editor Header */}
          <div className="h-9 sm:h-11 px-3 sm:px-4 border-b-2 border-[#E0D7C6] bg-[#FAF6EE] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5D4037]">
                Python Code Editor
              </span>
              <span className="bg-[#E0D7C6] text-[#5D4037] text-[10px] font-bold px-2 py-0.5 rounded-full hidden sm:inline">
                Target: ≤ {currentLevel.optimalLines} lines
              </span>
              {currentLevel.id > 7 && (
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider flex items-center gap-1">
                  ⭐ Pro
                </span>
              )}
              {activeLine && (
                <span className="bg-[#FF9800] text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  Line {activeLine}
                </span>
              )}
            </div>

            {errorMsg && (
              <span className="text-xs font-bold text-red-600 truncate max-w-[140px] sm:max-w-[200px]" title={errorMsg}>
                ⚠️ {errorMsg}
              </span>
            )}
          </div>

          {/* Line-Numbered Editor Area with Real-Time Active Line Highlight */}
          <div className="flex-1 p-2 sm:p-3 overflow-hidden flex flex-col min-h-0">
            <CodeEditor
              ref={editorRef}
              value={code}
              onChange={(newCode) => {
                setCode(newCode);
                if (errorMsg) {
                  setErrorMsg(null);
                  setErrorLine(null);
                  setJungleGuideAdvice(null);
                }
              }}
              errorLine={errorLine}
              activeLine={activeLine}
              readOnly={isRunning || isExecutingPython}
            />
          </div>

          {/* ==========================================================
              KID-FRIENDLY "JUNGLE GUIDE" SPEECH BUBBLE BENEATH EDITOR
              ========================================================== */}
          {jungleGuideAdvice && (
            <div className="mx-3 mb-2 p-3 bg-[#FFFDF9] rounded-2xl border-2 border-[#FFB74D] shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
              {/* Cute Vector Monkey Guide Avatar */}
              <div className="w-10 h-10 rounded-2xl bg-[#FFE0B2] border-2 border-[#FF9800] flex items-center justify-center shrink-0 shadow-xs">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="5" cy="9" r="3" fill="#6D4C41" />
                  <circle cx="5" cy="9" r="1.5" fill="#FFAB91" />
                  <circle cx="19" cy="9" r="3" fill="#6D4C41" />
                  <circle cx="19" cy="9" r="1.5" fill="#FFAB91" />
                  <circle cx="12" cy="11" r="7" fill="#8D6E63" stroke="#5D4037" strokeWidth="1.2" />
                  <ellipse cx="12" cy="12" rx="4.5" ry="3.8" fill="#FFE0B2" />
                  <circle cx="10" cy="11" r="1" fill="#263238" />
                  <circle cx="14" cy="11" r="1" fill="#263238" />
                  <path d="M10.5 13.5Q12 15 13.5 13.5" stroke="#5D4037" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </div>

              {/* Speech Bubble Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#E65100]">Jungle Guide</span>
                    <span className="bg-[#FF9800]/15 text-[#E65100] text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Hint
                    </span>
                  </div>
                  <button
                    onClick={() => setJungleGuideAdvice(null)}
                    className="text-[#8D6E63] hover:text-[#263238] text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs font-semibold text-[#263238] mt-1 leading-relaxed">
                  {jungleGuideAdvice}
                </p>
              </div>
            </div>
          )}

          {/* "Command Reference" Helper Bar at Bottom */}
          <div className="p-2.5 sm:p-3 bg-[#F5EFEB] border-t-2 border-[#E0D7C6] shrink-0">
            <div className="text-[11px] font-bold text-[#8D6E63] uppercase tracking-wider mb-1.5 sm:mb-2 flex items-center justify-between">
              <span>Command Reference (Click to insert at cursor)</span>
              <span className="text-[10px] text-[#7CB342] font-semibold hidden sm:inline">Skulpt Python 3</span>
            </div>

            {/* Clickable Command Reference Chips */}
            <div className="flex flex-wrap gap-1 sm:gap-1.5 max-h-20 sm:max-h-24 overflow-y-auto no-scrollbar pb-1">
              {commandChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleInsertSnippet(chip.snippet)}
                  disabled={isRunning || isExecutingPython}
                  className="chip-command text-xs py-1 px-2 sm:px-2.5"
                  title={`Insert ${chip.snippet}`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Chunky RUN / RESET Physical Arcade Buttons */}
            <div className="mt-2.5 sm:mt-3 flex items-center gap-2.5 sm:gap-3 pt-2 border-t border-[#E0D7C6]">
              {/* RUN BUTTON: Juicy Mango-Orange */}
              <button
                onClick={handleRunCode}
                disabled={isRunning || isExecutingPython}
                className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl btn-arcade btn-arcade-mango text-xs sm:text-sm md:text-base font-bold flex items-center justify-center gap-2"
              >
                <Play size={17} className={(isRunning || isExecutingPython) ? 'animate-spin' : 'fill-white'} />
                <span>
                  {isExecutingPython ? 'COMPILING PYTHON...' : isRunning ? 'RUNNING...' : 'RUN CODE'}
                </span>
              </button>

              {/* RESET BUTTON: Tactile Warm Cream / Slate */}
              <button
                onClick={handleReset}
                className="py-2.5 sm:py-3 px-3.5 sm:px-5 rounded-xl sm:rounded-2xl btn-arcade btn-arcade-parchment text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 text-[#5D4037]"
                title="Reset Level"
              >
                <RotateCcw size={16} />
                <span>RESET</span>
              </button>
            </div>
          </div>

        </section>

      </main>

      {/* ==============================================================
          CELEBRATORY VICTORY MODAL WITH STAR RATINGS
          ============================================================== */}
      <VictoryModal
        isOpen={isVictoryModalOpen}
        levelId={currentLevel.id}
        levelTitle={currentLevel.title}
        linesUsed={countCodeLines(code)}
        optimalLines={currentLevel.optimalLines}
        bananasCollected={bananasCollected}
        totalBananas={currentLevel.bananas.length}
        onNextLevel={handleNextLevel}
        onReplay={handleReplay}
        hasNextLevel={currentLevelIndex < BANANA_LEVELS.length - 1}
      />

      {/* ==============================================================
          RETRY / DEFEAT MODAL ON WATER SINK OR HAZARD COLLISION
          ============================================================== */}
      <RetryModal
        isOpen={Boolean(retryModalState?.isOpen)}
        reason={retryModalState?.reason || 'water'}
        levelTitle={currentLevel.title}
        hint={currentLevel.hint}
        onRetry={handleReset}
      />

    </div>
  );
}
