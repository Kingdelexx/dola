'use client';

let pyodidePromise: Promise<any> | null = null;

const PYODIDE_VERSION = 'v0.26.0';

/**
 * Singleton loader for Pyodide to ensure it is only loaded once across the entire application.
 */
export async function getPyodide() {
  if (typeof window === 'undefined') return null;

  if (pyodidePromise) {
    return pyodidePromise;
  }

  pyodidePromise = new Promise(async (resolve, reject) => {
    try {
      // 1. Ensure the script is actually available
      // It should be loaded via Next.js Script in the Root Layout, 
      // but we add a safety check/wait here.
      
      const waitForGlobal = async (attempts = 50) => {
          for (let i = 0; i < attempts; i++) {
              if ((window as any).loadPyodide) return true;
              await new Promise(r => setTimeout(r, 100)); // wait 100ms
          }
          return false;
      };

      const isReady = await waitForGlobal();
      
      if (!isReady) {
          // If still not ready, try manual injection as a fallback
          if (!(window as any).loadPyodide) {
              const script = document.createElement('script');
              script.src = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/pyodide.js`;
              script.async = true;
              document.body.appendChild(script);
              
              const injectedReady = await waitForGlobal(100);
              if (!injectedReady) throw new Error("Could not load Pyodide from CDN.");
          }
      }

      // 2. Initialize Pyodide
      const pyodide = await (window as any).loadPyodide({
        indexURL: `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`,
      });
      
      resolve(pyodide);
    } catch (error) {
      pyodidePromise = null; // Reset so we can retry on next call
      reject(error);
    }
  });

  return pyodidePromise;
}
