import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Box, Typography, Paper, alpha, ButtonBase, Chip, Skeleton,
} from '@mui/material';
import {
  Groups, FiberManualRecord,
  CheckCircle, Warning, Cancel,
} from '@mui/icons-material';
import { getMeusRdos, getRdoDetalhes } from '@/api/rdo';
import { CACHE_TIMES } from '@/config/query-config';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { ApiErrorBanner } from '@/components/shared/api-error-banner';
import { hhmmToString, formatMinutos } from '@/utils/hora-utils';
import { getCategoryMeta } from '@/utils/wrench-time-categories';
import type { RdoCabecalho, RdoDetalheItem } from '@/types/rdo-types';

const MONO = '"SF Mono", "Roboto Mono", "Fira Code", monospace';

/** Last activity of the day is always considered active (worker is "in" it) */
function detectActiveFromDetalhes(detalhes: RdoDetalheItem[]): RdoDetalheItem | null {
  if (detalhes.length === 0) return null;
  const sorted = [...detalhes].sort((a, b) => (b.HRINI ?? 0) - (a.HRINI ?? 0));
  const last = sorted[0];
  if (!last || last.HRINI == null) return null;
  return last;
}

function StatusBadge({ active, motivo }: { active: RdoDetalheItem | null; motivo?: string }) {
  if (!active) {
    return (
      <Chip
        icon={<Cancel sx={{ fontSize: '14px !important' }} />}
        label="Parado"
        size="small"
        sx={{
          height: 22, fontSize: 10, fontWeight: 700,
          bgcolor: alpha('#EF4444', 0.1), color: '#EF4444',
          '& .MuiChip-icon': { color: '#EF4444' },
        }}
      />
    );
  }
  const catColor = active.motivoCategoria
    ? getCategoryMeta(active.motivoCategoria).color
    : (active.motivoProdutivo === 'S' ? '#16A34A' : '#F59E0B');
  return (
    <Chip
      icon={<FiberManualRecord sx={{
        fontSize: '10px !important',
        animation: 'blink 1.5s ease-in-out infinite',
        '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
      }} />}
      label={active.motivoSigla ?? motivo ?? 'Ativo'}
      size="small"
      sx={{
        height: 22, fontSize: 10, fontWeight: 700,
        bgcolor: alpha(catColor, 0.12), color: catColor,
        '& .MuiChip-icon': { color: catColor },
      }}
    />
  );
}

function ProdBadge({ percent }: { percent: number | null }) {
  if (percent == null) return null;
  const color = percent >= 85 ? '#16A34A' : percent >= 60 ? '#F59E0B' : '#EF4444';
  const Icon = percent >= 85 ? CheckCircle : percent >= 60 ? Warning : Cancel;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
      <Icon sx={{ fontSize: 14, color }} />
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: MONO, color }}>
        {Math.round(percent)}%
      </Typography>
    </Box>
  );
}

function ColaboradorRow({
  rdo,
  active,
  onClick,
}: {
  rdo: RdoCabecalho;
  active: RdoDetalheItem | null;
  onClick: () => void;
}) {
  return (
    <ButtonBase onClick={onClick} sx={{ width: '100%', textAlign: 'left', display: 'block' }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.25,
        py: 1.25, px: 1.5,
        borderBottom: '1px solid', borderColor: 'divider',
        transition: 'background 120ms',
        '&:hover': { bgcolor: 'action.hover' },
        '&:active': { bgcolor: 'action.selected' },
      }}>
        <FuncionarioAvatar
          codparc={rdo.CODPARC ?? undefined}
          nome={rdo.nomeparc ?? undefined}
          size="medium"
          sx={{ width: 40, height: 40 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography noWrap sx={{ fontSize: '0.88rem', fontWeight: 700, flex: 1 }}>
              {rdo.nomeparc ?? `#${rdo.CODPARC}`}
            </Typography>
            <ProdBadge percent={rdo.produtividadePercent} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25, flexWrap: 'wrap' }}>
            <StatusBadge active={active} />
            {active && active.HRINI != null && (
              <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', fontFamily: MONO }}>
                desde {hhmmToString(active.HRINI)}
              </Typography>
            )}
            {active?.NUOS && (
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#3B82F6', fontFamily: MONO }}>
                OS {active.NUOS}
              </Typography>
            )}
            {rdo.totalItens > 0 && (
              <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
                {rdo.totalItens} atividades · {formatMinutos(rdo.totalMinutos ?? 0)}
              </Typography>
            )}
          </Box>
          {rdo.departamento && (
            <Typography sx={{ fontSize: '0.62rem', color: 'text.disabled', mt: 0.15 }}>
              {rdo.departamento}{rdo.cargo ? ` · ${rdo.cargo}` : ''}
            </Typography>
          )}
        </Box>
      </Box>
    </ButtonBase>
  );
}

