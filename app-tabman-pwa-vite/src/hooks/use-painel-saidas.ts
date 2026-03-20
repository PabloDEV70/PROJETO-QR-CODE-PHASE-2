import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '@/api/client';
import { useDeviceStore } from '@/stores/device-store';

export interface Operador {
  codparc: number;
  nome: string;
  nomeusu: string;
}

export interface PainelEntry {
  id: string;
  modelo: string;
  tag: string;
  placa: string;
  specs: string;
  operadores: Operador[];
  contratante: string;
  local: string;
  previsao: string;
  status: 'FIXO' | 'PARADA' | 'MANUTENCAO' | 'PROGRAMADO' | 'DISPONIVEL';
  updatedBy: string | null;
  updatedAt: string;
}

export function usePainelSaidas() {
  const [entries, setEntries] = useState<PainelEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const token = useDeviceStore((s) => s.token);

  // SSE connection
  useEffect(() => {
    const base = apiClient.defaults.baseURL ?? '';
    const url = `${base}/painel-saidas/stream`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    // Migrate old entries: operador string → operadores array
    const migrate = (item: any): PainelEntry => {
      if (!item.operadores && item.operador) {
        item.operadores = item.operador ? [{ codparc: 0, nome: item.operador }] : [];
      }
      if (!Array.isArray(item.operadores)) item.operadores = [];
      return item;
    };

    es.addEventListener('reset', (e) => {
      try { setEntries(JSON.parse(e.data).map(migrate)); } catch { /* ignore */ }
    });
    es.addEventListener('add', (e) => {
      try {
        const item = migrate(JSON.parse(e.data));
        setEntries((prev) => [...prev, item]);
      } catch { /* ignore */ }
    });
    es.addEventListener('update', (e) => {
      try {
        const item = migrate(JSON.parse(e.data));
        setEntries((prev) => prev.map((x) => x.id === item.id ? item : x));
      } catch { /* ignore */ }
    });
    es.addEventListener('remove', (e) => {
      try {
        const { id } = JSON.parse(e.data);
        setEntries((prev) => prev.filter((x) => x.id !== id));
      } catch { /* ignore */ }
    });

    return () => { es.close(); esRef.current = null; setConnected(false); };
  }, [token]);

  const addEntry = useCallback(async (entry: Omit<PainelEntry, 'id' | 'updatedAt' | 'updatedBy'>) => {
    await apiClient.post('/painel-saidas', entry);
  }, []);

  const updateEntry = useCallback(async (id: string, changes: Partial<PainelEntry>) => {
    await apiClient.put(`/painel-saidas/${id}`, changes);
  }, []);

  const removeEntry = useCallback(async (id: string) => {
    await apiClient.delete(`/painel-saidas/${id}`);
  }, []);

  return { entries, connected, addEntry, updateEntry, removeEntry };
}
