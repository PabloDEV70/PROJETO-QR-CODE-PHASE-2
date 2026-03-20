import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Local state for instant typing + debounced URL param sync.
 * Avoids React Router re-render cascade on every keystroke.
 */
export function useDebouncedParam(key: string, delay = 250) {
  const [params, setParams] = useSearchParams();
  const urlValue = params.get(key) || '';
  const [input, setInputRaw] = useState(urlValue);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mountedUrl = useRef(urlValue);

  // Sync URL → local only when param changes externally (tab switch, back button)
  useEffect(() => {
    if (urlValue !== mountedUrl.current) {
      mountedUrl.current = urlValue;
      setInputRaw(urlValue);
    }
  }, [urlValue]);

  const setInput = useCallback((v: string) => {
    setInputRaw(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      mountedUrl.current = v;
      setParams((p) => {
        const n = new URLSearchParams(p);
        v ? n.set(key, v) : n.delete(key);
        return n;
      }, { replace: true });
    }, delay);
  }, [key, delay, setParams]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return [input, setInput] as const;
}
