'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { Language } from '@au/types';
import { MONACO_LANGUAGE_ID } from './starter-code';
import { Skeleton } from '@/components/ui/skeleton';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export interface CodeEditorProps {
  language: Language;
  value: string;
  onChange: (value: string) => void;
  fontSize?: number;
  wordWrap?: boolean;
  height?: string;
  readOnly?: boolean;
}

export function CodeEditor({
  language,
  value,
  onChange,
  fontSize = 14,
  wordWrap = false,
  height = '460px',
  readOnly = false,
}: CodeEditorProps): JSX.Element {
  const { resolvedTheme } = useTheme();

  return (
    <div className="h-full overflow-hidden rounded-md border">
      <MonacoEditor
        height={height}
        language={MONACO_LANGUAGE_ID[language]}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
        options={{
          fontSize,
          wordWrap: wordWrap ? 'on' : 'off',
          minimap: { enabled: false },
          tabSize: 4,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly,
          renderWhitespace: 'selection',
        }}
      />
    </div>
  );
}
