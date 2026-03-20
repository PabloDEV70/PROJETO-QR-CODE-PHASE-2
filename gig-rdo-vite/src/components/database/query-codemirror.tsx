import { useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql, MSSQL } from '@codemirror/lang-sql';
import { keymap } from '@codemirror/view';
import { useThemeStore } from '@/stores/theme-store';

interface QueryCodemirrorProps {
  value: string;
  onChange: (val: string) => void;
  onExecute: () => void;
}

export function QueryCodemirror({ value, onChange, onExecute }: QueryCodemirrorProps) {
  const theme = useThemeStore((s) => s.mode);

  const execKeymap = keymap.of([
    {
      key: 'Ctrl-Enter',
      run: () => { onExecute(); return true; },
    },
    {
      key: 'Mod-Enter',
      run: () => { onExecute(); return true; },
    },
  ]);

  const handleChange = useCallback((val: string) => onChange(val), [onChange]);

  return (
    <CodeMirror
      value={value}
      onChange={handleChange}
      theme={theme}
      height="180px"
      extensions={[sql({ dialect: MSSQL }), execKeymap]}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        bracketMatching: true,
        autocompletion: true,
        tabSize: 2,
      }}
      style={{ fontSize: 13, border: '1px solid', borderColor: 'rgba(0,0,0,0.12)', borderRadius: 4 }}
    />
  );
}
