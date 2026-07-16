/**
 * Translates raw Python tracebacks and exceptions into simple, encouraging,
 * and clear kid-friendly plain language explanations.
 */
export function translatePythonError(rawError: string): { message: string; line: number | null } {
  const errorStr = String(rawError);
  let friendlyMessage = "Oh no! Python got a bit confused. Let's look at your code and try again! 🔍";
  let lineNum: number | null = null;

  // Try to extract line number (e.g. 'File "<external_input>", line 3' or 'line 3, in')
  const lineMatch = errorStr.match(/line (\d+)/i);
  if (lineMatch && lineMatch[1]) {
    lineNum = parseInt(lineMatch[1], 10);
  }

  // 1. Indentation Errors
  if (errorStr.includes("IndentationError")) {
    if (errorStr.includes("expected an indented block")) {
      friendlyMessage = `💡 Indentation Error: It looks like you forgot to add spaces/indentation inside a loop, function, or condition on line ${lineNum || 'X'}. Python needs these inside code blocks!`;
    } else if (errorStr.includes("unexpected indent")) {
      friendlyMessage = `💡 Indentation Error: There are extra spaces at the beginning of line ${lineNum || 'X'} that shouldn't be there. Keep everything aligned!`;
    } else {
      friendlyMessage = `💡 Indentation Error: Check the alignment spaces at the start of line ${lineNum || 'X'}. Python is very particular about neat spacing!`;
    }
  }
  // 2. Syntax Errors (missing colons, parentheses, etc)
  else if (errorStr.includes("SyntaxError")) {
    if (errorStr.includes("expected ':'") || errorStr.includes("expected colon")) {
      friendlyMessage = `💡 Missing Colon: You forgot to add a colon (\`:\`) at the end of line ${lineNum || 'X'}. Python needs colons to know where loops (\`for\`), functions (\`def\`), or conditions (\`if\`) start!`;
    } else if (errorStr.includes("unmatched") || errorStr.includes("was never closed")) {
      friendlyMessage = `💡 Unclosed Bracket/Quote: Check line ${lineNum || 'X'}. Make sure all your parentheses \`()\`, brackets \`[]\`, or quotes \`""\` are properly matched and closed!`;
    } else if (errorStr.includes("invalid syntax")) {
      friendlyMessage = `💡 Spelling / Typo Error: Python couldn't understand line ${lineNum || 'X'}. Look out for typos, missing quotes, or misplaced letters!`;
    } else {
      friendlyMessage = `💡 Spelling / Typo Error: There's a small syntax issue on line ${lineNum || 'X'}. Double check that everything matches the level instructions!`;
    }
  }
  // 3. Name Errors (undefined variables)
  else if (errorStr.includes("NameError")) {
    const nameMatch = errorStr.match(/name '([^']+)' is not defined/);
    const varName = nameMatch ? nameMatch[1] : '';
    if (varName) {
      friendlyMessage = `💡 Unknown Variable: You used \`${varName}\` on line ${lineNum || 'X'}, but Python doesn't know what that is yet! Did you spell it correctly, or forget to define it first (e.g. \`${varName} = ...\`)?`;
    } else {
      friendlyMessage = `💡 Unknown Variable: There is a name or variable on line ${lineNum || 'X'} that Python doesn't recognize. Check your spelling!`;
    }
  }
  // 4. Type Errors
  else if (errorStr.includes("TypeError")) {
    if (errorStr.includes("not callable")) {
      friendlyMessage = `💡 Spell / Function Call Error: You tried to call something that isn't a function on line ${lineNum || 'X'}. Check if you added extra parentheses by mistake!`;
    } else {
      friendlyMessage = `💡 Mixing Types: Python got confused about data types on line ${lineNum || 'X'}. Make sure you aren't trying to mix text (strings) and numbers in math equations!`;
    }
  }
  // 5. Assertion Errors (auto-grader failures)
  else if (errorStr.includes("AssertionError")) {
    // Custom assert messages
    const assertMatch = errorStr.match(/AssertionError:\s*(.*)/);
    if (assertMatch && assertMatch[1]) {
      friendlyMessage = `🎯 Try Again: ${assertMatch[1]}`;
    } else {
      friendlyMessage = `🎯 Challenge check failed. Review the instructions and make sure your output matches what the quest expects!`;
    }
  }
  // 6. ZeroDivisionError
  else if (errorStr.includes("ZeroDivisionError")) {
    friendlyMessage = `💡 Division by Zero: You tried to divide by zero on line ${lineNum || 'X'}. Math wizardry doesn't allow dividing by 0!`;
  }
  // Fallback
  else {
    friendlyMessage = `💡 Troubleshooting Tip (Line ${lineNum || 'X'}): Python says: "${errorStr.split('\n').pop() || errorStr}" - review the level hints and double-check your code layout!`;
  }

  return {
    message: friendlyMessage,
    line: lineNum
  };
}
