'use client';

import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

export interface CodeEditorHandle {
  insertSnippet: (snippet: string) => void;
  focus: () => void;
}

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  errorLine?: number | null;
  readOnly?: boolean;
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditor(
  { value, onChange, errorLine, readOnly = false },
  ref
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  // Expose snippet insertion at cursor
  useImperativeHandle(ref, () => ({
    insertSnippet: (snippet: string) => {
      if (!textareaRef.current) return;
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const before = value.substring(0, start);
      const after = value.substring(end);

      // If snippet is a block or statement, ensure proper line break if mid-code
      let toInsert = snippet;
      if (before.length > 0 && !before.endsWith('\n') && !before.endsWith(' ') && !snippet.startsWith('\n')) {
        toInsert = '\n' + snippet;
      }

      const updated = before + toInsert + after;
      onChange(updated);

      // Restore cursor position after inserted snippet
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
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const lines = value.split('\n');

  // Simple token-based Python syntax highlighter
  const highlightPythonLine = (line: string) => {
    if (line.trim().startsWith('#')) {
      return `<span class="text-amber-700/80 italic font-medium">${escapeHtml(line)}</span>`;
    }

    // Split preserving comments at end of line
    const commentIdx = line.indexOf('#');
    let codePart = commentIdx !== -1 ? line.slice(0, commentIdx) : line;
    const commentPart = commentIdx !== -1 ? line.slice(commentIdx) : '';

    // Regex replacements for Python tokens
    let highlighted = escapeHtml(codePart);

    // Keywords
    highlighted = highlighted.replace(
      /\b(for|in|range|if|else|elif|while|def|return|True|False|and|or|not)\b/g,
      '<span class="text-purple-600 font-bold">$1</span>'
    );

    // Monkey identifier
    highlighted = highlighted.replace(
      /\b(monkey)\b/g,
      '<span class="text-amber-800 font-bold">$1</span>'
    );

    // Methods
    highlighted = highlighted.replace(
      /\.(step|turn|turn_left|turn_right|jump|say|print)\b/g,
      '.<span class="text-teal-700 font-semibold">$1</span>'
    );

    // String literals
    highlighted = highlighted.replace(
      /(&quot;.*?&quot;|&#39;.*?&#39;|".*?"|'.*?')/g,
      '<span class="text-emerald-700 font-medium">$1</span>'
    );

    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+)\b/g,
      '<span class="text-orange-600 font-bold">$1</span>'
    );

    if (commentPart) {
      highlighted += `<span class="text-amber-700/80 italic font-medium">${escapeHtml(commentPart)}</span>`;
    }

    return highlighted;
  };

  return (
    <div className="relative flex-1 flex h-full bg-[#FFFDF9] rounded-2xl border-2 border-[#D7CCC8] shadow-inner overflow-hidden font-jetbrains">
      {/* Line Numbers Gutter */}
      <div 
        className="w-11 py-3 bg-[#FAF6EE] border-r-2 border-[#E0D7C6] select-none text-right pr-2 text-xs font-bold text-[#8D6E63] shrink-0"
        aria-hidden="true"
      >
        {lines.map((_, idx) => {
          const lineNum = idx + 1;
          const isErr = errorLine === lineNum;
          return (
            <div 
              key={idx} 
              className={`h-6 leading-6 transition-colors ${
                isErr ? 'bg-red-200 text-red-800 font-black rounded-l px-1' : ''
              }`}
            >
              {lineNum}
            </div>
          );
        })}
      </div>

      {/* Editor Body: Overlay Highlighter behind transparent Textarea */}
      <div className="relative flex-1 h-full overflow-hidden">
        {/* Syntax Highlight Mirror */}
        <pre
          ref={highlightRef}
          aria-hidden="true"
          className="absolute inset-0 p-3 m-0 font-jetbrains text-sm leading-6 whitespace-pre overflow-hidden pointer-events-none text-[#263238]"
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
          className="absolute inset-0 w-full h-full p-3 m-0 font-jetbrains text-sm leading-6 resize-none bg-transparent text-transparent caret-[#263238] focus:outline-none selection:bg-amber-200 selection:text-amber-950"
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
