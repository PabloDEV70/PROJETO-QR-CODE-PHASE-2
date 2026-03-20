import { useMemo, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Box, Typography, Paper, Chip, Skeleton, alpha, Collapse,
  IconButton, TextField,
} from '@mui/material';
import {
  PeopleAlt, FiberManualRecord, Build, DirectionsCar,
  AccessTime, Close, CalendarToday,
} from '@mui/icons-material';
import { apiClient } from '@/api/client';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { ApiErrorBanner } from '@/components/shared/api-error-banner';
import { hhmmToString, hhmmToMinutos, agoraHhmm, formatMinutos } from '@/utils/hora-utils';
import { getCategoryMeta } from '@/utils/wrench-time-categories';

const MONO = '"SF Mono", "Roboto Mono", "Fira Code", monospace';

interface QuemFazRow {
  CODRDO: number;
  CODPARC: number;
  nomeparc: string | null;
  departamento: string | null;
  cargo: string | null;
  ultItem: number | null;
  ultHrini: number | null;
  ultHrfim: number | null;
  ultMotivoCod: number | null;
  ultMotivoSigla: string | null;
  ultMotivoDesc: string | null;
  ultMotivoProdutivo: string | null;
  ultMotivoCategoria: string | null;
  ultNuos: number | null;
  ultOsStatus: string | null;
  ultOsPlaca: string | null;
  osAtivasCount: number;
}

async function fetchQuemFaz(data: string): Promise<QuemFazRow[]> {
  const { data: rows } = await apiClient.get<QuemFazRow[]>('/rdo/quem-faz', { params: { data } });
  return Array.isArray(rows) ? rows : [];
}

function useUrlState() {
  const [sp, setSp] = useSearchParams();
  const today = format(new Date(), 'yyyy-MM-dd');

  const data = sp.get('data') || today;
  const colab = sp.get('colab') ? Number(sp.get('colab')) : null;

  const setData = (d: string) => {
    const next = new URLSearchParams(sp);
    if (d === today) next.delete('data'); else next.set('data', d);
    next.delete('colab');
    setSp(next, { replace: true });
  };

  const setColab = (codparc: number | null) => {
    const next = new URLSearchParams(sp);
    if (codparc) next.set('colab', String(codparc)); else next.delete('colab');
    setSp(next, { replace: true });
  };

  const isToday = data === today;

  return { data, colab, setData, setColab, today, isToday };
}

function ElapsedBadge({ hrini }: { hrini: number }) {
  const [now, setNow] = useState(agoraHhmm);
  useEffect(() => {
    const id = setInterval(() => setNow(agoraHhmm()), 30_000);
    return () => clearInterval(id);
  }, []);
  const mins = hhmmToMinutos(now) - hhmmToMinutos(hrini);
  if (mins <= 0) return null;
  return (
    <Chip
      icon={<AccessTime sx={{ fontSize: '11px !important' }} />}
      label={formatMinutos(mins)}
      size="small"
      sx={{
        height: 18, fontSize: '0.6rem', fontWeight: 700,
        bgcolor: alpha('#3B82F6', 0.1), color: '#3B82F6',
        '& .MuiChip-icon': { color: '#3B82F6' },
      }}
    />
  );
}

function ActivityBand({ row }: { row: QuemFazRow }) {
  if (row.ultHrini == null) return null;

  const isOpen = row.ultHrfim == null;
  const catColor = row.ultMotivoCategoria
    ? getCategoryMeta(row.ultMotivoCategoria).color
    : (row.ultMotivoProdutivo === 'S' ? '#16A34A' : '#F59E0B');

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap',
    }}>
      <Chip
        icon={isOpen ? <FiberManualRecord sx={{
          fontSize: '8px !important',
          animation: 'blink 1.5s ease-in-out infinite',
          '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
        }} /> : undefined}
        label={row.ultMotivoSigla ?? 'Ativo'}
        size="small"
        sx={{
          height: 20, fontSize: '0.62rem', fontWeight: 700,
          bgcolor: alpha(catColor, 0.15), color: catColor,
          '& .MuiChip-icon': { color: catColor },
        }}
      />
      <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', fontFamily: MONO }}>
        {hhmmToString(row.ultHrini)}
        {row.ultHrfim != null ? ` → ${hhmmToString(row.ultHrfim)}` : ''}
      </Typography>
      {isOpen && <ElapsedBadge hrini={row.ultHrini} />}
    </Box>
  );
}

