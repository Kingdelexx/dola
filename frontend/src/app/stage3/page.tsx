'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import FeedbackModal from '@/components/FeedbackModal';
import { 
  Play, 
  Square, 
  Plus, 
  Trash2, 
  Settings, 
  Code, 
  Layout, 
  Info, 
  Sparkles, 
  RefreshCw, 
  ArrowLeft,
  MousePointer,
  HelpCircle
} from 'lucide-react';

interface AppElement {
  id: string;
  type: 'button' | 'label' | 'input' | 'image' | 'slider';
  text?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  value?: number;
  src?: string;
  hidden: boolean;
  borderRadius: number;
}

interface Template {
  name: string;
  description: string;
  elements: AppElement[];
  code: string;
  screenColor: string;
}

const TEMPLATES: Record<string, Template> = {
  counter: {
    name: "Counter App 🔢",
    description: "Create an interactive counter that increases and decreases on clicks.",
    screenColor: "#ffffff",
    elements: [
      {
        id: "counterLabel",
        type: "label",
        text: "0",
        x: 100,
        y: 80,
        width: 100,
        height: 60,
        backgroundColor: "transparent",
        textColor: "#1e293b",
        fontSize: 48,
        hidden: false,
        borderRadius: 0
      },
      {
        id: "btnUp",
        type: "button",
        text: "Count Up 🚀",
        x: 50,
        y: 180,
        width: 200,
        height: 50,
        backgroundColor: "#6366f1",
        textColor: "#ffffff",
        fontSize: 18,
        hidden: false,
        borderRadius: 12
      },
      {
        id: "btnDown",
        type: "button",
        text: "Count Down 📉",
        x: 50,
        y: 250,
        width: 200,
        height: 50,
        backgroundColor: "#ef4444",
        textColor: "#ffffff",
        fontSize: 18,
        hidden: false,
        borderRadius: 12
      }
    ],
    code: `// Counter App Logic
let count = 0;

onEvent("btnUp", "click", () => {
  count = count + 1;
  setProperty("counterLabel", "text", count);
});

onEvent("btnDown", "click", () => {
  count = count - 1;
  setProperty("counterLabel", "text", count);
});`
  },
  lightBulb: {
    name: "Light Bulb 💡",
    description: "Turn a light switch on/off to change screen color and text.",
    screenColor: "#0f172a",
    elements: [
      {
        id: "bulbLabel",
        type: "label",
        text: "The bulb is OFF 😴",
        x: 50,
        y: 100,
        width: 200,
        height: 40,
        backgroundColor: "transparent",
        textColor: "#94a3b8",
        fontSize: 18,
        hidden: false,
        borderRadius: 0
      },
      {
        id: "toggleBtn",
        type: "button",
        text: "Turn ON 💡",
        x: 50,
        y: 200,
        width: 200,
        height: 50,
        backgroundColor: "#f59e0b",
        textColor: "#ffffff",
        fontSize: 16,
        hidden: false,
        borderRadius: 25
      }
    ],
    code: `// Light Bulb Switch Logic
let isOn = false;

onEvent("toggleBtn", "click", () => {
  isOn = !isOn;
  if (isOn) {
    setProperty("bulbLabel", "text", "The bulb is ON! 💡");
    setProperty("bulbLabel", "textColor", "#fef08a");
    setProperty("toggleBtn", "text", "Turn OFF 😴");
    setScreenColor("#fef08a"); // Bright yellow background
  } else {
    setProperty("bulbLabel", "text", "The bulb is OFF 😴");
    setProperty("bulbLabel", "textColor", "#94a3b8");
    setProperty("toggleBtn", "text", "Turn ON 💡");
    setScreenColor("#0f172a"); // Dark slate background
  }
});`
  },
  colorMixer: {
    name: "Color Mixer 🎨",
    description: "Use red, green, and blue sliders to create your own color background.",
    screenColor: "#808080",
    elements: [
      {
        id: "mixerLabel",
        type: "label",
        text: "Slide to mix colors!",
        x: 30,
        y: 50,
        width: 240,
        height: 30,
        backgroundColor: "transparent",
        textColor: "#ffffff",
        fontSize: 16,
        hidden: false,
        borderRadius: 0
      },
      {
        id: "redSlider",
        type: "slider",
        x: 50,
        y: 120,
        width: 200,
        height: 30,
        backgroundColor: "#ef4444",
        textColor: "#ffffff",
        fontSize: 14,
        value: 128,
        hidden: false,
        borderRadius: 8
      },
      {
        id: "greenSlider",
        type: "slider",
        x: 50,
        y: 180,
        width: 200,
        height: 30,
        backgroundColor: "#22c55e",
        textColor: "#ffffff",
        fontSize: 14,
        value: 128,
        hidden: false,
        borderRadius: 8
      },
      {
        id: "blueSlider",
        type: "slider",
        x: 50,
        y: 240,
        width: 200,
        height: 30,
        backgroundColor: "#3b82f6",
        textColor: "#ffffff",
        fontSize: 14,
        value: 128,
        hidden: false,
        borderRadius: 8
      }
    ],
    code: `// Color Mixer Logic
let r = 128;
let g = 128;
let b = 128;

function updateMixer() {
  let hexColor = "#" + 
    Number(r).toString(16).padStart(2, '0') + 
    Number(g).toString(16).padStart(2, '0') + 
    Number(b).toString(16).padStart(2, '0');
  setScreenColor(hexColor);
}

onEvent("redSlider", "change", (val) => {
  r = val;
  updateMixer();
});

onEvent("greenSlider", "change", (val) => {
  g = val;
  updateMixer();
});

onEvent("blueSlider", "change", (val) => {
  b = val;
  updateMixer();
});`
  }
};

