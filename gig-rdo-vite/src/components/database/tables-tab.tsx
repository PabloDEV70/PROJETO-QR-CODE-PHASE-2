import { useMemo } from 'react';
import {
  Box, Paper, TextField, List, ListItemButton, ListItemText,
  Chip, CircularProgress, Typography,
} from '@mui/material';
import { Circle } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { useDbTables } from '@/hooks/use-database';
import { useAuthStore } from '@/stores/auth-store';
import { useDebouncedParam } from '@/hooks/use-debounced-param';
import { ExplorerTableDetail } from '@/components/database/explorer-table-detail';
import type { DatabaseEnv } from '@/types/auth-types';

const DB_STYLE: Record<DatabaseEnv, { bg: string; color: string; label: string }> = {
  PROD: { bg: '#2e7d3218', color: '#2e7d32', label: 'PRODUCAO' },
  TESTE: { bg: '#ed6c0218', color: '#ed6c02', label: 'TESTE' },
  TREINA: { bg: '#7b1fa218', color: '#7b1fa2', label: 'TREINA' },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;

export function TablesTab() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useDebouncedParam('q');
  const database = useAuthStore((s) => s.database);
  const dbStyle = DB_STYLE[database];
  const selected = params.get('table') || null;
  const { data, isLoading } = useDbTables();

  const items = Array.isArray(data) ? (data as R[]) : [];
  const filtered = useMemo(() => {
    if (!search) return items;
    const lower = search.toLowerCase();
    return items.filter((t) => String(t.TABLE_NAME ?? '').toLowerCase().includes(lower));
  }, [items, search]);

  const handleSelect = (name: string) => {
    setParams((p) => {
      const n = new URLSearchParams(p);
      n.set('table', name);
      return n;
    }, { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, height: '100%' }}>
      <Paper sx={{
        width: 280, flexShrink: 0, display: 'flex',
        flexDirection: 'column', overflow: 'hidden', p: 0.5,
      }}>
        <Chip
          icon={<Circle sx={{ fontSize: '8px !important', color: dbStyle.color }} />}
          label={dbStyle.label} size="small"
          sx={{
            mb: 0.5, height: 22, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
            bgcolor: dbStyle.bg, color: dbStyle.color, border: `1px solid ${dbStyle.color}40`,
            flexShrink: 0,
          }}
        />
        <TextField
          size="small" fullWidth placeholder="Buscar tabelas..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 0.5, flexShrink: 0 }}
          slotProps={{ input: { sx: { fontSize: 12 } } }}
        />
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, px: 0.5, flexShrink: 0,
        }}>
          {items.length > 0 && (
            <Chip label={`${filtered.length}/${items.length}`} size="small"
              sx={{ height: 18, fontSize: 10 }} />
          )}
          {isLoading && <CircularProgress size={12} />}
        </Box>
        <List dense sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {filtered.slice(0, 500).map((item) => {
            const name = String(item.TABLE_NAME ?? '');
            return (
              <ListItemButton
                key={name} selected={selected === name}
                onClick={() => handleSelect(name)}
                sx={{ py: 0.15, borderRadius: 0.5 }}
              >
                <ListItemText
                  primary={name}
                  slotProps={{ primary: { sx: { fontSize: 11, fontFamily: 'monospace' } } }}
                />
              </ListItemButton>
            );
          })}
          {filtered.length === 0 && !isLoading && (
            <Typography sx={{ fontSize: 11, color: 'text.disabled', py: 0.5, px: 1 }}>
              Nenhum resultado
            </Typography>
          )}
        </List>
      </Paper>

      <Paper sx={{ flex: 1, p: 1.5, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selected && (
          <Box sx={{ color: 'text.secondary', fontSize: 13, p: 2 }}>
            Selecione uma tabela no painel esquerdo
          </Box>
        )}
        {selected && <ExplorerTableDetail tableName={selected} />}
      </Paper>
    </Box>
  );
}
