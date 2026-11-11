import { GameAction } from './PythonGameCanvas';

export interface ParseResult {
  actions: GameAction[];
  stdout: string[];
  error: string | null;
  errorLine: number | null;
}

/**
 * Kid-friendly Python command and script interpreter for Python Studio.
 * Safely evaluates sequencing, loops, variables, conditions, and functions
 * and translates them into an animated GameAction queue.
 */
export function interpretPythonCode(code: string, initialEnv: Record<string, any> = {}): ParseResult {
  const actions: GameAction[] = [];
  const stdout: string[] = [];
  let error: string | null = null;
  let errorLine: number | null = null;

  try {
    const rawLines = code.split('\n');
    const variables: Record<string, any> = {
      coins: 0,
      health: 100,
      color: 'red',
      ...initialEnv
    };

    const functions: Record<string, { params: string[]; body: string[] }> = {};

    // First pass: extract function definitions
    let lineIdx = 0;
    while (lineIdx < rawLines.length) {
      const line = rawLines[lineIdx];
      const trimmed = line.trim();

      if (trimmed.startsWith('def ')) {
        const match = trimmed.match(/^def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*:/);
        if (!match) {
          throw { message: "Check your function definition syntax! Example: def my_function():", line: lineIdx + 1 };
        }
        const funcName = match[1];
        const params = match[2].split(',').map(p => p.trim()).filter(Boolean);
        const body: string[] = [];

        lineIdx++;
        while (lineIdx < rawLines.length) {
          const bodyLine = rawLines[lineIdx];
          if (bodyLine.trim().length === 0) {
            lineIdx++;
            continue;
          }
          const indent = bodyLine.search(/\S/);
          if (indent > 0) {
            body.push(bodyLine.trim());
            lineIdx++;
          } else {
            break;
          }
        }
        functions[funcName] = { params, body };
        continue;
      }
      lineIdx++;
    }

    // Helper to evaluate an argument expression (e.g. "2", "coins + 25", '"blue"')
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
      // Simple binary math: e.g. "coins + 25", "coins - 15"
      const mathMatch = t.match(/^([a-zA-Z0-9_]+)\s*([\+\-\*\/])\s*([a-zA-Z0-9_]+)$/);
      if (mathMatch) {
        const leftVal = evaluateExpr(mathMatch[1]);
        const op = mathMatch[2];
        const rightVal = evaluateExpr(mathMatch[3]);
        if (op === '+') return leftVal + rightVal;
        if (op === '-') return leftVal - rightVal;
        if (op === '*') return leftVal * rightVal;
        if (op === '/') return leftVal / rightVal;
      }
      return t;
    };

    // Helper to execute a single line
    const executeLine = (lineText: string, currentLineNum: number) => {
      const trimmed = lineText.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      // 1. Print statement
      if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
        const inner = trimmed.slice(6, -1);
        const parts = inner.split(',').map(p => evaluateExpr(p.trim()));
        const outStr = parts.join(' ');
        stdout.push(outStr);
        return;
      }

      // 2. Variable assignment: e.g. "coins = coins + 25"
      if (trimmed.includes('=') && !trimmed.includes('==') && !trimmed.startsWith('hero.')) {
        const eqIdx = trimmed.indexOf('=');
        const varName = trimmed.slice(0, eqIdx).trim();
        const expr = trimmed.slice(eqIdx + 1).trim();
        const val = evaluateExpr(expr);
        variables[varName] = val;
        return;
      }

      // 3. Hero commands
      if (trimmed.startsWith('hero.')) {
        const callMatch = trimmed.match(/^hero\.([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
        if (!callMatch) {
          throw { message: `Syntax error in hero command: "${trimmed}". Check closing parenthesis!`, line: currentLineNum };
        }
        const method = callMatch[1];
        const argStr = callMatch[2].trim();
        const param = argStr ? evaluateExpr(argStr) : undefined;

        if (method === 'move_right') {
          actions.push({ type: 'move_right', param: typeof param === 'number' ? param : 1, line: currentLineNum });
        } else if (method === 'move_left') {
          actions.push({ type: 'move_left', param: typeof param === 'number' ? param : 1, line: currentLineNum });
        } else if (method === 'move_up') {
          actions.push({ type: 'move_up', param: typeof param === 'number' ? param : 1, line: currentLineNum });
        } else if (method === 'move_down') {
          actions.push({ type: 'move_down', param: typeof param === 'number' ? param : 1, line: currentLineNum });
        } else if (method === 'jump') {
          actions.push({ type: 'jump', line: currentLineNum });
        } else if (method === 'collect') {
          actions.push({ type: 'collect', line: currentLineNum });
        } else if (method === 'say') {
          actions.push({ type: 'say', param: String(param || ''), line: currentLineNum });
        } else if (method === 'build_bridge') {
          actions.push({ type: 'build_bridge', line: currentLineNum });
        } else if (method === 'pick_up_gold') {
          actions.push({ type: 'pick_up_gold', param: typeof param === 'number' ? param : 25, line: currentLineNum });
        } else if (method === 'buy_item') {
          actions.push({ type: 'buy_item', param: 15, line: currentLineNum });
        } else if (method === 'unlock_vault') {
          actions.push({ type: 'unlock_vault', line: currentLineNum });
        } else if (method === 'scan_gate') {
          actions.push({ type: 'scan_gate', line: currentLineNum });
        } else if (method === 'use_laser') {
          actions.push({ type: 'use_laser', param: String(param || 'blue'), line: currentLineNum });
        } else if (method === 'raise_shield') {
          actions.push({ type: 'raise_shield', line: currentLineNum });
        } else if (method === 'cast_fireball') {
          actions.push({ type: 'cast_fireball', param: typeof param === 'number' ? param : 25, line: currentLineNum });
        } else if (method === 'dodge') {
          actions.push({ type: 'dodge', line: currentLineNum });
        } else if (method === 'victory_dance') {
          actions.push({ type: 'victory_dance', line: currentLineNum });
        }
        return;
      }

      // 4. Custom Function Call: e.g. "attack_combo(4)"
      const funcCallMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
      if (funcCallMatch && funcCallMatch[1] in functions) {
        const fName = funcCallMatch[1];
        const func = functions[fName];
        const passedArg = funcCallMatch[2].trim() ? evaluateExpr(funcCallMatch[2].trim()) : undefined;

        if (func.params[0] && passedArg !== undefined) {
          variables[func.params[0]] = passedArg;
        }

        func.body.forEach(bLine => executeLine(bLine, currentLineNum));
        return;
      }
    };

    // Main execution pass
    let curLine = 0;
    while (curLine < rawLines.length) {
      const line = rawLines[curLine];
      const trimmed = line.trim();
      const lineNum = curLine + 1;

      // Skip definitions, already parsed
      if (trimmed.startsWith('def ')) {
        curLine++;
        while (curLine < rawLines.length && (rawLines[curLine].trim().length === 0 || rawLines[curLine].search(/\S/) > 0)) {
          curLine++;
        }
        continue;
      }

      // Handle For Loop: e.g. "for step in range(5):"
      if (trimmed.startsWith('for ') && trimmed.includes('in range(')) {
        const loopMatch = trimmed.match(/^for\s+([a-zA-Z0-9_]+)\s+in\s+range\s*\(([^)]+)\)\s*:/);
        if (!loopMatch) {
          throw { message: "Syntax error in for loop! Format: for i in range(5):", line: lineNum };
        }
        const count = parseInt(evaluateExpr(loopMatch[2])) || 1;
        const bodyLines: { text: string; num: number }[] = [];

        curLine++;
        while (curLine < rawLines.length) {
          const nextL = rawLines[curLine];
          if (nextL.trim().length === 0) {
            curLine++;
            continue;
          }
          if (nextL.search(/\S/) > 0) {
            bodyLines.push({ text: nextL.trim(), num: curLine + 1 });
            curLine++;
          } else {
            break;
          }
        }

        const safetyMax = Math.min(count, 30);
        for (let iter = 0; iter < safetyMax; iter++) {
          variables[loopMatch[1]] = iter;
          for (const b of bodyLines) {
            executeLine(b.text, b.num);
          }
        }
        continue;
      }

      // Handle Conditionals: if / elif / else
      if (trimmed.startsWith('if ') && trimmed.endsWith(':')) {
        const condMatch = trimmed.match(/^if\s+(.+)\s*:/);
        const condExpr = condMatch ? condMatch[1].trim() : 'True';
        let conditionMet = false;

        // Parse condition: e.g. "color == 'red'"
        if (condExpr.includes('==')) {
          const [left, right] = condExpr.split('==').map(s => evaluateExpr(s.trim()));
          conditionMet = left === right;
        } else {
          conditionMet = Boolean(evaluateExpr(condExpr));
        }

        curLine++;
        const ifBody: { text: string; num: number }[] = [];
        while (curLine < rawLines.length && (rawLines[curLine].trim().length === 0 || rawLines[curLine].search(/\S/) > 0)) {
          if (rawLines[curLine].trim().length > 0) {
            ifBody.push({ text: rawLines[curLine].trim(), num: curLine + 1 });
          }
          curLine++;
        }

        if (conditionMet) {
          for (const b of ifBody) executeLine(b.text, b.num);
        }
        continue;
      }

      // Execute normal line
      executeLine(trimmed, lineNum);
      curLine++;
    }

  } catch (err: any) {
    error = err.message || 'Syntax error in Python script.';
    errorLine = err.line || 1;
  }

  return { actions, stdout, error, errorLine };
}
