import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MODOS = ['/grid', '/aeroporto', '/status', '/kanban', '/kpi', '/urgentes', '/quadro'] as const;
const DEFAULT_INTERVAL = 30_000;

export function useRodizio(intervalMs = DEFAULT_INTERVAL) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPaused, setIsPaused] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    const next = (currentIndex + 1) % MODOS.length;
    setCurrentIndex(next);
    navigate(MODOS[next], { replace: true });
  }, [currentIndex, navigate]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goToNext, intervalMs);
    return () => clearInterval(timer);
  }, [isPaused, intervalMs, goToNext]);

  // Sync index when user navigates manually
  useEffect(() => {
    const idx = MODOS.indexOf(location.pathname as typeof MODOS[number]);
    if (idx >= 0) setCurrentIndex(idx);
  }, [location.pathname]);

  return {
    isPaused,
    setIsPaused,
    currentIndex,
    currentMode: MODOS[currentIndex],
    totalModos: MODOS.length,
    goToNext,
    modos: MODOS,
  };
}

export { MODOS };
