import { GameAction, ParseResult, Direction } from './types';

// Global singleton loader for Skulpt CDN scripts
let skulptLoadPromise: Promise<void> | null = null;

export function loadSkulpt(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  // If already loaded
  if ((window as any).Sk && (window as any).Sk.builtinFiles) {
    return Promise.resolve();
  }

  if (skulptLoadPromise) {
    return skulptLoadPromise;
  }

  skulptLoadPromise = new Promise((resolve, reject) => {
    const loadScript = (src: string): Promise<void> => {
      return new Promise((res, rej) => {
        // Check if script element already exists
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          res();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => res();
        script.onerror = () => rej(new Error(`Failed to load script from ${src}`));
        document.head.appendChild(script);
      });
    };

    // Load skulpt core first, then skulpt stdlib
    loadScript('https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js')
      .then(() => loadScript('https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js'))
      .then(() => resolve())
      .catch((err) => {
        skulptLoadPromise = null;
        reject(err);
      });
  });

  return skulptLoadPromise;
}

/**
 * Execute student Python code via Skulpt with monkey and bridge builtins.
 * Returns the animation queue along with active Python line numbers.
 */
export async function executePythonWithSkulpt(code: string): Promise<ParseResult> {
  await loadSkulpt();
  const Sk = (window as any).Sk;
  if (!Sk) {
    throw new Error('Skulpt engine could not be initialized.');
  }

  const animationQueue: GameAction[] = [];
  const stdout: string[] = [];
  let currentLineNumber = 1;

  // Configure Skulpt with line tracking breakpoint hook
  Sk.configure({
    output: (text: string) => {
      stdout.push(text);
    },
    read: (x: string) => {
      if (Sk.builtinFiles === undefined || Sk.builtinFiles['files'][x] === undefined) {
        throw new Error("File not found: '" + x + "'");
      }
      return Sk.builtinFiles['files'][x];
    },
    debugging: true,
    breakpoints: (filename: string, lineno: number, colno: number) => {
      currentLineNumber = lineno;
      return false; // Don't pause execution, just track active line
    },
    __future__: Sk.python3,
    execLimit: 3000 // 3-second timeout protection for runaway loops
  });

  // Build the `monkey` Python class with step, turn, jump, say methods
  const MonkeyClass = Sk.misceval.buildClass(Sk.builtins, function ($gbl: any, $loc: any) {
    // monkey.step(steps=1)
    $loc.step = new Sk.builtin.func(function (self: any, steps: any) {
      let count = 1;
      if (steps !== undefined) {
        const jsSteps = Sk.ffi.remapToJs(steps);
        if (typeof jsSteps === 'number') {
          count = Math.round(jsSteps);
        }
      }
      animationQueue.push({
        type: 'STEP',
        count,
        line: currentLineNumber
      });
    });

    // monkey.turn(direction="right")
    $loc.turn = new Sk.builtin.func(function (self: any, dir: any) {
      let direction: Direction | 'around' = 'right';
      if (dir !== undefined) {
        const jsDir = String(Sk.ffi.remapToJs(dir)).toLowerCase().trim();
        if (['left', 'right', 'up', 'down', 'around'].includes(jsDir)) {
          direction = jsDir as Direction | 'around';
        }
      }
      animationQueue.push({
        type: 'TURN',
        direction,
        line: currentLineNumber
      });
    });

    // monkey.jump() (clears 1-tile rock obstacles)
    $loc.jump = new Sk.builtin.func(function (self: any) {
      animationQueue.push({
        type: 'JUMP',
        line: currentLineNumber
      });
    });

    // monkey.say(message)
    $loc.say = new Sk.builtin.func(function (self: any, msg: any) {
      const text = msg !== undefined ? String(Sk.ffi.remapToJs(msg)) : 'Yum!';
      animationQueue.push({
        type: 'SAY',
        message: text,
        line: currentLineNumber
      });
    });
  }, 'Monkey', []);

  // Build the `bridge` Python class with extend(tiles=1) method
  const BridgeClass = Sk.misceval.buildClass(Sk.builtins, function ($gbl: any, $loc: any) {
    // bridge.extend(tiles=1)
    $loc.extend = new Sk.builtin.func(function (self: any, tiles: any) {
      let count = 1;
      if (tiles !== undefined) {
        const jsTiles = Sk.ffi.remapToJs(tiles);
        if (typeof jsTiles === 'number') {
          count = Math.round(jsTiles);
        }
      }
      animationQueue.push({
        type: 'BUILD_BRIDGE',
        count,
        line: currentLineNumber
      });
    });
  }, 'Bridge', []);

  // Instantiate the objects into Python's global scope
  Sk.builtins.monkey = Sk.misceval.callsim(MonkeyClass);
  Sk.builtins.bridge = Sk.misceval.callsim(BridgeClass);

  let error: string | null = null;
  let errorLine: number | null = null;
  let errorAdvice: string | null = null;

  try {
    await Sk.misceval.asyncToPromise(() => {
      return Sk.importMainWithBody('<stdin>', false, code, true);
    });
  } catch (err: any) {
    const rawError = err ? err.toString() : 'Unknown Python error';
    
    // Extract line number from traceback or error message
    let lineNo: number | null = null;
    if (err.traceback && err.traceback.length > 0 && err.traceback[0].lineno) {
      lineNo = err.traceback[0].lineno;
    } else {
      const lineMatch = rawError.match(/on line (\d+)|line (\d+)/i);
      if (lineMatch) {
        lineNo = parseInt(lineMatch[1] || lineMatch[2], 10);
      }
    }
    errorLine = lineNo || currentLineNumber || 1;

    // Kid-Friendly Error Diagnostics
    const lines = code.split('\n');
    const problemLine = errorLine <= lines.length ? lines[errorLine - 1] : '';
    const trimmedLine = problemLine.trim();

    if (rawError.includes('ParseError') || rawError.includes('SyntaxError')) {
      if ((trimmedLine.startsWith('for ') || trimmedLine.startsWith('if ') || trimmedLine.startsWith('while ') || trimmedLine.startsWith('def ')) && !trimmedLine.endsWith(':')) {
        error = `Syntax Error on line ${errorLine}`;
        errorAdvice = `Oops! Check line ${errorLine} — did you forget a colon ":" at the end of your "${trimmedLine.split(' ')[0]}" loop?`;
      } else if (problemLine.includes('(') && !problemLine.includes(')')) {
        error = `Unclosed Parenthesis on line ${errorLine}`;
        errorAdvice = `Oops! Check line ${errorLine} — did you forget to close the parenthesis ")"?`;
      } else {
        error = `Syntax Typo on line ${errorLine}`;
        errorAdvice = `Oops! Check line ${errorLine} — looks like a small typo or extra character in "${trimmedLine}".`;
      }
    } else if (rawError.includes('IndentationError')) {
      if (rawError.includes('expected an indented block')) {
        error = `Missing Indent on line ${errorLine}`;
        errorAdvice = `Line ${errorLine} needs an indent! In Python, lines inside loops must be indented with 4 spaces (or press Tab).`;
      } else {
        error = `Unexpected Spacing on line ${errorLine}`;
        errorAdvice = `Line ${errorLine} has an unexpected space! Check the indentation at the start of the line.`;
      }
    } else if (rawError.includes('NameError')) {
      const match = rawError.match(/name '([^']+)' is not defined/);
      const missingName = match ? match[1] : '';
      if (missingName === 'monky') {
        error = `Unknown Name "${missingName}" on line ${errorLine}`;
        errorAdvice = `Check line ${errorLine} — did you mean "monkey" instead of "monky"?`;
      } else if (missingName === 'brige') {
        error = `Unknown Name "${missingName}" on line ${errorLine}`;
        errorAdvice = `Check line ${errorLine} — did you mean "bridge" instead of "brige"?`;
      } else {
        error = `Unknown Name "${missingName}" on line ${errorLine}`;
        errorAdvice = `Check line ${errorLine} — Python doesn't recognize "${missingName}". Did you mean "monkey" or "bridge"?`;
      }
    } else if (rawError.includes('AttributeError')) {
      const match = rawError.match(/has no attribute '([^']+)'/);
      const missingAttr = match ? match[1] : '';
      if (rawError.includes('Monkey')) {
        error = `Unknown Monkey Action "${missingAttr}" on line ${errorLine}`;
        errorAdvice = `Monkey doesn't know how to "${missingAttr}()"! Try monkey.step(), monkey.turn(), monkey.jump(), or monkey.say().`;
      } else if (rawError.includes('Bridge')) {
        error = `Unknown Bridge Action "${missingAttr}" on line ${errorLine}`;
        errorAdvice = `Bridge doesn't know how to "${missingAttr}()"! Try bridge.extend(tiles).`;
      } else {
        error = `Attribute Error on line ${errorLine}`;
        errorAdvice = `Check line ${errorLine} — that command does not exist.`;
      }
    } else if (rawError.includes('TimeLimitError')) {
      error = 'Loop Timed Out';
      errorAdvice = 'Whoa! Your code ran in a loop forever! Check your "for" or "while" loop conditions.';
    } else {
      error = `Python Error on line ${errorLine}`;
      errorAdvice = `Check line ${errorLine} — check your command spelling and parameters.`;
    }
  }

  return {
    actions: animationQueue,
    stdout,
    error,
    errorLine,
    errorAdvice
  };
}
