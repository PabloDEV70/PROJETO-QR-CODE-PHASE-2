import { useEffect, useCallback } from 'react';

interface ShortcutOptions {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcut(
  options: ShortcutOptions | ShortcutOptions[],
  callback: (e: KeyboardEvent) => void,
) {
  const shortcuts = Array.isArray(options) ? options : [options];

  const handler = useCallback((e: KeyboardEvent) => {
    for (const s of shortcuts) {
      const ctrlOk = s.ctrl ? (e.ctrlKey || e.metaKey) : true;
      const shiftOk = s.shift ? e.shiftKey : true;
      const altOk = s.alt ? e.altKey : true;
      const metaOk = s.meta ? e.metaKey : true;

      if (e.key.toLowerCase() === s.key.toLowerCase() && ctrlOk && shiftOk && altOk && metaOk) {
        if (s.preventDefault !== false) e.preventDefault();
        callback(e);
        return;
      }
    }
  }, [shortcuts, callback]);

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
