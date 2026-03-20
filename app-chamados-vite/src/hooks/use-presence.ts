import { useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/auth-store';

export interface OnlineUser {
  codusu: number;
  nome: string;
  codparc: number | null;
  codgrupo: number | null;
}

const HEARTBEAT_INTERVAL = 30_000; // 30s
const POLL_INTERVAL = 20_000; // 20s

async function sendHeartbeat(user: {
  codusu: number;
  nome: string;
  codparc?: number | null;
  codgrupo?: number | null;
}) {
  await apiClient.post('/presence/heartbeat', {
    codusu: user.codusu,
    nome: user.nome,
    codparc: user.codparc ?? null,
    codgrupo: user.codgrupo ?? null,
  });
}

async function fetchOnline(): Promise<OnlineUser[]> {
  const { data } = await apiClient.get<OnlineUser[]>('/presence/online');
  return data;
}

/**
 * Sends heartbeat every 30s and polls online users every 20s.
 * Returns the list of online users and a helper to check if a specific user is online.
 */
export function usePresence() {
  const user = useAuthStore((s) => s.user);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Send heartbeat on mount + every 30s
  const beat = useCallback(() => {
    if (!user?.codusu || !user.nome) return;
    sendHeartbeat({
      codusu: user.codusu,
      nome: user.nome,
      codparc: user.codparc,
      codgrupo: user.codgrupo,
    }).catch(() => { /* silent */ });
  }, [user?.codusu, user?.nome, user?.codparc, user?.codgrupo]);

  useEffect(() => {
    beat(); // immediate
    timerRef.current = setInterval(beat, HEARTBEAT_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [beat]);

  // Also beat on visibility change (tab comes back to focus)
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') beat();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [beat]);

  // Poll online users
  const query = useQuery({
    queryKey: ['presence', 'online'],
    queryFn: fetchOnline,
    staleTime: 15_000,
    refetchInterval: POLL_INTERVAL,
  });

  const onlineSet = new Set((query.data ?? []).map((u) => u.codusu));

  const isOnline = useCallback(
    (codusu: number | null | undefined) => codusu != null && onlineSet.has(codusu),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query.data],
  );

  return {
    onlineUsers: query.data ?? [],
    onlineCount: onlineSet.size,
    isOnline,
  };
}
