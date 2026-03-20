import { useMemo, useState } from 'react';
import {
  Box, Typography, CircularProgress, TextField, InputAdornment,
  List, ListItemButton, Chip, Stack, Collapse, alpha,
  Divider,
} from '@mui/material';
import {
  Search, ExpandMore, ExpandLess, FolderOpen, Folder,
  People, PlayArrow,
} from '@mui/icons-material';
import { useServicosComExecucao } from '@/hooks/use-manutencao';
import type { ServicoComExecucao } from '@/types/os-types';

function fmtMin(min: number): string {
  if (min <= 0) return '-';
  if (min < 60) return `${min.toFixed(0)}min`;
  const h = min / 60;
  return h < 24 ? `${h.toFixed(1)}h` : `${(h / 24).toFixed(1)}d`;
}

interface GrupoNode {
  codGrupo: number;
  descr: string;
  descrPai: string | null;
  servicos: ServicoComExecucao[];
  totalExec: number;
  totalExecutores: number;
}

function buildGrupos(items: ServicoComExecucao[]): GrupoNode[] {
  const map = new Map<number, GrupoNode>();
  for (const s of items) {
    let node = map.get(s.codGrupo);
    if (!node) {
      node = {
        codGrupo: s.codGrupo,
        descr: s.descrGrupo ?? 'Sem grupo',
        descrPai: s.descrGrupoPai,
        servicos: [],
        totalExec: 0,
        totalExecutores: 0,
      };
      map.set(s.codGrupo, node);
    }
    node.servicos.push(s);
    node.totalExec += s.totalExecucoes;
    node.totalExecutores += s.totalExecutores;
  }
  const arr = [...map.values()];
  arr.sort((a, b) => b.totalExec - a.totalExec);
  for (const g of arr) {
    g.servicos.sort((a, b) => b.totalExecucoes - a.totalExecucoes);
  }
  return arr;
}

function GrupoSection({ grupo, codprod, onSelect, maxExec, defaultOpen }: {
  grupo: GrupoNode;
  codprod: number | null;
  onSelect: (cod: number) => void;
  maxExec: number;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasSelected = grupo.servicos.some((s) => s.codProd === codprod);

  return (
    <>
      <ListItemButton
        onClick={() => setOpen(!open)}
        sx={{
          py: 0.75, px: 1.5,
          bgcolor: (t) => hasSelected
            ? alpha(t.palette.primary.main, 0.06)
            : alpha(t.palette.text.primary, 0.02),
          borderBottom: 1, borderColor: 'divider',
          '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.06) },
        }}
      >
        {open
          ? <FolderOpen sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
          : <Folder sx={{ fontSize: 18, mr: 1, color: 'text.disabled' }} />
        }
        <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
          <Typography
            sx={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: 0.3, lineHeight: 1.3,
            }}
            noWrap
          >
            {grupo.descr}
          </Typography>
          {grupo.descrPai && (
            <Typography sx={{ fontSize: 9, color: 'text.disabled', lineHeight: 1.2 }} noWrap>
              {grupo.descrPai}
            </Typography>
          )}
          <Stack direction="row" spacing={1} sx={{ mt: 0.25 }}>
            <Typography sx={{ fontSize: 9, color: 'text.disabled' }}>
              {grupo.servicos.length} servico{grupo.servicos.length !== 1 ? 's' : ''}
            </Typography>
            <Typography sx={{ fontSize: 9, color: 'text.disabled' }}>
              {grupo.totalExec} exec.
            </Typography>
          </Stack>
        </Box>
        <Stack alignItems="flex-end" sx={{ flexShrink: 0 }}>
          {open ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
        </Stack>
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List disablePadding>
          {grupo.servicos.map((s) => {
            const selected = codprod === s.codProd;
            const pct = maxExec > 0 ? (s.totalExecucoes / maxExec) * 100 : 0;
            return (
              <ListItemButton
                key={s.codProd}
                selected={selected}
                onClick={() => onSelect(s.codProd)}
                sx={{
                  py: 0.75, pl: 3, pr: 1.5,
                  borderLeft: 3,
                  borderLeftColor: selected ? 'primary.main' : 'transparent',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0, top: 0, bottom: 0,
                    width: `${pct}%`,
                    bgcolor: (t) => alpha(t.palette.primary.main, selected ? 0.1 : 0.04),
                    transition: 'width 0.3s',
                    zIndex: 0,
                  },
                  '&.Mui-selected': {
                    bgcolor: 'transparent',
                    '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.08) },
                  },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1, mr: 1 }}>
                  <Typography
                    sx={{
                      fontSize: 11.5, fontWeight: selected ? 700 : 400,
                      color: selected ? 'primary.main' : 'text.primary',
                    }}
                    noWrap
                  >
                    {s.descrProd}
                  </Typography>
                  <Typography sx={{ fontSize: 9, color: 'text.disabled', fontFamily: 'monospace' }}>
                    #{s.codProd}
                  </Typography>
                </Box>
                <Stack alignItems="flex-end" spacing={0} sx={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <People sx={{ fontSize: 11, color: selected ? 'primary.main' : 'text.disabled' }} />
                    <Typography sx={{
                      fontSize: 12, fontWeight: 700,
                      color: selected ? 'primary.main' : 'text.secondary',
                    }}>
                      {s.totalExecutores}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.25}>
                    <PlayArrow sx={{ fontSize: 9, color: 'text.disabled' }} />
                    <Typography sx={{ fontSize: 9, color: 'text.disabled' }}>
                      {s.totalExecucoes} exec
                    </Typography>
                    <Typography sx={{ fontSize: 9, color: 'text.disabled', ml: 0.5 }}>
                      {fmtMin(s.mediaMinutos)}
                    </Typography>
                  </Stack>
                </Stack>
              </ListItemButton>
            );
          })}
        </List>
      </Collapse>
    </>
  );
}

