import { useRef, useEffect, useCallback, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  containerRef?: React.RefObject<HTMLElement | null>;
}

export function usePullToRefresh({ onRefresh, threshold = 80, containerRef }: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const pulling = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const el = containerRef?.current ?? document.scrollingElement;
    if (!el || el.scrollTop > 5) return;
    startY.current = e.touches[0].clientY;
    pulling.current = false;
  }, [containerRef]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isRefreshing) return;
    const el = containerRef?.current ?? document.scrollingElement;
    if (!el || el.scrollTop > 5) return;

    const dy = e.touches[0].clientY - startY.current;
    if (dy > 10) {
      pulling.current = true;
      setIsPulling(true);
      setPullDistance(Math.min(dy * 0.5, threshold * 1.5));
      e.preventDefault();
    }
  }, [isRefreshing, threshold, containerRef]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const el = containerRef?.current ?? document;
    const opts: AddEventListenerOptions = { passive: false };

    el.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
    el.addEventListener('touchmove', handleTouchMove as EventListener, opts);
    el.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart as EventListener);
      el.removeEventListener('touchmove', handleTouchMove as EventListener);
      el.removeEventListener('touchend', handleTouchEnd as EventListener);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, containerRef]);

  return { isPulling, isRefreshing, pullDistance, progress: Math.min(pullDistance / threshold, 1) };
}
