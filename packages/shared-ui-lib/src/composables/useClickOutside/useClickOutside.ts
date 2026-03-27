import { useEffect, useRef, useCallback } from 'react';

interface UseClickOutsideOptions {
  onClickOutside: () => void;
  enabled?: boolean;
}

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  options: UseClickOutsideOptions
) {
  const { onClickOutside, enabled = true } = options;
  const ref = useRef<T>(null);

  const handleClick = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!enabled) return;

      const target = event.target as Node | null;
      if (ref.current && !ref.current.contains(target)) {
        onClickOutside();
      }
    },
    [onClickOutside, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [handleClick, enabled]);

  return ref;
}