export function ServicoList({ codprod, onSelect }: {
  codprod: number | null;
  onSelect: (cod: number) => void;
}) {
  const { data: servicos, isLoading } = useServicosComExecucao();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!servicos) return [];
    if (!search) return servicos;
    const q = search.toLowerCase();
    return servicos.filter((s) =>
      s.descrProd.toLowerCase().includes(q) ||
      (s.descrGrupo && s.descrGrupo.toLowerCase().includes(q)) ||
      (s.descrGrupoPai && s.descrGrupoPai.toLowerCase().includes(q)) ||
      String(s.codProd).includes(q),
    );
  }, [servicos, search]);

  const grupos = useMemo(() => buildGrupos(filtered), [filtered]);
  const maxExec = useMemo(
    () => Math.max(1, ...filtered.map((s) => s.totalExecucoes)),
    [filtered],
  );
  const total = servicos?.length ?? 0;
  const totalExec = useMemo(
    () => filtered.reduce((s, r) => s + r.totalExecucoes, 0),
    [filtered],
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 1.5, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: 13, mb: 0.5 }}>
          Servicos executados
        </Typography>
        <TextField
          size="small" fullWidth placeholder="Buscar servico, grupo ou codigo..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 16 }} />
                </InputAdornment>
              ),
              sx: { fontSize: 12 },
            },
          }}
        />
        {search && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </Typography>
        )}
      </Box>

      {/* Summary stats */}
      {total > 0 && (
        <Box sx={{ px: 1.5, py: 0.75, borderBottom: 1, borderColor: 'divider', bgcolor: (t) => alpha(t.palette.primary.main, 0.03) }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Chip
              label={`${total} servicos`}
              size="small"
              sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
            />
            <Chip
              label={`${grupos.length} grupos`}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
            />
            <Chip
              icon={<PlayArrow sx={{ fontSize: '12px !important' }} />}
              label={`${totalExec.toLocaleString('pt-BR')} exec.`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
            />
          </Stack>
        </Box>
      )}

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress size={24} />
          </Stack>
        ) : grupos.length === 0 ? (
          <Stack alignItems="center" sx={{ py: 6, px: 2 }}>
            <Search sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {search ? 'Nenhum servico encontrado' : 'Nenhum servico com execucoes'}
            </Typography>
          </Stack>
        ) : (
          <List disablePadding>
            {grupos.map((g, i) => (
              <GrupoSection
                key={g.codGrupo}
                grupo={g}
                codprod={codprod}
                onSelect={onSelect}
                maxExec={maxExec}
                defaultOpen={i === 0 || g.servicos.some((s) => s.codProd === codprod)}
              />
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ px: 1.5, py: 0.5, bgcolor: (t) => alpha(t.palette.text.primary, 0.02) }}>
        <Typography sx={{ fontSize: 9, color: 'text.disabled', textAlign: 'center' }}>
          Somente servicos com execucoes registradas (AD_TCFEXEC)
        </Typography>
      </Box>
    </Box>
  );
}
