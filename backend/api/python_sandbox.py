import ast
import sys
import os
import subprocess
import json
import time

# Whitelist of allowed modules in the learning sandbox
SAFE_MODULES = {
    'math', 'random', 'datetime', 'time', 'string', 'json',
    're', 'collections', 'itertools', 'heapq', 'bisect', 'copy'
}

# Explicitly blocked modules
FORBIDDEN_MODULES = {
    'os', 'sys', 'subprocess', 'shutil', 'pty', 'posix', 'nt', 'winreg', 'msvcrt',
    'socket', 'urllib', 'requests', 'http', 'ftplib', 'poplib', 'imaplib', 'smtplib',
    'asyncio', 'aiohttp', 'builtins', '__builtin__', 'importlib', 'types', 'inspect',
    'traceback', 'code', 'codeop', 'compileall', 'pip', 'pkg_resources', 'setuptools',
    'distutils', 'site', 'ensurepip', 'ctypes', 'cffi', 'mmap', 'multiprocessing',
    'threading', 'concurrent', 'pickle', 'shelve', 'marshal', 'gc', 'pathlib',
    'fileinput', 'tempfile', 'glob', 'shlex', 'platform', 'commands', 'webbrowser'
}

# Forbidden builtin function calls
FORBIDDEN_CALLS = {
    'open', 'eval', 'exec', 'compile', '__import__', 'globals', 'locals', 'vars',
    'dir', 'help', 'breakpoint', 'exit', 'quit', 'getattr', 'setattr', 'delattr',
    'hasattr', 'input'
}

# Forbidden dunder attributes used for sandbox escape / reflection
FORBIDDEN_ATTRIBUTES = {
    '__subclasses__', '__bases__', '__base__', '__mro__', '__class__',
    '__globals__', '__builtins__', '__code__', '__closure__', '__func__',
    '__self__', '__module__', '__dict__', '__import__'
}


class SecurityNodeVisitor(ast.NodeVisitor):
    """
    AST visitor that inspects user-submitted Python code for security violations.
    """
    def __init__(self):
        self.violations = []

    def visit_Import(self, node):
        for alias in node.names:
            base_mod = alias.name.split('.')[0]
            if base_mod in FORBIDDEN_MODULES or base_mod not in SAFE_MODULES:
                self.violations.append(f"Import of module '{alias.name}' is restricted for security.")
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        if node.module:
            base_mod = node.module.split('.')[0]
            if base_mod in FORBIDDEN_MODULES or base_mod not in SAFE_MODULES:
                self.violations.append(f"Import from module '{node.module}' is restricted for security.")
        self.generic_visit(node)

    def visit_Call(self, node):
        func_name = None
        if isinstance(node.func, ast.Name):
            func_name = node.func.id
        elif isinstance(node.func, ast.Attribute):
            func_name = node.func.attr

        if func_name in FORBIDDEN_CALLS:
            self.violations.append(f"Function call '{func_name}()' is restricted in the DolaCode sandbox.")
        self.generic_visit(node)

    def visit_Attribute(self, node):
        if node.attr in FORBIDDEN_ATTRIBUTES:
            self.violations.append(f"Access to internal attribute '{node.attr}' is restricted for security.")
        self.generic_visit(node)


def validate_python_code_ast(code: str) -> tuple[bool, str]:
    """
    Parses and checks the AST of the Python code for security violations.
    Returns: (is_valid: bool, error_message: str)
    """
    if not code or not code.strip():
        return True, ""

    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return False, f"SyntaxError on line {e.lineno}: {e.msg}"

    visitor = SecurityNodeVisitor()
    visitor.visit(tree)

    if visitor.violations:
        return False, "; ".join(visitor.violations)

    return True, ""


