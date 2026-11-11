'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';
import { 
  Play, 
  RotateCcw, 
  Save, 
  FolderOpen, 
  Share2, 
  HelpCircle, 
  Sparkles, 
  Code2, 
  Terminal, 
  ChevronRight, 
  Check, 
  CheckCircle2, 
  Zap,
  Flame,
  Shield,
  Layers,
  ArrowRight,
  Gauge
} from 'lucide-react';
import { playAppSound } from '../app-studio/audioSynth';
import PythonInstructionPanel, { PythonChallengeData, PYTHON_CLASSES } from './PythonInstructionPanel';
import PythonWorkspaceToolbar from './PythonWorkspaceToolbar';
import PythonGameCanvas, { GameAction } from './PythonGameCanvas';
import PythonTutorialModal from './PythonTutorialModal';
import PythonShareModal from './PythonShareModal';
import PythonSavedProjectsModal from './PythonSavedProjectsModal';
import { interpretPythonCode } from './pythonInterpreter';

// Dynamically import Monaco Editor to avoid SSR hydration issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-900 text-slate-400 font-mono text-sm">
      <div className="flex items-center gap-3">
        <Sparkles className="animate-spin text-purple-400" size={20} />
        <span>Loading Python Pro Studio...</span>
      </div>
    </div>
  ),
});

