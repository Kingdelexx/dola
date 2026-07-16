'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Sparkles, Key, Play, RotateCcw, HelpCircle, 
  CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Terminal, Award
} from 'lucide-react';

import PythonEditor from '@/components/PythonEditor';
import PyodideRunner from '@/components/PyodideRunner';
import GameCanvas from '@/components/GameCanvas';
import AIChat from '@/components/AIChat';
import FeedbackModal from '@/components/FeedbackModal';

import { usePythonStageStore } from './store/usePythonStageStore';
import { pythonLevels, getChapterLevels } from './data/pythonLevels';
import { translatePythonError } from './utils/errorTranslator';

export default function Stage4Page() {
  const router = useRouter();
  
  // Zustand state
  const {
    currentChapterId,
    currentLevelId,
    xp,
    hintTokens,
    unlockedHints,
    codeState,
    completedLevels,
    isCompleted,
    initStore,
    selectLevel,
    selectChapter,
    updateCode,
    unlockHint,
    completeLevel,
    resetProgress
  } = usePythonStageStore();

  // Local UI states
  const [runnerStatus, setRunnerStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [stdout, setStdout] = useState('');
  const [executionError, setExecutionError] = useState<{ message: string; line: number | null } | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [runState, setRunState] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [mobileTab, setMobileTab] = useState<'quest' | 'code' | 'tutor'>('code');

  const runnerRef = useRef<any>(null);

  // Initialize store and load progress on mount
  useEffect(() => {
    initStore();
  }, []);

  const activeLevel = pythonLevels.find(l => l.id === currentLevelId) || pythonLevels[0];
  const userCode = codeState[activeLevel.id] ?? activeLevel.starterCode;

  // Run student code with assertion test cases
  const handleRunCode = async () => {
    if (!runnerRef.current || runnerStatus !== 'ready' || runState === 'running') return;
    
    setRunState('running');
    setStdout('');
    setExecutionError(null);

    // Run code with assertions
    const testCase = activeLevel.testCases[0]?.assertPython || '';
    const result = await runnerRef.current.runCode(userCode, testCase);

    setStdout(result.stdout || (result.success ? '[Success - Spell completed!]' : ''));

    if (result.success) {
      setRunState('success');
      // Complete level, awards XP and a hint token key!
      await completeLevel(activeLevel.id);
      
      // If final boss completed, trigger feedback modal
      if (activeLevel.id === 'ch10_l1') {
        setTimeout(() => setShowFeedbackModal(true), 3000);
      }
    } else {
      setRunState('failed');
      const translated = translatePythonError(result.rawError || 'Unknown exception');
      setExecutionError(translated);
    }
  };

  const handleNextLevel = () => {
    const currentIndex = pythonLevels.findIndex(l => l.id === activeLevel.id);
    if (currentIndex !== -1 && currentIndex < pythonLevels.length - 1) {
      const nextLevel = pythonLevels[currentIndex + 1];
      selectLevel(nextLevel.id);
      setRunState('idle');
      setStdout('');
      setExecutionError(null);
    }
  };

  const handlePrevLevel = () => {
    const currentIndex = pythonLevels.findIndex(l => l.id === activeLevel.id);
    if (currentIndex > 0) {
      const prevLevel = pythonLevels[currentIndex - 1];
      selectLevel(prevLevel.id);
      setRunState('idle');
      setStdout('');
      setExecutionError(null);
    }
  };

  const handleUnlockHint = () => {
    unlockHint(activeLevel.id);
  };

  const handleFeedbackClose = () => {
    setShowFeedbackModal(false);
    router.push('/dashboard');
  };

  const currentLevelHintsCount = unlockedHints[activeLevel.id] || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* HUD Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-30 shrink-0 sticky top-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link 
            href="/dashboard" 
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="h-6 w-px bg-slate-800"></div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-lg sm:text-xl">🐍</span>
            <h1 className="text-xs sm:text-sm font-black tracking-widest text-slate-200 uppercase hidden xs:block">
              <span className="hidden md:inline">World 4: Python Quest</span>
              <span className="inline md:hidden">World 4</span>
            </h1>
          </div>
        </div>

        {/* Global HUD panel */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-slate-900 border border-slate-850 px-2.5 sm:px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 sm:gap-2 text-xs font-black shadow-inner">
            <Sparkles size={14} className="text-yellow-400" />
            <span className="text-slate-400 hidden sm:inline">XP:</span>
            <span className="text-yellow-400">{xp}</span>
          </div>
          
          <div className="bg-slate-900 border border-slate-850 px-2.5 sm:px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 sm:gap-2 text-xs font-black shadow-inner">
            <Key size={14} className="text-amber-500" />
            <span className="text-slate-400 hidden sm:inline">Keys:</span>
            <span className="text-amber-500">{hintTokens}</span>
          </div>

          <button
            onClick={() => {
              if (confirm("Are you sure you want to reset your chapter progress? This cannot be undone.")) {
                resetProgress();
                setRunState('idle');
                setStdout('');
                setExecutionError(null);
              }
            }}
            title="Reset All Progress"
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-rose-400 transition-colors"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </header>

      {/* Mobile navigation tab strip */}
      <div className="lg:hidden grid grid-cols-3 border-b border-slate-800 bg-slate-950 p-1 text-center text-slate-400 sticky top-16 z-20">
        <button
          onClick={() => setMobileTab('quest')}
          className={`py-2 text-[11px] font-black uppercase rounded-lg transition-all ${
            mobileTab === 'quest' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' : 'hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          Quest Log
        </button>
        <button
          onClick={() => setMobileTab('code')}
          className={`py-2 text-[11px] font-black uppercase rounded-lg transition-all ${
            mobileTab === 'code' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' : 'hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setMobileTab('tutor')}
          className={`py-2 text-[11px] font-black uppercase rounded-lg transition-all ${
            mobileTab === 'tutor' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' : 'hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          AI Tutor
        </button>
      </div>

      {/* Main Layout Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Chapter & Quest Log */}
        <section className={`w-80 border-r border-slate-800 bg-slate-950/70 p-4 overflow-y-auto flex-col gap-4 custom-scrollbar shrink-0 ${
          mobileTab === 'quest' ? 'flex w-full absolute inset-0 top-[105px] z-10 bg-slate-950' : 'hidden lg:flex'
        }`}>
          {/* Chapter Selector */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen size={12} /> Map Road Chapters
            </h4>
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 10 }).map((_, i) => {
                const chapterNum = i + 1;
                const isCurrent = currentChapterId === chapterNum;
                // Check if any level in this chapter is completed
                const chapterLevels = getChapterLevels(chapterNum);
                const isDone = chapterLevels.every(l => completedLevels.includes(l.id));

                return (
                  <button
                    key={chapterNum}
                    onClick={() => selectChapter(chapterNum)}
                    className={`h-9 rounded-xl font-black text-xs border flex items-center justify-center transition-all ${
                      isCurrent 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-650/20' 
                        : isDone
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-900 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                    }`}
                    title={`Chapter ${chapterNum}`}
                  >
                    {chapterNum}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-slate-800"></div>

          {/* Quest Log & Story dialogue */}
          <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-3xl space-y-3.5 shadow-lg">
            <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs tracking-wider uppercase">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
              <span>Active Quest</span>
            </div>
            
            {/* Story block */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-900 flex gap-2.5 items-start">
              <div className="text-2xl bg-indigo-950 p-2 rounded-xl border border-indigo-500/20">🤖</div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Rover the Guide</p>
                <p className="text-xs text-slate-200 leading-relaxed font-semibold">{activeLevel.narrative}</p>
              </div>
            </div>

            {/* Objective instructions */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quest Objective</p>
              <p className="text-xs text-slate-300 leading-relaxed font-bold bg-slate-950/40 p-3 rounded-2xl border border-slate-850">
                {activeLevel.instructions}
              </p>
            </div>
          </div>

          {/* Hint keys unlock area */}
          <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-3xl space-y-3 shadow-lg">
            <div className="flex justify-between items-center">
              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <HelpCircle size={12} /> Level Secrets
              </h5>
              <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">
                {activeLevel.hints.length - currentLevelHintsCount} secrets left
              </span>
            </div>

            {/* Unlock Button */}
            {currentLevelHintsCount < activeLevel.hints.length ? (
              <button
                onClick={handleUnlockHint}
                disabled={hintTokens <= 0}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-900/10 active:scale-95 transition-all"
              >
                <Key size={13} />
                <span>Reveal Secret (Costs 1 Key)</span>
              </button>
            ) : (
              <div className="text-center text-[11px] text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-900/20 p-2 rounded-xl">
                ✨ All secrets revealed for this level!
              </div>
            )}

            {/* Unlocked hints stack */}
            {currentLevelHintsCount > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-850">
                {activeLevel.hints.slice(0, currentLevelHintsCount).map((hint, i) => (
                  <div key={i} className="text-xs leading-relaxed text-amber-200 bg-amber-950/20 border border-amber-900/20 p-2.5 rounded-xl flex items-start gap-2">
                    <span className="text-[10px] bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/40 text-amber-400 font-extrabold">{i + 1}</span>
                    <p className="font-semibold">{hint}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Center Panel: Visualization Canvas & Code Editor */}
        <section className={`flex-1 flex flex-col p-4 overflow-y-auto gap-4 custom-scrollbar ${
          mobileTab === 'code' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Active Level Nav bar */}
          <div className="flex justify-between items-center bg-slate-900 border border-slate-850 px-4 py-2.5 rounded-3xl shrink-0">
            <button
              onClick={handlePrevLevel}
              disabled={pythonLevels.findIndex(l => l.id === activeLevel.id) === 0}
              className="p-2 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-slate-300 font-black text-xs flex items-center gap-1 transition-all"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">PREV</span>
            </button>
            <div className="text-center">
              <h2 className="text-xs font-black tracking-wider text-slate-100 uppercase">{activeLevel.title}</h2>
              <p className="text-[9px] font-mono text-slate-500 mt-0.5">ID: {activeLevel.id}</p>
            </div>
            <button
              onClick={handleNextLevel}
              disabled={pythonLevels.findIndex(l => l.id === activeLevel.id) === pythonLevels.length - 1}
              className="p-2 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-slate-300 font-black text-xs flex items-center gap-1 transition-all"
            >
              <span className="hidden sm:inline">NEXT</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* 1. Visual game board */}
          <GameCanvas 
            levelId={activeLevel.id} 
            codeOutput={stdout} 
            success={runState === 'success'} 
          />

          {/* Pyodide engine mounting */}
          <PyodideRunner 
            ref={runnerRef} 
            onStatusChange={setRunnerStatus} 
          />

          {/* 2. Custom CodeMirror Editor */}
          <PythonEditor
            code={userCode}
            onChange={(code) => updateCode(activeLevel.id, code)}
            snippets={activeLevel.scaffoldSnippets}
            type={activeLevel.type}
          />

          {/* Editor Action Bar */}
          <div className="flex gap-3 shrink-0">
            <button
              onClick={handleRunCode}
              disabled={runnerStatus !== 'ready' || runState === 'running'}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:from-slate-800 disabled:to-slate-850 disabled:cursor-not-allowed text-slate-950 font-black text-xs tracking-widest uppercase rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 active:scale-95 transition-all"
            >
              <Play size={14} fill="currentColor" />
              <span>
                {runnerStatus === 'loading' 
                  ? 'Loading WASM Sandbox...' 
                  : runState === 'running' 
                  ? 'Executing Spell...' 
                  : 'Cast Python Spell (Run)'}
              </span>
            </button>
            
            <button
              onClick={() => updateCode(activeLevel.id, activeLevel.starterCode)}
              className="px-4 bg-slate-900 border border-slate-850 hover:bg-slate-800 rounded-2xl text-slate-300 hover:text-white transition-colors"
              title="Reset starter code"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          {/* Execution feedback log output */}
          <AnimatePresence mode="wait">
            {(stdout || executionError) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-slate-900/60 border border-slate-850 rounded-3xl p-4 space-y-2 shadow-xl shrink-0"
              >
                <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-1">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Terminal size={12} /> Execution Logs
                  </h4>
                  {runState === 'success' && (
                    <span className="text-[10px] text-emerald-400 font-black flex items-center gap-0.5">
                      <CheckCircle size={11} /> QUEST PASSED
                    </span>
                  )}
                  {runState === 'failed' && (
                    <span className="text-[10px] text-rose-400 font-black flex items-center gap-0.5">
                      <AlertCircle size={11} /> QUEST FAILED
                    </span>
                  )}
                </div>

                {/* Display friendly translated error box if present */}
                {executionError ? (
                  <div className="bg-rose-950/20 border border-rose-900/30 p-3 rounded-2xl text-rose-300 font-semibold text-xs leading-relaxed">
                    {executionError.message}
                  </div>
                ) : (
                  <div className="font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">
                    {stdout}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right Side: AI Companion chatbot */}
        <section className={`w-80 border-l border-slate-800 bg-slate-950/70 p-4 flex flex-col shrink-0 ${
          mobileTab === 'tutor' ? 'flex w-full absolute inset-0 top-[105px] z-10 bg-slate-950' : 'hidden lg:flex'
        }`}>
          <AIChat />
        </section>

      </main>

      {/* Completion feedback modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        stage={4}
        part={1}
        onClose={handleFeedbackClose}
      />
    </div>
  );
}
