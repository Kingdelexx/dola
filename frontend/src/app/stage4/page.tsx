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
import FeedbackModal from '@/components/FeedbackModal';
import LizzyChat from '@/components/LizzyChat';

import { usePythonStageStore } from './store/usePythonStageStore';
import { pythonLevels, getChapterLevels } from './data/pythonLevels';
import { translatePythonError } from './utils/errorTranslator';
import InstructionCarousel from './components/InstructionCarousel';
import ChapterZeroView from './components/ChapterZeroView';
import { useAuth } from '@/context/AuthContext';

export default function Stage4Page() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.profile?.role === 'parent') {
        router.push('/parent-dashboard');
      }
    }
  }, [user, loading, router]);
  
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
  const [mobileTab, setMobileTab] = useState<'quest' | 'code'>('code');

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

    setStdout(result.stdout || (result.success ? '[Success - Execution completed!]' : ''));

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
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-purple-50/40 to-sky-50/80 text-slate-900 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* HUD Header */}
      <header className="h-16 border-b-4 border-purple-200/80 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 px-3 sm:px-6 flex items-center justify-between z-30 shrink-0 sticky top-0 text-white shadow-lg">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link 
            href="/dashboard" 
            className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="h-6 w-px bg-white/30"></div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-lg sm:text-xl">🐍</span>
            <h1 className="text-xs sm:text-sm font-black tracking-widest text-white uppercase hidden xs:block">
              <span className="hidden md:inline">World 4: Python Quest</span>
              <span className="inline md:hidden">World 4</span>
            </h1>
          </div>
        </div>

        {/* Global HUD panel */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-white/20 backdrop-blur-md border border-white/40 px-3 sm:px-4 py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 text-xs font-black shadow-inner text-yellow-200">
            <Sparkles size={14} className="text-yellow-300 animate-spin" />
            <span className="text-white/80 hidden sm:inline">XP:</span>
            <span className="text-yellow-300 font-extrabold">{xp}</span>
          </div>
          
          <div className="bg-white/20 backdrop-blur-md border border-white/40 px-3 sm:px-4 py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 text-xs font-black shadow-inner text-amber-200">
            <Key size={14} className="text-amber-300" />
            <span className="text-white/80 hidden sm:inline">Keys:</span>
            <span className="text-amber-300 font-extrabold">{hintTokens}</span>
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
            className="p-2 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </header>

      <div className="lg:hidden grid grid-cols-2 border-b-2 border-purple-200 bg-white/90 p-1 text-center text-slate-700 sticky top-16 z-20">
        <button
          onClick={() => setMobileTab('quest')}
          className={`py-2 text-[11px] font-black uppercase rounded-lg transition-all ${
            mobileTab === 'quest' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-purple-50 hover:text-slate-900'
          }`}
        >
          Quest Log
        </button>
        <button
          onClick={() => setMobileTab('code')}
          className={`py-2 text-[11px] font-black uppercase rounded-lg transition-all ${
            mobileTab === 'code' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-purple-50 hover:text-slate-900'
          }`}
        >
          Editor
        </button>
      </div>

      {/* Main Layout Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Chapter & Quest Log */}
        <section className={`w-80 border-r-2 border-purple-200 bg-white/80 backdrop-blur-md p-4 overflow-y-auto flex-col gap-4 custom-scrollbar shrink-0 shadow-lg ${
          mobileTab === 'quest' ? 'flex w-full absolute inset-0 top-[105px] z-10 bg-amber-50' : 'hidden lg:flex'
        }`}>
          {/* Chapter Selector */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-purple-900 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen size={12} className="text-purple-600" /> Map Road Chapters
            </h4>
            <div className="grid grid-cols-6 gap-1.5">
              {Array.from(new Set(pythonLevels.map(l => l.chapter))).sort((a, b) => a - b).map((chapterNum) => {
                const isCurrent = currentChapterId === chapterNum;
                // Check if any level in this chapter is completed
                const chapterLevels = getChapterLevels(chapterNum);
                const isDone = chapterLevels.every(l => completedLevels.includes(l.id));

                return (
                  <button
                    key={chapterNum}
                    onClick={() => selectChapter(chapterNum)}
                    className={`h-9 rounded-xl font-black text-xs border-2 flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 border-purple-400 text-white shadow-md scale-105' 
                        : isDone
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                        : 'bg-purple-50 border-purple-100 text-purple-900 hover:bg-purple-100 font-bold'
                    }`}
                    title={chapterNum === 0 ? 'Tutorial Calibration' : `Chapter ${chapterNum}`}
                  >
                    {chapterNum}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-0.5 bg-purple-100"></div>

          {/* Quest Log & Story dialogue */}
          <div className="bg-white border-2 border-purple-200 p-4 rounded-[28px] space-y-3.5 shadow-md">
            <div className="flex items-center gap-2 text-purple-700 font-black text-xs tracking-wider uppercase">
              <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping"></span>
              <span>Active Quest</span>
            </div>
            
            {/* Story block */}
            <div className="bg-purple-50/80 p-3.5 rounded-2xl border border-purple-200 flex gap-2.5 items-start">
              <div className="text-2xl bg-white p-2 rounded-2xl border border-purple-200 shadow-sm shrink-0">🤖</div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-purple-800 uppercase tracking-wider">Rover the Guide</p>
                <p className="text-xs text-slate-800 leading-relaxed font-bold">{activeLevel.narrative}</p>
              </div>
            </div>

            {/* Objective instructions */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-purple-900 uppercase tracking-widest">Quest Objective</p>
              <p className="text-xs text-slate-900 leading-relaxed font-black bg-purple-50/80 p-3 rounded-2xl border border-purple-200">
                {activeLevel.instructions}
              </p>
            </div>
          </div>

          {/* Hint keys unlock area */}
          <div className="bg-white border-2 border-purple-200 p-4 rounded-[28px] space-y-3 shadow-md">
            <div className="flex justify-between items-center">
              <h5 className="text-[10px] font-black text-purple-900 uppercase tracking-widest flex items-center gap-1">
                <HelpCircle size={12} className="text-amber-500" /> Level Secrets
              </h5>
              <span className="text-[10px] font-black text-amber-700 flex items-center gap-0.5 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                {activeLevel.hints.length - currentLevelHintsCount} secrets left
              </span>
            </div>

            {/* Unlock Button */}
            {currentLevelHintsCount < activeLevel.hints.length ? (
              <button
                onClick={handleUnlockHint}
                disabled={hintTokens <= 0}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md border-2 border-amber-200 active:scale-95 transition-all cursor-pointer"
              >
                <Key size={14} />
                <span>Reveal Secret (Costs 1 Key)</span>
              </button>
            ) : (
              <div className="text-center text-[11px] text-emerald-800 font-black bg-emerald-100 border border-emerald-300 p-2 rounded-2xl">
                ✨ All secrets revealed for this level!
              </div>
            )}

            {/* Unlocked hints stack */}
            {currentLevelHintsCount > 0 && (
              <div className="space-y-2 pt-2 border-t border-purple-100">
                {activeLevel.hints.slice(0, currentLevelHintsCount).map((hint, i) => (
                  <div key={i} className="text-xs leading-relaxed text-amber-950 bg-amber-50 border border-amber-200 p-2.5 rounded-2xl flex items-start gap-2 font-bold shadow-sm">
                    <span className="text-[10px] bg-amber-300 text-amber-950 px-2 py-0.5 rounded-full font-black shrink-0">{i + 1}</span>
                    <p className="font-semibold">{hint}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Center Panel: Visualization Canvas & Code Editor OR Chapter 0 Web Page */}
        {activeLevel.chapter === 0 ? (
          <ChapterZeroView />
        ) : (
          <section className={`flex-1 flex flex-col p-4 overflow-y-auto gap-4 custom-scrollbar ${
            mobileTab === 'code' ? 'flex' : 'hidden lg:flex'
          }`}>
            {/* Active Level Nav bar */}
            <div className="flex justify-between items-center bg-white border-2 border-purple-200 px-5 py-3 rounded-full shrink-0 shadow-md">
              <button
                onClick={handlePrevLevel}
                disabled={pythonLevels.findIndex(l => l.id === activeLevel.id) === 0}
                className="p-2 hover:bg-purple-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-purple-900 font-black text-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">PREV</span>
              </button>
              <div className="text-center">
                <h2 className="text-sm font-black tracking-wider text-purple-950 uppercase">{activeLevel.title}</h2>
                <p className="text-[9px] font-mono text-purple-600 font-bold mt-0.5">ID: {activeLevel.id}</p>
              </div>
              <button
                onClick={handleNextLevel}
                disabled={pythonLevels.findIndex(l => l.id === activeLevel.id) === pythonLevels.length - 1}
                className="p-2 hover:bg-purple-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-purple-900 font-black text-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <span className="hidden sm:inline">NEXT</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* 1. Visual game board */}
            <GameCanvas 
              levelId={activeLevel.id} 
              codeOutput={stdout} 
              success={runState === 'success'} 
              isRunning={runState === 'running'}
            />

            {/* Pyodide engine mounting */}
            <PyodideRunner 
              ref={runnerRef} 
              onStatusChange={setRunnerStatus} 
            />

            {/* Interactive Instruction Carousel Card */}
            <InstructionCarousel level={activeLevel} />

            {/* Editor Action Bar */}
            <div className="flex gap-3 shrink-0">
              <button
                onClick={handleRunCode}
                disabled={runnerStatus !== 'ready' || runState === 'running'}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-slate-950 font-black text-xs tracking-widest uppercase rounded-2xl flex items-center justify-center gap-2 shadow-lg border-2 border-emerald-200 active:scale-95 transition-all cursor-pointer"
              >
                <Play size={16} fill="currentColor" />
                <span>
                  {runnerStatus === 'loading' 
                    ? 'Loading WASM Sandbox...' 
                    : runState === 'running' 
                    ? 'Executing Code...' 
                    : 'Execute Python Code 🚀'}
                </span>
              </button>
              
              <button
                onClick={() => updateCode(activeLevel.id, activeLevel.starterCode)}
                className="px-4 bg-white border-2 border-purple-200 hover:bg-purple-50 rounded-2xl text-purple-900 hover:text-purple-950 transition-colors shadow-md cursor-pointer font-bold"
                title="Reset starter code"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* 2. Custom CodeMirror Editor */}
            <PythonEditor
              code={userCode}
              onChange={(code) => updateCode(activeLevel.id, code)}
              snippets={activeLevel.scaffoldSnippets}
              type={activeLevel.type}
            />

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
                    <div className="font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed max-h-80 min-h-[140px] overflow-y-auto custom-scrollbar p-1">
                      {stdout}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}



      </main>

      {/* Completion feedback modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        stage={4}
        part={1}
        onClose={handleFeedbackClose}
      />

      {/* Lizzy AI Tutor Floating Chatbox */}
      <LizzyChat 
        stage={4} 
        level={currentLevelId} 
        contextInfo={`Stage 4 Python Quest. Level ${activeLevel.id} (${activeLevel.title}). Chapter ${activeLevel.chapter}. Instructions: ${activeLevel.instructions}. Starter Code: "${activeLevel.starterCode}". Current Student Code: "${codeState[activeLevel.id] || activeLevel.starterCode}". ${executionError ? `Terminal Error: ${executionError.message}` : ''}`} 
      />
    </div>
  );
}
