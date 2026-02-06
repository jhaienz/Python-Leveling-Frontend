'use client';

import { useTheme } from 'next-themes';
import Editor from '@monaco-editor/react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = 'python',
  height = '400px',
  readOnly = false,
  className,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();

  // Handle 100% height by using h-full class
  const isFullHeight = height === '100%';

  return (
    <div className={cn(
      "overflow-hidden",
      isFullHeight ? "h-full" : "",
      className
    )}>
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
