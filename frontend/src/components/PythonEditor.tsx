'use client';
import React, { useRef } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { Sparkles, Terminal } from 'lucide-react';

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
    <div className="w-full bg-slate-950 border-4 border-amber-900/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col font-sans">
      {/* Editor Header decoration */}
      <div className="bg-gradient-to-r from-amber-950/80 to-slate-900 px-4 py-2 border-b border-amber-900/30 flex justify-between items-center text-amber-100/90 text-xs font-black tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-amber-500" />
          <span>Python Spellbook</span>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/20 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>WASM Sandbox</span>
        </div>
      </div>

      {/* CodeMirror Workspace */}
      <div className="flex-1 min-h-[320px] max-h-[480px] overflow-auto text-sm border-b border-amber-900/10">
        <CodeMirror
          ref={editorRef}
          value={code}
          height="100%"
          minHeight="320px"
          extensions={[python()]}
          theme={vscodeDark}
          onChange={(value) => onChange(value)}
          placeholder="# Write your Python spells here..."
          className="outline-none"
        />
      </div>

      {/* Snippet shelf for Parsons problem styled help */}
      {snippets.length > 0 && (
        <div className="bg-slate-900 p-3 border-t border-amber-900/20 flex flex-col gap-2">
          <p className="text-[10px] font-black uppercase text-amber-500/80 tracking-widest flex items-center gap-1">
            <Sparkles size={11} /> Spell Ingredients (Click to cast / insert):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {snippets.map((snip, idx) => (
              <button
                key={idx}
                onClick={() => handleInsertSnippet(snip)}
                className="bg-amber-950/40 hover:bg-amber-900/40 active:scale-95 transition-all text-amber-200 border border-amber-900/40 px-2.5 py-1 rounded-xl text-xs font-mono font-bold hover:text-white"
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
