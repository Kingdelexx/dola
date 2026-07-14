'use client';
import { useEffect, useState } from 'react';

// Extend window object to hold loadPyodide
declare global {
  interface Window {
    loadPyodide: any;
  }
}

import { getPyodide } from '@/lib/pyodideLoader';
import { forwardRef, useImperativeHandle } from 'react';

const PyodideRunner = forwardRef(({ code, onOutput }: { code: string; onOutput: (out: string) => void }, ref) => {
  const [pyodide, setPyodide] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    runCode
  }));

  useEffect(() => {
    let mounted = true;
    
    async function init() {
      try {
        const py = await getPyodide();
        if (mounted) {
          setPyodide(py);
          setError(null);
        }
      } catch (err: any) {
        console.error("Pyodide loading failed:", err);
        if (mounted) setError("Failed to load engine correctly.");
      }
    }
    
    init();
    
    return () => {
      mounted = false;
    };
  }, []);

  const runCode = async () => {
    if (!pyodide || isRunning) return;
    setIsRunning(true);
    let output = '';
    setError(null);
    try {
      // Basic override to capture stdout nicely
      // We also import 'js' for the bridge
      pyodide.runPython(`
        import sys
        import io
        import js
        sys.stdout = io.StringIO()
      `);
      await pyodide.runPythonAsync(code);
      output = pyodide.runPython("sys.stdout.getvalue()");
      if (!output) output = "[No output]";
    } catch (err: any) {
      output = err.toString();
    }
    setIsRunning(false);
    onOutput(output);
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      {error && <div className="text-red-500 text-xs font-bold mb-2">Error: {error}</div>}
      <button 
        onClick={runCode} 
        disabled={!pyodide || isRunning}
        className="px-6 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold rounded-lg shadow-md hover:from-green-500 hover:to-green-700 disabled:opacity-50 transition-all font-sans"
      >
        {!pyodide ? 'Loading Engine...' : isRunning ? 'Running...' : '▶ Run Code'}
      </button>
    </div>
  );
});

PyodideRunner.displayName = 'PyodideRunner';
export default PyodideRunner;
