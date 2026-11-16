import { GameAction, ParseResult } from './types';

/**
 * Kid-friendly Python interpreter for Banana Tales.
 * Translates Python commands (loops, sequencing, steps, turns, speech) into an animated GameAction queue.
 */
export function interpretMonkeyPython(code: string): ParseResult {
  const actions: GameAction[] = [];
  const stdout: string[] = [];
  let error: string | null = null;
  let errorLine: number | null = null;

  try {
    const rawLines = code.split('\n');
    const variables: Record<string, any> = {};

    // Helper to evaluate arguments (e.g. "3", '"left"', 'steps + 1')
    const evaluateExpr = (expr: string): any => {
      const t = expr.trim();
      if (!t) return undefined;
      // String literals
      if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
        return t.slice(1, -1);
      }
      // Numbers
      if (!isNaN(Number(t))) {
        return Number(t);
      }
      // Variables
      if (t in variables) {
        return variables[t];
      }
      // Simple math
      const mathMatch = t.match(/^([a-zA-Z0-9_]+)\s*([\+\-\*\/])\s*([a-zA-Z0-9_]+)$/);
      if (mathMatch) {
        const left = evaluateExpr(mathMatch[1]);
        const op = mathMatch[2];
        const right = evaluateExpr(mathMatch[3]);
        if (typeof left === 'number' && typeof right === 'number') {
          if (op === '+') return left + right;
          if (op === '-') return left - right;
          if (op === '*') return left * right;
          if (op === '/') return left / right;
        }
      }
      return t;
    };

    // Helper to execute a single statement line
    const executeStatement = (lineText: string, lineNum: number) => {
      const trimmed = lineText.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      // 1. Variable assignment: e.g. "count = 3"
      if (trimmed.includes('=') && !trimmed.includes('==') && !trimmed.startsWith('monkey.')) {
        const eqIdx = trimmed.indexOf('=');
        const varName = trimmed.slice(0, eqIdx).trim();
        const expr = trimmed.slice(eqIdx + 1).trim();
        variables[varName] = evaluateExpr(expr);
        return;
      }

      // 2. Print statements
      if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
        const inner = trimmed.slice(6, -1);
        const parts = inner.split(',').map(p => evaluateExpr(p.trim()));
        stdout.push(parts.join(' '));
        return;
      }

      // 3. Monkey commands
      if (trimmed.startsWith('monkey.')) {
        const callMatch = trimmed.match(/^monkey\.([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
        if (!callMatch) {
          throw {
            message: `Syntax error on line ${lineNum}: Check closing parenthesis in "${trimmed}"!`,
            line: lineNum
          };
        }

        const method = callMatch[1];
        const argStr = callMatch[2].trim();
        const param = argStr ? evaluateExpr(argStr) : undefined;

        if (method === 'step') {
          const count = typeof param === 'number' ? Math.round(param) : 1;
          actions.push({ type: 'step', param: count, line: lineNum });
        } else if (method === 'turn') {
          const dir = String(param || 'right').toLowerCase();
          if (!['left', 'right', 'up', 'down'].includes(dir)) {
            throw {
              message: `Unknown turn direction "${dir}" on line ${lineNum}! Use "left", "right", "up", or "down".`,
              line: lineNum
            };
          }
          actions.push({ type: 'turn', param: dir, line: lineNum });
        } else if (method === 'turn_left' || method === 'turnLeft') {
          actions.push({ type: 'turn', param: 'left', line: lineNum });
        } else if (method === 'turn_right' || method === 'turnRight') {
          actions.push({ type: 'turn', param: 'right', line: lineNum });
        } else if (method === 'jump') {
          actions.push({ type: 'jump', line: lineNum });
        } else if (method === 'say') {
          actions.push({ type: 'say', param: String(param || 'Yum!'), line: lineNum });
        } else {
          throw {
            message: `Monkey doesn't know "monkey.${method}()"! Use monkey.step(), monkey.turn(), or monkey.jump().`,
            line: lineNum
          };
        }
        return;
      }

      // If unrecognized non-empty statement
      if (!trimmed.startsWith('#')) {
        throw {
          message: `Unrecognized command "${trimmed}" on line ${lineNum}!`,
          line: lineNum
        };
      }
    };

    // Main script parsing pass
    let curLine = 0;
    while (curLine < rawLines.length) {
      const line = rawLines[curLine];
      const trimmed = line.trim();
      const lineNum = curLine + 1;

      if (!trimmed || trimmed.startsWith('#')) {
        curLine++;
        continue;
      }

      // Check For Loops: e.g. "for i in range(3):"
      if (trimmed.startsWith('for ')) {
        if (!trimmed.endsWith(':')) {
          throw {
            message: `Line ${lineNum}: Python for loops must end with a colon (:). Example: for i in range(3):`,
            line: lineNum
          };
        }

        const loopMatch = trimmed.match(/^for\s+([a-zA-Z0-9_]+)\s+in\s+range\s*\(([^)]+)\)\s*:/);
        if (!loopMatch) {
          throw {
            message: `Line ${lineNum}: Loop format should be: for i in range(number):`,
            line: lineNum
          };
        }

        const loopVar = loopMatch[1];
        const loopCountRaw = evaluateExpr(loopMatch[2]);
        const loopCount = typeof loopCountRaw === 'number' ? Math.min(Math.max(loopCountRaw, 0), 20) : 1;

        // Collect indented body
        curLine++;
        const bodyLines: { text: string; num: number }[] = [];
        while (curLine < rawLines.length) {
          const bodyLine = rawLines[curLine];
          if (bodyLine.trim().length === 0) {
            curLine++;
            continue;
          }
          const indent = bodyLine.search(/\S/);
          if (indent > 0) {
            bodyLines.push({ text: bodyLine.trim(), num: curLine + 1 });
            curLine++;
          } else {
            break;
          }
        }

        if (bodyLines.length === 0) {
          throw {
            message: `Line ${lineNum}: Expected indented block inside the for loop!`,
            line: lineNum
          };
        }

        // Execute loop body
        for (let iter = 0; iter < loopCount; iter++) {
          variables[loopVar] = iter;
          for (const b of bodyLines) {
            executeStatement(b.text, b.num);
          }
        }
        continue;
      }

      // Regular statement
      executeStatement(trimmed, lineNum);
      curLine++;
    }

  } catch (err: any) {
    error = err.message || 'Error running Python code.';
    errorLine = err.line || 1;
  }

  return { actions, stdout, error, errorLine };
}

/**
 * Counts effective lines of code (ignoring comments and blank lines).
 */
export function countCodeLines(code: string): number {
  return code
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'))
    .length;
}
