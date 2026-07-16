import React from 'react';
import Editor from '@monaco-editor/react';
import { useAppStudioStore } from '../store/useAppStudioStore';

export default function JavaScriptEditor() {
  const { projects, currentProjectId, updateCode } = useAppStudioStore();
  const currentProject = projects.find(p => p.id === currentProjectId);

  const handleCodeChange = (val: string | undefined) => {
    updateCode(val || '');
  };

  return (
    <div className="flex-1 bg-slate-950 border border-slate-900 overflow-hidden flex flex-col h-full">
      {/* Editor toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono font-bold text-indigo-400">AppStudio.js</span>
        <span className="text-[10px] uppercase font-bold tracking-widest bg-slate-950 px-2 py-0.5 rounded border border-slate-850">JavaScript Mode</span>
      </div>

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={currentProject?.code || ''}
          onChange={handleCodeChange}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            padding: { top: 12 },
            automaticLayout: true,
            wordWrap: 'on',
            lineNumbers: 'on',
            scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 }
          }}
        />
      </div>
    </div>
  );
}
