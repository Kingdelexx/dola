'use client';
import Editor from '@monaco-editor/react';

export default function PythonEditor({ code, onChange }: { code: string; onChange: (code: string) => void }) {
  return (
    <div className="border border-gray-400 rounded-lg overflow-hidden shadow-inner w-full">
      <Editor
        height="500px"
        defaultLanguage="python"
        theme="vs-dark"
        value={code}
        onChange={(value) => onChange(value || '')}
        options={{
          fontSize: 16,
          minimap: { enabled: false },
          padding: { top: 16 }
        }}
      />
    </div>
  );
}