export function AdminEquipePage() {
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLabel = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });

  // Fetch all RDOs for today (no codparc filter = all team)
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-equipe', today],
    queryFn: () => getMeusRdos({ dataInicio: today, dataFim: today, limit: 200 }),
    ...CACHE_TIMES.rdoList,
  });

  const rdos = data?.data ?? [];

  // Fetch detalhes for each RDO to detect active activity
  const detalhesQueries = useQuery({
    queryKey: ['admin-equipe-detalhes', today, rdos.map((r) => r.CODRDO).join(',')],
    queryFn: async () => {
      const results = await Promise.all(
        rdos.map(async (rdo) => {
          try {
            const detalhes = await getRdoDetalhes(rdo.CODRDO);
            return { codrdo: rdo.CODRDO, active: detectActiveFromDetalhes(detalhes) };
          } catch {
            return { codrdo: rdo.CODRDO, active: null };
          }
        }),
      );
      return Object.fromEntries(results.map((r) => [r.codrdo, r.active]));
    },
    enabled: rdos.length > 0,
    refetchInterval: 15_000, // refresh every 15s for real-time feel
    staleTime: 10_000,
  });

  const activeMap = (detalhesQueries.data ?? {}) as Record<number, RdoDetalheItem | null>;

  // Sort: active first, then by productivity desc
  const sorted = useMemo(() => {
    return [...rdos].sort((a, b) => {
      const aActive = activeMap[a.CODRDO] ? 1 : 0;
      const bActive = activeMap[b.CODRDO] ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      return (b.produtividadePercent ?? 0) - (a.produtividadePercent ?? 0);
    });
  }, [rdos, activeMap]);

  const activeCount = sorted.filter((r) => activeMap[r.CODRDO]).length;

  const handleClick = (rdo: RdoCabecalho) => {
    if (!rdo.CODPARC) return;
    navigate(`/?viewAsCodParc=${rdo.CODPARC}&viewAsNome=${encodeURIComponent(rdo.nomeparc ?? '')}`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Groups sx={{ fontSize: 28, color: 'primary.main' }} />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.3 }}>
            Equipe Hoje
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', textTransform: 'capitalize', fontWeight: 500 }}>
            {todayLabel}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: MONO, color: 'primary.main' }}>
            {rdos.length}
          </Typography>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 1 }}>
            RDOs
          </Typography>
        </Box>
      </Box>

      <ApiErrorBanner error={error} onRetry={refetch} context="AdminEquipe" />

      {/* Stats bar */}
      {rdos.length > 0 && (
        <Box sx={{
          display: 'flex', gap: 1.5, px: 1,
        }}>
          <Paper elevation={0} sx={{
            flex: 1, py: 1, px: 1.5, borderRadius: 2, textAlign: 'center',
            bgcolor: alpha('#16A34A', 0.08), border: '1px solid', borderColor: alpha('#16A34A', 0.15),
          }}>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: MONO, color: '#16A34A' }}>
              {activeCount}
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', letterSpacing: 1 }}>
              Ativos
            </Typography>
          </Paper>
          <Paper elevation={0} sx={{
            flex: 1, py: 1, px: 1.5, borderRadius: 2, textAlign: 'center',
            bgcolor: alpha('#EF4444', 0.08), border: '1px solid', borderColor: alpha('#EF4444', 0.15),
          }}>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: MONO, color: '#EF4444' }}>
              {rdos.length - activeCount}
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: 1 }}>
              Parados
            </Typography>
          </Paper>
          <Paper elevation={0} sx={{
            flex: 1, py: 1, px: 1.5, borderRadius: 2, textAlign: 'center',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
            border: '1px solid', borderColor: (t) => alpha(t.palette.primary.main, 0.15),
          }}>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: MONO, color: 'primary.main' }}>
              {rdos.length > 0
                ? Math.round(rdos.reduce((s, r) => s + (r.produtividadePercent ?? 0), 0) / rdos.length)
                : 0}%
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 1 }}>
              Media
            </Typography>
          </Paper>
        </Box>
      )}

      {/* List */}
      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      ) : rdos.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Groups sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Nenhum RDO iniciado hoje
          </Typography>
        </Box>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          {sorted.map((rdo) => (
            <ColaboradorRow
              key={rdo.CODRDO}
              rdo={rdo}
              active={activeMap[rdo.CODRDO] ?? null}
              onClick={() => handleClick(rdo)}
            />
          ))}
        </Paper>
      )}
    </Box>
  );
}

export default AdminEquipePage;
