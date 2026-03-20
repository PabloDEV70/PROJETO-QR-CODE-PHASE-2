import { useEffect, useRef, useState, useCallback } from 'react';

const EVENTS: Array<keyof WindowEventMap> = [
  'touchstart',
  'pointerdown',
  'keydown',
];

export function useInactivity(
  timeoutMs: number,
  onInactive: () => void,
): { remainingSeconds: number } {
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.ceil(timeoutMs / 1000),
  );
  const deadlineRef = useRef(Date.now() + timeoutMs);
  const onInactiveRef = useRef(onInactive);
  onInactiveRef.current = onInactive;

  const resetTimer = useCallback(() => {
    deadlineRef.current = Date.now() + timeoutMs;
    setRemainingSeconds(Math.ceil(timeoutMs / 1000));
  }, [timeoutMs]);

  useEffect(() => {
    // Reset on mount
    resetTimer();

    // Countdown interval
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((deadlineRef.current - Date.now()) / 1000),
      );
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        onInactiveRef.current();
      }
    }, 1000);

    // Event listeners
    const handler = () => resetTimer();
    for (const event of EVENTS) {
      window.addEventListener(event, handler, { passive: true });
    }

    return () => {
      clearInterval(interval);
      for (const event of EVENTS) {
        window.removeEventListener(event, handler);
      }
    };
  }, [timeoutMs, resetTimer]);

  return { remainingSeconds };
}
