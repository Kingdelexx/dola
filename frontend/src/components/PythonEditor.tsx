'use client';
import React, { useRef } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { Sparkles, Terminal, Code2 } from 'lucide-react';

interface PythonEditorProps {
  code: string;
  onChange: (code: string) => void;
  snippets?: string[];
  type?: 'scaffold' | 'typing' | 'sandbox';
}

export default function PythonEditor({ code, onChange, snippets = [], type = 'typing' }: PythonEditorProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  // Click handler to insert snippet at current cursor position or append
  const handleInsertSnippet = (snippet: string) => {
    const view = editorRef.current?.view;
    if (view) {
      const state = view.state;
      const selection = state.selection.main;
      
      const transaction = view.state.update({
        changes: { from: selection.from, to: selection.to, insert: snippet },
        selection: { anchor: selection.from + snippet.length }
      });
      view.dispatch(transaction);
      view.focus();
    } else {
      // Fallback: append
      onChange(code ? `${code}\n${snippet}` : snippet);
    }
  };

  return (
    <div className="w-full bg-white border-4 border-purple-200 rounded-[32px] overflow-hidden shadow-xl flex flex-col font-sans">
      {/* Playful Editor Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 px-4 py-3 border-b-2 border-purple-200 flex justify-between items-center text-white text-xs font-black tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-yellow-300" />
          <span>🐍 Python Code Console</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[10px] backdrop-blur-md shadow-inner border border-white/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-bold">Live WASM Sandbox</span>
        </div>
      </div>

      {/* CodeMirror Workspace */}
      <div className="flex-1 min-h-[320px] max-h-[480px] overflow-auto text-sm bg-slate-950">
        <CodeMirror
          ref={editorRef}
          value={code}
          height="100%"
          minHeight="320px"
          extensions={[python()]}
          theme={vscodeDark}
          onChange={(value) => onChange(value)}
          placeholder="# Write your Python code here..."
          className="outline-none font-mono"
        />
      </div>

      {/* Bright Snippet Shelf */}
      {snippets.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 p-3.5 border-t-2 border-purple-100 flex flex-col gap-2">
          <p className="text-[11px] font-black uppercase text-purple-900 tracking-wider flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500 animate-pulse" /> Magic Code Blocks (Click to insert):
          </p>
          <div className="flex flex-wrap gap-2">
            {snippets.map((snip, idx) => (
              <button
                key={idx}
                onClick={() => handleInsertSnippet(snip)}
                className="bg-purple-600 hover:bg-purple-500 active:scale-95 transition-all text-white border-2 border-purple-400 px-3 py-1 rounded-xl text-xs font-mono font-bold shadow-md cursor-pointer"
              >
                {snip}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
