'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, RotateCcw, Lightbulb, CheckCircle2, Award, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { BANANA_LEVELS } from './levels';
import { BananaLevel, GameAction } from './types';
import { interpretMonkeyPython, countCodeLines } from './interpreter';
import { BananaTalesCanvas } from './BananaTalesCanvas';
import { CodeEditor, CodeEditorHandle } from './CodeEditor';
import { VictoryModal } from './VictoryModal';
import { playAppSound } from '../app-studio/audioSynth';

export default function BananaTalesGame() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const currentLevel: BananaLevel = BANANA_LEVELS[currentLevelIndex] || BANANA_LEVELS[0];

  // Code state
  const [code, setCode] = useState(currentLevel.starterCode);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);

  // Execution & Engine state
  const [isRunning, setIsRunning] = useState(false);
  const [actionQueue, setActionQueue] = useState<GameAction[]>([]);
  const [bananasCollected, setBananasCollected] = useState(0);

  // Victory modal & level progress state
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [levelStars, setLevelStars] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [showHint, setShowHint] = useState(false);

  // Reference to code editor for inserting chips at cursor
  const editorRef = useRef<CodeEditorHandle>(null);

  // Load starter code and reset state when switching levels
  useEffect(() => {
    setCode(currentLevel.starterCode);
    setErrorMsg(null);
    setErrorLine(null);
    setIsRunning(false);
    setActionQueue([]);
    setBananasCollected(0);
    setIsVictoryModalOpen(false);
    setShowHint(false);
  }, [currentLevelIndex]);

  // Command reference chips to insert at cursor
  const commandChips = [
    { label: 'monkey.step(1)', snippet: 'monkey.step(1)' },
    { label: 'monkey.step(2)', snippet: 'monkey.step(2)' },
    { label: 'monkey.turn("left")', snippet: 'monkey.turn("left")' },
    { label: 'monkey.turn("right")', snippet: 'monkey.turn("right")' },
    { label: 'monkey.turn("down")', snippet: 'monkey.turn("down")' },
    { label: 'monkey.turn("up")', snippet: 'monkey.turn("up")' },
    { label: 'for i in range(3):', snippet: 'for i in range(3):\n    monkey.step(1)' },
    { label: 'monkey.jump()', snippet: 'monkey.jump()' },
  ];

  const handleInsertSnippet = (snippet: string) => {
    try {
      playAppSound('click');
    } catch {}
    editorRef.current?.insertSnippet(snippet);
  };

  // Run Button Handler
  const handleRunCode = () => {
    if (isRunning) return;
    setErrorMsg(null);
    setErrorLine(null);

    const parseResult = interpretMonkeyPython(code);
    if (parseResult.error) {
      setErrorMsg(parseResult.error);
      setErrorLine(parseResult.errorLine);
      try {
        playAppSound('boing');
      } catch {}
      return;
    }

    if (parseResult.actions.length === 0) {
      setErrorMsg('No monkey actions to run! Try typing monkey.step(1)');
      return;
    }

    try {
      playAppSound('click');
    } catch {}

    setActionQueue(parseResult.actions);
    setIsRunning(true);
  };

  // Reset Button Handler
  const handleReset = () => {
    setIsRunning(false);
    setActionQueue([]);
    setBananasCollected(0);
    setErrorMsg(null);
    setErrorLine(null);
    setIsVictoryModalOpen(false);
    try {
      playAppSound('click');
    } catch {}
  };

  // Handle Level Completion from Canvas
  const handleExecutionComplete = (success: boolean, collectedCount: number) => {
    setIsRunning(false);
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

      // Open victory modal
      setTimeout(() => {
        setIsVictoryModalOpen(true);
      }, 500);
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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F5EFEB] text-[#263238] font-fredoka select-none">
      
      {/* ==============================================================
          TOP BAR: Game Title, Level Selector Pills, 3-Star Score Indicator
          ============================================================== */}
      <header className="h-16 px-4 md:px-6 bg-[#FAF6EE] border-b-2 border-[#D7CCC8] shadow-sm flex items-center justify-between shrink-0 z-20">
        
        {/* Left: Back to Dashboard & Game Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="btn-arcade btn-arcade-parchment px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-[#5D4037]"
            title="Return to Dashboard"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div className="h-6 w-0.5 bg-[#D7CCC8] mx-1 hidden sm:block"></div>

          {/* Game Brand with Vector Golden Banana SVG */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF9C4] border-2 border-[#FFD54F] flex items-center justify-center shadow-xs">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
                <h1 className="text-base md:text-lg font-bold tracking-tight text-[#263238] leading-none">
                  Banana Tales
                </h1>
                <span className="bg-[#7CB342] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden md:inline-block">
                  Python Jungle
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#8D6E63] hidden sm:block">
                World 3 • Code the Monkey Adventure
              </p>
            </div>
          </div>
        </div>

        {/* Center: Level Selector Pills (Levels 1–5) */}
        <div className="flex items-center gap-1.5 bg-[#F5EFEB] p-1.5 rounded-2xl border-2 border-[#E0D7C6]">
          {BANANA_LEVELS.map((lvl, idx) => {
            const isActive = idx === currentLevelIndex;
            const stars = levelStars[lvl.id] || 0;
            return (
              <button
                key={lvl.id}
                onClick={() => {
                  if (!isRunning) setCurrentLevelIndex(idx);
                }}
                disabled={isRunning}
                className={`relative px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  isActive
                    ? 'btn-arcade btn-arcade-mango shadow-sm scale-105'
                    : 'bg-[#FAF6EE] text-[#5D4037] hover:bg-white border border-[#D7CCC8]'
                }`}
              >
                <span>L{lvl.id}</span>
                {stars > 0 && (
                  <span className={`text-[10px] ${isActive ? 'text-white' : 'text-[#FF9800]'}`}>
                    {'★'.repeat(stars)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: 3-Star Score Indicator & Hint Button */}
        <div className="flex items-center gap-3">
          {/* 3-Star Score Indicator */}
          <div className="flex items-center gap-1 bg-[#F5EFEB] px-2.5 py-1.5 rounded-2xl border-2 border-[#E0D7C6]">
            {[1, 2, 3].map((starIdx) => {
              const isFilled = starIdx <= currentLevelEarnedStars;
              return (
                <svg
                  key={starIdx}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={isFilled ? 'drop-shadow-xs' : 'opacity-35'}
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

          {/* Hint Toggle Button */}
          <button
            onClick={() => setShowHint(!showHint)}
            className={`btn-arcade px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 ${
              showHint ? 'btn-arcade-green' : 'btn-arcade-parchment'
            }`}
            title="Toggle Level Hint"
          >
            <Lightbulb size={15} />
            <span className="hidden md:inline">Hint</span>
          </button>
        </div>

      </header>

      {/* Optional Hint Dropdown Banner */}
      {showHint && (
        <div className="bg-[#FFF9C4] border-b-2 border-[#FFD54F] px-6 py-2.5 flex items-center justify-between text-xs font-bold text-[#5D4037] animate-in slide-in-from-top-2">
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
          MAIN WORKSPACE: Left Panel (55% width) + Right Panel (45% width)
          ============================================================== */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-3 gap-3">
        
        {/* ============================================================
            LEFT PANEL (55% width): 60fps HTML5 Canvas Game Stage
            ============================================================ */}
        <section className="w-full md:w-[55%] h-full flex flex-col bg-[#FAF6EE] rounded-3xl border-2 border-[#D7CCC8] shadow-sm overflow-hidden">
          
          {/* Canvas Sub-Header */}
          <div className="h-11 px-4 border-b-2 border-[#E0D7C6] bg-[#FAF6EE] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7CB342]">
                Stage: {currentLevel.title}
              </span>
              <span className="text-xs text-[#8D6E63]">•</span>
              <span className="text-xs font-semibold text-[#8D6E63]">
                {currentLevel.subtitle}
              </span>
            </div>

            <div className="text-xs font-bold text-[#FF8F00] flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Target: {currentLevel.bananas.length} Banana{currentLevel.bananas.length > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-[#EFE8DC]/50">
            <BananaTalesCanvas
              level={currentLevel}
              actionQueue={actionQueue}
              isRunning={isRunning}
              onExecutionComplete={handleExecutionComplete}
              onReset={handleReset}
            />
          </div>

        </section>

        {/* ============================================================
            RIGHT PANEL (45% width): Python Code Editor & Command Reference
            ============================================================ */}
        <section className="w-full md:w-[45%] h-full flex flex-col bg-[#FAF6EE] rounded-3xl border-2 border-[#D7CCC8] shadow-sm overflow-hidden">
          
          {/* Code Editor Header */}
          <div className="h-11 px-4 border-b-2 border-[#E0D7C6] bg-[#FAF6EE] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5D4037]">
                Python Code Editor
              </span>
              <span className="bg-[#E0D7C6] text-[#5D4037] text-[10px] font-bold px-2 py-0.5 rounded-full">
                Target: ≤ {currentLevel.optimalLines} lines
              </span>
            </div>

            {errorMsg && (
              <span className="text-xs font-bold text-red-600 truncate max-w-[200px]" title={errorMsg}>
                ⚠️ {errorMsg}
              </span>
            )}
          </div>

          {/* Line-Numbered Editor Area */}
          <div className="flex-1 p-3 overflow-hidden flex flex-col min-h-0">
            <CodeEditor
              ref={editorRef}
              value={code}
              onChange={(newCode) => {
                setCode(newCode);
                if (errorMsg) {
                  setErrorMsg(null);
                  setErrorLine(null);
                }
              }}
              errorLine={errorLine}
              readOnly={isRunning}
            />
          </div>

          {/* "Command Reference" Helper Bar at Bottom */}
          <div className="p-3 bg-[#F5EFEB] border-t-2 border-[#E0D7C6] shrink-0">
            <div className="text-[11px] font-bold text-[#8D6E63] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Command Reference (Click to insert at cursor)</span>
              <span className="text-[10px] text-[#7CB342] font-semibold">Ready to Code</span>
            </div>

            {/* Clickable Command Reference Chips */}
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar pb-1">
              {commandChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleInsertSnippet(chip.snippet)}
                  disabled={isRunning}
                  className="chip-command"
                  title={`Insert ${chip.snippet}`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Chunky RUN / RESET Physical Arcade Buttons */}
            <div className="mt-3 flex items-center gap-3 pt-2 border-t border-[#E0D7C6]">
              {/* RUN BUTTON: Juicy Mango-Orange */}
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex-1 py-3 px-6 rounded-2xl btn-arcade btn-arcade-mango text-sm md:text-base font-bold flex items-center justify-center gap-2"
              >
                <Play size={18} className={isRunning ? 'animate-spin' : 'fill-white'} />
                <span>{isRunning ? 'RUNNING...' : 'RUN CODE'}</span>
              </button>

              {/* RESET BUTTON: Tactile Warm Cream / Slate */}
              <button
                onClick={handleReset}
                className="py-3 px-5 rounded-2xl btn-arcade btn-arcade-parchment text-sm font-bold flex items-center justify-center gap-1.5 text-[#5D4037]"
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

    </div>
  );
}
