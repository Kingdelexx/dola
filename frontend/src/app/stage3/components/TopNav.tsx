import React, { useState } from 'react';
import { useAppStudioStore } from '../store/useAppStudioStore';
import { 
  Play, Square, Save, RotateCcw, RotateCw, Download, Settings, 
  Plus, FolderOpen, Copy, Trash2, Heart, Award, ArrowLeft, RefreshCw, Code
} from 'lucide-react';
import Link from 'next/link';

interface TopNavProps {
  onCompleteStage?: () => void;
}

export default function TopNav({ onCompleteStage }: TopNavProps) {
  const {
    projects,
    currentProjectId,
    selectProject,
    createProject,
    deleteProject,
    renameProject,
    duplicateProject,
    toggleFavoriteProject,
    undo,
    redo,
    undoStack,
    redoStack,
    isRunning,
    startSimulation,
    stopSimulation,
    activeTab,
    setActiveTab
  } = useAppStudioStore();

  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState('');

  const currentProject = projects.find(p => p.id === currentProjectId);

  const handleStartEditingName = () => {
    if (currentProject) {
      setProjectNameInput(currentProject.name);
      setIsEditingName(true);
    }
  };

  const handleSaveName = () => {
    if (currentProjectId && projectNameInput.trim()) {
      renameProject(currentProjectId, projectNameInput.trim());
    }
    setIsEditingName(false);
  };

  const handleManualSave = () => {
    localStorage.setItem('dola_appstudio_projects', JSON.stringify(projects));
    alert("Project saved successfully! 💾");
  };

  // Compile full offline bundle
  const generateHTMLBundle = () => {
    if (!currentProject) return '';
    
    // Build screens HTML elements
    let screensHTML = '';
    currentProject.screens.forEach((screen, idx) => {
      let elementsHTML = '';
      screen.elements.forEach(el => {
        let elStyles = `position:${el.style.position};left:${el.style.x}px;top:${el.style.y}px;width:${el.style.width}px;height:${el.style.height}px;border-radius:${el.style.borderRadius}px;opacity:${el.style.opacity};transform:rotate(${el.style.rotation}deg);background-color:${el.style.backgroundColor};color:${el.style.color};font-family:${el.style.fontFamily};font-size:${el.style.fontSize}px;font-weight:${el.style.fontWeight};text-align:${el.style.textAlign};z-index:${el.style.zIndex};border:${el.style.borderWidth || 0}px ${el.style.borderStyle || 'none'} ${el.style.borderColor || 'transparent'};`;
        
        let elAttr = `id="${el.id}" style="${elStyles}" class="app-element"`;
        if (el.enabled === false) elAttr += ' disabled';

        switch (el.type) {
          case 'button':
            elementsHTML += `<button ${elAttr}>${el.text || ''}</button>\n`;
            break;
          case 'label':
            elementsHTML += `<span ${elAttr}>${el.text || ''}</span>\n`;
            break;
          case 'input':
            elementsHTML += `<input type="text" ${elAttr} value="${el.value || ''}" placeholder="${el.hint || ''}">\n`;
            break;
          case 'passwordInput':
            elementsHTML += `<input type="password" ${elAttr} placeholder="${el.hint || ''}">\n`;
            break;
          case 'numberInput':
            elementsHTML += `<input type="number" ${elAttr} value="${el.value || '0'}">\n`;
            break;
          case 'textArea':
            elementsHTML += `<textarea ${elAttr} placeholder="${el.hint || ''}">${el.text || ''}</textarea>\n`;
            break;
          case 'image':
            elementsHTML += `<img ${elAttr} src="${el.src || ''}" alt="${el.name}">\n`;
            break;
          case 'icon':
            elementsHTML += `<span ${elAttr} class="app-element text-center flex items-center justify-center">${el.text || '⭐'}</span>\n`;
            break;
          case 'divider':
            elementsHTML += `<div ${elAttr}></div>\n`;
            break;
          case 'checkbox':
            elementsHTML += `<label style="position:${el.style.position};left:${el.style.x}px;top:${el.style.y}px;z-index:${el.style.zIndex};" class="flex items-center gap-2"><input type="checkbox" id="${el.id}" ${el.checked ? 'checked' : ''} class="app-element"> <span style="color:${el.style.color};font-size:${el.style.fontSize}px;">${el.text || ''}</span></label>\n`;
            break;
          case 'switch':
            elementsHTML += `<label style="position:${el.style.position};left:${el.style.x}px;top:${el.style.y}px;z-index:${el.style.zIndex};" class="flex items-center gap-2"><input type="checkbox" id="${el.id}" ${el.checked ? 'checked' : ''} class="app-element toggle-switch"> <span style="color:${el.style.color};font-size:${el.style.fontSize}px;">${el.text || ''}</span></label>\n`;
            break;
          case 'dropdown':
            let opts = el.options?.map(o => `<option value="${o}">${o}</option>`).join('') || '';
            elementsHTML += `<select ${elAttr}>${opts}</select>\n`;
            break;
          case 'slider':
            elementsHTML += `<input type="range" ${elAttr} min="0" max="100" value="${el.value || 50}">\n`;
            break;
          case 'datePicker':
            elementsHTML += `<input type="date" ${elAttr} value="${el.value || ''}">\n`;
            break;
          case 'timePicker':
            elementsHTML += `<input type="time" ${elAttr} value="${el.value || ''}">\n`;
            break;
          case 'video':
            elementsHTML += `<video ${elAttr} src="${el.src || ''}" controls></video>\n`;
            break;
          case 'audio':
            elementsHTML += `<audio id="${el.id}" src="${el.src || ''}"></audio>\n`;
            break;
          case 'canvas':
            elementsHTML += `<canvas ${elAttr}></canvas>\n`;
            break;
          case 'webViewer':
            elementsHTML += `<iframe ${elAttr} src="${el.src || ''}"></iframe>\n`;
            break;
          default:
            elementsHTML += `<div ${elAttr}>[${el.type}]</div>\n`;
        }
      });

      screensHTML += `
      <div id="${screen.id}" class="app-screen" style="display:${idx === 0 ? 'block' : 'none'};background-color:${screen.backgroundColor};width:100%;height:100%;position:relative;overflow:hidden;">
        ${elementsHTML}
      </div>`;
    });

    // Build API scripts
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentProject.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif; }
    #phone-frame { width: 360px; height: 640px; background: white; border: 12px solid #1e293b; border-radius: 36px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; position: relative; }
    .app-screen { width: 100%; height: 100%; position: relative; overflow: hidden; }
    .app-element { outline: none; }
    button.app-element { cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; transition: opacity 0.2s; }
    button.app-element:active { opacity: 0.8; }
    input.app-element, textarea.app-element, select.app-element { border: 1px solid #cbd5e1; padding: 4px 8px; }
  </style>
</head>
<body>
  <div id="phone-frame">
    ${screensHTML}
  </div>

  <script>
    // DolaCode App Studio JS runtime API
    const eventHandlers = {};
    const localDb = {};

    function onEvent(id, type, callback) {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener(type, (e) => {
          callback(e);
        });
      }
    }

    function setProperty(id, prop, val) {
      const el = document.getElementById(id);
      if (!el) return;
      if (prop === 'text') {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = val;
        else el.innerText = val;
      } else if (prop === 'value') {
        el.value = val;
      } else if (prop === 'visible') {
        el.style.display = val ? 'block' : 'none';
      } else if (prop === 'enabled') {
        el.disabled = !val;
      } else if (prop === 'backgroundColor') {
        el.style.backgroundColor = val;
      } else if (prop === 'color') {
        el.style.color = val;
      } else if (prop === 'src') {
        el.src = val;
      } else {
        el.style[prop] = val;
      }
    }

    function getProperty(id, prop) {
      const el = document.getElementById(id);
      if (!el) return null;
      if (prop === 'text') {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return el.value;
        return el.innerText;
      }
      if (prop === 'value') return el.value;
      if (prop === 'visible') return el.style.display !== 'none';
      if (prop === 'enabled') return !el.disabled;
      if (prop === 'checked') return el.checked;
      return el.style[prop];
    }

    function setText(id, text) { setProperty(id, 'text', text); }
    function getText(id) { return getProperty(id, 'text'); }
    function setValue(id, val) { setProperty(id, 'value', val); }
    function getValue(id) { return getProperty(id, 'value'); }
    function show(id) { setProperty(id, 'visible', true); }
    function hide(id) { setProperty(id, 'visible', false); }
    
    function navigateTo(screenId) {
      document.querySelectorAll('.app-screen').forEach(s => s.style.display = 'none');
      const target = document.getElementById(screenId);
      if (target) target.style.display = 'block';
    }

    function showAlert(msg) { alert(msg); }
    function showToast(msg) { console.log("TOAST:", msg); alert(msg); }
    function playAudio(id) {
      const el = document.getElementById(id);
      if (el) el.play().catch(e => console.log(e));
    }

    function saveData(key, val) {
      localDb[key] = val;
      localStorage.setItem('${currentProject?.id}_db_' + key, JSON.stringify(val));
    }

    function loadData(key) {
      const val = localStorage.getItem('${currentProject?.id}_db_' + key);
      return val ? JSON.parse(val) : localDb[key];
    }

    function generateRandomNumber(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const log = console.log;

    // Load Script
    window.addEventListener('load', () => {
      try {
        ${currentProject?.code}
      } catch(e) {
        console.error("Runtime error:", e);
      }
    });
  </script>
</body>
</html>`;
    return html;
  };

  const handleExportHTML = () => {
    const html = generateHTMLBundle();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject?.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'app'}_export.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportDropdown(false);
  };

  const handleExportZIP = () => {
    const projectJSON = JSON.stringify(currentProject, null, 2);
    const blob = new Blob([projectJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject?.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'app'}_source.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportDropdown(false);
  };

  return (
    <div className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 text-white shrink-0 select-none z-40">
      {/* Left items: Back & project name */}
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard" 
          className="p-2 hover:bg-slate-900 rounded-xl transition-colors text-slate-400 hover:text-white"
          title="Back to Dashboard"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="h-6 w-px bg-slate-800"></div>

        {/* Project Selector & Name */}
        <div className="relative">
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <input
                type="text"
                value={projectNameInput}
                onChange={(e) => setProjectNameInput(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="bg-slate-900 border border-indigo-500 rounded px-2.5 py-1 text-sm text-slate-100 font-extrabold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
            ) : (
              <h2 
                onClick={handleStartEditingName}
                className="text-xs sm:text-sm font-black tracking-wide text-slate-200 hover:text-white cursor-pointer px-1 rounded hover:bg-slate-900/50 flex items-center gap-2 truncate max-w-[100px] sm:max-w-none"
                title="Click to rename"
              >
                {currentProject?.name || 'Loading Project...'}
              </h2>
            )}
            
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-slate-200 transition-colors"
              title="Project Manager"
            >
              <FolderOpen size={14} />
            </button>

            <button
              onClick={() => {
                const name = prompt("Enter a name for your new project:", "New Project");
                if (name && name.trim()) {
                  createProject(name.trim());
                } else if (name !== null) {
                  createProject();
                }
              }}
              className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-indigo-400 transition-colors"
              title="New Project"
            >
              <Plus size={15} />
            </button>
          </div>

          {/* Project Manager Dropdown list */}
          {showProjectDropdown && (
            <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-850 rounded-xl shadow-2xl p-2 z-50">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 py-1 border-b border-slate-850 mb-2 flex items-center justify-between">
                <span>User Projects</span>
                <button
                  onClick={() => {
                    createProject();
                    setShowProjectDropdown(false);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-black flex items-center gap-0.5"
                >
                  <Plus size={10} /> NEW
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                {projects.map((proj) => (
                  <div 
                    key={proj.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                      proj.id === currentProjectId ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'hover:bg-slate-950 text-slate-300'
                    }`}
                  >
                    <button
                      onClick={() => {
                        selectProject(proj.id);
                        setShowProjectDropdown(false);
                      }}
                      className="flex-1 text-left font-bold truncate pr-2"
                    >
                      {proj.name}
                    </button>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleFavoriteProject(proj.id)}
                        className={`hover:scale-110 transition-transform ${proj.isFavorite ? 'text-rose-500' : 'text-slate-600 hover:text-rose-400'}`}
                      >
                        <Heart size={12} className={proj.isFavorite ? 'fill-rose-500' : ''} />
                      </button>
                      <button
                        onClick={() => duplicateProject(proj.id)}
                        className="text-slate-600 hover:text-indigo-400"
                        title="Duplicate"
                      >
                        <Copy size={12} />
                      </button>
                      {projects.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete project "${proj.name}"?`)) {
                              deleteProject(proj.id);
                            }
                          }}
                          className="text-slate-600 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Save, Undo/Redo & Simulation Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Undo/Redo - Hidden on mobile viewports for space */}
        <div className="hidden md:flex items-center bg-slate-900 border border-slate-850 rounded-xl p-0.5">
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className={`p-2 rounded-lg transition-colors ${undoStack.length > 0 ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 cursor-not-allowed'}`}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className={`p-2 rounded-lg transition-colors ${redoStack.length > 0 ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 cursor-not-allowed'}`}
            title="Redo (Ctrl+Y)"
          >
            <RotateCw size={15} />
          </button>
        </div>

        {/* Save button */}
        <button
          onClick={handleManualSave}
          className="p-2.5 bg-slate-900 border border-slate-850 hover:bg-slate-850 hover:text-white rounded-xl text-slate-300 flex items-center justify-center gap-1.5 text-xs font-black transition-colors"
          title="Save to local storage"
        >
          <Save size={15} />
          <span className="hidden sm:inline">SAVE</span>
        </button>

        {/* RUN / STOP Toggle */}
        <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
        {isRunning ? (
          <button
            onClick={stopSimulation}
            className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black tracking-widest flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-red-900/30 active:scale-95 transition-all"
          >
            <Square size={13} fill="white" />
            <span className="hidden xs:inline">STOP</span>
          </button>
        ) : (
          <button
            onClick={startSimulation}
            className="px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black tracking-widest flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-emerald-950/20 active:scale-95 transition-all"
          >
            <Play size={13} fill="white" />
            <span className="hidden xs:inline">RUN</span>
          </button>
        )}
      </div>

      {/* Right side: View modes (Visual / Blocks / Code) & Exports */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggle switch for Visual / Blocks / Code */}
        <div className="flex items-center bg-slate-900 border border-slate-850 rounded-xl p-0.5">
          <button
            onClick={() => setActiveTab('design')}
            className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === 'design' ? 'bg-indigo-600 text-white font-extrabold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="hidden xs:inline">DESIGN</span>
            <span className="inline xs:hidden">DES</span>
          </button>
          <button
            onClick={() => setActiveTab('blocks')}
            className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === 'blocks' ? 'bg-indigo-600 text-white font-extrabold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="hidden xs:inline">BLOCKS</span>
            <span className="inline xs:hidden">BLK</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === 'code' ? 'bg-indigo-600 text-white font-extrabold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="hidden xs:inline">CODE</span>
            <span className="inline xs:hidden">COD</span>
          </button>
        </div>

        {/* Export options */}
        <div className="relative">
          <button
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            className="p-2.5 bg-slate-900 border border-slate-850 hover:bg-slate-850 rounded-xl text-slate-350 flex items-center gap-1.5 text-xs font-black transition-colors"
          >
            <Download size={14} />
            <span className="hidden sm:inline">EXPORT</span>
          </button>

          {showExportDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-850 rounded-xl shadow-2xl p-1 z-50 text-slate-300">
              <button
                onClick={handleExportHTML}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-left hover:bg-slate-950 hover:text-indigo-400 rounded-lg transition-colors"
              >
                <Code size={13} />
                Single HTML Bundle
              </button>
              <button
                onClick={handleExportZIP}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-left hover:bg-slate-950 hover:text-indigo-400 rounded-lg transition-colors"
              >
                <Download size={13} />
                JSON Project File
              </button>
            </div>
          )}
        </div>

        {/* Complete / Submit button */}
        <button
          onClick={onCompleteStage}
          className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-black tracking-wider shadow-lg shadow-yellow-950/20 active:scale-95 transition-all flex items-center gap-1"
        >
          <Award size={14} />
          <span className="hidden sm:inline">SUBMIT APP</span>
        </button>
      </div>
    </div>
  );
}