export default function Stage3Page() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  
  // Workspace modes: 'design' or 'code'
  const [mode, setMode] = useState<'design' | 'code'>('design');
  const [isRunning, setIsRunning] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // App Canvas State
  const [elements, setElements] = useState<AppElement[]>(TEMPLATES.counter.elements);
  const [screenColor, setScreenColor] = useState<string>(TEMPLATES.counter.screenColor);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  // Code State
  const [code, setCode] = useState<string>(TEMPLATES.counter.code);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  
  // Active Event Handlers (Bound during Simulator execution)
  const eventListenersRef = useRef<Record<string, Record<string, (val?: any) => void>>>({});
  
  // Element Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Update simulator state
  const simulatorElementsRef = useRef<AppElement[]>(elements);
  useEffect(() => {
    simulatorElementsRef.current = elements;
  }, [elements]);

  const simulatorScreenColorRef = useRef<string>(screenColor);
  useEffect(() => {
    simulatorScreenColorRef.current = screenColor;
  }, [screenColor]);

  // Load user data / sync streak
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/user/progress/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({})
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          updateUser(data.user);
        }
      })
      .catch(err => console.error("Error updating streak on mount:", err));
    }
  }, []);

  // Save Progress & Submit Feedback
  const handleCompleteStage = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/user/progress/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({
            stage: 3,
            progress: 1
          })
        });
        const data = await response.json();
        if (data.success) {
          updateUser(data.user);
        }
      } catch (err) {
        console.error("Error updating progress on backend:", err);
      }
    }
    setShowFeedbackModal(true);
  };

  const handleFeedbackClose = () => {
    setShowFeedbackModal(false);
    router.push('/dashboard');
  };

  // Add Component to Phone Designer
  const addElement = (type: AppElement['type']) => {
    const count = elements.filter(e => e.type === type).length + 1;
    const newId = `${type}${count}`;
    
    const defaults: Record<AppElement['type'], Partial<AppElement>> = {
      button: { text: "Button 🔘", backgroundColor: "#3b82f6", textColor: "#ffffff", fontSize: 16, width: 140, height: 45, borderRadius: 8 },
      label: { text: "Label 📝", backgroundColor: "transparent", textColor: "#1e293b", fontSize: 18, width: 150, height: 35, borderRadius: 0 },
      input: { text: "", backgroundColor: "#ffffff", textColor: "#1e293b", fontSize: 14, width: 180, height: 40, borderRadius: 6 },
      image: { src: "/assets/sprites/rocket.png", backgroundColor: "transparent", textColor: "", fontSize: 0, width: 80, height: 80, borderRadius: 0 },
      slider: { value: 50, backgroundColor: "#e2e8f0", textColor: "#3b82f6", fontSize: 12, width: 200, height: 20, borderRadius: 10 }
    };

    const newElement: AppElement = {
      id: newId,
      type,
      x: 50,
      y: 100 + (elements.length * 15) % 200,
      width: defaults[type].width || 100,
      height: defaults[type].height || 40,
      backgroundColor: defaults[type].backgroundColor || "#ffffff",
      textColor: defaults[type].textColor || "#000000",
      fontSize: defaults[type].fontSize || 16,
      value: defaults[type].value,
      src: defaults[type].src,
      hidden: false,
      borderRadius: defaults[type].borderRadius || 0,
      text: defaults[type].text
    };

    setElements([...elements, newElement]);
    setSelectedElementId(newId);
  };

  // Delete Component
  const deleteElement = (id: string) => {
    setElements(elements.filter(e => e.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  // Update specific property of an element
  const updateElementProp = (id: string, prop: keyof AppElement, value: any) => {
    setElements(elements.map(e => {
      if (e.id === id) {
        return { ...e, [prop]: value };
      }
      return e;
    }));
  };

  // Template loader
  const loadTemplate = (key: keyof typeof TEMPLATES) => {
    const t = TEMPLATES[key];
    setElements(t.elements);
    setCode(t.code);
    setScreenColor(t.screenColor);
    setSelectedElementId(null);
    setConsoleLogs([]);
    setIsRunning(false);
  };

  // Dragging Handlers in Design Canvas
  const handleDragStart = (e: React.MouseEvent, el: AppElement) => {
    if (mode !== 'design') return;
    setSelectedElementId(el.id);
    setIsDragging(true);
    
    // Calculate mouse position relative to component top-left
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleDragOver = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElementId || mode !== 'design') return;
    
    const canvas = e.currentTarget.getBoundingClientRect();
    let newX = e.clientX - canvas.left - dragOffset.x;
    let newY = e.clientY - canvas.top - dragOffset.y;
    
    // Bounds checking
    const el = elements.find(el => el.id === selectedElementId);
    if (el) {
      newX = Math.max(0, Math.min(newX, canvas.width - el.width));
      newY = Math.max(0, Math.min(newY, canvas.height - el.height));
      
      updateElementProp(selectedElementId, 'x', Math.round(newX));
      updateElementProp(selectedElementId, 'y', Math.round(newY));
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Run Simulator Engine
  const startSimulator = () => {
    setIsRunning(true);
    setConsoleLogs(["Simulator started 🚀"]);
    eventListenersRef.current = {};

    // 1. Core API definitions inside the App Lab sandbox
    const onEvent = (id: string, eventType: string, callback: (val?: any) => void) => {
      if (!eventListenersRef.current[id]) {
        eventListenersRef.current[id] = {};
      }
      eventListenersRef.current[id][eventType] = callback;
    };

    const setProperty = (id: string, property: string, value: any) => {
      // Direct React State Updates of simulation elements
      setElements(prev => prev.map(e => {
        if (e.id === id) {
          // Map properties
          if (property === 'text') return { ...e, text: String(value) };
          if (property === 'backgroundColor') return { ...e, backgroundColor: String(value) };
          if (property === 'textColor') return { ...e, textColor: String(value) };
          if (property === 'value') return { ...e, value: Number(value) };
          if (property === 'hidden') return { ...e, hidden: Boolean(value) };
          if (property === 'src') return { ...e, src: String(value) };
        }
        return e;
      }));
    };

    const getProperty = (id: string, property: string) => {
      const target = simulatorElementsRef.current.find(e => e.id === id);
      if (!target) return undefined;
      if (property === 'text') return target.text;
      if (property === 'value') return target.value;
      if (property === 'backgroundColor') return target.backgroundColor;
      if (property === 'textColor') return target.textColor;
      if (property === 'src') return target.src;
      return undefined;
    };

    const setScreenColor = (color: string) => {
      setScreenColor(color);
    };

    const log = (...msg: any[]) => {
      setConsoleLogs(prev => [...prev, msg.map(m => typeof m === 'object' ? JSON.stringify(m) : String(m)).join(' ')]);
    };

    // 2. Safe execution structure
    try {
      // Build a wrapper function providing App Lab APIs in scope
      const sandbox = new Function('onEvent', 'setProperty', 'getProperty', 'setScreenColor', 'log', code);
      sandbox(onEvent, setProperty, getProperty, setScreenColor, log);
    } catch (err: any) {
      setConsoleLogs(prev => [...prev, `❌ Error: ${err.message}`]);
      setIsRunning(false);
    }
  };

  const stopSimulator = () => {
    setIsRunning(false);
    setConsoleLogs(prev => [...prev, "Simulator stopped ⏹️"]);
    eventListenersRef.current = {};
  };

  // Triggering simulation events from UI clicks/changes
  const triggerSimulationEvent = (id: string, eventType: string, val?: any) => {
    if (!isRunning) return;
    const elementListeners = eventListenersRef.current[id];
    if (elementListeners && elementListeners[eventType]) {
      try {
        elementListeners[eventType](val);
      } catch (err: any) {
        setConsoleLogs(prev => [...prev, `❌ Runtime Error inside ${id} event: ${err.message}`]);
      }
    }
  };

  // Injects code snippet into Editor
  const insertCodeSnippet = (snippet: string) => {
    setCode(prev => prev + '\n' + snippet);
    setMode('code');
  };

  const selectedElement = elements.find(e => e.id === selectedElementId);

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight">World 3: DolaCode App Lab 📱</h1>
            <p className="text-xs text-indigo-100 font-medium">Design your own user interface and code actions in real-time!</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Templates Quick Selector */}
          <div className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="text-xs font-black uppercase text-indigo-200">Load Demo:</span>
            <select 
              className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
              onChange={(e) => loadTemplate(e.target.value)}
            >
              <option value="counter" className="text-slate-800 font-medium">Counter App</option>
              <option value="lightBulb" className="text-slate-800 font-medium">Light Bulb</option>
              <option value="colorMixer" className="text-slate-800 font-medium">Color Mixer</option>
            </select>
          </div>

          <button
            onClick={handleCompleteStage}
            className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 border-2 border-white"
          >
            Complete & Feedback 💬
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: Toolboxes / Snippets (lg:col-span-3) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm flex flex-col gap-6">
          {/* Designer Elements Toolbox */}
          <div>
            <h2 className="text-md font-black text-slate-800 mb-4 flex items-center gap-2">
              <Layout size={18} className="text-indigo-500" />
              <span>UI Components</span>
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => addElement('button')} 
                disabled={isRunning}
                className="p-3 bg-slate-50 hover:bg-indigo-50 border-2 border-slate-100 hover:border-indigo-300 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-slate-700 hover:text-indigo-600 disabled:opacity-50"
              >
                <span className="text-xl">🔘</span>
                <span className="text-xs font-black">Button</span>
              </button>

              <button 
                onClick={() => addElement('label')} 
                disabled={isRunning}
                className="p-3 bg-slate-50 hover:bg-indigo-50 border-2 border-slate-100 hover:border-indigo-300 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-slate-700 hover:text-indigo-600 disabled:opacity-50"
              >
                <span className="text-xl">📝</span>
                <span className="text-xs font-black">Label</span>
              </button>

              <button 
                onClick={() => addElement('input')} 
                disabled={isRunning}
                className="p-3 bg-slate-50 hover:bg-indigo-50 border-2 border-slate-100 hover:border-indigo-300 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-slate-700 hover:text-indigo-600 disabled:opacity-50"
              >
                <span className="text-xl">🔤</span>
                <span className="text-xs font-black">Text Input</span>
              </button>

              <button 
                onClick={() => addElement('slider')} 
                disabled={isRunning}
                className="p-3 bg-slate-50 hover:bg-indigo-50 border-2 border-slate-100 hover:border-indigo-300 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-slate-700 hover:text-indigo-600 disabled:opacity-50"
              >
                <span className="text-xl">🎚️</span>
                <span className="text-xs font-black">Slider</span>
              </button>

              <button 
                onClick={() => addElement('image')} 
                disabled={isRunning}
                className="p-3 bg-slate-50 hover:bg-indigo-50 border-2 border-slate-100 hover:border-indigo-300 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-slate-700 hover:text-indigo-600 col-span-2 disabled:opacity-50"
              >
                <span className="text-xl">🖼️</span>
                <span className="text-xs font-black">Image Box</span>
              </button>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Code Snippets Cheat Sheet */}
          <div>
            <h2 className="text-md font-black text-slate-800 mb-4 flex items-center gap-2">
              <Code size={18} className="text-purple-500" />
              <span>App API Library</span>
            </h2>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => insertCodeSnippet('onEvent("id", "click", () => {\n  // Code runs on click\n});')}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-purple-50 rounded-xl border border-slate-200 hover:border-purple-300 text-xs font-mono text-slate-700 transition-all"
              >
                <span className="font-bold text-purple-600">onEvent</span>("id", "click", callback)
              </button>

              <button 
                onClick={() => insertCodeSnippet('setProperty("id", "text", "New Text");')}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-purple-50 rounded-xl border border-slate-200 hover:border-purple-300 text-xs font-mono text-slate-700 transition-all"
              >
                <span className="font-bold text-blue-600">setProperty</span>("id", "text", value)
              </button>

              <button 
                onClick={() => insertCodeSnippet('getProperty("id", "text");')}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-purple-50 rounded-xl border border-slate-200 hover:border-purple-300 text-xs font-mono text-slate-700 transition-all"
              >
                <span className="font-bold text-indigo-600">getProperty</span>("id", "property")
              </button>

              <button 
                onClick={() => insertCodeSnippet('setScreenColor("#ff0000");')}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-purple-50 rounded-xl border border-slate-200 hover:border-purple-300 text-xs font-mono text-slate-700 transition-all"
              >
                <span className="font-bold text-orange-600">setScreenColor</span>(color)
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Mobile Device Simulator (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="flex gap-2 mb-4 w-full justify-center">
            {/* Mode Toggles */}
            <button 
              onClick={() => setMode('design')}
              className={`flex-1 py-2 px-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 border-2 ${
                mode === 'design' 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <MousePointer size={16} /> Design Mode
            </button>
            <button 
              onClick={() => setMode('code')}
              className={`flex-1 py-2 px-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 border-2 ${
                mode === 'code' 
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Code size={16} /> Code Editor
            </button>
          </div>

          {/* Mobile phone bezel frame */}
          <div className="w-[340px] h-[640px] bg-slate-800 rounded-[3rem] p-4 border-[8px] border-slate-700 shadow-2xl relative">
            {/* Ear Speaker */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-20"></div>

            {/* Mobile Screen Canvas */}
            <div 
              onMouseMove={handleDragOver}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              style={{ backgroundColor: screenColor }}
              className="w-full h-full rounded-[2.2rem] overflow-hidden relative border border-slate-900 select-none transition-colors duration-300"
            >
              {/* Added Components */}
              {elements.map((el) => {
                const isSelected = selectedElementId === el.id;
                
                // Element Renderer
                return (
                  <div
                    key={el.id}
                    onMouseDown={(e) => handleDragStart(e, el)}
                    style={{
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width}px`,
                      height: `${el.height}px`,
                      backgroundColor: el.type === 'label' && el.backgroundColor === 'transparent' ? 'transparent' : el.backgroundColor,
                      color: el.textColor,
                      fontSize: `${el.fontSize}px`,
                      borderRadius: `${el.borderRadius}px`,
                      display: el.hidden ? 'none' : 'flex'
                    }}
                    className={`absolute items-center justify-center font-bold overflow-hidden select-none transition-shadow ${
                      mode === 'design' ? 'cursor-move' : ''
                    } ${
                      isSelected && mode === 'design' 
                        ? 'outline-dashed outline-2 outline-indigo-500 shadow-lg scale-102 ring-4 ring-indigo-200 z-10' 
                        : ''
                    }`}
                  >
                    {el.type === 'button' && (
                      <button 
                        onClick={() => triggerSimulationEvent(el.id, 'click')}
                        className="w-full h-full flex items-center justify-center font-black active:opacity-75"
                        disabled={mode === 'design'}
                      >
                        {el.text}
                      </button>
                    )}

                    {el.type === 'label' && (
                      <span className="text-center w-full select-none font-semibold px-2">{el.text}</span>
                    )}

                    {el.type === 'input' && (
                      <input 
                        type="text" 
                        placeholder="Type here..." 
                        value={el.text}
                        disabled={mode === 'design'}
                        onChange={(e) => {
                          updateElementProp(el.id, 'text', e.target.value);
                          triggerSimulationEvent(el.id, 'input', e.target.value);
                        }}
                        className="w-full h-full bg-transparent border-0 outline-none px-3 font-semibold text-slate-800"
                      />
                    )}

                    {el.type === 'slider' && (
                      <div className="w-full px-2 flex items-center h-full">
                        <input 
                          type="range"
                          min="0"
                          max="255"
                          value={el.value ?? 128}
                          disabled={mode === 'design'}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            updateElementProp(el.id, 'value', val);
                            triggerSimulationEvent(el.id, 'change', val);
                          }}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>
                    )}

                    {el.type === 'image' && (
                      <img 
                        src={el.src} 
                        alt="app element" 
                        draggable={false}
                        onClick={() => triggerSimulationEvent(el.id, 'click')}
                        className="w-full h-full object-contain pointer-events-none" 
                      />
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Home button notch */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/20 rounded-full"></div>
          </div>
        </div>

        {/* RIGHT COLUMN: Code Workspace / Properties (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Simulation Controllers (Always visible on top-right) */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm flex items-center justify-between">
            <span className="font-black text-slate-800 text-sm">Simulator Status:</span>
            <div className="flex gap-2">
              {!isRunning ? (
                <button
                  onClick={startSimulator}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Play size={14} className="fill-white" /> Run
                </button>
              ) : (
                <button
                  onClick={stopSimulator}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Square size={14} className="fill-white" /> Stop
                </button>
              )}
            </div>
          </div>

          {/* Conditionally display Designer Properties or Code Text Editor */}
          {mode === 'design' ? (
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm flex-1 flex flex-col">
              <h2 className="text-md font-black text-slate-800 mb-4 flex items-center gap-2 border-b pb-3">
                <Settings size={18} className="text-indigo-500" />
                <span>Element Inspector</span>
              </h2>

              {selectedElement ? (
                <div className="flex-1 flex flex-col gap-4 text-xs font-semibold text-slate-600 overflow-y-auto">
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 block uppercase">Type</span>
                      <span className="font-black text-slate-800 uppercase">{selectedElement.type}</span>
                    </div>
                    <button 
                      onClick={() => deleteElement(selectedElement.id)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg border border-transparent hover:border-red-100 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div>
                    <label className="block mb-1 text-[10px] font-black uppercase text-slate-400">Element ID</label>
                    <input 
                      type="text" 
                      value={selectedElement.id} 
                      onChange={(e) => updateElementProp(selectedElement.id, 'id', e.target.value.replace(/\s+/g, ''))}
                      className="w-full px-3 py-2 bg-slate-50 border-2 rounded-xl focus:border-indigo-400 outline-none font-mono text-slate-800"
                    />
                  </div>

                  {/* Component specific properties */}
                  {selectedElement.type !== 'image' && selectedElement.type !== 'slider' && (
                    <div>
                      <label className="block mb-1 text-[10px] font-black uppercase text-slate-400">Display Text</label>
                      <input 
                        type="text" 
                        value={selectedElement.text || ''} 
                        onChange={(e) => updateElementProp(selectedElement.id, 'text', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border-2 rounded-xl focus:border-indigo-400 outline-none text-slate-800"
                      />
                    </div>
                  )}

                  {selectedElement.type === 'image' && (
                    <div>
                      <label className="block mb-1 text-[10px] font-black uppercase text-slate-400">Image Asset Source</label>
                      <select 
                        value={selectedElement.src || ''} 
                        onChange={(e) => updateElementProp(selectedElement.id, 'src', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border-2 rounded-xl focus:border-indigo-400 outline-none text-slate-800 font-bold"
                      >
                        <option value="/assets/sprites/rocket.png">🚀 Space Rocket</option>
                        <option value="/assets/sprites/alien.png">👽 Friendly Alien</option>
                        <option value="/assets/sprites/dog.png">🐕 Playful Puppy</option>
                        <option value="/assets/sprites/cat.png">🐈 Fluffy Kitten</option>
                        <option value="/assets/sprites/dinosaur.png">🦖 Green Dino</option>
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-[10px] font-black uppercase text-slate-400">Font Size (px)</label>
                      <input 
                        type="number" 
                        value={selectedElement.fontSize} 
                        onChange={(e) => updateElementProp(selectedElement.id, 'fontSize', parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 bg-slate-50 border-2 rounded-xl focus:border-indigo-400 outline-none text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-[10px] font-black uppercase text-slate-400">Border Radius (px)</label>
                      <input 
                        type="number" 
                        value={selectedElement.borderRadius} 
                        onChange={(e) => updateElementProp(selectedElement.id, 'borderRadius', parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 bg-slate-50 border-2 rounded-xl focus:border-indigo-400 outline-none text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-[10px] font-black uppercase text-slate-400">Width (px)</label>
                      <input 
                        type="number" 
                        value={selectedElement.width} 
                        onChange={(e) => updateElementProp(selectedElement.id, 'width', parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 bg-slate-50 border-2 rounded-xl focus:border-indigo-400 outline-none text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-[10px] font-black uppercase text-slate-400">Height (px)</label>
                      <input 
                        type="number" 
                        value={selectedElement.height} 
                        onChange={(e) => updateElementProp(selectedElement.id, 'height', parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 bg-slate-50 border-2 rounded-xl focus:border-indigo-400 outline-none text-slate-800"
                      />
                    </div>
                  </div>

                  {selectedElement.type !== 'image' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-[10px] font-black uppercase text-slate-400">Bg Color</label>
                        <input 
                          type="color" 
                          value={selectedElement.backgroundColor.startsWith('#') ? selectedElement.backgroundColor : '#ffffff'} 
                          onChange={(e) => updateElementProp(selectedElement.id, 'backgroundColor', e.target.value)}
                          className="w-full h-9 bg-slate-50 border-2 rounded-xl focus:border-indigo-400 outline-none p-1 cursor-pointer"
                        />
                      </div>

                      {selectedElement.type !== 'slider' && (
                        <div>
                          <label className="block mb-1 text-[10px] font-black uppercase text-slate-400">Text Color</label>
                          <input 
                            type="color" 
                            value={selectedElement.textColor.startsWith('#') ? selectedElement.textColor : '#000000'} 
                            onChange={(e) => updateElementProp(selectedElement.id, 'textColor', e.target.value)}
                            className="w-full h-9 bg-slate-50 border-2 rounded-xl focus:border-indigo-400 outline-none p-1 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border mt-2">
                    <input 
                      type="checkbox" 
                      id="hiddenCheck"
                      checked={selectedElement.hidden}
                      onChange={(e) => updateElementProp(selectedElement.id, 'hidden', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="hiddenCheck" className="text-slate-700 cursor-pointer">Hide component from start</label>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                  <MousePointer size={36} className="mb-2 text-slate-300" />
                  <p className="font-bold text-xs">Click a component on the phone simulator to inspect and customize its properties!</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 rounded-3xl p-6 border-2 border-slate-800 shadow-lg flex-1 flex flex-col text-white">
              <h2 className="text-md font-black mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Code size={18} className="text-purple-400" />
                  <span>JavaScript Logic code</span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">AppLab.js</span>
              </h2>

              <textarea 
                value={code} 
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Write code here..."
                className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-indigo-300 outline-none resize-none focus:border-purple-500 min-h-[220px]"
              />

              {/* Console logs */}
              <div className="mt-4 border-t border-slate-800 pt-4 flex-1 flex flex-col min-h-[140px] max-h-[180px]">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Debugger Output</span>
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[10px] text-slate-400 overflow-y-auto flex flex-col gap-1 select-text">
                  {consoleLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">{log}</div>
                  ))}
                  {consoleLogs.length === 0 && (
                    <span className="text-slate-600">No output logs. Click "Run" to launch simulator...</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      <FeedbackModal
        isOpen={showFeedbackModal}
        stage={3}
        part={1}
        onClose={handleFeedbackClose}
      />
    </div>
  );
}
