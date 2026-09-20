'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';
import AssetPaletteModal from './AssetPaletteModal';
import KidTutorialModal from './KidTutorialModal';
import SavedProjectsModal from './SavedProjectsModal';
import MissionInstructionPanel, { MissionData } from './MissionInstructionPanel';
import { 
  Code2, 
  Paintbrush, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Maximize2, 
  Minimize2, 
  Check, 
  Copy, 
  Info,
  ImageIcon,
  PartyPopper,
  Palette,
  Save,
  HelpCircle,
  CloudCheck,
  Eye,
  Columns,
  Plus,
  FolderOpen
} from 'lucide-react';

// Dynamically import Monaco Editor to avoid SSR hydration issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-900 text-slate-400 font-mono text-sm">
      <div className="flex items-center gap-3">
        <Sparkles className="animate-spin text-amber-400" size={20} />
        <span>Loading Editor Studio...</span>
      </div>
    </div>
  ),
});

const DEFAULT_STARTER_HTML = `<div class="card">
  <h1>AGENT LEO</h1>
  <h3>CYBER INTELLIGENCE DIVISION</h3>
  <p>Superpower: Instant Code Mastery and Quantum Hacking!</p>
</div>`;

const DEFAULT_STARTER_CSS = `.card {
  background: #0f172a;
  border: 3px solid #00f2fe;
  border-radius: 16px;
  padding: 24px;
  color: #f8fafc;
  text-align: center;
}`;

// Kid-Friendly Color Swatches
const QUICK_COLOR_SWATCHES = [
  { name: 'Electric Gold', hex: '#f9a826' },
  { name: 'Neon Cyan', hex: '#00f2fe' },
  { name: 'Hot Pink', hex: '#ff007f' },
  { name: 'Slime Green', hex: '#10b981' },
  { name: 'Midnight', hex: '#0f172a' },
  { name: 'Coral Red', hex: '#ff4757' },
  { name: 'Cosmic Purple', hex: '#8b5cf6' },
  { name: 'Bright Yellow', hex: '#ffd32a' },
];

