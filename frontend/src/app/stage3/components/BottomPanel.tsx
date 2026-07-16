import React from 'react';
import { useAppStudioStore } from '../store/useAppStudioStore';
import { Terminal, AlertTriangle, Activity, Code, Trash2 } from 'lucide-react';

export default function BottomPanel() {
  const {
    bottomPanelTab,
    setBottomPanelTab,
    consoleLogs,
    problems,
    interactionLogs,
    projects,
    currentProjectId
  } = useAppStudioStore();

  const project = projects.find(p => p.id === currentProjectId);

  const clearLogs = () => {
    useAppStudioStore.setState({ consoleLogs: [], problems: [], interactionLogs: [] });
  };

  return (
    <div className="bg-slate-950 border-t border-slate-800 flex flex-col h-48 text-slate-300">
      {/* Tabs list */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-3">
        <div className="flex gap-1 py-1">
          <button
            onClick={() => setBottomPanelTab('console')}
            className={`px-3 py-1.5 text-xs font-black rounded-lg flex items-center gap-1.5 transition-all ${
              bottomPanelTab === 'console' ? 'bg-slate-950 text-indigo-400 font-extrabold border border-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal size={13} />
            CONSOLE ({consoleLogs.length})
          </button>
          <button
            onClick={() => setBottomPanelTab('problems')}
            className={`px-3 py-1.5 text-xs font-black rounded-lg flex items-center gap-1.5 transition-all ${
              bottomPanelTab === 'problems'
                ? 'bg-slate-950 text-indigo-400 font-extrabold border border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            } ${problems.length > 0 ? 'text-red-400' : ''}`}
          >
            <AlertTriangle size={13} />
            PROBLEMS ({problems.length})
          </button>
          <button
            onClick={() => setBottomPanelTab('logs')}
            className={`px-3 py-1.5 text-xs font-black rounded-lg flex items-center gap-1.5 transition-all ${
              bottomPanelTab === 'logs' ? 'bg-slate-950 text-indigo-400 font-extrabold border border-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity size={13} />
            SESSION LOGS ({interactionLogs.length})
          </button>
          <button
            onClick={() => setBottomPanelTab('output')}
            className={`px-3 py-1.5 text-xs font-black rounded-lg flex items-center gap-1.5 transition-all ${
              bottomPanelTab === 'output' ? 'bg-slate-950 text-indigo-400 font-extrabold border border-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code size={13} />
            JS OUTPUT
          </button>
        </div>

        <button
          onClick={clearLogs}
          title="Clear logs"
          className="p-1 hover:bg-slate-800 text-slate-500 hover:text-slate-300 rounded transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
        >
          <Trash2 size={12} /> CLEAR
        </button>
      </div>

      {/* Contents Area */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed custom-scrollbar">
        {bottomPanelTab === 'console' && (
          <div className="space-y-1">
            {consoleLogs.length === 0 ? (
              <div className="text-slate-600 text-center py-8">Console is empty. Click RUN to start execution logs.</div>
            ) : (
              consoleLogs.map((log, idx) => (
                <div key={idx} className={`border-l-2 pl-2 ${
                  log.toLowerCase().includes('error') 
                    ? 'border-red-500 text-red-400' 
                    : log.includes('started') 
                      ? 'border-emerald-500 text-emerald-400' 
                      : 'border-slate-800 text-slate-300'
                }`}>
                  {log}
                </div>
              ))
            )}
          </div>
        )}

        {bottomPanelTab === 'problems' && (
          <div className="space-y-1.5">
            {problems.length === 0 ? (
              <div className="text-slate-600 text-center py-8">No warnings or errors compiled! Your workspace is healthy. ✨</div>
            ) : (
              problems.map((p, idx) => (
                <div key={idx} className="flex items-start gap-2 text-red-400 bg-red-950/20 border border-red-900/30 p-2 rounded-lg">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">{p.message}</p>
                    {p.line && <p className="text-[10px] text-red-500">Line: {p.line}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {bottomPanelTab === 'logs' && (
          <div className="space-y-1 text-slate-400">
            {interactionLogs.length === 0 ? (
              <div className="text-slate-600 text-center py-8">Interaction session logs are empty. Click UI elements during runtime to record events.</div>
            ) : (
              interactionLogs.map((log, idx) => (
                <div key={idx} className="border-b border-slate-900/50 pb-0.5 last:border-0">
                  {log}
                </div>
              ))
            )}
          </div>
        )}

        {bottomPanelTab === 'output' && (
          <div className="space-y-1">
            <div className="text-slate-500 text-[10px] uppercase font-bold border-b border-slate-900 pb-1.5 mb-1.5 flex items-center justify-between">
              <span>Read-only JavaScript compile output from Blockly block structure</span>
            </div>
            <pre className="text-emerald-400 bg-slate-900/40 p-3 rounded-lg border border-slate-900 overflow-x-auto whitespace-pre">
              {project?.code || '// Add Blockly blocks to view generated JavaScript'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
