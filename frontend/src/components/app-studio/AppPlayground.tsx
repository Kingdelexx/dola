'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';
import { 
  Smartphone, 
  Play, 
  RotateCcw, 
  Save, 
  FolderOpen, 
  Share2, 
  HelpCircle, 
  Sparkles, 
  Layers, 
  Code2, 
  Sliders, 
  Trash2, 
  Plus, 
  Eye, 
  Terminal, 
  ChevronRight, 
  Check, 
  MousePointerClick,
  Type,
  ImageIcon,
  Edit3,
  Copy,
  Zap,
  ArrowRight
} from 'lucide-react';
import { playAppSound } from './audioSynth';
import AppInstructionPanel, { AppMissionData, APP_CLASSES } from './AppInstructionPanel';
import AppWorkspaceToolbar from './AppWorkspaceToolbar';
import AppTutorialModal from './AppTutorialModal';
import AppShareModal from './AppShareModal';
import AppSavedProjectsModal from './AppSavedProjectsModal';

// Dynamically import Monaco Editor to avoid SSR hydration issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-900 text-slate-400 font-mono text-sm">
      <div className="flex items-center gap-3">
        <Sparkles className="animate-spin text-purple-400" size={20} />
        <span>Loading App Code Studio...</span>
      </div>
    </div>
  ),
});

export interface ScreenElement {
  id: string;
  type: 'label' | 'image' | 'button' | 'input';
  name?: string;
  text?: string;
  src?: string;
  hint?: string;
  style: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: string;
    borderRadius?: number;
    position?: string;
    zIndex?: number;
    [key: string]: any;
  };
}

export interface AppScreen {
  id: string;
  name: string;
  backgroundColor: string;
  elements: ScreenElement[];
}