export default function WebPlayground() {
  const [slug, setSlug] = useState('secret-agent-id-badge');
  const [challenge, setChallenge] = useState<MissionData | null>(null);

  const [htmlCode, setHtmlCode] = useState(DEFAULT_STARTER_HTML);
  const [cssCode, setCssCode] = useState(DEFAULT_STARTER_CSS);
  
  // Debounced code for preview rendering (350ms requirement)
  const [debouncedHtml, setDebouncedHtml] = useState(DEFAULT_STARTER_HTML);
  const [debouncedCss, setDebouncedCss] = useState(DEFAULT_STARTER_CSS);

  // UI States
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('html');
  const [mobileWorkspaceView, setMobileWorkspaceView] = useState<'editor' | 'preview' | 'split'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isSaving, setIsSaving] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);

  // Validation States
  const [criteriaResults, setCriteriaResults] = useState<{ criterion: string; passed: boolean }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Monaco Editor References for layout adjustment
  const htmlEditorRef = useRef<any>(null);
  const cssEditorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Web Audio API Retro Sound Effects Synthesis
  const playRewardSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + idx * 0.08);
        osc.stop(audioCtx.currentTime + idx * 0.08 + 0.25);
      });
    } catch (e) {
      console.log('Audio Context error:', e);
    }
  };

  const playClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  // Safely trigger editor layout on tab or workspace view changes
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (activeTab === 'html' && htmlEditorRef.current) {
          htmlEditorRef.current.layout();
        } else if (activeTab === 'css' && cssEditorRef.current) {
          cssEditorRef.current.layout();
        }
      } catch (e) {
        // Suppress layout recalculation errors
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTab, mobileWorkspaceView, isFullscreen]);

  // Fetch challenge details and saved draft when slug changes
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Token ${token}`;

        const res = await fetch(`/api/web-studio/challenges/${slug}/`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.challenge) {
            setChallenge(data.challenge);
            
            // Check student progress draft or load default starters
            if (data.student_progress && data.student_progress.saved_html) {
              setHtmlCode(data.student_progress.saved_html);
              setCssCode(data.student_progress.saved_css || data.challenge.starter_css);
              setIsCompleted(data.student_progress.is_completed || false);
            } else {
              setHtmlCode(data.challenge.starter_html || DEFAULT_STARTER_HTML);
              setCssCode(data.challenge.starter_css || DEFAULT_STARTER_CSS);
              setIsCompleted(false);
            }

            // Populate initial criteria check
            const reqTags: string[] = data.challenge.solution_criteria?.required_tags || [];
            const reqClasses: string[] = data.challenge.solution_criteria?.required_classes || [];
            const initResults = [
              ...reqTags.map(t => ({ criterion: `Must contain <${t}> tag`, passed: false })),
              ...reqClasses.map(c => ({ criterion: `Must contain .${c} class`, passed: false }))
            ];
            setCriteriaResults(initResults);
          }
        }
      } catch (err) {
        console.log('Error loading challenge:', err);
      }
    };
    fetchChallenge();
  }, [slug]);

  // Debounce handler for Live Preview (350ms) + Autosave status tracking
  useEffect(() => {
    setIsUpdating(true);
    setSaveStatus('unsaved');
    const timer = setTimeout(() => {
      setDebouncedHtml(htmlCode);
      setDebouncedCss(cssCode);
      setIsUpdating(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [htmlCode, cssCode]);

  // Autosave interval every 6 seconds if unsaved
  useEffect(() => {
    const autosaveTimer = setTimeout(() => {
      if (saveStatus === 'unsaved') {
        saveDraft(true);
      }
    }, 6000);
    return () => clearTimeout(autosaveTimer);
  }, [htmlCode, cssCode, saveStatus]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Open Selected Project from Modal
  const handleOpenProject = (targetSlug: string, savedHtml?: string, savedCss?: string) => {
    setSlug(targetSlug);
    if (savedHtml) setHtmlCode(savedHtml);
    if (savedCss) setCssCode(savedCss);
    playClickSound();
    showToast(`Loaded project: ${targetSlug}! 🚀`);
  };

  // Create New Project / Reset Studio
  const handleNewProject = () => {
    setSlug('secret-agent-id-badge');
    setHtmlCode(`<div class="my-creation">\n  <h1>MY NEW WEB CREATION 🚀</h1>\n  <p>Start editing HTML and CSS to bring your ideas to life!</p>\n</div>`);
    setCssCode(`.my-creation {\n  background: #0f172a;\n  border: 3px solid #f9a826;\n  border-radius: 16px;\n  padding: 24px;\n  color: #f8fafc;\n  text-align: center;\n}`);
    playClickSound();
    showToast("New Canvas Created! 🎨 Start Coding!");
  };

  // Save Draft API Call
  const saveDraft = async (silent = false) => {
    setSaveStatus('saving');
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      const res = await fetch('/api/web-studio/save-draft/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          slug,
          saved_html: htmlCode,
          saved_css: cssCode
        })
      });

      if (res.ok) {
        setSaveStatus('saved');
        if (!silent) {
          playClickSound();
          showToast("Project Saved to Cloud! 💾");
        }
      } else {
        setSaveStatus('unsaved');
      }
    } catch (e) {
      console.log('Save error:', e);
      setSaveStatus('unsaved');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Mission & Validate Code against Criteria API
  const handleSubmitMission = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      const res = await fetch('/api/web-studio/submit/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          slug,
          html: htmlCode,
          css: cssCode
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCriteriaResults(data.criteria_results || []);
        if (data.success) {
          setIsCompleted(true);
          confetti({
            particleCount: 110,
            spread: 90,
            origin: { y: 0.6 }
          });
          playRewardSound();
          showToast(`Mission Cleared! Earned ${data.reward_xp || challenge?.reward_xp || 50} XP! 🎉`);
        } else {
          playClickSound();
          showToast(data.message || "Keep tweaking your code to complete all goals!");
        }
      }
    } catch (e) {
      console.log('Submission error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset starter template
  const handleReset = () => {
    if (challenge) {
      setHtmlCode(challenge.starter_html);
      setCssCode(challenge.starter_css);
    } else {
      setHtmlCode(DEFAULT_STARTER_HTML);
      setCssCode(DEFAULT_STARTER_CSS);
    }
    playClickSound();
    showToast("Reset to Starter Template! 🚀");
  };

  // Insert Sticker Asset into HTML Editor
  const handleInsertSticker = (snippet: string, title: string) => {
    setHtmlCode(prev => `${prev}\n${snippet}`);
    playClickSound();
    showToast(`Inserted sticker "${title}"! 🎨`);
    setIsAssetModalOpen(false);
  };

  // Click Swatch Color -> Appends hex into CSS
  const handleColorSwatchClick = (swatch: { name: string; hex: string }) => {
    navigator.clipboard.writeText(swatch.hex);
    setCssCode(prev => `${prev}\n/* ${swatch.name} */\n.color-sample { color: ${swatch.hex}; }`);
    playClickSound();
    showToast(`Color ${swatch.hex} (${swatch.name}) inserted! 🎨`);
  };

  // Construct complete HTML string with kid-friendly CSS resets & Google Fonts
  const srcDoc = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Fredoka', 'Nunito', system-ui, -apple-system, sans-serif;
      background-color: #0d1117;
      color: #f0f6fc;
      padding: 20px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow-x: hidden;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 12px auto;
    }
    .btn {
      background: linear-gradient(135deg, #f9a826, #f59e0b);
      color: #0f172a;
      border: none;
      padding: 12px 24px;
      font-family: 'Fredoka', sans-serif;
      font-size: 16px;
      font-weight: 700;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 4px 0 #b45309;
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
      margin-top: 14px;
      display: inline-block;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #b45309;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
    }
    .btn:active {
      transform: translateY(2px);
      box-shadow: 0 2px 0 #b45309;
    }
    ${debouncedCss}
  </style>
</head>
<body>
  ${debouncedHtml}
</body>
</html>
  `;

  // Dynamic preview iframe width based on selected device preview
  const getDeviceClass = () => {
    switch (previewDevice) {
      case 'mobile':
        return 'w-[320px] sm:w-[360px] h-[580px] rounded-3xl border-8 border-slate-700 shadow-2xl';
      case 'tablet':
        return 'w-[640px] h-[780px] rounded-2xl border-8 border-slate-700 shadow-2xl';
      case 'desktop':
      default:
        return 'w-full h-full rounded-xl border border-slate-800';
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col bg-slate-950 text-slate-100 ${
        isFullscreen ? 'fixed inset-0 z-50 overflow-hidden' : 'w-full h-[calc(100vh-64px)] min-h-[600px]'
      }`}
    >
      {/* Playful Top Header Navigation */}
      <header className="h-14 md:h-16 bg-slate-900 border-b border-slate-800/80 px-3 md:px-6 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Code2 className="text-amber-400 w-4 h-4 md:w-5 md:h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm md:text-lg tracking-tight bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 bg-clip-text text-transparent truncate max-w-[140px] sm:max-w-none">
                Web Studio
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full hidden xs:inline">
                HTML & CSS
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-1.5 md:gap-2">

          {/* New Project Button */}
          <button
            onClick={handleNewProject}
            className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-lg text-xs transition-all flex items-center gap-1 shadow-md hover:from-amber-400 hover:to-yellow-300 active:scale-95 shrink-0"
            title="Create New Blank Canvas Project"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New Project</span>
          </button>

          {/* Saved Projects List Modal Button */}
          <button
            onClick={() => setIsProjectsModalOpen(true)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Open Saved Projects Drawer"
          >
            <FolderOpen size={14} className="text-amber-400" />
            <span className="hidden sm:inline">My Projects</span>
          </button>
          
          {/* Tutorial Button */}
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-lg text-xs font-black transition-all flex items-center gap-1 active:scale-95 shadow-sm"
            title="Open Interactive Tutorial for Kids"
          >
            <HelpCircle size={14} className="text-amber-400" />
            <span className="hidden md:inline">How to Play</span>
          </button>

          {/* Manual Save Button */}
          <button
            onClick={() => saveDraft(false)}
            disabled={isSaving}
            className={`px-2.5 py-1.5 border rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95 ${
              saveStatus === 'saved'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : saveStatus === 'saving'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400'
            }`}
            title="Save code draft to database"
          >
            {saveStatus === 'saved' ? (
              <CloudCheck size={14} />
            ) : saveStatus === 'saving' ? (
              <Sparkles size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-bold transition-all active:scale-95"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </header>

      {/* Level Selector & Instruction Panel */}
      <MissionInstructionPanel
        currentSlug={slug}
        challenge={challenge}
        criteriaResults={criteriaResults}
        isCompleted={isCompleted}
        onSelectMission={(newSlug) => setSlug(newSlug)}
        onSubmitMission={handleSubmitMission}
        isSubmitting={isSubmitting}
      />

      {/* MOBILE WORKSPACE TOGGLE SWITCHER (Shown on screens < 1024px) */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-1.5 flex items-center justify-center gap-1 shrink-0 select-none">
        <button
          onClick={() => setMobileWorkspaceView('editor')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
            mobileWorkspaceView === 'editor'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          <Code2 size={14} />
          <span>Code Editors</span>
        </button>

        <button
          onClick={() => setMobileWorkspaceView('preview')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
            mobileWorkspaceView === 'preview'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          <Eye size={14} />
          <span>Live Stage</span>
        </button>

        <button
          onClick={() => setMobileWorkspaceView('split')}
          className={`py-1.5 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all ${
            mobileWorkspaceView === 'split'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
          title="Split View"
        >
          <Columns size={14} />
          <span className="hidden sm:inline">Split</span>
        </button>
      </div>

      {/* Main Split Screen / Responsive Column Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

        {/* LEFT COLUMN: CODE EDITORS */}
        <div 
          className={`w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-900/50 overflow-hidden transition-all ${
            mobileWorkspaceView === 'preview' ? 'invisible absolute -left-[9999px] lg:visible lg:relative lg:left-0 lg:flex' : 'flex'
          } ${mobileWorkspaceView === 'split' ? 'h-1/2 lg:h-full' : 'h-full'}`}
        >
          {/* Tab View Mode */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Editor Tabs & Toolbars Bar */}
            <div className="flex items-center justify-between bg-slate-900 border-b border-slate-800 px-3 pt-2 shrink-0 overflow-x-auto">
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('html')}
                  className={`px-3 sm:px-4 py-2 text-xs font-black rounded-t-xl transition-all flex items-center gap-1.5 border-t-2 ${
                    activeTab === 'html'
                      ? 'bg-slate-950 text-amber-400 border-amber-400 shadow-lg'
                      : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50'
                  }`}
                >
                  <Code2 size={15} className={activeTab === 'html' ? 'text-amber-400' : 'text-slate-400'} />
                  <span>1. HTML</span>
                </button>

                <button
                  onClick={() => setActiveTab('css')}
                  className={`px-3 sm:px-4 py-2 text-xs font-black rounded-t-xl transition-all flex items-center gap-1.5 border-t-2 ${
                    activeTab === 'css'
                      ? 'bg-slate-950 text-sky-400 border-sky-400 shadow-lg'
                      : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50'
                  }`}
                >
                  <Paintbrush size={15} className={activeTab === 'css' ? 'text-sky-400' : 'text-slate-400'} />
                  <span>2. Magic CSS</span>
                </button>
              </div>

              {/* Toolbar Trigger for Active Tab */}
              {activeTab === 'html' ? (
                <button
                  onClick={() => setIsAssetModalOpen(true)}
                  className="mb-1.5 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-sm shrink-0"
                >
                  <ImageIcon size={13} className="text-amber-400" />
                  <span>+ Sticker</span>
                </button>
              ) : (
                <div className="mb-1.5 flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 shrink-0">
                  <Palette size={13} className="text-sky-400 shrink-0" />
                  <div className="flex items-center gap-1">
                    {QUICK_COLOR_SWATCHES.slice(0, 6).map((swatch) => (
                      <button
                        key={swatch.hex}
                        onClick={() => handleColorSwatchClick(swatch)}
                        className="w-3.5 h-3.5 rounded-full border border-slate-700 hover:scale-125 transition-transform shrink-0"
                        style={{ backgroundColor: swatch.hex }}
                        title={`Insert ${swatch.name} (${swatch.hex})`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Editor Container (PERSISTENTLY MOUNTED HTML AND CSS EDITORS) */}
            <div className="flex-1 relative bg-slate-950 overflow-hidden">
              {/* HTML Editor */}
              <div className={`h-full w-full ${activeTab === 'html' ? 'block' : 'hidden'}`}>
                <MonacoEditor
                  height="100%"
                  language="html"
                  theme="vs-dark"
                  value={htmlCode}
                  onChange={(val) => setHtmlCode(val || '')}
                  onMount={(editor) => { htmlEditorRef.current = editor; }}
                  options={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    automaticLayout: true,
                    tabSize: 2,
                    padding: { top: 12, bottom: 12 },
                    renderLineHighlight: 'all',
                    cursorBlinking: 'smooth',
                  }}
                />
              </div>

              {/* CSS Editor */}
              <div className={`h-full w-full ${activeTab === 'css' ? 'block' : 'hidden'}`}>
                <MonacoEditor
                  height="100%"
                  language="css"
                  theme="vs-dark"
                  value={cssCode}
                  onChange={(val) => setCssCode(val || '')}
                  onMount={(editor) => { cssEditorRef.current = editor; }}
                  options={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    automaticLayout: true,
                    tabSize: 2,
                    padding: { top: 12, bottom: 12 },
                    renderLineHighlight: 'all',
                    cursorBlinking: 'smooth',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW STAGE */}
        <div 
          className={`w-full lg:w-1/2 flex flex-col bg-slate-950 overflow-hidden transition-all ${
            mobileWorkspaceView === 'editor' ? 'invisible absolute -left-[9999px] lg:visible lg:relative lg:left-0 lg:flex' : 'flex'
          } ${mobileWorkspaceView === 'split' ? 'h-1/2 lg:h-full' : 'h-full'}`}
        >
          {/* Live Preview Window Header */}
          <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 md:px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
              </div>
              <span className="text-xs font-black text-slate-300 ml-1 flex items-center gap-1">
                <Play size={13} className="text-emerald-400 fill-emerald-400" />
                Live Stage
              </span>
              {isUpdating && (
                <span className="flex items-center gap-1 text-[9px] text-amber-400 font-semibold bg-amber-400/10 px-1.5 py-0.2 rounded-full border border-amber-400/20">
                  <Sparkles size={9} className="animate-spin" /> Live
                </span>
              )}
            </div>

            {/* Device Viewport Toggle */}
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1 rounded-md transition-all ${
                  previewDevice === 'desktop' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Desktop View"
              >
                <Monitor size={13} />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`p-1 rounded-md transition-all ${
                  previewDevice === 'tablet' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tablet View"
              >
                <Tablet size={13} />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1 rounded-md transition-all ${
                  previewDevice === 'mobile' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mobile View"
              >
                <Smartphone size={13} />
              </button>
            </div>
          </div>

          {/* Sandboxed Iframe Container */}
          <div className="flex-1 bg-slate-900/40 p-2 sm:p-4 flex items-center justify-center overflow-auto relative">
            <div className={`transition-all duration-300 ${getDeviceClass()} overflow-hidden bg-slate-900 shadow-2xl relative max-w-full`}>
              <iframe
                title="Dolacode Live Web Preview"
                srcDoc={srcDoc}
                sandbox="allow-scripts"
                className="w-full h-full border-0 bg-[#0d1117]"
              />
            </div>
          </div>

          {/* Live Stage Footer */}
          <div className="bg-slate-900 border-t border-slate-800 px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
            <div className="flex items-center gap-1.5 font-medium text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Sandboxed Engine</span>
            </div>
            <div className="font-mono text-slate-500">
              350ms live preview
            </div>
          </div>

        </div>

      </div>

      {/* Saved Projects List Modal */}
      <SavedProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        onOpenProject={handleOpenProject}
        onNewProject={handleNewProject}
      />

      {/* Asset Palette Modal Drawer */}
      <AssetPaletteModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onSelectAsset={handleInsertSticker}
      />

      {/* Interactive Kid Tutorial Modal */}
      <KidTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border-2 border-amber-400 text-amber-300 px-3.5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce text-xs">
          <Sparkles className="text-amber-400 shrink-0" size={16} />
          <span className="font-extrabold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