def execute_sandboxed_python(code: str, test_assertions: list[str] = None, timeout_seconds: float = 2.0) -> dict:
    """
    Executes Python code in a secure, sandboxed subprocess environment.
    
    Security Guarantees:
    1. Static AST analysis validates imports, calls, and attributes before running.
    2. Runs in an isolated subprocess with stripped environment variables (no server secrets).
    3. Builtins are restricted; dangerous functions and filesystem access are removed.
    4. Execution wall-clock timeout enforced (default 2 seconds).
    5. Output size limit enforced (max 50,000 characters).
    """
    # 1. AST Validation
    is_valid, error_msg = validate_python_code_ast(code)
    if not is_valid:
        return {
            "success": False,
            "error": "SecurityViolation",
            "message": error_msg,
            "stdout": "",
            "stderr": error_msg,
            "execution_time_ms": 0,
            "tests_passed": False,
            "tests_total": len(test_assertions) if test_assertions else 0
        }

    # 2. Validate test assertions if provided
    if test_assertions:
        for idx, assertion in enumerate(test_assertions):
            a_valid, a_err = validate_python_code_ast(assertion)
            if not a_valid:
                return {
                    "success": False,
                    "error": "SecurityViolation",
                    "message": f"Test assertion #{idx + 1} security violation: {a_err}",
                    "stdout": "",
                    "stderr": a_err,
                    "execution_time_ms": 0,
                    "tests_passed": False,
                    "tests_total": len(test_assertions)
                }

    # 3. Construct the runner script executed in the isolated subprocess
    escaped_code = json.dumps(code)
    escaped_assertions = json.dumps(test_assertions or [])

    runner_code = f"""
import sys, io, json, time

safe_builtins = {{
    'abs': abs, 'all': all, 'any': any, 'ascii': ascii, 'bin': bin,
    'bool': bool, 'bytearray': bytearray, 'bytes': bytes, 'chr': chr,
    'complex': complex, 'dict': dict, 'divmod': divmod, 'enumerate': enumerate,
    'filter': filter, 'float': float, 'format': format, 'frozenset': frozenset,
    'hash': hash, 'hex': hex, 'int': int, 'isinstance': isinstance,
    'issubclass': issubclass, 'iter': iter, 'len': len, 'list': list,
    'map': map, 'max': max, 'min': min, 'next': next, 'object': object,
    'oct': oct, 'ord': ord, 'pow': pow, 'print': print, 'range': range,
    'repr': repr, 'reversed': reversed, 'round': round, 'set': set,
    'slice': slice, 'sorted': sorted, 'str': str, 'sum': sum,
    'tuple': tuple, 'type': type, 'zip': zip,
    'True': True, 'False': False, 'None': None,
    'Exception': Exception, 'ValueError': ValueError, 'TypeError': TypeError,
    'IndexError': IndexError, 'KeyError': KeyError, 'ZeroDivisionError': ZeroDivisionError,
    'AssertionError': AssertionError, 'NameError': NameError, 'AttributeError': AttributeError,
}}

SAFE_MODULES = {{'math', 'random', 'datetime', 'time', 'string', 'json', 're', 'collections', 'itertools', 'heapq', 'bisect', 'copy'}}
__orig_import = __import__

def __safe_import(name, *args, **kwargs):
    base_name = name.split('.')[0]
    if base_name in SAFE_MODULES:
        return __orig_import(name, *args, **kwargs)
    raise ImportError(f"Importing '{{name}}' is restricted in the DolaCode sandbox.")

safe_builtins['__import__'] = __safe_import

sys.setrecursionlimit(1000)

user_code = {escaped_code}
assertions = {escaped_assertions}

stdout_capture = io.StringIO()
sys.stdout = stdout_capture

safe_globals = {{'__builtins__': safe_builtins}}
safe_locals = {{}}

start_time = time.time()
error_type = None
error_msg = None
tests_passed = True
tests_total = len(assertions)
assertion_error = None

try:
    compiled = compile(user_code, '<dolacode>', 'exec')
    exec(compiled, safe_globals, safe_locals)
    
    for a in assertions:
        try:
            exec(a, safe_globals, safe_locals)
        except Exception as ae:
            tests_passed = False
            assertion_error = str(ae)
            break
except Exception as e:
    error_type = type(e).__name__
    error_msg = str(e)
    tests_passed = False

elapsed_ms = int((time.time() - start_time) * 1000)
out_text = stdout_capture.getvalue()

# Limit output size to 50KB
if len(out_text) > 50000:
    out_text = out_text[:50000] + "\\n[Output truncated: exceeded 50KB limit]"

result = {{
    "success": error_type is None and tests_passed,
    "stdout": out_text,
    "stderr": error_msg or "",
    "error": error_type,
    "message": error_msg or assertion_error or "Execution completed successfully.",
    "execution_time_ms": elapsed_ms,
    "tests_passed": tests_passed,
    "tests_total": tests_total
}}

sys.__stdout__.write(json.dumps(result))
"""

    # 4. Execute in subprocess with sanitized environment and timeout
    # Strip any sensitive server secrets from environment
    sensitive_keywords = {'SECRET', 'KEY', 'PASS', 'TOKEN', 'AUTH', 'PAYSTACK', 'DATABASE', 'CREDENTIAL'}
    clean_env = {
        k: v for k, v in os.environ.items()
        if not any(s in k.upper() for s in sensitive_keywords)
    }
    clean_env['PYTHONPATH'] = ''

    start_t = time.time()
    try:
        proc = subprocess.run(
            [sys.executable, '-c', runner_code],
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            env=clean_env
        )

        if proc.returncode == 0 and proc.stdout:
            try:
                res_data = json.loads(proc.stdout)
                return res_data
            except json.JSONDecodeError:
                pass

        # If runner itself produced an error
        stderr_text = proc.stderr or proc.stdout
        return {
            "success": False,
            "error": "ExecutionError",
            "message": stderr_text[:500] if stderr_text else "Execution failed.",
            "stdout": proc.stdout[:2000] if proc.stdout else "",
            "stderr": stderr_text[:2000] if stderr_text else "",
            "execution_time_ms": int((time.time() - start_t) * 1000),
            "tests_passed": False,
            "tests_total": len(test_assertions) if test_assertions else 0
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": "TimeLimitExceeded",
            "message": f"Execution timed out (maximum {timeout_seconds}s allowed).",
            "stdout": "",
            "stderr": f"TimeLimitExceeded: code execution exceeded {timeout_seconds} seconds.",
            "execution_time_ms": int(timeout_seconds * 1000),
            "tests_passed": False,
            "tests_total": len(test_assertions) if test_assertions else 0
        }
    except Exception as e:
        return {
            "success": False,
            "error": type(e).__name__,
            "message": str(e),
            "stdout": "",
            "stderr": str(e),
            "execution_time_ms": int((time.time() - start_t) * 1000),
            "tests_passed": False,
            "tests_total": len(test_assertions) if test_assertions else 0
        }
