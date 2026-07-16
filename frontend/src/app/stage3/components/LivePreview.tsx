import React, { useState, useEffect, useRef } from 'react';
import { useAppStudioStore, AppElement } from '../store/useAppStudioStore';
import { 
  Play, Square, RefreshCw, Smartphone, Laptop, AlertCircle, 
  CheckCircle, ShieldAlert, Award, Volume2, Sparkles, VolumeX, Mic
} from 'lucide-react';

export default function LivePreview() {
  const {
    projects,
    currentProjectId,
    currentScreenId,
    isRunning,
    startSimulation,
    stopSimulation,
    addConsoleLog,
    addProblem,
    addInteractionLog
  } = useAppStudioStore();

  const project = projects.find(p => p.id === currentProjectId);

  // Local device state instead of store to prevent store bloat
  const [simulatorDevice, setSimulatorDevice] = useState<'phone' | 'tablet'>('phone');

  // Runtime states
  const [runtimeActiveScreenId, setRuntimeActiveScreenId] = useState<string | null>(null);
  const [runtimeElements, setRuntimeElements] = useState<AppElement[]>([]);
  const [localDb, setLocalDb] = useState<Record<string, any>>({});
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSource, setAudioSource] = useState<string>('');

  const eventListenersRef = useRef<Array<{ elementId: string; eventType: string; callback: Function }>>([]);

  // Reset runtime simulation when stopping/running
  useEffect(() => {
    if (isRunning && project) {
      setRuntimeActiveScreenId(currentScreenId);
      
      // Clone elements and attach screenId dynamically so we can filter them at runtime
      const clonedElements: AppElement[] = [];
      project.screens.forEach(s => {
        s.elements.forEach(el => {
          clonedElements.push({
            ...JSON.parse(JSON.stringify(el)),
            screenId: s.id
          } as any);
        });
      });
      
      setRuntimeElements(clonedElements);
      setLocalDb({});
      eventListenersRef.current = [];
      setAlertMessage(null);
      setToastMessage(null);
      addConsoleLog("Simulation started. Initializing script...");

      // Execute code
      try {
        // Define runtime helper functions
        const onEvent = (elementId: string, eventType: string, callback: Function) => {
          eventListenersRef.current.push({ elementId, eventType, callback });
        };

        const updateRuntimeElement = (id: string, prop: string, val: any) => {
          setRuntimeElements(prev => prev.map(el => {
            if (el.id === id) {
              if (prop === 'text' || prop === 'value' || prop === 'checked' || prop === 'visible' || prop === 'enabled') {
                return { ...el, [prop]: val };
              } else {
                return { ...el, style: { ...el.style, [prop]: val } };
              }
            }
            return el;
          }));
        };

        const getRuntimeElementValue = (id: string, prop: string) => {
          let target: AppElement | undefined;
          setRuntimeElements(prev => {
            target = prev.find(el => el.id === id);
            return prev;
          });
          if (!target) return undefined;
          if (prop === 'text') return target.text;
          if (prop === 'value') return target.value;
          if (prop === 'checked') return target.checked;
          if (prop === 'visible') return target.visible;
          if (prop === 'enabled') return target.enabled;
          return (target.style as any)[prop];
        };

        const setProperty = (id: string, prop: string, val: any) => {
          updateRuntimeElement(id, prop, val);
          addConsoleLog(`setProperty("${id}", "${prop}", ${JSON.stringify(val)})`);
        };

        const getProperty = (id: string, prop: string) => {
          const val = getRuntimeElementValue(id, prop);
          addConsoleLog(`getProperty("${id}", "${prop}") = ${JSON.stringify(val)}`);
          return val;
        };

        const setText = (id: string, text: any) => setProperty(id, 'text', String(text));
        const getText = (id: string) => getProperty(id, 'text');
        const setValue = (id: string, val: any) => setProperty(id, 'value', val);
        const getValue = (id: string) => getProperty(id, 'value');
        const show = (id: string) => setProperty(id, 'visible', true);
        const hide = (id: string) => setProperty(id, 'visible', false);

        const navigateTo = (screenId: string) => {
          const exists = project.screens.some(s => s.id === screenId);
          if (exists) {
            setRuntimeActiveScreenId(screenId);
            addConsoleLog(`navigateTo("${screenId}")`);
          } else {
            addProblem({ type: 'error', message: `navigateTo: Screen "${screenId}" not found in project.` });
          }
        };

        const showAlert = (msg: string) => {
          setAlertMessage(msg);
          addConsoleLog(`showAlert("${msg}")`);
        };

        const showToast = (msg: string) => {
          setToastMessage(msg);
          addConsoleLog(`showToast("${msg}")`);
          setTimeout(() => setToastMessage(null), 3000);
        };

        const playAudio = (assetName: string) => {
          addConsoleLog(`playAudio("${assetName}")`);
          const asset = project.assets.find(a => a.name.toLowerCase() === assetName.toLowerCase() || a.name.includes(assetName));
          if (asset && asset.url) {
            setAudioSource(asset.url);
            setIsPlayingAudio(true);
          } else {
            addConsoleLog(`playAudio: Asset "${assetName}" not found in Asset Manager. Playing simulated beep.`);
            setToastMessage(`🔊 Simulated Sound: ${assetName}`);
            setTimeout(() => setToastMessage(null), 1500);
          }
        };

        const saveData = (key: string, val: any) => {
          setLocalDb(prev => {
            const next = { ...prev, [key]: val };
            addConsoleLog(`saveData("${key}", ${JSON.stringify(val)})`);
            return next;
          });
        };

        const loadData = (key: string) => {
          const val = localDb[key];
          addConsoleLog(`loadData("${key}") = ${JSON.stringify(val)}`);
          return val;
        };

        const generateRandomNumber = (min: number, max: number) => {
          const num = Math.floor(Math.random() * (max - min + 1)) + min;
          addConsoleLog(`generateRandomNumber(${min}, ${max}) = ${num}`);
          return num;
        };

        const log = (msg: any) => {
          addConsoleLog(String(msg));
        };

        // Construct sandbox runner
        const runner = new Function(
          'onEvent', 'setProperty', 'getProperty', 'setText', 'getText', 
          'setValue', 'getValue', 'show', 'hide', 'navigateTo', 
          'showAlert', 'showToast', 'playAudio', 'saveData', 'loadData', 
          'generateRandomNumber', 'log',
          project.code
        );

        // Run user script
        runner(
          onEvent, setProperty, getProperty, setText, getText,
          setValue, getValue, show, hide, navigateTo,
          showAlert, showToast, playAudio, saveData, loadData,
          generateRandomNumber, log
        );

      } catch (err: any) {
        addProblem({ type: 'error', message: err.message });
        addConsoleLog(`Error: ${err.message}`);
        stopSimulation();
      }
    } else {
      addConsoleLog("Simulation stopped.");
    }
  }, [isRunning]);

  if (!project) return null;

  const activeScreen = project.screens.find(s => s.id === (isRunning ? runtimeActiveScreenId : currentScreenId));
  const activeElements = (isRunning ? runtimeElements : activeScreen?.elements || [])
    .filter(el => isRunning ? (el as any).screenId === runtimeActiveScreenId : true);

  // Trigger event listeners on click/input
  const triggerEvent = (elementId: string, eventType: string, e?: any) => {
    if (!isRunning) return;
    addInteractionLog(`Event: "${eventType}" on component "${elementId}"`);

    // Handle standard value capture for inputs
    if (eventType === 'change' && e) {
      setRuntimeElements(prev => prev.map(el => {
        if (el.id === elementId) {
          const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
          return { ...el, value: val, text: val, checked: e.target.type === 'checkbox' ? e.target.checked : el.checked };
        }
        return el;
      }));
    }

    // Run registered callback handlers
    const listeners = eventListenersRef.current.filter(l => l.elementId === elementId && l.eventType === eventType);
    listeners.forEach(l => {
      try {
        l.callback(e);
      } catch (err: any) {
        addProblem({ type: 'error', message: err.message });
        addConsoleLog(`Runtime Error: ${err.message}`);
      }
    });
  };

  // Render components inside simulation runner
  const renderRuntimeElement = (el: AppElement) => {
    if (el.visible === false) return null;

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: el.style.x,
      top: el.style.y,
      width: el.style.width,
      height: el.style.height,
      borderRadius: el.style.borderRadius,
      opacity: el.style.opacity,
      transform: `rotate(${el.style.rotation}deg)`,
      backgroundColor: el.style.backgroundColor,
      color: el.style.color,
      fontFamily: el.style.fontFamily,
      fontSize: el.style.fontSize,
      fontWeight: el.style.fontWeight,
      textAlign: el.style.textAlign,
      zIndex: el.style.zIndex,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      overflow: 'hidden'
    };

    const isEnabled = el.enabled !== false;

    switch (el.type) {
      case 'button':
        return (
          <button 
            style={baseStyle} 
            disabled={!isEnabled}
            onClick={() => triggerEvent(el.id, 'click')}
            className="shadow active:scale-95 transition-transform font-bold"
          >
            {el.text}
          </button>
        );
      case 'label':
        return (
          <div 
            style={{ ...baseStyle, justifyContent: el.style.textAlign === 'left' ? 'flex-start' : el.style.textAlign === 'right' ? 'flex-end' : 'center', padding: '0 4px' }}
            onClick={() => triggerEvent(el.id, 'click')}
          >
            {el.text}
          </div>
        );
      case 'input':
        return (
          <input 
            type="text" 
            placeholder={el.hint} 
            value={el.value || ''}
            disabled={!isEnabled}
            onChange={(e) => triggerEvent(el.id, 'change', e)}
            onClick={() => triggerEvent(el.id, 'click')}
            style={baseStyle} 
            className="px-2 border border-slate-350 focus:border-indigo-500 focus:outline-none" 
          />
        );
      case 'passwordInput':
        return (
          <input 
            type="password" 
            placeholder={el.hint} 
            value={el.value || ''}
            disabled={!isEnabled}
            onChange={(e) => triggerEvent(el.id, 'change', e)}
            style={baseStyle} 
            className="px-2 border border-slate-350 focus:border-indigo-500 focus:outline-none" 
          />
        );
      case 'numberInput':
        return (
          <input 
            type="number" 
            value={el.value || 0}
            disabled={!isEnabled}
            onChange={(e) => triggerEvent(el.id, 'change', e)}
            style={baseStyle} 
            className="px-2 border border-slate-350 focus:border-indigo-500 focus:outline-none" 
          />
        );
      case 'textArea':
        return (
          <textarea 
            placeholder={el.hint} 
            value={el.text || ''}
            disabled={!isEnabled}
            onChange={(e) => triggerEvent(el.id, 'change', e)}
            style={{ ...baseStyle, alignItems: 'flex-start', padding: '4px' }} 
            className="border border-slate-350 focus:border-indigo-500 focus:outline-none" 
          />
        );
      case 'image':
        return (
          <img 
            src={el.src} 
            alt={el.name} 
            onClick={() => triggerEvent(el.id, 'click')}
            style={{ ...baseStyle, objectFit: 'cover', cursor: isRunning ? 'pointer' : 'default' }} 
          />
        );
      case 'icon':
        return (
          <div 
            style={{ ...baseStyle, fontSize: el.style.fontSize * 1.5, cursor: isRunning ? 'pointer' : 'default' }}
            onClick={() => triggerEvent(el.id, 'click')}
          >
            {el.text}
          </div>
        );
      case 'divider':
        return <div style={{ ...baseStyle, height: '2px', backgroundColor: el.style.backgroundColor }}></div>;
      case 'spacer':
        return <div style={{ ...baseStyle, backgroundColor: 'transparent' }}></div>;
      case 'card':
        return <div style={baseStyle} className="shadow-md bg-white border border-slate-100" onClick={() => triggerEvent(el.id, 'click')}></div>;
      case 'checkbox':
        return (
          <label style={{ position: 'absolute', left: el.style.x, top: el.style.y, zIndex: el.style.zIndex }} className="flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={el.checked || false} 
              disabled={!isEnabled}
              onChange={(e) => triggerEvent(el.id, 'change', e)}
              className="w-4 h-4 accent-indigo-600" 
            />
            <span style={{ color: el.style.color, fontSize: el.style.fontSize }}>{el.text}</span>
          </label>
        );
      case 'switch':
        return (
          <label style={{ position: 'absolute', left: el.style.x, top: el.style.y, zIndex: el.style.zIndex }} className="flex items-center gap-2 cursor-pointer select-none">
            <div 
              onClick={() => isEnabled && triggerEvent(el.id, 'change', { target: { type: 'checkbox', checked: !el.checked } })}
              className={`w-8 h-4 rounded-full p-0.5 transition-colors ${el.checked ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${el.checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
            <span style={{ color: el.style.color, fontSize: el.style.fontSize }}>{el.text}</span>
          </label>
        );
      case 'dropdown':
        return (
          <select 
            value={el.value || ''}
            disabled={!isEnabled}
            onChange={(e) => triggerEvent(el.id, 'change', e)}
            style={baseStyle} 
            className="px-2 border border-slate-350 focus:outline-none"
          >
            {el.options?.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        );
      case 'slider':
        return (
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={el.value || 50} 
            disabled={!isEnabled}
            onChange={(e) => triggerEvent(el.id, 'change', e)}
            style={baseStyle} 
            className="accent-indigo-600" 
          />
        );
      case 'audio':
        return null;
      case 'video':
        return <video style={baseStyle} src={el.src} controls={isEnabled} onClick={() => triggerEvent(el.id, 'click')}></video>;
      case 'camera':
        return (
          <div style={{ ...baseStyle, backgroundColor: '#000000' }}>
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              <span className="text-[8px] text-white font-mono font-bold uppercase">REC</span>
            </div>
            <video className="w-full h-full object-cover" autoPlay muted playsInline></video>
          </div>
        );
      case 'microphone':
        return (
          <div style={{ ...baseStyle, borderRadius: '50%', backgroundColor: '#fef2f2' }}>
            <Mic size={24} className="text-red-500 animate-pulse" />
          </div>
        );
      case 'canvas':
        return (
          <canvas 
            style={{ ...baseStyle, backgroundColor: '#ffffff', cursor: 'crosshair' }} 
            className="border border-slate-200"
            onClick={() => triggerEvent(el.id, 'click')}
          ></canvas>
        );
      case 'chart':
        return (
          <div style={baseStyle} className="bg-white p-2 flex flex-col justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase">{el.chartType} Report</span>
            <div className="flex items-end gap-2.5 w-full h-[60%] px-2">
              <div className="bg-indigo-500 w-full rounded-t" style={{ height: '40%' }}></div>
              <div className="bg-indigo-600 w-full rounded-t" style={{ height: '80%' }}></div>
              <div className="bg-indigo-700 w-full rounded-t" style={{ height: '55%' }}></div>
            </div>
          </div>
        );
      case 'map':
        return (
          <div style={baseStyle} className="relative overflow-hidden bg-slate-100 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
              <span className="text-xs font-bold text-slate-700 block">{el.mapCenter || 'Map Location'}</span>
              <span className="text-[9px] text-slate-400">Map Simulation</span>
            </div>
          </div>
        );
      case 'qrScanner':
        return (
          <div style={{ ...baseStyle, backgroundColor: '#020617' }} className="flex flex-col items-center justify-center relative">
            <div className="border-2 border-indigo-500 w-[60%] h-[60%] rounded-xl flex items-center justify-center">
              <div className="w-10 h-10 border border-indigo-500/20 border-dashed animate-pulse"></div>
            </div>
            <div className="absolute left-0 w-full h-0.5 bg-indigo-500 top-1/2 animate-bounce"></div>
          </div>
        );
      case 'webViewer':
        return <iframe style={baseStyle} src={el.src}></iframe>;
      default:
        return null;
    }
  };

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden select-none shrink-0 text-slate-300">
      {/* Simulator Device Switcher */}
      <div className="bg-slate-950 border-b border-slate-850 p-2 flex items-center justify-between">
        <span className="text-xs font-black tracking-widest text-slate-400 flex items-center gap-1.5 uppercase">
          <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></span>
          Simulator Sandbox
        </span>
        <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setSimulatorDevice('phone')}
            className={`p-1.5 rounded-md transition-colors ${simulatorDevice === 'phone' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
            title="Phone mode"
          >
            <Smartphone size={13} />
          </button>
          <button
            onClick={() => setSimulatorDevice('tablet')}
            className={`p-1.5 rounded-md transition-colors ${simulatorDevice === 'tablet' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
            title="Tablet mode"
          >
            <Laptop size={13} />
          </button>
        </div>
      </div>

      {/* Simulator Viewer Frame */}
      <div className="flex-1 flex items-center justify-center bg-slate-950 p-4 relative custom-scrollbar">
        {/* Device frame container */}
        <div 
          className={`bg-slate-900 border-[12px] border-slate-800 shadow-2xl flex items-center justify-center relative transition-all duration-300 ${
            simulatorDevice === 'phone' 
              ? 'w-[328px] h-[552px] rounded-[38px] border-[10px]' 
              : 'w-[344px] h-[460px] rounded-[24px] border-[12px]'
          }`}
        >
          {/* Top Notch speaker for phone */}
          {simulatorDevice === 'phone' && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-3 bg-slate-800 rounded-full z-20 flex items-center justify-center">
              <div className="w-10 h-0.5 bg-slate-900 rounded-full"></div>
            </div>
          )}

          {/* Simulator Screen viewport viewport */}
          <div 
            style={{ backgroundColor: activeScreen?.backgroundColor || '#ffffff' }}
            className={`overflow-hidden relative shadow-inner w-full h-full transition-all duration-300 ${
              simulatorDevice === 'phone' ? 'rounded-[26px]' : 'rounded-[12px]'
            }`}
          >
            {/* If not running, show play overlay button */}
            {!isRunning && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-30 select-none">
                <Play size={44} className="text-indigo-500 mb-3 animate-pulse cursor-pointer hover:scale-110 transition-transform" onClick={startSimulation} />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">Simulator Idle</h4>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Click the big Play icon or the top green RUN button to load your scripts.</p>
              </div>
            )}

            {/* Render active screen elements */}
            {activeElements.map((el) => (
              <div key={el.id}>
                {renderRuntimeElement(el)}
              </div>
            ))}

            {/* Dynamic Alert modal overlay */}
            {alertMessage && (
              <div className="absolute inset-0 bg-slate-950/75 flex items-center justify-center p-6 z-50">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl max-w-[240px] text-center space-y-3">
                  <AlertCircle size={32} className="text-indigo-500 mx-auto" />
                  <p className="text-xs font-black text-slate-200">{alertMessage}</p>
                  <button
                    onClick={() => setAlertMessage(null)}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-black"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic Toast overlay banner */}
            {toastMessage && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-800 shadow-xl px-3 py-2 rounded-xl text-center z-50 flex items-center gap-1.5 max-w-[240px] animate-bounce">
                <Sparkles size={12} className="text-indigo-400 shrink-0" />
                <span className="text-[10px] font-bold text-slate-200 truncate">{toastMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulated Audio Stream Player */}
      {isPlayingAudio && (
        <div className="bg-slate-950 px-3 py-1.5 border-t border-slate-850 flex items-center justify-between text-[10px]">
          <span className="font-mono text-slate-500 truncate max-w-[200px]">🔊 Playing audio: {audioSource}</span>
          <button 
            onClick={() => setIsPlayingAudio(false)}
            className="text-indigo-400 hover:text-indigo-300 font-bold"
          >
            MUTE
          </button>
          <audio src={audioSource} autoPlay onEnded={() => setIsPlayingAudio(false)} className="hidden"></audio>
        </div>
      )}
    </div>
  );
}
