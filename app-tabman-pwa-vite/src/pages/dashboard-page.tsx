import { useMemo, useState, useCallback } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { Box, Typography, Skeleton, Fab, IconButton, TextField } from '@mui/material';
import { PersonAdd, FiberManualRecord, Refresh, ChevronLeft, ChevronRight, Today } from '@mui/icons-material';
import { format, addDays, parseISO } from 'date-fns';
import { useQuemFaz } from '@/hooks/use-quem-faz';
import { ActivityCard } from '@/components/dashboard/activity-card';
import { PinDialog } from '@/components/selector/pin-dialog';
import { useSessionStore } from '@/stores/session-store';
import { isOngoing } from '@/types/quem-faz-types';
import type { QuemFazRow } from '@/types/quem-faz-types';

interface OutletCtx { search: string; setSearch: (v: string) => void }

function sortRows(rows: QuemFazRow[]): QuemFazRow[] {
  return [...rows].sort((a, b) => {
    // Ongoing first
    const aOn = isOngoing(a) ? 1 : 0;
    const bOn = isOngoing(b) ? 1 : 0;
    if (aOn !== bOn) return bOn - aOn;
    // Then by last activity time DESC
    return (b.ultHrini ?? 0) - (a.ultHrini ?? 0);
  });
}

export function DashboardPage() {
  const navigate = useNavigate();
  const startSession = useSessionStore((s) => s.startSession);
  const [sp, setSp] = useSearchParams();
  const hoje = format(new Date(), 'yyyy-MM-dd');
  const dtref = sp.get('data') || hoje;
  const isToday = dtref === hoje;

  const setDtref = (d: string) => {
    const next = new URLSearchParams(sp);
    if (d === hoje) next.delete('data'); else next.set('data', d);
    setSp(next, { replace: true });
  };

  const { data: rows, isLoading, dataUpdatedAt, isFetching, refetch } = useQuemFaz(dtref);
  const ctx = useOutletContext<OutletCtx | undefined>();
  const search = ctx?.search ?? '';
  const departamento = sp.get('departamento') ?? '';

  const filtered = useMemo(() => {
    if (!rows) return [];
    let list = sortRows(rows);
    // Department filter (from AppHeader autocomplete)
    if (departamento) {
      list = list.filter((r) => r.departamento === departamento);
    }
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    const isDigits = /^\d+$/.test(q);
    return list.filter((r) =>
      isDigits
        ? String(r.CODPARC).includes(q)
        : r.nomeparc?.toLowerCase().includes(q),
    );
  }, [rows, search, departamento]);

  const ongoingCount = useMemo(() => filtered.filter(isOngoing).length, [filtered]);

  const [pinTarget, setPinTarget] = useState<{ codparc: number; nomeparc: string; cargo?: string | null } | null>(null);

  const handleClick = useCallback((row: QuemFazRow) => {
    setPinTarget({ codparc: row.CODPARC, nomeparc: row.nomeparc ?? '', cargo: row.cargo });
  }, []);

  const handlePinConfirm = useCallback(() => {
    if (!pinTarget) return;
    startSession(pinTarget.codparc, pinTarget.nomeparc);
    setPinTarget(null);
    const dateParam = isToday ? '' : `?data=${dtref}`;
    navigate(`/apontar/${pinTarget.codparc}${dateParam}`);
  }, [pinTarget, startSession, navigate, isToday, dtref]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      {/* Date selector */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton size="small" onClick={() => setDtref(format(addDays(parseISO(dtref), -1), 'yyyy-MM-dd'))}>
          <ChevronLeft sx={{ fontSize: 20 }} />
        </IconButton>
        <TextField
          type="date" value={dtref} size="small"
          onChange={(e) => setDtref(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { height: 32, fontSize: '0.8rem', fontFamily: '"JetBrains Mono", monospace' } }}
        />
        <IconButton size="small" onClick={() => setDtref(format(addDays(parseISO(dtref), 1), 'yyyy-MM-dd'))} disabled={dtref >= hoje}>
          <ChevronRight sx={{ fontSize: 20 }} />
        </IconButton>
        {!isToday && (
          <IconButton size="small" onClick={() => setDtref(hoje)} title="Hoje">
            <Today sx={{ fontSize: 18, color: 'primary.main' }} />
          </IconButton>
        )}
        {!isToday && (
          <Typography sx={{ fontSize: '0.72rem', color: '#e65100', fontWeight: 600, ml: 0.5 }}>
            {new Date(dtref + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </Typography>
        )}
      </Box>

      {/* Loading */}
      {isLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Typography color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            {search ? `Nenhum resultado para "${search}"` : isToday ? 'Nenhum colaborador com RDO hoje' : 'Nenhum RDO nesta data'}
          </Typography>
        </Box>
      )}

      {/* Cards grid */}
      {!isLoading && filtered.length > 0 && (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 1.5,
        }}>
          {filtered.map((row) => (
            <ActivityCard key={row.CODPARC} row={row} onClick={() => handleClick(row)} />
          ))}
        </Box>
      )}

      {/* Floating status bar */}
      {!isLoading && (
        <Box sx={{
          position: 'fixed', bottom: 16, left: 16,
          display: 'flex', alignItems: 'center', gap: 0.75,
          bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
          borderRadius: 2, px: 1.25, py: 0.5,
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        }}>
          <FiberManualRecord sx={{ fontSize: 8, color: '#16a34a', animation: 'dp2 2s infinite', '@keyframes dp2': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700 }}>
            {ongoingCount} trabalhando
          </Typography>
          <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled' }}>
            {filtered.length} RDO
          </Typography>
          <Box sx={{ width: 1, height: 14, bgcolor: 'divider', mx: 0.25 }} />
          <Typography sx={{ fontSize: '0.55rem', color: isFetching ? 'primary.main' : 'text.disabled', fontFamily: 'monospace' }}>
            {isFetching ? 'atualizando...' : dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
          </Typography>
          <IconButton
            size="small"
            onClick={() => refetch()}
            disabled={isFetching}
            sx={{
              width: 22, height: 22,
              animation: isFetching ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
            }}
          >
            <Refresh sx={{ fontSize: 14, color: isFetching ? 'primary.main' : 'text.disabled' }} />
          </IconButton>
        </Box>
      )}
      <Fab
        color="primary"
        size="medium"
        onClick={() => navigate(`/novo-rdo${isToday ? '' : `?data=${dtref}`}`)}
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <PersonAdd />
      </Fab>

      {/* PIN confirmation */}
      <PinDialog
        open={!!pinTarget}
        colaborador={pinTarget}
        onConfirm={handlePinConfirm}
        onClose={() => setPinTarget(null)}
      />
    </Box>
  );
}
