import { useMemo, useState, useEffect, useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Chip, ToggleButton, ToggleButtonGroup,
  Skeleton, Collapse, alpha, ButtonBase, Divider, TextField,
  InputAdornment,
} from '@mui/material';
import {
  Build, DirectionsCar, ExpandMore, ExpandLess,
  FiberManualRecord, Engineering, Search, Close,
} from '@mui/icons-material';
import { apiClient } from '@/api/client';
import { useEffectiveCodparc } from '@/hooks/use-effective-codparc';
import { useAuthStore } from '@/stores/auth-store';
import { ApiErrorBanner } from '@/components/shared/api-error-banner';
import type { OsListItem, OsServiceItem } from '@/types/os-types';

const MONO = '"SF Mono", "Roboto Mono", "Fira Code", monospace';

type ViewMode = 'minhas' | 'todas';
type StatusFilter = 'all' | 'A' | 'E';

function useUrlState() {
  const [sp, setSp] = useSearchParams();
  const isAdmin = useAuthStore((s) => s.isAdmin);

  const view = (sp.get('view') as ViewMode) || (isAdmin ? 'todas' : 'minhas');
  const status = (sp.get('status') as StatusFilter) || 'all';
  const expanded = sp.get('os') ? Number(sp.get('os')) : null;
  const placa = sp.get('placa') || '';

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v); else next.delete(k);
    }
    setSp(next, { replace: true });
  };

  const setView = (v: ViewMode) => {
    const defaults: Record<string, string | null> = {
      view: v === (isAdmin ? 'todas' : 'minhas') ? null : v,
      os: null,
    };
    update(defaults);
  };

  const setStatus = (s: StatusFilter) => update({ status: s === 'all' ? null : s });
  const setExpanded = (nuos: number | null) => update({ os: nuos ? String(nuos) : null });
  const setPlaca = (p: string) => update({ placa: p || null, os: null });

  return { view, status, expanded, placa, setView, setStatus, setExpanded, setPlaca };
}

function safeDateStr(raw: string | null | undefined): string {
  if (!raw) return '';
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  } catch {
    return '';
  }
}

/** Single API call for all active OS — replaces 2 parallel calls */
async function fetchOsAtivas(params: Record<string, string>): Promise<OsListItem[]> {
  const { data } = await apiClient.get<OsListItem[]>('/os/ativas', { params });
  return Array.isArray(data) ? data : [];
}

async function fetchOsServicos(nuos: number): Promise<OsServiceItem[]> {
  const { data } = await apiClient.get<OsServiceItem[]>(`/os/${nuos}/servicos`);
  return Array.isArray(data) ? data : [];
}

function StatusChip({ status, label }: { status: string; label: string }) {
  const colorMap: Record<string, string> = {
    A: '#3B82F6', E: '#F59E0B', F: '#16A34A', C: '#EF4444', R: '#EF4444',
  };
  const color = colorMap[status] ?? '#6B7280';
  return (
    <Chip
      icon={<FiberManualRecord sx={{ fontSize: '8px !important' }} />}
      label={label}
      size="small"
      sx={{
        height: 20, fontSize: '0.65rem', fontWeight: 700,
        bgcolor: alpha(color, 0.1), color,
        '& .MuiChip-icon': { color },
      }}
    />
  );
}

function ManutencaoChip({ label }: { label: string }) {
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 20, fontSize: '0.6rem', fontWeight: 600,
        bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
        color: 'text.secondary',
      }}
    />
  );
}