export default function AppPlayground() {
  const [slug, setSlug] = useState('class-1-hello-app');
  const [challenge, setChallenge] = useState<AppMissionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // App Canvas Data
  const [screens, setScreens] = useState<AppScreen[]>([]);
  const [activeScreenId, setActiveScreenId] = useState<string>('screen1');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Code
  const [code, setCode] = useState<string>('');

  // UI Modes
  const [mode, setMode] = useState<'design' | 'preview'>('design');
  const [activeTab, setActiveTab] = useState<'canvas' | 'code' | 'inspector'>('canvas');
  const [consoleLogs, setConsoleLogs] = useState<{ id: string; msg: string; time: string; type: 'log' | 'error' | 'success' }[]>([]);

  // Simulation Runtime State
  const [runtimeOverrides, setRuntimeOverrides] = useState<Record<string, { text?: string; src?: string; value?: string; style?: any }>>({});
  const [simActiveScreenId, setSimActiveScreenId] = useState<string>('screen1');

  // Modals
  const [showTutorial, setShowTutorial] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);

  // Status & Feedback
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [awardedXp, setAwardedXp] = useState<number | null>(null);

  // Runtime event handlers registry
  const eventHandlersRef = useRef<Record<string, Record<string, Function>>>({});

  // Fetch challenge data
  const fetchChallenge = useCallback(async (targetSlug: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      const res = await fetch(`/api/app-studio/challenges/${targetSlug}/`, { headers });
      if (res.ok) {
        const data = await res.json();
        setChallenge(data);

        // Load screens from student draft if available, else starter screens
        const initialScreens: AppScreen[] = (data.student_draft?.saved_screens && data.student_draft.saved_screens.length > 0)
          ? data.student_draft.saved_screens
          : (data.starter_screens && data.starter_screens.length > 0)
            ? data.starter_screens
            : [{ id: 'screen1', name: 'Main Screen', backgroundColor: '#0f172a', elements: [] }];

        setScreens(initialScreens);
        setActiveScreenId(initialScreens[0]?.id || 'screen1');
        setSimActiveScreenId(initialScreens[0]?.id || 'screen1');

        // Load code from draft or starter
        const initialCode = data.student_draft?.saved_code || data.starter_code || '';
        setCode(initialCode);

        setIsCompleted(data.student_progress?.is_completed || false);
        setSelectedElementId(initialScreens[0]?.elements[0]?.id || null);
        setRuntimeOverrides({});
      }
    } catch (err) {
      console.error('Failed to load app challenge:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenge(slug);
  }, [slug, fetchChallenge]);

  // Current active screen object
  const currentScreen = useMemo(() => {
    const screenToFind = mode === 'preview' ? simActiveScreenId : activeScreenId;
    return screens.find(s => s.id === screenToFind) || screens[0] || { id: 'screen1', name: 'Screen 1', backgroundColor: '#0f172a', elements: [] };
  }, [screens, activeScreenId, simActiveScreenId, mode]);

  // Selected element object
  const selectedElement = useMemo(() => {
    for (const screen of screens) {
      const el = screen.elements.find(e => e.id === selectedElementId);
      if (el) return el;
    }
    return null;
  }, [screens, selectedElementId]);

  // Log message helper
  const addConsoleLog = useCallback((msg: string, type: 'log' | 'error' | 'success' = 'log') => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setConsoleLogs(prev => [...prev.slice(-30), { id: Math.random().toString(), msg, time, type }]);
  }, []);

  // -------------------------------------------------------------
  // Real-Time Evaluation of Mission Criteria
  // -------------------------------------------------------------
  const criteriaResults = useMemo(() => {
    if (!challenge || !challenge.solution_criteria) return [];

    const criteria = challenge.solution_criteria;
    const results: { criterion: string; passed: boolean }[] = [];

    // All elements across all screens
    const allElements: ScreenElement[] = screens.flatMap(s => s.elements);

    // Required elements check
    if (criteria.required_elements && Array.isArray(criteria.required_elements)) {
      criteria.required_elements.forEach((reqType: string) => {
        const hasElem = allElements.some(e => e.type.toLowerCase() === reqType.toLowerCase());
        results.push({
          criterion: `Includes at least one "${reqType}" component`,
          passed: hasElem
        });
      });
    }

    // Min screens check
    if (criteria.required_min_screens && criteria.required_min_screens > 1) {
      results.push({
        criterion: `Has at least ${criteria.required_min_screens} distinct app screens`,
        passed: screens.length >= criteria.required_min_screens
      });
    }

    // Required events check
    if (criteria.required_events && Array.isArray(criteria.required_events)) {
      criteria.required_events.forEach((evt: string) => {
        const hasEventInCode = code.includes('onEvent') || code.includes(evt);
        results.push({
          criterion: `Registers an event listener for "${evt}"`,
          passed: hasEventInCode
        });
      });
    }

    // Required keywords check
    if (criteria.required_keywords && Array.isArray(criteria.required_keywords)) {
      criteria.required_keywords.forEach((keyword: string) => {
        const hasKeyword = code.includes(keyword);
        results.push({
          criterion: `Uses variable/function "${keyword}"`,
          passed: hasKeyword
        });
      });
    }

    return results;
  }, [challenge, screens, code]);

  // -------------------------------------------------------------
  // Sandbox Runner: Executes JS and binds event handlers
  // -------------------------------------------------------------
  const startSimulation = useCallback(() => {
    eventHandlersRef.current = {};
    setRuntimeOverrides({});
    setSimActiveScreenId(screens[0]?.id || 'screen1');
    addConsoleLog('📱 Mobile App Simulator started! Initializing events...', 'log');

    try {
      // Safe mock runtime environment
      const runtime = {
        onEvent: (id: string, evtName: string, cb: Function) => {
          if (!eventHandlersRef.current[id]) {
            eventHandlersRef.current[id] = {};
          }
          eventHandlersRef.current[id][evtName] = cb;
        },
        setProperty: (id: string, prop: string, value: any) => {
          setRuntimeOverrides(prev => {
            const current = prev[id] || {};
            if (prop === 'text') return { ...prev, [id]: { ...current, text: String(value) } };
            if (prop === 'src') return { ...prev, [id]: { ...current, src: String(value) } };
            if (prop === 'value') return { ...prev, [id]: { ...current, value: String(value) } };
            return {
              ...prev,
              [id]: {
                ...current,
                style: { ...(current.style || {}), [prop]: value }
              }
            };
          });
        },
        getText: (id: string) => {
          // Check runtime overrides first
          if (runtimeOverrides[id]?.value !== undefined) return runtimeOverrides[id].value;
          if (runtimeOverrides[id]?.text !== undefined) return runtimeOverrides[id].text;
          // Look up element
          for (const screen of screens) {
            const elem = screen.elements.find(e => e.id === id);
            if (elem) return elem.text || elem.hint || '';
          }
          return '';
        },
        setText: (id: string, val: any) => {
          runtime.setProperty(id, 'text', val);
        },
        setScreen: (targetScreenId: string) => {
          // Check if screen exists by ID or name
          const target = screens.find(s => s.id === targetScreenId || s.name.toLowerCase() === targetScreenId.toLowerCase());
          if (target) {
            setSimActiveScreenId(target.id);
            addConsoleLog(`Navigated to screen: "${target.name}"`, 'log');
          } else {
            addConsoleLog(`Screen "${targetScreenId}" not found`, 'error');
          }
        },
        playSound: (name: 'laser' | 'boing' | 'cheer' | 'cowbell' | 'chime' | 'click') => {
          playAppSound(name);
          addConsoleLog(`Played audio fx: "${name}"`, 'log');
        },
        log: (msg: any) => {
          addConsoleLog(String(msg), 'log');
        },
        Math: Math,
        setTimeout: (fn: Function, delay: number) => setTimeout(fn, delay),
        clearTimeout: (timer: any) => clearTimeout(timer),
        console: {
          log: (...args: any[]) => addConsoleLog(args.map(String).join(' '), 'log'),
          error: (...args: any[]) => addConsoleLog(args.map(String).join(' '), 'error')
        }
      };

      // Execute code within simulated runtime scope
      const runner = new Function(
        'onEvent', 
        'setProperty', 
        'getText', 
        'setText', 
        'setScreen', 
        'playSound', 
        'log', 
        'Math', 
        'setTimeout', 
        'clearTimeout', 
        'console', 
        code
      );

      runner(
        runtime.onEvent,
        runtime.setProperty,
        runtime.getText,
        runtime.setText,
        runtime.setScreen,
        runtime.playSound,
        runtime.log,
        runtime.Math,
        runtime.setTimeout,
        runtime.clearTimeout,
        runtime.console
      );

      addConsoleLog('App logic compiled successfully! Tap buttons on the phone to interact.', 'success');
    } catch (err: any) {
      addConsoleLog(`Runtime Error: ${err.message}`, 'error');
    }
  }, [code, screens, addConsoleLog, runtimeOverrides]);

  // Trigger simulation whenever user switches to 'preview' mode
  useEffect(() => {
    if (mode === 'preview') {
      startSimulation();
    }
  }, [mode, startSimulation]);

  // Handle phone element click during simulation
  const handleElementClick = (elementId: string) => {
    if (mode === 'design') {
      setSelectedElementId(elementId);
      return;
    }

    // In preview mode: execute registered event listener
    const handlers = eventHandlersRef.current[elementId];
    if (handlers && handlers['click']) {
      try {
        handlers['click']();
      } catch (err: any) {
        addConsoleLog(`Error in "${elementId}" click handler: ${err.message}`, 'error');
      }
    } else {
      // Default tap sound if no custom handler
      playAppSound('click');
    }
  };

  // -------------------------------------------------------------
  // Visual Canvas Modifications (Design Mode)
  // -------------------------------------------------------------
  const handleAddElement = (type: 'button' | 'label' | 'image' | 'input', customProps: any = {}) => {
    const newId = `${type}_${Math.random().toString(36).substring(2, 7)}`;
    const yOffset = 50 + (currentScreen.elements.length * 50) % 350;

    let newElement: ScreenElement;
    if (type === 'button') {
      newElement = {
        id: newId,
        type: 'button',
        name: customProps.name || 'Action Button',
        text: customProps.text || 'Tap Me! 🚀',
        style: {
          x: customProps.x ?? 35,
          y: customProps.y ?? yOffset,
          width: customProps.width ?? 250,
          height: customProps.height ?? 50,
          backgroundColor: customProps.backgroundColor || '#10b981',
          color: customProps.color || '#ffffff',
          fontSize: customProps.fontSize || 16,
          fontWeight: 'bold',
          borderRadius: 14,
          position: 'absolute',
          zIndex: currentScreen.elements.length + 1
        }
      };
    } else if (type === 'label') {
      newElement = {
        id: newId,
        type: 'label',
        name: customProps.name || 'Text Label',
        text: customProps.text || 'Hello World! ✨',
        style: {
          x: customProps.x ?? 30,
          y: customProps.y ?? yOffset,
          width: customProps.width ?? 260,
          height: customProps.height ?? 40,
          fontSize: customProps.fontSize || 18,
          fontWeight: customProps.fontWeight || 'bold',
          color: customProps.color || '#facc15',
          textAlign: customProps.textAlign || 'center',
          position: 'absolute',
          zIndex: currentScreen.elements.length + 1
        }
      };
    } else if (type === 'image') {
      newElement = {
        id: newId,
        type: 'image',
        name: customProps.name || 'Picture Sticker',
        src: customProps.src || '/assets/stickers/happy-robot.svg',
        style: {
          x: customProps.x ?? 110,
          y: customProps.y ?? yOffset,
          width: customProps.width ?? 100,
          height: customProps.height ?? 100,
          position: 'absolute',
          zIndex: currentScreen.elements.length + 1
        }
      };
    } else {
      // Input
      newElement = {
        id: newId,
        type: 'input',
        name: customProps.name || 'Input Box',
        hint: customProps.hint || 'Type something here...',
        style: {
          x: customProps.x ?? 35,
          y: customProps.y ?? yOffset,
          width: customProps.width ?? 250,
          height: customProps.height ?? 45,
          backgroundColor: '#1e293b',
          color: '#ffffff',
          fontSize: 14,
          borderRadius: 12,
          position: 'absolute',
          zIndex: currentScreen.elements.length + 1
        }
      };
    }

    setScreens(prev => prev.map(s => {
      if (s.id === currentScreen.id) {
        return { ...s, elements: [...s.elements, newElement] };
      }
      return s;
    }));

    setSelectedElementId(newId);
    playAppSound('click');
  };

  const handleUpdateElement = (id: string, updates: Partial<ScreenElement>) => {
    setScreens(prev => prev.map(s => {
      const elIndex = s.elements.findIndex(e => e.id === id);
      if (elIndex === -1) return s;

      const newElements = [...s.elements];
      newElements[elIndex] = {
        ...newElements[elIndex],
        ...updates,
        style: {
          ...newElements[elIndex].style,
          ...(updates.style || {})
        }
      };
      return { ...s, elements: newElements };
    }));
  };

  const handleDeleteElement = (id: string) => {
    setScreens(prev => prev.map(s => ({
      ...s,
      elements: s.elements.filter(e => e.id !== id)
    })));
    setSelectedElementId(null);
    playAppSound('boing');
  };

  const handleAddScreen = () => {
    const num = screens.length + 1;
    const newScreenId = `screen${num}`;
    const newScreen: AppScreen = {
      id: newScreenId,
      name: `Screen ${num}`,
      backgroundColor: '#0f172a',
      elements: [
        {
          id: `title_${num}`,
          type: 'label',
          name: 'Screen Title',
          text: `Welcome to Screen ${num}! 🌟`,
          style: {
            x: 20,
            y: 40,
            width: 280,
            height: 40,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#38bdf8',
            textAlign: 'center',
            position: 'absolute',
            zIndex: 1
          }
        }
      ]
    };
    setScreens(prev => [...prev, newScreen]);
    setActiveScreenId(newScreenId);
    playAppSound('cheer');
  };

  // -------------------------------------------------------------
  // Toolbar Action Handlers
  // -------------------------------------------------------------
  const handleToolbarSoundTrigger = (sound: 'laser' | 'boing' | 'cheer' | 'cowbell', name: string) => {
    playAppSound(sound);
    addConsoleLog(`Triggered Sound: ${name}`, 'log');
  };

  const handleToolbarPetAction = (action: 'feed' | 'play' | 'sleep') => {
    if (action === 'feed') {
      playAppSound('cheer');
      addConsoleLog('Fed Bubbles a tasty snack! Hunger decreased! 🍕', 'success');
    } else if (action === 'play') {
      playAppSound('boing');
      addConsoleLog('Played fetch with Bubbles! Happiness boosted! 🎾', 'success');
    } else {
      playAppSound('cowbell');
      addConsoleLog('Bubbles is taking a cozy nap! Energy restored! 😴', 'log');
    }
  };

  const handleLoadInventorTheme = (theme: 'savings' | 'study' | 'homework' | 'reading') => {
    playAppSound('chime');
    if (theme === 'savings') {
      setScreens([
        {
          id: 'screen1',
          name: 'Savings Dashboard',
          backgroundColor: '#090d16',
          elements: [
            {
              id: 'appHeader',
              type: 'label',
              name: 'Header',
              text: '💰 DOLA SAVINGS TRACKER',
              style: { x: 20, y: 30, width: 280, height: 35, fontSize: 17, fontWeight: 'bold', color: '#facc15', textAlign: 'center', position: 'absolute', zIndex: 1 }
            },
            {
              id: 'piggyImg',
              type: 'image',
              name: 'Savings Mascot',
              src: '/assets/stickers/gold-star.svg',
              style: { x: 115, y: 70, width: 90, height: 90, position: 'absolute', zIndex: 2 }
            },
            {
              id: 'goalLabel',
              type: 'label',
              name: 'Target Goal',
              text: 'Goal: Bicycle 🚲 (₦15,000)',
              style: { x: 20, y: 170, width: 280, height: 25, fontSize: 14, color: '#94a3b8', textAlign: 'center', position: 'absolute', zIndex: 3 }
            },
            {
              id: 'savedAmount',
              type: 'label',
              name: 'Current Savings',
              text: '₦5,000 Saved',
              style: { x: 20, y: 200, width: 280, height: 45, fontSize: 26, fontWeight: 'bold', color: '#34d399', textAlign: 'center', position: 'absolute', zIndex: 4 }
            },
            {
              id: 'statusMsg',
              type: 'label',
              name: 'Progress Message',
              text: 'Keep saving! ₦10,000 left to reach your goal!',
              style: { x: 20, y: 255, width: 280, height: 30, fontSize: 12, color: '#fef08a', textAlign: 'center', position: 'absolute', zIndex: 5 }
            },
            {
              id: 'btnAdd500',
              type: 'button',
              name: 'Add 500 Naira',
              text: '+ ₦500 Deposit',
              style: { x: 30, y: 300, width: 125, height: 45, backgroundColor: '#10b981', color: '#ffffff', fontSize: 13, fontWeight: 'bold', borderRadius: 12, position: 'absolute', zIndex: 6 }
            },
            {
              id: 'btnAdd1000',
              type: 'button',
              name: 'Add 1000 Naira',
              text: '+ ₦1,000 Deposit',
              style: { x: 165, y: 300, width: 125, height: 45, backgroundColor: '#059669', color: '#ffffff', fontSize: 13, fontWeight: 'bold', borderRadius: 12, position: 'absolute', zIndex: 7 }
            },
            {
              id: 'btnReset',
              type: 'button',
              name: 'Reset Tracker',
              text: 'Reset Goal 🔄',
              style: { x: 90, y: 360, width: 140, height: 35, backgroundColor: '#334155', color: '#cbd5e1', fontSize: 12, borderRadius: 10, position: 'absolute', zIndex: 8 }
            }
          ]
        }
      ]);
      setCode(`let totalSaved = 5000;
let goalAmount = 15000;

function updateSavings() {
  setProperty("savedAmount", "text", "₦" + totalSaved.toLocaleString() + " Saved");
  let remaining = goalAmount - totalSaved;
  
  if (remaining <= 0) {
    setProperty("statusMsg", "text", "🎉 GOAL REACHED! You can buy your bicycle! 🚲");
    playSound("cheer");
  } else {
    setProperty("statusMsg", "text", "Keep saving! ₦" + remaining.toLocaleString() + " left to reach your goal!");
    playSound("laser");
  }
}

onEvent("btnAdd500", "click", () => {
  totalSaved = totalSaved + 500;
  updateSavings();
});

onEvent("btnAdd1000", "click", () => {
  totalSaved = totalSaved + 1000;
  updateSavings();
});

onEvent("btnReset", "click", () => {
  totalSaved = 0;
  updateSavings();
});`);
    } else if (theme === 'study') {
      setScreens([
        {
          id: 'screen1',
          name: 'Study Planner',
          backgroundColor: '#1e1b4b',
          elements: [
            { id: 'h1', type: 'label', name: 'Header', text: '📚 DAILY STUDY PLANNER', style: { x: 20, y: 30, width: 280, height: 35, fontSize: 17, fontWeight: 'bold', color: '#c084fc', textAlign: 'center', position: 'absolute', zIndex: 1 } },
            { id: 'mathTask', type: 'button', name: 'Math Mission', text: '📐 Maths: Fractions [Ready]', style: { x: 30, y: 90, width: 260, height: 45, backgroundColor: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 'bold', borderRadius: 12, position: 'absolute', zIndex: 2 } },
            { id: 'sciTask', type: 'button', name: 'Science Mission', text: '🔬 Science: Solar System [Ready]', style: { x: 30, y: 145, width: 260, height: 45, backgroundColor: '#8b5cf6', color: '#fff', fontSize: 13, fontWeight: 'bold', borderRadius: 12, position: 'absolute', zIndex: 3 } },
            { id: 'codeTask', type: 'button', name: 'Coding Mission', text: '💻 DolaCode: Mobile Apps [Ready]', style: { x: 30, y: 200, width: 260, height: 45, backgroundColor: '#10b981', color: '#fff', fontSize: 13, fontWeight: 'bold', borderRadius: 12, position: 'absolute', zIndex: 4 } },
            { id: 'streakLbl', type: 'label', name: 'Streak', text: '🔥 Study Streak: 3 Days!', style: { x: 20, y: 270, width: 280, height: 30, fontSize: 15, fontWeight: 'bold', color: '#facc15', textAlign: 'center', position: 'absolute', zIndex: 5 } }
          ]
        }
      ]);
      setCode(`let streak = 3;

onEvent("mathTask", "click", () => {
  setProperty("mathTask", "text", "📐 Maths: Fractions [COMPLETED! ✅]");
  playSound("cheer");
});

onEvent("sciTask", "click", () => {
  setProperty("sciTask", "text", "🔬 Science: Solar System [COMPLETED! ✅]");
  playSound("cheer");
});

onEvent("codeTask", "click", () => {
  setProperty("codeTask", "text", "💻 DolaCode: Mobile Apps [COMPLETED! ✅]");
  streak = streak + 1;
  setProperty("streakLbl", "text", "🔥 Study Streak: " + streak + " Days! AMAZING!");
  playSound("cheer");
});`);
    } else if (theme === 'homework') {
      setScreens([
        {
          id: 'screen1',
          name: 'Homework Board',
          backgroundColor: '#0f172a',
          elements: [
            { id: 'hwTitle', type: 'label', name: 'Title', text: '📝 HOMEWORK ORGANISER', style: { x: 20, y: 30, width: 280, height: 35, fontSize: 17, fontWeight: 'bold', color: '#38bdf8', textAlign: 'center', position: 'absolute', zIndex: 1 } },
            { id: 'task1', type: 'button', name: 'Task 1', text: '📖 English Essay &bull; Due Tomorrow', style: { x: 30, y: 90, width: 260, height: 50, backgroundColor: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 'bold', borderRadius: 12, position: 'absolute', zIndex: 2 } },
            { id: 'task2', type: 'button', name: 'Task 2', text: '🌍 Geography Map &bull; Due Friday', style: { x: 30, y: 150, width: 260, height: 50, backgroundColor: '#f59e0b', color: '#fff', fontSize: 13, fontWeight: 'bold', borderRadius: 12, position: 'absolute', zIndex: 3 } },
            { id: 'hwStatus', type: 'label', name: 'Status', text: '2 Assignments Pending', style: { x: 20, y: 220, width: 280, height: 30, fontSize: 14, color: '#facc15', textAlign: 'center', fontWeight: 'bold', position: 'absolute', zIndex: 4 } }
          ]
        }
      ]);
      setCode(`let pending = 2;

onEvent("task1", "click", () => {
  pending = Math.max(0, pending - 1);
  setProperty("task1", "text", "📖 English Essay [HANDED IN! 🎉]");
  setProperty("hwStatus", "text", pending + " Assignments Pending");
  playSound("cheer");
});

onEvent("task2", "click", () => {
  pending = Math.max(0, pending - 1);
  setProperty("task2", "text", "🌍 Geography Map [HANDED IN! 🎉]");
  setProperty("hwStatus", "text", pending === 0 ? "🎉 ALL HOMEWORK FINISHED!" : pending + " Assignments Pending");
  playSound("cheer");
});`);
    } else {
      // Reading Tracker
      setScreens([
        {
          id: 'screen1',
          name: 'Reading Log',
          backgroundColor: '#064e3b',
          elements: [
            { id: 'readTitle', type: 'label', name: 'Title', text: '📖 DOLA READING TRACKER', style: { x: 20, y: 30, width: 280, height: 35, fontSize: 17, fontWeight: 'bold', color: '#6ee7b7', textAlign: 'center', position: 'absolute', zIndex: 1 } },
            { id: 'bookTitle', type: 'label', name: 'Current Book', text: 'Reading: "The Magic Treehouse"', style: { x: 20, y: 80, width: 280, height: 30, fontSize: 14, color: '#fef08a', textAlign: 'center', position: 'absolute', zIndex: 2 } },
            { id: 'pageCount', type: 'label', name: 'Pages', text: 'Pages Read: 42 📄', style: { x: 20, y: 120, width: 280, height: 40, fontSize: 22, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', position: 'absolute', zIndex: 3 } },
            { id: 'btnAdd5Pages', type: 'button', name: 'Add 5 Pages', text: '+ 5 Pages Read 📖', style: { x: 40, y: 180, width: 240, height: 45, backgroundColor: '#10b981', color: '#ffffff', fontSize: 14, fontWeight: 'bold', borderRadius: 12, position: 'absolute', zIndex: 4 } },
            { id: 'btnAdd10Pages', type: 'button', name: 'Add 10 Pages', text: '+ 10 Pages Read 🚀', style: { x: 40, y: 235, width: 240, height: 45, backgroundColor: '#059669', color: '#ffffff', fontSize: 14, fontWeight: 'bold', borderRadius: 12, position: 'absolute', zIndex: 5 } }
          ]
        }
      ]);
      setCode(`let pagesRead = 42;

onEvent("btnAdd5Pages", "click", () => {
  pagesRead = pagesRead + 5;
  setProperty("pageCount", "text", "Pages Read: " + pagesRead + " 📄");
  playSound("cheer");
});

onEvent("btnAdd10Pages", "click", () => {
  pagesRead = pagesRead + 10;
  setProperty("pageCount", "text", "Pages Read: " + pagesRead + " 📄");
  playSound("cheer");
});`);
    }
  };

  // -------------------------------------------------------------
  // Draft Save & Mission Submit
  // -------------------------------------------------------------
  const handleSaveDraft = async () => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      await fetch('/api/app-studio/save-draft/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          challenge_slug: slug,
          screens: screens,
          code: code
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

      const res = await fetch('/api/app-studio/submit/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          challenge_slug: slug,
          screens: screens,
          code: code
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsCompleted(true);
        setAwardedXp(data.awarded_xp || challenge?.reward_xp || 100);
        playAppSound('cheer');
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        alert(data.message || 'Check all criteria before submitting!');
      }
    } catch (err) {
      console.error('Failed to submit challenge:', err);
      alert('Network error while submitting mission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Switch class mission
  const handleSelectMission = (newSlug: string) => {
    setSlug(newSlug);
    setAwardedXp(null);
    setMode('design');
    setConsoleLogs([]);
  };

  const activeClass = APP_CLASSES.find(c => c.slug === slug) || APP_CLASSES[0];

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* 1. TOP INSTRUCTION PANEL WITH CLASSES & CRITERIA */}
      <AppInstructionPanel
        currentSlug={slug}
        challenge={challenge}
        criteriaResults={criteriaResults}
        isCompleted={isCompleted}
        onSelectMission={handleSelectMission}
        onSubmitMission={handleSubmitMission}
        isSubmitting={isSubmitting}
      />

      {/* 2. CLASS-SPECIFIC WORKSPACE ACTION TOOLBAR */}
      <AppWorkspaceToolbar
        classNum={activeClass.num}
        currentSlug={slug}
        onAddComponent={handleAddElement}
        onTriggerSound={handleToolbarSoundTrigger}
        onPetAction={handleToolbarPetAction}
        onSwitchScreen={(id) => {
          setActiveScreenId(id);
          setSimActiveScreenId(id);
        }}
        onLoadInventorTheme={handleLoadInventorTheme}
        onOpenShareModal={() => setShowShareModal(true)}
      />

      {/* 3. MAIN WORKSPACE AREA */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* ========================================================= */}
        {/* LEFT / CENTER: PHONE SIMULATOR CANVAS                     */}
        {/* ========================================================= */}
        <div className="flex-1 bg-slate-900/60 p-4 flex flex-col items-center justify-center overflow-y-auto relative">
          {/* Phone Canvas Header Bar */}
          <div className="w-full max-w-[360px] mb-3 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              {/* Mode Toggle: Design vs Interactive Simulator */}
              <button
                onClick={() => {
                  setMode(mode === 'design' ? 'preview' : 'design');
                  playAppSound('click');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md ${
                  mode === 'preview'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 ring-2 ring-emerald-400'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {mode === 'preview' ? (
                  <>
                    <RotateCcw size={14} />
                    <span>Back to Design</span>
                  </>
                ) : (
                  <>
                    <Play size={14} className="fill-current" />
                    <span>Play App Live! 🚀</span>
                  </>
                )}
              </button>

              {/* Screens count pill */}
              <span className="text-[11px] font-bold text-slate-400 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
                {screens.length} {screens.length === 1 ? 'Screen' : 'Screens'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowTutorial(true)}
                title="Open Tutorial"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-bold transition-all border border-slate-700"
              >
                <HelpCircle size={15} />
              </button>
              <button
                onClick={() => setShowProjectsModal(true)}
                title="My Projects"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700"
              >
                <FolderOpen size={15} />
              </button>
              <button
                onClick={handleSaveDraft}
                title="Save Draft"
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700 flex items-center gap-1"
              >
                <Save size={14} />
                <span>{saveStatus === 'saving' ? '...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Screen Multi-Tab Switcher (when more than 1 screen exists) */}
          {screens.length > 1 && (
            <div className="w-full max-w-[360px] mb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {screens.map(scr => {
                const isCur = (mode === 'preview' ? simActiveScreenId : activeScreenId) === scr.id;
                return (
                  <button
                    key={scr.id}
                    onClick={() => {
                      if (mode === 'preview') setSimActiveScreenId(scr.id);
                      else setActiveScreenId(scr.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      isCur
                        ? 'bg-sky-500 text-slate-950 font-black'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    {scr.name}
                  </button>
                );
              })}
              {mode === 'design' && (
                <button
                  onClick={handleAddScreen}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-bold border border-slate-700 flex items-center gap-1"
                >
                  <Plus size={12} /> Screen
                </button>
              )}
            </div>
          )}

          {/* ===================================================== */}
          {/* THE PHYSICAL PHONE BEZEL FRAME                        */}
          {/* ===================================================== */}
          <div className="w-[330px] h-[580px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col shrink-0 ring-4 ring-slate-900/60">
            {/* Phone Speaker Notch & Camera */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full flex items-center justify-center gap-2 z-30 pointer-events-none border border-slate-800">
              <div className="w-10 h-1 bg-slate-800 rounded-full" />
              <div className="w-2.5 h-2.5 bg-slate-950 rounded-full border border-slate-800" />
            </div>

            {/* Inner Phone Screen Display */}
            <div 
              className="w-full h-full rounded-[38px] overflow-hidden relative flex flex-col"
              style={{ backgroundColor: currentScreen.backgroundColor || '#0f172a' }}
            >
              {/* Phone Status Bar */}
              <div className="h-6 pt-1 px-5 flex items-center justify-between text-[10px] font-bold text-slate-400 z-20 shrink-0 select-none">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <span>100% 🔋</span>
                </div>
              </div>

              {/* Screen Canvas Area */}
              <div className="flex-1 relative overflow-hidden">
                {currentScreen.elements.map(elem => {
                  const isSelected = selectedElementId === elem.id && mode === 'design';
                  const runtimeOverride = runtimeOverrides[elem.id];

                  // Resolve dynamic style & text
                  const displayText = runtimeOverride?.text !== undefined ? runtimeOverride.text : elem.text;
                  const displaySrc = runtimeOverride?.src !== undefined ? runtimeOverride.src : elem.src;
                  const style = {
                    ...elem.style,
                    ...(runtimeOverride?.style || {})
                  };

                  if (elem.type === 'label') {
                    return (
                      <div
                        key={elem.id}
                        onClick={() => handleElementClick(elem.id)}
                        className={`transition-all select-none flex items-center justify-center ${
                          isSelected ? 'ring-2 ring-amber-400 rounded-lg cursor-pointer bg-amber-400/10' : 'cursor-pointer'
                        }`}
                        style={{
                          left: `${style.x ?? 20}px`,
                          top: `${style.y ?? 20}px`,
                          width: `${style.width ?? 280}px`,
                          height: `${style.height ?? 40}px`,
                          fontSize: `${style.fontSize ?? 16}px`,
                          fontWeight: style.fontWeight || 'bold',
                          color: style.color || '#ffffff',
                          textAlign: (style.textAlign as any) || 'center',
                          position: 'absolute',
                          zIndex: style.zIndex ?? 1
                        }}
                      >
                        {displayText}
                      </div>
                    );
                  }

                  if (elem.type === 'image') {
                    return (
                      <div
                        key={elem.id}
                        onClick={() => handleElementClick(elem.id)}
                        className={`transition-all select-none flex items-center justify-center ${
                          isSelected ? 'ring-2 ring-sky-400 rounded-2xl cursor-pointer bg-sky-400/10' : 'cursor-pointer'
                        }`}
                        style={{
                          left: `${style.x ?? 110}px`,
                          top: `${style.y ?? 70}px`,
                          width: `${style.width ?? 100}px`,
                          height: `${style.height ?? 100}px`,
                          position: 'absolute',
                          zIndex: style.zIndex ?? 2
                        }}
                      >
                        <img 
                          src={displaySrc || '/assets/stickers/happy-robot.svg'} 
                          alt="Sticker" 
                          className="w-full h-full object-contain pointer-events-none drop-shadow-md"
                        />
                      </div>
                    );
                  }

                  if (elem.type === 'input') {
                    return (
                      <div
                        key={elem.id}
                        onClick={() => handleElementClick(elem.id)}
                        className={`transition-all select-none ${
                          isSelected ? 'ring-2 ring-purple-400 rounded-xl' : ''
                        }`}
                        style={{
                          left: `${style.x ?? 30}px`,
                          top: `${style.y ?? 180}px`,
                          width: `${style.width ?? 260}px`,
                          height: `${style.height ?? 45}px`,
                          position: 'absolute',
                          zIndex: style.zIndex ?? 3
                        }}
                      >
                        <input
                          type="text"
                          placeholder={elem.hint || 'Type here...'}
                          defaultValue={runtimeOverride?.value || ''}
                          onChange={(e) => {
                            if (mode === 'preview') {
                              setRuntimeOverrides(prev => ({
                                ...prev,
                                [elem.id]: { ...(prev[elem.id] || {}), value: e.target.value }
                              }));
                            }
                          }}
                          className="w-full h-full px-3.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                        />
                      </div>
                    );
                  }

                  // Default: Button
                  return (
                    <button
                      key={elem.id}
                      onClick={() => handleElementClick(elem.id)}
                      className={`transition-all active:scale-95 flex items-center justify-center font-black shadow-lg ${
                        isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                      }`}
                      style={{
                        left: `${style.x ?? 30}px`,
                        top: `${style.y ?? 240}px`,
                        width: `${style.width ?? 260}px`,
                        height: `${style.height ?? 50}px`,
                        backgroundColor: style.backgroundColor || '#10b981',
                        color: style.color || '#ffffff',
                        fontSize: `${style.fontSize ?? 15}px`,
                        fontWeight: style.fontWeight || 'bold',
                        borderRadius: `${style.borderRadius ?? 14}px`,
                        position: 'absolute',
                        zIndex: style.zIndex ?? 4
                      }}
                    >
                      {displayText}
                    </button>
                  );
                })}
              </div>

              {/* Home Indicator Bar */}
              <div className="h-4 flex items-center justify-center z-20 pb-1">
                <div className="w-24 h-1 bg-slate-600/60 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT: TABBED WORKBENCH (Code, Canvas Inspector, Console) */}
        {/* ========================================================= */}
        <div className="w-full lg:w-[480px] bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0">
          {/* Workbench Tabs */}
          <div className="h-11 bg-slate-950 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'code'
                    ? 'bg-purple-600 text-white font-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 size={14} />
                <span>JavaScript Code</span>
              </button>

              <button
                onClick={() => setActiveTab('inspector')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'inspector'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders size={14} />
                <span>Component Inspector</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (mode !== 'preview') setMode('preview');
                  else startSimulation();
                }}
                className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 rounded-lg text-xs font-black transition-all border border-emerald-500/30 flex items-center gap-1"
              >
                <Play size={12} className="fill-current" />
                <span>Run Code</span>
              </button>
            </div>
          </div>

          {/* Workbench Content */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {activeTab === 'code' ? (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-hidden">
                  <MonacoEditor
                    height="100%"
                    language="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    options={{
                      fontSize: 13,
                      fontFamily: "'Fira Code', 'Courier New', monospace",
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      tabSize: 2,
                      lineNumbers: 'on',
                      wordWrap: 'on',
                      automaticLayout: true,
                    }}
                  />
                </div>

                {/* Event Cheatsheet Helper Bar */}
                <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 shrink-0">
                  <div className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <Zap size={13} className="text-yellow-400" />
                    <span>Quick Code Helpers:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                    <button
                      onClick={() => setCode(prev => prev + '\nonEvent("buttonId", "click", () => {\n  playSound("cheer");\n});\n')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded border border-slate-700"
                    >
                      + onEvent()
                    </button>
                    <button
                      onClick={() => setCode(prev => prev + '\nsetProperty("labelId", "text", "Hello!");\n')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700"
                    >
                      + setProperty()
                    </button>
                    <button
                      onClick={() => setCode(prev => prev + '\nsetScreen("screen2");\n')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700"
                    >
                      + setScreen()
                    </button>
                    <button
                      onClick={() => setCode(prev => prev + '\nplaySound("laser");\n')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-pink-300 rounded border border-slate-700"
                    >
                      + playSound()
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* COMPONENT INSPECTOR TAB */
              <div className="h-full p-4 overflow-y-auto space-y-4">
                {selectedElement ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                          Selected {selectedElement.type}
                        </span>
                        <h4 className="text-sm font-black text-white">{selectedElement.name || selectedElement.id}</h4>
                        <span className="text-[11px] font-mono text-slate-400">ID: #{selectedElement.id}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteElement(selectedElement.id)}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg text-xs transition-all border border-red-500/30"
                        title="Delete Element"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Text Field */}
                    {(selectedElement.type === 'button' || selectedElement.type === 'label') && (
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Text Content</label>
                        <input
                          type="text"
                          value={selectedElement.text || ''}
                          onChange={(e) => handleUpdateElement(selectedElement.id, { text: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none focus:border-amber-400"
                        />
                      </div>
                    )}

                    {/* Image / Sticker Selector */}
                    {selectedElement.type === 'image' && (
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Pick Sticker</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            '/assets/stickers/happy-robot.svg',
                            '/assets/stickers/dino.svg',
                            '/assets/stickers/gold-star.svg',
                            '/assets/stickers/rocket.svg',
                            '/assets/stickers/leo-explorer.svg'
                          ].map(src => (
                            <button
                              key={src}
                              onClick={() => handleUpdateElement(selectedElement.id, { src })}
                              className={`p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border flex items-center justify-center transition-all ${
                                selectedElement.src === src ? 'border-sky-400 bg-sky-400/20' : 'border-slate-700'
                              }`}
                            >
                              <img src={src} alt="sticker" className="w-8 h-8 object-contain" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Color Presets */}
                    {selectedElement.type === 'button' && (
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Button Color</label>
                        <div className="flex flex-wrap gap-1.5">
                          {['#10b981', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6', '#ef4444'].map(color => (
                            <button
                              key={color}
                              onClick={() => handleUpdateElement(selectedElement.id, { style: { backgroundColor: color } })}
                              className="w-7 h-7 rounded-lg border-2 border-slate-900 transition-all hover:scale-110 active:scale-95 shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Font Size Slider */}
                    {(selectedElement.type === 'button' || selectedElement.type === 'label') && (
                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                          <span>Font Size</span>
                          <span className="text-amber-400">{selectedElement.style.fontSize || 16}px</span>
                        </div>
                        <input
                          type="range"
                          min="11"
                          max="32"
                          value={selectedElement.style.fontSize || 16}
                          onChange={(e) => handleUpdateElement(selectedElement.id, { style: { fontSize: parseInt(e.target.value) } })}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                      </div>
                    )}

                    {/* Position Sliders (X & Y) */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Position X (px)</label>
                        <input
                          type="number"
                          value={selectedElement.style.x ?? 20}
                          onChange={(e) => handleUpdateElement(selectedElement.id, { style: { x: parseInt(e.target.value) || 0 } })}
                          className="w-full px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Position Y (px)</label>
                        <input
                          type="number"
                          value={selectedElement.style.y ?? 20}
                          onChange={(e) => handleUpdateElement(selectedElement.id, { style: { y: parseInt(e.target.value) || 0 } })}
                          className="w-full px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <MousePointerClick size={36} className="text-slate-600 mb-2 animate-bounce" />
                    <p className="text-sm font-bold text-slate-300">No Component Selected</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Tap any button, label, picture, or input box on the phone to edit its properties here!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Mini Console */}
            <div className="h-32 bg-slate-950 border-t border-slate-800 p-2.5 flex flex-col shrink-0 font-mono text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Terminal size={12} className="text-emerald-400" />
                  <span>Interactive App Console</span>
                </span>
                <button
                  onClick={() => setConsoleLogs([])}
                  className="hover:text-white transition-colors text-[10px]"
                >
                  Clear
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 pt-1 text-[11px]">
                {consoleLogs.length === 0 ? (
                  <span className="text-slate-600 italic">No output yet. Interact with the app or click &quot;Run Code&quot;!</span>
                ) : (
                  consoleLogs.map(log => (
                    <div
                      key={log.id}
                      className={`flex items-start gap-1.5 ${
                        log.type === 'error'
                          ? 'text-red-400'
                          : log.type === 'success'
                            ? 'text-emerald-400 font-bold'
                            : 'text-slate-300'
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
      </div>

      {/* ========================================================= */}
      {/* MODALS                                                    */}
      {/* ========================================================= */}
      {/* 1. Step-by-Step Curriculum Tutorial Modal */}
      <AppTutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        currentClassNum={activeClass.num}
        onSelectClass={(clsNum) => {
          const target = APP_CLASSES.find(c => c.num === clsNum);
          if (target) handleSelectMission(target.slug);
        }}
      />

      {/* 2. Share & Export App Modal */}
      <AppShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        appName={challenge?.title || 'My Mobile App'}
        screens={screens}
        code={code}
      />

      {/* 3. Saved Projects Drawer Modal */}
      <AppSavedProjectsModal
        isOpen={showProjectsModal}
        onClose={() => setShowProjectsModal(false)}
        onOpenProject={(projSlug, projScreens, projCode) => {
          setSlug(projSlug);
          if (projScreens && projScreens.length > 0) setScreens(projScreens);
          if (projCode) setCode(projCode);
        }}
        onNewProject={() => {
          handleSelectMission('class-1-hello-app');
        }}
      />
    </div>
  );
}
