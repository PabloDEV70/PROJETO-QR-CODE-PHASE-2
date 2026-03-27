import { useState, useCallback } from 'react';

interface UseToggleOptions {
  defaultValue?: boolean;
}

interface UseToggleReturn {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
  setValue: (value: boolean) => void;
}

export function useToggle(options: UseToggleOptions = {}): UseToggleReturn {
  const { defaultValue = false } = options;
  const [value, setValue] = useState(defaultValue);

  const toggle = useCallback(() => setValue((prev) => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse, setValue };
}
