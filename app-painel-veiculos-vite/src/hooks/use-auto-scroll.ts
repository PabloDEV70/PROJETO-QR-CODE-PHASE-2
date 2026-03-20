import { useEffect, useRef, useCallback } from 'react';
import { usePainelStore } from '@/stores/painel-store';

export function useAutoScroll(containerRef: React.RefObject<HTMLElement | null>) {
  const rafRef = useRef<number>(0);
  const speed = usePainelStore((s) => s.scrollSpeed);
  const isPaused = usePainelStore((s) => s.isPaused);

  const step = useCallback(() => {
    const el = containerRef.current;
    if (!el || isPaused) {
      rafRef.current = requestAnimationFrame(step);
      return;
    }
    el.scrollTop += speed * 0.5;
    if (el.scrollTop >= el.scrollHeight - el.clientHeight) {
      el.scrollTop = 0;
    }
    rafRef.current = requestAnimationFrame(step);
  }, [containerRef, speed, isPaused]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [step]);
}
