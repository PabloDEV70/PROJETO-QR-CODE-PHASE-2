import { useState, useEffect, useCallback } from 'react';

type StorageValue<T> = T | null;

interface UseLocalStorageOptions {
  serialize?: (value: unknown) => string;
  deserialize?: (value: string) => unknown;
}

interface UseLocalStorageReturn<T> {
  value: StorageValue<T>;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

export function useLocalStorage<T>(
  key: string,
  initialValue?: T,
  options: UseLocalStorageOptions = {}
): UseLocalStorageReturn<T> {
  const { serialize = JSON.stringify, deserialize = JSON.parse } = options;

  const [value, setValueState] = useState<StorageValue<T>>(() => {
    if (typeof window === 'undefined') {
      return initialValue ?? null;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (deserialize(item) as T) : (initialValue ?? null);
    } catch {
      return initialValue ?? null;
    }
  });

  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      try {
        const valueToStore = newValue instanceof Function ? newValue(value as T) : newValue;
        setValueState(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serialize(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, serialize, value]
  );

  const removeValue = useCallback(() => {
    try {
      setValueState(null);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setValueState(deserialize(e.newValue) as T);
      } else if (e.key === key && !e.newValue) {
        setValueState(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize]);

  return { value, setValue, removeValue };
}
