'use client';

import React, { useRef, useImperativeHandle, forwardRef } from 'react';

export interface CodeEditorHandle {
  insertSnippet: (snippet: string) => void;
  focus: () => void;
}

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  errorLine?: number | null;
  activeLine?: number | null;
  readOnly?: boolean;
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditor(
  { value = '', onChange, errorLine, activeLine, readOnly = false },
  ref
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Expose snippet insertion at cursor or append to end
  useImperativeHandle(ref, () => ({
    insertSnippet: (snippet: string) => {
      if (!textareaRef.current) return;
      const textarea = textareaRef.current;
      const isFocused = typeof document !== 'undefined' && document.activeElement === textarea;

      let start = textarea.selectionStart;
      let end = textarea.selectionEnd;

      // When textarea is not currently focused (e.g. user tapped a chip on mobile),
      // selectionStart is often 0 or undefined. In that case, append cleanly to the end of the existing code.
      if (!isFocused || start === null || start === undefined || (start === 0 && end === 0 && (value || '').trim().length > 0)) {
        start = (value || '').length;
        end = (value || '').length;
      }

      const before = (value || '').substring(0, start);
      const after = (value || '').substring(end);

      let toInsert = snippet;
      if (before.length > 0 && !before.endsWith('\n') && !before.endsWith(' ') && !snippet.startsWith('\n')) {
        toInsert = '\n' + snippet;
      }

      const updated = before + toInsert + after;
      onChange(updated);

      // Only re-focus if it was ALREADY focused before tapping (e.g. desktop keyboard workflow).
      // On mobile touchscreens, avoiding auto-refocus prevents the virtual keyboard from abruptly
      // popping up and shifting the entire viewport when the user taps helper chips.
      if (isFocused) {
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            const newPos = start + toInsert.length;
            textareaRef.current.setSelectionRange(newPos, newPos);
          }
        }, 10);
      }
    },
    focus: () => {
      textareaRef.current?.focus();
    }
  }));

  // Handle Tab key indentation (4 spaces)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '    '; // 4 spaces

      const updated = (value || '').substring(0, start) + spaces + (value || '').substring(end);
      onChange(updated);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  // Sync scroll between textarea and line numbers gutter
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const lines = (value || '').split('\n');

  return (
    <div 
      onClick={() => textareaRef.current?.focus()}
      className="relative flex-1 flex h-full min-h-[220px] sm:min-h-[260px] md:min-h-0 bg-[#FFFDF9] rounded-2xl border-2 border-[#D7CCC8] shadow-inner overflow-hidden font-jetbrains cursor-text select-text"
    >
      {/* Line Numbers Gutter */}
      <div 
        ref={gutterRef}
        className="w-10 sm:w-12 py-3 bg-[#FAF6EE] border-r-2 border-[#E0D7C6] select-none text-right pr-2 text-xs font-bold text-[#8D6E63] shrink-0 overflow-hidden"
        aria-hidden="true"
      >
        {lines.map((_, idx) => {
          const lineNum = idx + 1;
          const isErr = errorLine === lineNum;
          const isActive = activeLine === lineNum;

          let lineClass = 'h-6 leading-6 transition-all duration-150 flex items-center justify-end gap-1';
          if (isErr) {
            lineClass += ' bg-red-200 text-red-800 font-black rounded-l px-1';
          } else if (isActive) {
            lineClass += ' bg-[#FFD54F] text-[#E65100] font-black rounded-l px-1 shadow-xs border-r-2 border-[#E65100] scale-105';
          }

          return (
            <div key={idx} className={lineClass}>
              {isActive && <span className="text-[9px] text-[#E65100] animate-pulse">▶</span>}
              <span>{lineNum}</span>
            </div>
          );
        })}
      </div>

      {/* Editor Body: 100% Guaranteed Visible, High-Contrast Textarea */}
      <div className="relative flex-1 h-full overflow-hidden select-text">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          disabled={readOnly}
          spellCheck={false}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          wrap="off"
          style={{ color: '#263238', WebkitTextFillColor: '#263238' }}
          className="w-full h-full p-3 m-0 font-jetbrains text-sm leading-6 resize-none bg-transparent text-[#263238] font-medium caret-[#E65100] focus:outline-none selection:bg-amber-200 selection:text-amber-950 whitespace-pre overflow-auto select-text touch-manipulation cursor-text"
          placeholder="# Type your Python code here..."
        />
      </div>
    </div>
  );
});
