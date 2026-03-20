import { useMemo } from 'react';
import {
  Box, Paper, TextField, List, ListItemButton, ListItemText,
  Chip, CircularProgress, Typography,
} from '@mui/material';
import { Circle } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import {
  useDbViews, useDbProcedures, useDbTriggers, useDbFunctions,
} from '@/hooks/use-database-objects';
import { useAuthStore } from '@/stores/auth-store';
import { useDebouncedParam } from '@/hooks/use-debounced-param';
import { ExplorerCodeDetail } from '@/components/database/explorer-code-detail';
import type { CodeObjectType } from '@/components/database/explorer-code-detail';
import type { DatabaseEnv } from '@/types/auth-types';

const DB_STYLE: Record<DatabaseEnv, { bg: string; color: string; label: string }> = {
  PROD: { bg: '#2e7d3218', color: '#2e7d32', label: 'PRODUCAO' },
  TESTE: { bg: '#ed6c0218', color: '#ed6c02', label: 'TESTE' },
  TREINA: { bg: '#7b1fa218', color: '#7b1fa2', label: 'TREINA' },
};

const TYPE_LABELS: Record<CodeObjectType, string> = {
  view: 'Views', procedure: 'Procedures', trigger: 'Triggers', function: 'Functions',
};

const TYPE_PLACEHOLDER: Record<CodeObjectType, string> = {
  view: 'Buscar views...', procedure: 'Buscar procedures...',
  trigger: 'Buscar triggers...', function: 'Buscar functions...',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;

interface CodeObjectsTabProps {
  type: CodeObjectType;
}

export function CodeObjectsTab({ type }: CodeObjectsTabProps) {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useDebouncedParam('q');
  const database = useAuthStore((s) => s.database);
  const dbStyle = DB_STYLE[database];
  const selectedObj = params.get('obj') || null;
  const selectedSchema = params.get('eschema') || null;

  const views = useDbViews(type === 'view');
  const procs = useDbProcedures(type === 'procedure');
  const trigs = useDbTriggers(type === 'trigger');
  const funcs = useDbFunctions(type === 'function');

  const queryMap = { view: views, procedure: procs, trigger: trigs, function: funcs };
  const query = queryMap[type];
  const items = Array.isArray(query.data) ? (query.data as R[]) : [];

  const filtered = useMemo(() => {
    if (!search) return items;
    const lower = search.toLowerCase();
    return items.filter((it) => String(it.nome ?? '').toLowerCase().includes(lower));
  }, [items, search]);

  const handleSelect = (nome: string, schema: string) => {
    setParams((p) => {
      const n = new URLSearchParams(p);
      n.set('obj', nome);
      n.set('eschema', schema);
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
          size="small" fullWidth placeholder={TYPE_PLACEHOLDER[type]}
          value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 0.5, flexShrink: 0 }}
          slotProps={{ input: { sx: { fontSize: 12 } } }}
        />
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, px: 0.5, flexShrink: 0,
        }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary' }}>
            {TYPE_LABELS[type]}
          </Typography>
          {items.length > 0 && (
            <Chip label={`${filtered.length}/${items.length}`} size="small"
              sx={{ height: 18, fontSize: 10 }} />
          )}
          {query.isLoading && <CircularProgress size={12} />}
        </Box>
        <List dense sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {filtered.slice(0, 500).map((item, i) => {
            const nome = String(item.nome ?? '');
            const schema = String(item.schema ?? 'dbo');
            const isSelected = selectedObj === nome && selectedSchema === schema;
            return (
              <ListItemButton
                key={`${schema}.${nome}-${i}`} selected={isSelected}
                onClick={() => handleSelect(nome, schema)}
                sx={{ py: 0.15, borderRadius: 0.5 }}
              >
                <ListItemText
                  primary={`${schema}.${nome}`}
                  slotProps={{ primary: { sx: { fontSize: 11, fontFamily: 'monospace' } } }}
                />
              </ListItemButton>
            );
          })}
          {filtered.length === 0 && !query.isLoading && (
            <Typography sx={{ fontSize: 11, color: 'text.disabled', py: 0.5, px: 1 }}>
              Nenhum resultado
            </Typography>
          )}
        </List>
      </Paper>

      <Paper sx={{ flex: 1, p: 1.5, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {(!selectedObj || !selectedSchema) && (
          <Box sx={{ color: 'text.secondary', fontSize: 13, p: 2 }}>
            Selecione um objeto no painel esquerdo
          </Box>
        )}
        {selectedObj && selectedSchema && (
          <ExplorerCodeDetail type={type} schema={selectedSchema} nome={selectedObj} />
        )}
      </Paper>
    </Box>
  );
}
