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
  { value, onChange, errorLine, activeLine, readOnly = false },
  ref
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const activeLineBgRef = useRef<HTMLDivElement>(null);

  // Expose snippet insertion at cursor
  useImperativeHandle(ref, () => ({
    insertSnippet: (snippet: string) => {
      if (!textareaRef.current) return;
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const before = value.substring(0, start);
      const after = value.substring(end);

      let toInsert = snippet;
      if (before.length > 0 && !before.endsWith('\n') && !before.endsWith(' ') && !snippet.startsWith('\n')) {
        toInsert = '\n' + snippet;
      }

      const updated = before + toInsert + after;
      onChange(updated);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPos = start + toInsert.length;
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 10);
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

      const updated = value.substring(0, start) + spaces + value.substring(end);
      onChange(updated);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  // Sync scroll between textarea and syntax highlight display
  const handleScroll = () => {
    if (textareaRef.current) {
      const top = textareaRef.current.scrollTop;
      const left = textareaRef.current.scrollLeft;
      if (highlightRef.current) {
        highlightRef.current.scrollTop = top;
        highlightRef.current.scrollLeft = left;
      }
      if (activeLineBgRef.current) {
        activeLineBgRef.current.scrollTop = top;
      }
    }
  };

  const lines = value.split('\n');

  // Single-pass token-based Python syntax highlighter
  // Avoids regex cascading collisions on injected HTML tags
  const highlightPythonLine = (line: string): string => {
    const tokenRegex = /(#[^\n]*)|("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|\b(for|in|range|if|else|elif|while|def|return|True|False|and|or|not)\b|\b(monkey|bridge)\b|\b(step|turn|jump|say|extend|print)\b|\b(\d+)\b/g;

    let result = '';
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        result += escapeHtml(line.slice(lastIndex, match.index));
      }

      const [fullMatch, comment, dblStr, sglStr, keyword, obj, method, num] = match;

      if (comment !== undefined) {
        result += `<span class="text-amber-700/80 italic font-medium">${escapeHtml(comment)}</span>`;
      } else if (dblStr !== undefined || sglStr !== undefined) {
        result += `<span class="text-emerald-700 font-medium">${escapeHtml(fullMatch)}</span>`;
      } else if (keyword !== undefined) {
        result += `<span class="text-purple-600 font-bold">${escapeHtml(keyword)}</span>`;
      } else if (obj !== undefined) {
        if (obj === 'monkey') {
          result += `<span class="text-amber-800 font-bold">${escapeHtml(obj)}</span>`;
        } else {
          result += `<span class="text-emerald-800 font-bold">${escapeHtml(obj)}</span>`;
        }
      } else if (method !== undefined) {
        result += `<span class="text-teal-700 font-semibold">${escapeHtml(method)}</span>`;
      } else if (num !== undefined) {
        result += `<span class="text-orange-600 font-bold">${escapeHtml(num)}</span>`;
      } else {
        result += escapeHtml(fullMatch);
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      result += escapeHtml(line.slice(lastIndex));
    }

    return result;
  };

  return (
    <div className="relative flex-1 flex h-full bg-[#FFFDF9] rounded-2xl border-2 border-[#D7CCC8] shadow-inner overflow-hidden font-jetbrains">
      {/* Line Numbers Gutter */}
      <div 
        className="w-12 py-3 bg-[#FAF6EE] border-r-2 border-[#E0D7C6] select-none text-right pr-2 text-xs font-bold text-[#8D6E63] shrink-0"
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

      {/* Editor Body: Overlay Highlighter behind transparent Textarea */}
      <div className="relative flex-1 h-full overflow-hidden">
        {/* Active Line Glow Row Layer */}
        <div 
          ref={activeLineBgRef}
          aria-hidden="true"
          className="absolute inset-0 p-3 m-0 pointer-events-none overflow-hidden"
        >
          {lines.map((_, idx) => {
            const lineNum = idx + 1;
            const isActive = activeLine === lineNum;
            const isErr = errorLine === lineNum;

            if (isActive) {
              return (
                <div 
                  key={idx} 
                  className="h-6 w-full bg-[#FFF9C4]/80 border-l-4 border-[#FF9800] rounded-r transition-all duration-150" 
                />
              );
            }
            if (isErr) {
              return (
                <div 
                  key={idx} 
                  className="h-6 w-full bg-red-100/70 border-l-4 border-red-500 rounded-r" 
                />
              );
            }
            return <div key={idx} className="h-6 w-full" />;
          })}
        </div>

        {/* Syntax Highlight Mirror */}
        <pre
          ref={highlightRef}
          aria-hidden="true"
          className="absolute inset-0 p-3 m-0 font-jetbrains text-sm leading-6 whitespace-pre overflow-hidden pointer-events-none text-[#263238] z-10"
          dangerouslySetInnerHTML={{
            __html: lines.map(line => highlightPythonLine(line) || '&nbsp;').join('\n')
          }}
        />

        {/* Real Interactive Textarea */}
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
          className="absolute inset-0 w-full h-full p-3 m-0 font-jetbrains text-sm leading-6 resize-none bg-transparent text-transparent caret-[#263238] focus:outline-none selection:bg-amber-200 selection:text-amber-950 z-20 whitespace-pre overflow-auto"
          placeholder="# Type your Python code here..."
        />
      </div>
    </div>
  );
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