function OsInfo({ row }: { row: QuemFazRow }) {
  if (!row.ultNuos && row.osAtivasCount === 0) return null;
  return (
    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', mt: 0.25 }}>
      <Build sx={{ fontSize: 12, color: '#F59E0B' }} />
      {row.ultNuos && (
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: MONO, color: '#F59E0B' }}>
          OS {row.ultNuos}
        </Typography>
      )}
      {row.ultOsPlaca && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          <DirectionsCar sx={{ fontSize: 10, color: 'text.disabled' }} />
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, fontFamily: MONO, color: 'text.secondary' }}>
            {row.ultOsPlaca}
          </Typography>
        </Box>
      )}
      {row.osAtivasCount > 0 && (
        <Typography sx={{ fontSize: '0.62rem', color: 'text.disabled' }}>
          ({row.osAtivasCount} OS ativa{row.osAtivasCount > 1 ? 's' : ''})
        </Typography>
      )}
    </Box>
  );
}

function ExpandedDetail({ row }: { row: QuemFazRow }) {
  const catMeta = row.ultMotivoCategoria ? getCategoryMeta(row.ultMotivoCategoria) : null;
  const catColor = catMeta?.color
    ?? (row.ultMotivoProdutivo === 'S' ? '#16A34A' : '#F59E0B');

  return (
    <Box sx={{
      mt: 0.75, pt: 0.75, borderTop: '1px dashed',
      borderColor: alpha(catColor, 0.2),
    }}>
      {row.ultMotivoDesc && (
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: catColor, mb: 0.25 }}>
          {row.ultMotivoDesc}
        </Typography>
      )}
      {catMeta && (
        <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
          {catMeta.label}
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
        <Box>
          <Typography sx={{ fontSize: '0.55rem', color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Inicio
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: MONO }}>
            {hhmmToString(row.ultHrini)}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: '0.55rem', color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Fim
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: MONO }}>
            {row.ultHrfim != null ? hhmmToString(row.ultHrfim) : 'Em andamento'}
          </Typography>
        </Box>
        {row.ultNuos && (
          <Box>
            <Typography sx={{ fontSize: '0.55rem', color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              OS
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: MONO, color: '#F59E0B' }}>
              {row.ultNuos}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function ColabCard({
  row, selected, onSelect,
}: {
  row: QuemFazRow; selected: boolean; onSelect: () => void;
}) {
  const hasRdo = row.ultHrini != null;
  const hasOs = row.osAtivasCount > 0 || row.ultNuos != null;
  const isOpen = hasRdo && row.ultHrfim == null;

  const catColor = row.ultMotivoCategoria
    ? getCategoryMeta(row.ultMotivoCategoria).color
    : (row.ultMotivoProdutivo === 'S' ? '#16A34A' : '#F59E0B');

  return (
    <Paper
      elevation={0}
      onClick={onSelect}
      sx={{
        border: '1px solid',
        borderColor: selected ? catColor : 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        ...(selected && { boxShadow: `0 0 0 1px ${alpha(catColor, 0.3)}` }),
        ...(isOpen && !selected && {
          borderLeft: `3px solid ${catColor}`,
        }),
      }}
    >
      <Box sx={{ p: 1.25, display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
        <FuncionarioAvatar
          codparc={row.CODPARC}
          nome={row.nomeparc ?? ''}
          size="medium"
          sx={{ width: 40, height: 40 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontSize: '0.85rem', fontWeight: 700 }}>
            {row.nomeparc ?? `#${row.CODPARC}`}
          </Typography>
          {(row.departamento || row.cargo) && (
            <Typography sx={{ fontSize: '0.62rem', color: 'text.disabled', mb: 0.25 }}>
              {row.departamento}{row.cargo ? ` · ${row.cargo}` : ''}
            </Typography>
          )}
          <ActivityBand row={row} />
          <OsInfo row={row} />
          {!hasRdo && !hasOs && (
            <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled', mt: 0.25, fontStyle: 'italic' }}>
              Sem atividade registrada
            </Typography>
          )}
          <Collapse in={selected} unmountOnExit>
            <ExpandedDetail row={row} />
          </Collapse>
        </Box>
      </Box>
    </Paper>
  );
}

export function AdminQuemFazPage() {
  const { data, colab, setData, setColab, isToday } = useUrlState();
  const dateLabel = format(new Date(data + 'T12:00:00'), "EEEE, dd 'de' MMMM", { locale: ptBR });

  const { data: rows, isLoading, error, refetch } = useQuery({
    queryKey: ['quem-faz', data],
    queryFn: () => fetchQuemFaz(data),
    staleTime: isToday ? 30_000 : 5 * 60_000,
    gcTime: 5 * 60_000,
  });

  const colabs = rows ?? [];

  const sorted = useMemo(() => {
    return [...colabs].sort((a, b) => {
      const aOpen = a.ultHrini != null && a.ultHrfim == null ? 4 : 0;
      const bOpen = b.ultHrini != null && b.ultHrfim == null ? 4 : 0;
      const aScore = aOpen + (a.ultHrini != null ? 2 : 0) + (a.osAtivasCount > 0 ? 1 : 0);
      const bScore = bOpen + (b.ultHrini != null ? 2 : 0) + (b.osAtivasCount > 0 ? 1 : 0);
      if (bScore !== aScore) return bScore - aScore;
      return (b.ultHrini ?? 0) - (a.ultHrini ?? 0);
    });
  }, [colabs]);

  const ativosRdo = sorted.filter((c) => c.ultHrini != null).length;
  const emAndamento = sorted.filter((c) => c.ultHrini != null && c.ultHrfim == null).length;
  const comOs = sorted.filter((c) => c.osAtivasCount > 0).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <PeopleAlt sx={{ fontSize: 28, color: 'primary.main' }} />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.3 }}>
            Quem faz o que
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', textTransform: 'capitalize', fontWeight: 500 }}>
            {dateLabel}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CalendarToday sx={{ fontSize: 16, color: 'text.disabled' }} />
          <TextField
            type="date"
            size="small"
            value={data}
            onChange={(e) => setData(e.target.value)}
            slotProps={{ htmlInput: { max: format(new Date(), 'yyyy-MM-dd') } }}
            sx={{
              width: 140,
              '& .MuiInputBase-input': { fontSize: '0.75rem', py: 0.5, px: 1 },
              '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
            }}
          />
        </Box>
      </Box>

      <ApiErrorBanner error={error} onRetry={refetch} context="QuemFaz" />

      {/* Stats */}
      {sorted.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, px: 0.5 }}>
          <Paper elevation={0} sx={{
            flex: 1, py: 0.75, px: 1, borderRadius: 2, textAlign: 'center',
            bgcolor: alpha('#16A34A', 0.08), border: '1px solid', borderColor: alpha('#16A34A', 0.15),
          }}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: MONO, color: '#16A34A' }}>
              {emAndamento}
            </Typography>
            <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Em atividade
            </Typography>
          </Paper>
          <Paper elevation={0} sx={{
            flex: 1, py: 0.75, px: 1, borderRadius: 2, textAlign: 'center',
            bgcolor: alpha('#F59E0B', 0.08), border: '1px solid', borderColor: alpha('#F59E0B', 0.15),
          }}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: MONO, color: '#F59E0B' }}>
              {comOs}
            </Typography>
            <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Em OS
            </Typography>
          </Paper>
          <Paper elevation={0} sx={{
            flex: 1, py: 0.75, px: 1, borderRadius: 2, textAlign: 'center',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
            border: '1px solid', borderColor: (t) => alpha(t.palette.primary.main, 0.15),
          }}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: MONO, color: 'primary.main' }}>
              {ativosRdo}/{sorted.length}
            </Typography>
            <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Com RDO
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Selected colab indicator */}
      {colab && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.5 }}>
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            Colaborador selecionado
          </Typography>
          <IconButton size="small" onClick={() => setColab(null)} sx={{ p: 0.25 }}>
            <Close sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      )}

      {/* List */}
      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      ) : sorted.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <PeopleAlt sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Nenhum colaborador com RDO {isToday ? 'hoje' : 'nesta data'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {sorted.map((c) => (
            <ColabCard
              key={c.CODRDO}
              row={c}
              selected={colab === c.CODPARC}
              onSelect={() => setColab(colab === c.CODPARC ? null : c.CODPARC)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default AdminQuemFazPage;
