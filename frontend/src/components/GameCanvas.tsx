'use client';
import { useEffect, useState } from 'react';

export default function GameCanvas({ codeOutput }: { codeOutput: string }) {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (codeOutput && codeOutput !== "[No output]") {
      setMessages(prev => [...prev, `> ${codeOutput}`]);
    } else if (codeOutput === "[No output]") {
        setMessages(prev => [...prev, `> (Execution Successful, no printed output)`]);
    }
  }, [codeOutput]);

  return (
    <div className="w-full h-[500px] border-4 border-slate-700 rounded-2xl bg-slate-900 text-green-400 p-4 font-mono overflow-y-auto shadow-2xl">
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-3">
        <h3 className="text-slate-200 font-sans font-bold font-lg tracking-wide uppercase">Game / Console Output</h3>
        <button className="text-xs text-slate-400 hover:text-white transition-colors" onClick={() => setMessages([])}>Clear</button>
      </div>
      <div className="flex flex-col gap-1 text-sm leading-relaxed">
        {messages.length === 0 && <span className="text-slate-600 animate-pulse text-center mt-10">Run some code to see output here!</span>}
        {messages.map((msg, i) => (
          <div key={i} className="whitespace-pre-wrap break-all">{msg}</div>
        ))}
      </div>
    </div>
  );
}
