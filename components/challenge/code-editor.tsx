'use client';

import { useTheme } from 'next-themes';
import Editor from '@monaco-editor/react';
import { Skeleton } from '@/components/ui/skeleton';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language = 'python',
  height = '400px',
  readOnly = false,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="border rounded-lg overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(val) => onChange(val || '')}
        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
        loading={<Skeleton className="h-full w-full" />}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          wordWrap: 'on',
          readOnly,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
}
