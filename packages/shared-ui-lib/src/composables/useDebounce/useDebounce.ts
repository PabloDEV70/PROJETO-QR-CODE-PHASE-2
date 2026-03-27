import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDebounceOptions<T> {
  value: T;
  delay: number;
}

interface UseDebounceReturn<T> {
  debouncedValue: T;
  isPending: boolean;
}

export function useDebounce<T>({ value, delay }: UseDebounceOptions<T>): UseDebounceReturn<T> {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsPending(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return { debouncedValue, isPending };
}

interface UseDebouncedCallbackOptions {
  delay: number;
}

interface UseDebouncedCallbackReturn<T extends (...args: unknown[]) => unknown> {
  debouncedCallback: T;
  isPending: boolean;
  cancel: () => void;
}

export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  { delay }: UseDebouncedCallbackOptions
): UseDebouncedCallbackReturn<T> {
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setIsPending(false);
    }
  }, []);

  const debouncedCallback = useCallback(
    ((...args: unknown[]) => {
      setIsPending(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
        setIsPending(false);
      }, delay);
    }) as T,
    [callback, delay]
  );

  return { debouncedCallback, isPending, cancel };
}