export default function PythonPlayground() {
  const [slug, setSlug] = useState('class-1-robo-motion');
  const [challenge, setChallenge] = useState<PythonChallengeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Code & Terminal
  const [code, setCode] = useState<string>('');
  const [consoleLogs, setConsoleLogs] = useState<{ id: string; msg: string; time: string; type: 'log' | 'error' | 'success' }[]>([]);

  // Game Engine & Animation
  const [actionQueue, setActionQueue] = useState<GameAction[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [gameResetCount, setGameResetCount] = useState<number>(0);

  // UI Modes & Modals
  const [mobileTab, setMobileTab] = useState<'canvas' | 'code' | 'terminal'>('canvas');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);

  // Status & Feedback
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [awardedXp, setAwardedXp] = useState<number | null>(null);

  // Monaco editor reference for inserting snippets at cursor
  const editorRef = useRef<any>(null);

  // Fetch challenge data
  const fetchChallenge = useCallback(async (targetSlug: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      const res = await fetch(`/api/python-studio/challenges/${targetSlug}/`, { headers });
      if (res.ok) {
        const data = await res.json();
        const ch = data.challenge;
        setChallenge(ch);

        // Load code from student draft or starter
        const initialCode = data.student_progress?.saved_code || ch.starter_code || '';
        setCode(initialCode);
        setIsCompleted(data.student_progress?.is_completed || false);
        setActionQueue([]);
        setIsRunning(false);
        setConsoleLogs([]);
      }
    } catch (err) {
      console.error('Failed to load python challenge:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenge(slug);
  }, [slug, fetchChallenge]);

  // Console log helper
  const addConsoleLog = useCallback((msg: string, type: 'log' | 'error' | 'success' = 'log') => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setConsoleLogs(prev => [...prev.slice(-30), { id: Math.random().toString(), msg, time, type }]);
  }, []);

  // -------------------------------------------------------------
  // Real-time Criteria Evaluation
  // -------------------------------------------------------------
  const criteriaResults = useMemo(() => {
    if (!challenge || !challenge.solution_criteria) return [];

    const criteria = challenge.solution_criteria;
    const results: { criterion: string; passed: boolean }[] = [];

    // Required methods check: e.g. "hero.move_right", "hero.collect", "hero.jump"
    if (criteria.required_methods && Array.isArray(criteria.required_methods)) {
      criteria.required_methods.forEach((method: string) => {
        const hasMethod = code.includes(method);
        results.push({
          criterion: `Calls command "${method}()"`,
          passed: hasMethod
        });
      });
    }

    // Required keywords check: e.g. "for", "range", "def", "if", "coins"
    if (criteria.required_keywords && Array.isArray(criteria.required_keywords)) {
      criteria.required_keywords.forEach((keyword: string) => {
        const hasKeyword = code.includes(keyword);
        results.push({
          criterion: `Uses Python keyword/variable "${keyword}"`,
          passed: hasKeyword
        });
      });
    }

    return results;
  }, [challenge, code]);

  // -------------------------------------------------------------
  // Run Code: Parse Python & Start Animation
  // -------------------------------------------------------------
  const handleRunCode = () => {
    if (isRunning) return;

    addConsoleLog('🚀 Compiling Python program and loading game animation...', 'log');
    const { actions, stdout, error, errorLine } = interpretPythonCode(code);

    if (error) {
      addConsoleLog(`Syntax Error on line ${errorLine}: ${error}`, 'error');
      playAppSound('boing');
      return;
    }

    if (stdout.length > 0) {
      stdout.forEach(out => addConsoleLog(out, 'log'));
    }

    if (actions.length === 0) {
      addConsoleLog('No executable game actions found. Add commands like hero.move_right()!', 'error');
      return;
    }

    addConsoleLog(`Parsed ${actions.length} game action commands! Playing 60fps animation...`, 'success');
    setActionQueue(actions);
    setIsRunning(true);
  };

  const handleExecutionComplete = (success: boolean) => {
    setIsRunning(false);
    if (success) {
      addConsoleLog('🎉 Animation completed successfully! Mission targets cleared!', 'success');
    } else {
      addConsoleLog('Animation finished. Review goals and try adjusting your parameters.', 'log');
    }
  };

  // Snippet inserter into Monaco editor
  const handleInsertSnippet = (snippet: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const selection = editor.getSelection();
      editor.executeEdits('snippet-inserter', [
        {
          range: selection,
          text: snippet,
          forceMoveMarkers: true,
        },
      ]);
      editor.focus();
    } else {
      setCode(prev => prev + '\n' + snippet);
    }
  };

  const handleResetGame = () => {
    setIsRunning(false);
    setActionQueue([]);
    setGameResetCount(prev => prev + 1);
    playAppSound('boing');
    addConsoleLog('Game world reset to starting position.', 'log');
  };

  // -------------------------------------------------------------
  // Draft Save & Submission
  // -------------------------------------------------------------
  const handleSaveDraft = async () => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      await fetch('/api/python-studio/save-draft/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          slug: slug,
          saved_code: code
        })
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error('Failed to save draft:', err);
      setSaveStatus('idle');
    }
  };

  const handleSubmitMission = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      const res = await fetch('/api/python-studio/submit/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          slug: slug,
          code: code
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsCompleted(true);
        setAwardedXp(data.reward_xp || challenge?.reward_xp || 60);
        playAppSound('cheer');
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        alert(data.message || 'Make sure all criteria are satisfied before submitting!');
      }
    } catch (err) {
      console.error('Failed to submit challenge:', err);
      alert('Network error while submitting Python challenge.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectMission = (newSlug: string) => {
    setSlug(newSlug);
    setAwardedXp(null);
    setIsRunning(false);
    setActionQueue([]);
    setConsoleLogs([]);
  };

  const activeClass = PYTHON_CLASSES.find(c => c.slug === slug) || PYTHON_CLASSES[0];

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* 1. TOP INSTRUCTION PANEL WITH CLASSES & WHAT TO ACHIEVE */}
      <PythonInstructionPanel
        currentSlug={slug}
        challenge={challenge}
        criteriaResults={criteriaResults}
        isCompleted={isCompleted}
        onSelectMission={handleSelectMission}
        onSubmitMission={handleSubmitMission}
        onRunCode={handleRunCode}
        isSubmitting={isSubmitting}
        isRunning={isRunning}
      />

      {/* 2. PYTHON WORKSPACE TOOLBAR WITH SNIPPET PILLS & SPEED */}
      <PythonWorkspaceToolbar
        classNum={activeClass.num}
        onInsertSnippet={handleInsertSnippet}
        onResetGame={handleResetGame}
        onOpenShareModal={() => setShowShareModal(true)}
        playbackSpeed={playbackSpeed}
        onChangeSpeed={setPlaybackSpeed}
      />

      {/* 3. MAIN WORKSPACE AREA */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* ========================================================= */}
        {/* LEFT: INTERACTIVE GAME ANIMATION CANVAS                   */}
        {/* ========================================================= */}
        <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-3 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          {/* Canvas Sub-Header */}
          <div className="w-full max-w-[620px] mb-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400 animate-spin" />
                <span>Live Game Animation Engine</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowTutorial(true)}
                title="Curriculum Guide"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-bold transition-all border border-slate-700"
              >
                <HelpCircle size={14} />
              </button>
              <button
                onClick={() => setShowProjectsModal(true)}
                title="My Projects"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700"
              >
                <FolderOpen size={14} />
              </button>
              <button
                onClick={handleSaveDraft}
                title="Save Draft"
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700 flex items-center gap-1"
              >
                <Save size={13} />
                <span>{saveStatus === 'saving' ? '...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Game Canvas */}
          <div className="w-full max-w-[620px] flex-1 flex items-center justify-center">
            <PythonGameCanvas
              key={`${slug}-${gameResetCount}`}
              scene={challenge?.game_config?.scene || 'island'}
              gameConfig={challenge?.game_config || {}}
              actionQueue={actionQueue}
              isRunning={isRunning}
              onExecutionComplete={handleExecutionComplete}
              speed={playbackSpeed}
              classNum={activeClass.num}
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT: MONACO PYTHON EDITOR & TERMINAL CONSOLE            */}
        {/* ========================================================= */}
        <div className="w-full lg:w-[490px] bg-slate-900 flex flex-col shrink-0 overflow-hidden">
          {/* Editor Header Bar */}
          <div className="h-10 bg-slate-950 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-purple-400">
                <Code2 size={15} />
                <span>main.py</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Python 3.11</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 shadow-sm ${
                  isRunning
                    ? 'bg-purple-800 text-purple-300'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 text-white'
                }`}
              >
                <Play size={11} className={isRunning ? 'animate-spin' : 'fill-current'} />
                <span>Run Code</span>
              </button>
            </div>
          </div>

          {/* Monaco Python Editor */}
          <div className="flex-1 overflow-hidden relative">
            <MonacoEditor
              height="100%"
              language="python"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              options={{
                fontSize: 13,
                fontFamily: "'Fira Code', 'Courier New', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                tabSize: 4,
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>

          {/* Bottom Interactive Terminal / Output Console */}
          <div className="h-40 bg-slate-950 border-t border-slate-800 p-2.5 flex flex-col shrink-0 font-mono text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Terminal size={13} className="text-purple-400" />
                <span>Python Output &amp; Debug Console</span>
              </span>
              <button
                onClick={() => setConsoleLogs([])}
                className="hover:text-white transition-colors text-[10px]"
              >
                Clear
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pt-1.5 text-[11px]">
              {consoleLogs.length === 0 ? (
                <span className="text-slate-600 italic">No output yet. Click &quot;Run Animation 🚀&quot; to execute your Python script!</span>
              ) : (
                consoleLogs.map(log => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-1.5 ${
                      log.type === 'error'
                        ? 'text-rose-400 font-bold'
                        : log.type === 'success'
                          ? 'text-emerald-400 font-bold'
                          : 'text-purple-200'
                    }`}
                  >
                    <span className="text-slate-600 shrink-0">[{log.time}]</span>
                    <span>{log.msg}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODALS                                                    */}
      {/* ========================================================= */}
      {/* 1. Step-by-Step Curriculum Tutorial Modal */}
      <PythonTutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        currentClassNum={activeClass.num}
        onSelectClass={(clsNum) => {
          const target = PYTHON_CLASSES.find(c => c.num === clsNum);
          if (target) handleSelectMission(target.slug);
        }}
      />

      {/* 2. Share & Export Python Script Modal */}
      <PythonShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        projectTitle={challenge?.title || 'My Python Project'}
        code={code}
        classNum={activeClass.num}
      />

      {/* 3. Saved Projects Drawer Modal */}
      <PythonSavedProjectsModal
        isOpen={showProjectsModal}
        onClose={() => setShowProjectsModal(false)}
        onOpenProject={(projSlug, projCode) => {
          setSlug(projSlug);
          if (projCode) setCode(projCode);
        }}
        onNewProject={() => {
          handleSelectMission('class-1-robo-motion');
        }}
      />
    </div>
  );
}