function OsServicosDetail({ nuos }: { nuos: number }) {
  const { data: servicos, isLoading } = useQuery({
    queryKey: ['os-servicos', nuos],
    queryFn: () => fetchOsServicos(nuos),
    staleTime: 2 * 60_000,
  });

  if (isLoading) return <Skeleton variant="rounded" height={40} sx={{ mx: 1.5, mb: 1 }} />;
  if (!servicos?.length) return (
    <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', px: 1.5, pb: 1 }}>
      Nenhum servico cadastrado.
    </Typography>
  );

  return (
    <Box sx={{ px: 1.5, pb: 1.5 }}>
      {servicos.map((s, i) => {
        const statusColor = s.STATUS === 'F' ? '#16A34A' : s.STATUS === 'E' ? '#F59E0B' : '#3B82F6';
        return (
          <Box key={`${s.NUOS}-${s.SEQUENCIA}`} sx={{
            display: 'flex', gap: 1, py: 0.75, alignItems: 'flex-start',
            borderTop: i > 0 ? '1px solid' : 'none', borderColor: 'divider',
          }}>
            <Box sx={{
              width: 6, height: 6, borderRadius: '50%', bgcolor: statusColor,
              mt: 0.75, flexShrink: 0,
            }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: '0.78rem', fontWeight: 600 }}>
                {s.nomeProduto ?? `Produto #${s.CODPROD}`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 0.25 }}>
                <Typography sx={{ fontSize: '0.65rem', color: statusColor, fontWeight: 700 }}>
                  {s.statusLabel ?? s.STATUS}
                </Typography>
                {s.TEMPO != null && s.TEMPO > 0 && (
                  <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', fontFamily: MONO }}>
                    {s.TEMPO}min
                  </Typography>
                )}
                {s.OBSERVACAO && (
                  <Typography noWrap sx={{ fontSize: '0.65rem', color: 'text.disabled', maxWidth: 180 }}>
                    {s.OBSERVACAO}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function OsCard({ os, expanded, onToggle }: {
  os: OsListItem; expanded: boolean; onToggle: () => void;
}) {
  const dtAbertura = safeDateStr(os.DTABERTURA);
  const statusColor = os.STATUS === 'E' ? '#F59E0B' : '#3B82F6';

  return (
    <Paper elevation={0} sx={{
      border: '1px solid',
      borderColor: expanded ? 'primary.main' : 'divider',
      borderLeft: `3px solid ${statusColor}`,
      borderRadius: 2, overflow: 'hidden',
      transition: 'border-color 0.15s',
    }}>
      <ButtonBase
        onClick={onToggle}
        sx={{ width: '100%', textAlign: 'left', display: 'block' }}
      >
        <Box sx={{ p: 1.5, display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 1.5, flexShrink: 0,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <DirectionsCar sx={{ fontSize: 20, color: 'primary.main' }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, fontFamily: MONO, color: 'primary.main' }}>
                {os.NUOS}
              </Typography>
              <StatusChip status={os.STATUS} label={os.statusLabel} />
              <Box sx={{ flex: 1 }} />
              {expanded
                ? <ExpandLess sx={{ fontSize: 18, color: 'text.disabled' }} />
                : <ExpandMore sx={{ fontSize: 18, color: 'text.disabled' }} />}
            </Box>

            {(os.placa || os.marcaModelo) && (
              <Typography noWrap sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.primary' }}>
                {os.placa && <span style={{ fontFamily: MONO, fontWeight: 700 }}>{os.placa}</span>}
                {os.placa && os.marcaModelo && ' · '}
                {os.marcaModelo}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5, alignItems: 'center' }}>
              {os.manutencaoLabel && <ManutencaoChip label={os.manutencaoLabel} />}
              {os.tipoLabel && <ManutencaoChip label={os.tipoLabel} />}
              {dtAbertura && (
                <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', fontFamily: MONO }}>
                  {dtAbertura}
                </Typography>
              )}
              <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
                · {os.qtdServicos ?? 0} servico{(os.qtdServicos ?? 0) !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
        </Box>
      </ButtonBase>

      <Collapse in={expanded}>
        <Divider />
        <OsServicosDetail nuos={os.NUOS} />
      </Collapse>
    </Paper>
  );
}

export function OsManPage() {
  const codparc = useEffectiveCodparc();
  const { view, status: statusFilter, expanded, placa, setView, setStatus, setExpanded, setPlaca } = useUrlState();

  // Local input state for debounced search
  const [placaInput, setPlacaInput] = useState(placa);
  const deferredPlaca = useDeferredValue(placaInput);
  const effectivePlaca = deferredPlaca.length >= 2 ? deferredPlaca : '';

  // Sync deferred value to URL via effect (not during render)
  useEffect(() => {
    if (effectivePlaca !== placa) setPlaca(effectivePlaca);
  }, [effectivePlaca]); // eslint-disable-line react-hooks/exhaustive-deps

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (view === 'minhas' && codparc) {
      params.codparcexec = String(codparc);
    }
    if (placa) {
      params.placa = placa;
    }
    return params;
  }, [view, codparc, placa]);

  const { data: osList, isLoading, error, refetch } = useQuery({
    queryKey: ['os-ativas', queryParams],
    queryFn: () => fetchOsAtivas(queryParams),
    enabled: view === 'todas' || !!codparc,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const items = osList ?? [];
  const filtered = statusFilter === 'all' ? items : items.filter((o) => o.STATUS === statusFilter);
  const abertasCount = items.filter((o) => o.STATUS === 'A').length;
  const emExecCount = items.filter((o) => o.STATUS === 'E').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Build sx={{ fontSize: 28, color: 'primary.main' }} />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.3 }}>
            OS Manutencao
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>
            {view === 'minhas' ? 'Minhas ordens de servico' : 'Todas as ordens ativas'}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: MONO, color: 'primary.main' }}>
            {filtered.length}
          </Typography>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 1 }}>
            OS
          </Typography>
        </Box>
      </Box>

      {/* Vehicle search */}
      <TextField
        size="small"
        placeholder="Buscar por placa (ex: ABC1D23)"
        value={placaInput}
        onChange={(e) => setPlacaInput(e.target.value.toUpperCase())}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 18, color: 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: placaInput ? (
              <InputAdornment position="end">
                <ButtonBase onClick={() => { setPlacaInput(''); setPlaca(''); }} sx={{ borderRadius: 1, p: 0.25 }}>
                  <Close sx={{ fontSize: 16, color: 'text.disabled' }} />
                </ButtonBase>
              </InputAdornment>
            ) : null,
          },
        }}
        sx={{
          '& .MuiInputBase-input': { fontSize: '0.82rem', fontFamily: MONO, py: 0.75 },
          '& .MuiOutlinedInput-root': { borderRadius: 2 },
        }}
      />

      {/* Toggle: Minhas / Todas */}
      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={(_, v) => v && setView(v)}
        size="small"
        fullWidth
        sx={{
          '& .MuiToggleButton-root': {
            textTransform: 'none', fontWeight: 700, fontSize: '0.82rem',
            py: 0.75, borderRadius: '12px !important',
          },
          '& .Mui-selected': {
            bgcolor: (t) => `${alpha(t.palette.primary.main, 0.12)} !important`,
            color: 'primary.main',
          },
        }}
      >
        <ToggleButton value="minhas">Minhas</ToggleButton>
        <ToggleButton value="todas">Todas</ToggleButton>
      </ToggleButtonGroup>

      {/* Status chips filter */}
      <Box sx={{ display: 'flex', gap: 0.75 }}>
        <Chip
          label={`Todas (${items.length})`}
          size="small"
          onClick={() => setStatus('all')}
          sx={{
            fontWeight: 700, fontSize: '0.72rem',
            bgcolor: statusFilter === 'all' ? (t) => alpha(t.palette.primary.main, 0.12) : 'transparent',
            color: statusFilter === 'all' ? 'primary.main' : 'text.secondary',
            border: '1px solid', borderColor: statusFilter === 'all' ? 'primary.main' : 'divider',
          }}
        />
        <Chip
          icon={<FiberManualRecord sx={{ fontSize: '8px !important' }} />}
          label={`Abertas (${abertasCount})`}
          size="small"
          onClick={() => setStatus(statusFilter === 'A' ? 'all' : 'A')}
          sx={{
            fontWeight: 700, fontSize: '0.72rem',
            bgcolor: statusFilter === 'A' ? alpha('#3B82F6', 0.1) : 'transparent',
            color: statusFilter === 'A' ? '#3B82F6' : 'text.secondary',
            border: '1px solid', borderColor: statusFilter === 'A' ? '#3B82F6' : 'divider',
            '& .MuiChip-icon': { color: '#3B82F6' },
          }}
        />
        <Chip
          icon={<FiberManualRecord sx={{ fontSize: '8px !important' }} />}
          label={`Exec (${emExecCount})`}
          size="small"
          onClick={() => setStatus(statusFilter === 'E' ? 'all' : 'E')}
          sx={{
            fontWeight: 700, fontSize: '0.72rem',
            bgcolor: statusFilter === 'E' ? alpha('#F59E0B', 0.1) : 'transparent',
            color: statusFilter === 'E' ? '#F59E0B' : 'text.secondary',
            border: '1px solid', borderColor: statusFilter === 'E' ? '#F59E0B' : 'divider',
            '& .MuiChip-icon': { color: '#F59E0B' },
          }}
        />
      </Box>

      <ApiErrorBanner error={error} onRetry={refetch} context="OsManutencao" />

      {/* List */}
      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={88} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Engineering sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {placa
              ? `Nenhuma OS ativa para placa "${placa}"`
              : view === 'minhas'
                ? 'Nenhuma OS atribuida a voce'
                : 'Nenhuma OS ativa'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {filtered.map((os) => (
            <OsCard
              key={os.NUOS}
              os={os}
              expanded={expanded === os.NUOS}
              onToggle={() => setExpanded(expanded === os.NUOS ? null : os.NUOS)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default OsManPage;
