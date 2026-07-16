'use client';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { getPyodide } from '@/lib/pyodideLoader';

// Extend window object to hold loadPyodide
declare global {
  interface Window {
    loadPyodide: any;
  }
}

interface RunResult {
  success: boolean;
  stdout: string;
  rawError: string | null;
}

interface PyodideRunnerProps {
  code?: string;
  onOutput?: (out: string) => void;
  onStatusChange?: (status: 'loading' | 'ready' | 'error') => void;
}

const PyodideRunner = forwardRef(({ code, onOutput, onStatusChange }: PyodideRunnerProps, ref) => {
  const [pyodide, setPyodide] = useState<any>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [localRunning, setLocalRunning] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    runCode,
    isLoaded: !!pyodide
  }));

  useEffect(() => {
    let mounted = true;
    
    async function init() {
      if (onStatusChange) onStatusChange('loading');
      try {
        const py = await getPyodide();
        if (mounted) {
          setPyodide(py);
          setLoadingError(null);
          if (onStatusChange) onStatusChange('ready');
        }
      } catch (err: any) {
        console.error("Pyodide loading failed:", err);
        if (mounted) {
          setLoadingError("Failed to load engine correctly.");
          if (onStatusChange) onStatusChange('error');
        }
      }
    }
    
    init();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Programmatic runner for Stage 4
  const runCode = async (codeText: string, assertionScript?: string): Promise<RunResult> => {
    if (!pyodide) {
      return { success: false, stdout: '', rawError: 'Engine not loaded.' };
    }

    let stdout = '';
    let rawError: string | null = null;
    let success = true;

    try {
      // 1. Set up stdout capturing in python context
      pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
      `);

      // 2. Execute main student code
      await pyodide.runPythonAsync(codeText);
      
      // 3. Read captured stdout
      stdout = pyodide.runPython("sys.stdout.getvalue()");

      // 4. Run assertion script if present (checks variable states, functions etc.)
      if (assertionScript) {
        await pyodide.runPythonAsync(assertionScript);
      }
    } catch (err: any) {
      success = false;
      rawError = err.toString();
      // Read whatever stdout was written before the crash
      try {
        stdout = pyodide.runPython("sys.stdout.getvalue()");
      } catch (e) {}
    }

    return { success, stdout, rawError };
  };

  // Click handler for Stage 2 (button-based run)
  const handleLocalRun = async () => {
    if (!pyodide || localRunning || !code || !onOutput) return;
    setLocalRunning(true);
    setLocalError(null);

    const result = await runCode(code);
    
    setLocalRunning(false);
    if (!result.success && result.rawError) {
      setLocalError(result.rawError);
      onOutput(result.rawError);
    } else {
      onOutput(result.stdout || "[No output]");
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {loadingError && (
        <div className="bg-rose-950/20 border border-rose-900/40 text-rose-300 p-2.5 rounded-xl text-xs font-bold font-sans">
          ⚠️ Pyodide engine failed to initialize: {loadingError}
        </div>
      )}

      {/* Render local Run Code button ONLY for Stage 2 (where onOutput is passed) */}
      {onOutput && (
        <div className="flex flex-col gap-2 mt-4">
          {localError && <div className="text-red-500 text-xs font-bold mb-2">Error: {localError}</div>}
          <button 
            onClick={handleLocalRun} 
            disabled={!pyodide || localRunning}
            className="px-6 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold rounded-lg shadow-md hover:from-green-500 hover:to-green-700 disabled:opacity-50 transition-all font-sans"
          >
            {!pyodide ? 'Loading Engine...' : localRunning ? 'Running...' : '▶ Run Code'}
          </button>
        </div>
      )}
    </div>
  );
});

PyodideRunner.displayName = 'PyodideRunner';
export default PyodideRunner;
