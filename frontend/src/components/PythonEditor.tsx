'use client';
import React, { useRef } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { Sparkles, Terminal, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 p-4 border-t-2 border-purple-100 flex flex-col gap-3 font-sans">
          <p className="text-[11px] font-black uppercase text-purple-900 tracking-wider flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500 animate-pulse" /> Magic Code Deck (Click to cast):
          </p>
          <div className="flex flex-wrap gap-2.5">
            {snippets.map((snip, idx) => {
              // Pick a cool card theme based on text contents
              let cardBg = "from-indigo-600 via-purple-700 to-pink-600 border-indigo-400 shadow-indigo-500/10";
              let cardIcon = "🔮";
              let rarity = "COMMON";
              
              if (snip.includes('for') || snip.includes('while')) {
                cardBg = "from-amber-600 via-orange-600 to-yellow-500 border-amber-400 shadow-amber-500/10";
                cardIcon = "🔁";
                rarity = "RARE";
              } else if (snip.includes('if') || snip.includes('else')) {
                cardBg = "from-emerald-600 via-teal-600 to-cyan-500 border-emerald-400 shadow-emerald-500/10";
                cardIcon = "⚖️";
                rarity = "EPIC";
              } else if (snip.includes('fireball') || snip.includes('victory') || snip.includes('damage') || snip.includes('collect')) {
                cardBg = "from-rose-600 via-red-600 to-orange-500 border-rose-400 shadow-rose-500/10";
                cardIcon = "⚔️";
                rarity = "LEGEND";
              } else if (snip.includes('move') || snip.includes('turn')) {
                cardBg = "from-blue-600 via-indigo-600 to-purple-500 border-blue-400 shadow-blue-500/10";
                cardIcon = "🏃";
                rarity = "COMMON";
              }

              return (
                <motion.button
                  key={idx}
                  onClick={() => handleInsertSnippet(snip)}
                  whileHover={{ scale: 1.06, y: -4, boxShadow: '0 10px 15px -3px rgba(167, 139, 250, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  className={`bg-gradient-to-br ${cardBg} border-2 text-white px-3.5 py-2.5 rounded-2xl flex flex-col items-center justify-between min-w-[105px] h-20 shadow-md cursor-pointer transition-shadow select-none`}
                >
                  <div className="w-full flex justify-between items-center text-[8.5px] font-black uppercase tracking-wider opacity-85">
                    <span>{cardIcon} {rarity}</span>
                    <span className="bg-white/20 px-1 rounded font-mono text-[8px]">#{idx+1}</span>
                  </div>
                  <div className="font-mono text-xs font-black tracking-wide my-1">
                    {snip}
                  </div>
                  <div className="text-[7.5px] font-black text-yellow-250 uppercase tracking-widest leading-none">
                    CLICK TO CAST
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
