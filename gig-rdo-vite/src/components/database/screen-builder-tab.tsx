import { useMemo, Fragment } from 'react';
import {
  Box, Paper, TextField, List, ListItemButton, ListItemText,
  Chip, CircularProgress, Typography, ListSubheader,
} from '@mui/material';
import { Circle } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { useScreenInstances } from '@/hooks/use-screen-builder';
import { useDebouncedParam } from '@/hooks/use-debounced-param';
import { ScreenInstanceDetail } from '@/components/database/screen-instance-detail';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;

export function ScreenBuilderTab() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useDebouncedParam('tq');
  const selected = params.get('tela') ? Number(params.get('tela')) : null;
  const { data, isLoading } = useScreenInstances();

  const items: R[] = Array.isArray(data) ? data : [];

  const filtered = useMemo(() => {
    if (!search) return items;
    const lower = search.toLowerCase();
    return items.filter(
      (t) =>
        String(t.NOMEINSTANCIA ?? '').toLowerCase().includes(lower)
        || String(t.NOMETAB ?? '').toLowerCase().includes(lower)
        || String(t.DESCRINSTANCIA ?? '').toLowerCase().includes(lower),
    );
  }, [items, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, R[]>();
    for (const item of filtered) {
      const cat = String(item.CATEGORIA ?? 'Sem Categoria').trim() || 'Sem Categoria';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    return map;
  }, [filtered]);

  const handleSelect = (nuInstancia: number) => {
    setParams((p) => {
      const n = new URLSearchParams(p);
      n.set('tela', String(nuInstancia));
      return n;
    }, { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, height: '100%' }}>
      <Paper sx={{
        width: 280, flexShrink: 0, display: 'flex',
        flexDirection: 'column', overflow: 'hidden', p: 0.5,
      }}>
        <TextField
          size="small" fullWidth placeholder="Buscar telas..."
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
          {[...grouped.entries()].map(([cat, group]) => (
            <Fragment key={cat}>
              <ListSubheader component="div" sx={{
                fontSize: 10, lineHeight: '24px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                bgcolor: 'background.paper',
              }}>
                {cat}
              </ListSubheader>
              {group.map((item) => {
                const id = Number(item.NUINSTANCIA);
                const name = String(item.NOMEINSTANCIA ?? '');
                const table = String(item.NOMETAB ?? '');
                const active = item.ATIVO === 'S' || item.ATIVO === 1;
                return (
                  <ListItemButton
                    key={id} selected={selected === id}
                    onClick={() => handleSelect(id)}
                    sx={{ py: 0.15, borderRadius: 0.5 }}
                  >
                    <Circle sx={{
                      fontSize: 6, mr: 0.5,
                      color: active ? 'success.main' : 'text.disabled',
                    }} />
                    <ListItemText
                      primary={name}
                      secondary={table}
                      slotProps={{
                        primary: { sx: { fontSize: 11, fontFamily: 'monospace' } },
                        secondary: { sx: { fontSize: 9 } },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </Fragment>
          ))}
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
            Selecione uma tela no painel esquerdo
          </Box>
        )}
        {selected && <ScreenInstanceDetail nuInstancia={selected} />}
      </Paper>
    </Box>
  );
}
