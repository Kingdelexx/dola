import { GameAction, ParseResult, Direction } from './types';

/**
 * Kid-friendly Python interpreter for Banana Tales (fallback interpreter).
 * Translates Python commands (loops, sequencing, steps, turns, speech) into an animated GameAction queue.
 */
export function interpretMonkeyPython(code: string): ParseResult {
  const actions: GameAction[] = [];
  const stdout: string[] = [];
  let error: string | null = null;
  let errorLine: number | null = null;
  let errorAdvice: string | null = null;

  try {
    const rawLines = code.split('\n');
    const variables: Record<string, any> = {};

    // Helper to evaluate arguments (e.g. "3", '"left"', 'steps + 1')
    const evaluateExpr = (expr: string): any => {
      const t = expr.trim();
      if (!t) return undefined;
      if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
        return t.slice(1, -1);
      }
      if (!isNaN(Number(t))) {
        return Number(t);
      }
      if (t in variables) {
        return variables[t];
      }
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

      // 1. Variable assignment
      if (trimmed.includes('=') && !trimmed.includes('==') && !trimmed.startsWith('monkey.') && !trimmed.startsWith('bridge.')) {
        const eqIdx = trimmed.indexOf('=');
        const varName = trimmed.slice(0, eqIdx).trim();
        const expr = trimmed.slice(eqIdx + 1).trim();
        variables[varName] = evaluateExpr(expr);
        return;
      }

      // 2. Print statement
      if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
        const inner = trimmed.slice(6, -1);
        const parts = inner.split(',').map(p => evaluateExpr(p.trim()));
        stdout.push(parts.join(' '));
        return;
      }

      // 3. Bridge commands: bridge.extend(tiles=1)
      if (trimmed.startsWith('bridge.')) {
        const callMatch = trimmed.match(/^bridge\.([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
        if (!callMatch) {
          throw {
            message: `Syntax error on line ${lineNum}: Check closing parenthesis in "${trimmed}"!`,
            line: lineNum,
            advice: `Check line ${lineNum} — did you close the parenthesis in bridge.extend()?`
          };
        }
        const method = callMatch[1];
        const argStr = callMatch[2].trim();
        const param = argStr ? evaluateExpr(argStr) : undefined;

        if (method === 'extend') {
          const count = typeof param === 'number' ? Math.round(param) : 1;
          actions.push({ type: 'BUILD_BRIDGE', count, line: lineNum });
        } else {
          throw {
            message: `Unknown bridge command "bridge.${method}()" on line ${lineNum}!`,
            line: lineNum,
            advice: `Bridge can use bridge.extend(tiles=1) to lay wooden planks over water!`
          };
        }
        return;
      }

      // 4. Monkey commands
      if (trimmed.startsWith('monkey.')) {
        const callMatch = trimmed.match(/^monkey\.([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
        if (!callMatch) {
          throw {
            message: `Syntax error on line ${lineNum}: Check closing parenthesis in "${trimmed}"!`,
            line: lineNum,
            advice: `Check line ${lineNum} — make sure your parentheses are closed ()!`
          };
        }

        const method = callMatch[1];
        const argStr = callMatch[2].trim();
        const param = argStr ? evaluateExpr(argStr) : undefined;

        if (method === 'step') {
          const count = typeof param === 'number' ? Math.round(param) : 1;
          actions.push({ type: 'STEP', count, line: lineNum });
        } else if (method === 'turn') {
          const dir = String(param || 'right').toLowerCase();
          if (!['left', 'right', 'up', 'down', 'around'].includes(dir)) {
            throw {
              message: `Unknown turn direction "${dir}" on line ${lineNum}!`,
              line: lineNum,
              advice: `Use "left", "right", "up", "down", or "around" inside monkey.turn()!`
            };
          }
          actions.push({ type: 'TURN', direction: dir as Direction | 'around', line: lineNum });
        } else if (method === 'turn_left' || method === 'turnLeft') {
          actions.push({ type: 'TURN', direction: 'left', line: lineNum });
        } else if (method === 'turn_right' || method === 'turnRight') {
          actions.push({ type: 'TURN', direction: 'right', line: lineNum });
        } else if (method === 'jump') {
          actions.push({ type: 'JUMP', line: lineNum });
        } else if (method === 'say') {
          actions.push({ type: 'SAY', message: String(param || 'Yum!'), line: lineNum });
        } else {
          throw {
            message: `Monkey doesn't know "monkey.${method}()"!`,
            line: lineNum,
            advice: `Monkey knows monkey.step(), monkey.turn(), monkey.jump(), and monkey.say()!`
          };
        }
        return;
      }

      // Unrecognized statement
      if (!trimmed.startsWith('#')) {
        throw {
          message: `Unrecognized command "${trimmed}" on line ${lineNum}!`,
          line: lineNum,
          advice: `Did you mean to call monkey.step() or bridge.extend()?`
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

      // Check For Loops
      if (trimmed.startsWith('for ')) {
        if (!trimmed.endsWith(':')) {
          throw {
            message: `Line ${lineNum}: Missing colon (:) at end of for loop!`,
            line: lineNum,
            advice: `Check line ${lineNum} — did you forget a colon (:) at the end of your for loop?`
          };
        }

        const loopMatch = trimmed.match(/^for\s+([a-zA-Z0-9_]+)\s+in\s+range\s*\(([^)]+)\)\s*:/);
        if (!loopMatch) {
          throw {
            message: `Line ${lineNum}: Loop format should be: for i in range(number):`,
            line: lineNum,
            advice: `Try formatting your loop as: for i in range(3):`
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
            line: lineNum,
            advice: `Line ${lineNum} needs an indent! Code inside a for loop must be indented with 4 spaces (or Tab).`
          };
        }

        for (let iter = 0; iter < loopCount; iter++) {
          variables[loopVar] = iter;
          for (const b of bodyLines) {
            executeStatement(b.text, b.num);
          }
        }
        continue;
      }

      executeStatement(trimmed, lineNum);
      curLine++;
    }

  } catch (err: any) {
    error = err.message || 'Error running Python code.';
    errorLine = err.line || 1;
    errorAdvice = err.advice || null;
  }

  return { actions, stdout, error, errorLine, errorAdvice };
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
