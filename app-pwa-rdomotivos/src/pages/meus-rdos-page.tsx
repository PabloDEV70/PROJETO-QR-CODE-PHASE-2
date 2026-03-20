import { useMemo, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import { alpha } from '@mui/material/styles';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HistoryIcon from '@mui/icons-material/History';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BuildIcon from '@mui/icons-material/Build';
import { useMeusRdosInfinite } from '@/hooks/use-meus-rdos';
import { formatMinutos } from '@/utils/hora-utils';
import { EmptyState } from '@/components/shared/empty-state';
import { ApiErrorBanner } from '@/components/shared/api-error-banner';
import type { RdoCabecalho } from '@/types/rdo-types';

/* -- Date helpers -- */

const DIAS = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'] as const;
const DIAS_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'] as const;
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const;

function parseLocalDate(dtref: string): Date {
  const [y, m, d] = dtref.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d);
}

function diaCurto(dtref: string): string {
  return DIAS_CURTOS[parseLocalDate(dtref).getDay()]!;
}

function diaLongo(dtref: string): string {
  return DIAS[parseLocalDate(dtref).getDay()]!;
}

function diaNum(dtref: string): string {
  const d = parseLocalDate(dtref);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function diaMesExtenso(dtref: string): string {
  const d = parseLocalDate(dtref);
  return `${d.getDate()} ${MESES[d.getMonth()]!}`;
}

function getWeekLabel(dtref: string): string {
  const d = parseLocalDate(dtref);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return 'Esta semana';
  if (diffDays < 14) return 'Semana passada';
  return `${MESES[d.getMonth()]!} ${d.getFullYear()}`;
}

/* -- Derived data -- */

interface RdoComputed {
  rdo: RdoCabecalho;
  dia: string;
  diaLongo: string;
  diaNum: string;
  diaMes: string;
  prodMin: number;
  nprodMin: number;
  totalMin: number;
  pct: number;
  prodRatio: number;
}

function computeRdos(rdos: RdoCabecalho[]): RdoComputed[] {
  return rdos.map((rdo) => {
    const prodMin = rdo.minutosProdu ?? 0;
    const nprodMin = rdo.minutosNaoProdu ?? 0;
    const totalMin = rdo.totalMinutos ?? (prodMin + nprodMin);
    const pct = rdo.produtividadePercent ?? 0;
    const prodRatio = totalMin > 0 ? (prodMin / totalMin) * 100 : 0;
    return {
      rdo,
      dia: rdo.DTREF ? diaCurto(rdo.DTREF) : '--',
      diaLongo: rdo.DTREF ? diaLongo(rdo.DTREF) : '--',
      diaNum: rdo.DTREF ? diaNum(rdo.DTREF) : '--',
      diaMes: rdo.DTREF ? diaMesExtenso(rdo.DTREF) : '--',
      prodMin,
      nprodMin,
      totalMin,
      pct,
      prodRatio,
    };
  });
}

interface Stats {
  count: number;
  totalProd: number;
  totalNProd: number;
  totalMin: number;
  avgProd: number;
}

function computeStats(items: RdoComputed[]): Stats {
  const totalProd = items.reduce((s, r) => s + r.prodMin, 0);
  const totalNProd = items.reduce((s, r) => s + r.nprodMin, 0);
  const totalMin = totalProd + totalNProd;
  const avgProd = items.length > 0
    ? Math.round(items.reduce((s, r) => s + r.pct, 0) / items.length)
    : 0;
  return { count: items.length, totalProd, totalNProd, totalMin, avgProd };
}

/* -- URL state -- */

function useHistoricoUrlState() {
  const [sp] = useSearchParams();
  return {
    dataInicio: sp.get('de') ?? undefined,
    dataFim: sp.get('ate') ?? undefined,
  };
}

/* -- Infinite scroll -- */

function useInfiniteScroll(
  fetchNext: () => void,
  hasNext: boolean,
  isFetching: boolean,
) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNext && !isFetching) fetchNext();
      },
      { rootMargin: '200px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchNext, hasNext, isFetching]);
  return sentinelRef;
}

/* -- Summary -- */

function SummaryRow({ stats }: { stats: Stats }) {
  const avgColor = stats.avgProd >= 85 ? '#16A34A' : stats.avgProd >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <Card sx={{ mb: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, p: 2 }}>
        {/* Total horas */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Box>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total
            </Typography>
            <Typography fontWeight={700} sx={{ fontSize: '1rem', lineHeight: 1.2 }}>
              {formatMinutos(stats.totalMin)}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
              em {stats.count} {stats.count === 1 ? 'dia' : 'dias'}
            </Typography>
          </Box>
        </Box>

        {/* Media produtividade */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon sx={{ fontSize: 18, color: avgColor }} />
          <Box>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Media
            </Typography>
            <Typography fontWeight={700} sx={{ fontSize: '1rem', lineHeight: 1.2, color: avgColor }}>
              {stats.avgProd}%
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
              produtividade
            </Typography>
          </Box>
        </Box>

        {/* Produtivo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BuildIcon sx={{ fontSize: 18, color: '#16A34A' }} />
          <Box>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Produtivo
            </Typography>
            <Typography fontWeight={700} sx={{ fontSize: '1rem', lineHeight: 1.2, color: '#16A34A' }}>
              {formatMinutos(stats.totalProd)}
            </Typography>
          </Box>
        </Box>

        {/* Improdutivo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: alpha('#EF4444', 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#EF4444' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Improdutivo
            </Typography>
            <Typography fontWeight={700} sx={{ fontSize: '1rem', lineHeight: 1.2, color: '#EF4444' }}>
              {formatMinutos(stats.totalNProd)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

/* -- RDO row -- */

function RdoRow({ item, onTap }: { item: RdoComputed; onTap: () => void }) {
  const { rdo, diaLongo: diaL, diaMes, pct, prodRatio, totalMin, prodMin } = item;
  const pctColor = pct >= 85 ? '#16A34A' : pct >= 60 ? '#F59E0B' : '#EF4444';
  const pctBg = pct >= 85 ? alpha('#16A34A', 0.08) : pct >= 60 ? alpha('#F59E0B', 0.08) : alpha('#EF4444', 0.08);

  return (
    <CardActionArea
      onClick={onTap}
      sx={{
        borderRadius: 1,
        '&:active': { transform: 'scale(0.985)' },
        transition: 'transform 100ms',
      }}
    >
      <Box sx={{ px: 1.5, py: 1.25 }}>
        {/* Row 1: Date + percentage */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
            <Typography fontWeight={700} sx={{ fontSize: '0.85rem' }}>
              {diaL}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {diaMes}
            </Typography>
          </Box>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.5,
            px: 1, py: 0.25, borderRadius: 2, bgcolor: pctBg,
          }}>
            <Typography fontWeight={700} sx={{ fontSize: '0.8rem', color: pctColor }}>
              {pct}%
            </Typography>
          </Box>
        </Box>

        {/* Row 2: Progress bar */}
        <LinearProgress
          variant="determinate"
          value={prodRatio}
          sx={{
            height: 5, borderRadius: 3, mb: 0.75,
            bgcolor: alpha(pctColor, 0.12),
            '& .MuiLinearProgress-bar': { bgcolor: pctColor, borderRadius: 3 },
          }}
        />

        {/* Row 3: Details */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            {rdo.primeiraHora ?? '--:--'} — {rdo.ultimaHora ?? '--:--'}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
            {formatMinutos(totalMin)}
          </Typography>
          <Typography sx={{ fontSize: '0.65rem', color: '#16A34A', fontWeight: 600 }}>
            {formatMinutos(prodMin)} prod
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
              {rdo.totalItens} ativ.
              {rdo.qtdOs ? ` · ${rdo.qtdOs} OS` : ''}
            </Typography>
            <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: 16 }} />
          </Box>
        </Box>
      </Box>
    </CardActionArea>
  );
}

/* -- Loading skeleton -- */

function ListSkeleton() {
  return (
    <Stack spacing={1}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.25 }}>
          <Skeleton variant="rounded" width={44} height={32} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" height={8} />
            <Skeleton variant="text" width="50%" height={14} sx={{ mt: 0.5 }} />
          </Box>
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      ))}
    </Stack>
  );
}

/* -- Page -- */

export function MeusRdosPage() {
  const navigate = useNavigate();
  const { dataInicio, dataFim } = useHistoricoUrlState();

  const {
    data, isLoading, error, refetch,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useMeusRdosInfinite({ dataInicio, dataFim });

  const rdos = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);
  const items = useMemo(() => computeRdos(rdos), [rdos]);
  const stats = useMemo(() => computeStats(items), [items]);

  const sentinelRef = useInfiniteScroll(fetchNextPage, !!hasNextPage, isFetchingNextPage);

  return (
    <Box>
      <ApiErrorBanner error={error} onRetry={refetch} context="MeusRdos" />

      {isLoading ? (
        <ListSkeleton />
      ) : rdos.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon fontSize="inherit" />}
          title="Nenhum apontamento"
          description="Seus registros aparecerao aqui conforme voce apontar atividades"
        />
      ) : (
        <>
          <SummaryRow stats={stats} />

          <Box>
            {items.map((item, i) => {
              const weekLabel = item.rdo.DTREF ? getWeekLabel(item.rdo.DTREF) : '';
              const prevWeekLabel = i > 0 && items[i - 1]?.rdo.DTREF ? getWeekLabel(items[i - 1]!.rdo.DTREF!) : '';
              const showHeader = weekLabel !== prevWeekLabel;
              return (
                <Box key={item.rdo.CODRDO}>
                  {showHeader && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: i === 0 ? 0 : 2, mb: 1 }}>
                      <Typography sx={{
                        fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                      }}>
                        {weekLabel}
                      </Typography>
                      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                    </Box>
                  )}
                  <Card sx={{ mb: 0.75 }}>
                    <RdoRow item={item} onTap={() => navigate(`/rdo/${item.rdo.CODRDO}`)} />
                  </Card>
                </Box>
              );
            })}
          </Box>

          <Box ref={sentinelRef} sx={{ py: 3, textAlign: 'center' }}>
            {isFetchingNextPage && <CircularProgress size={24} />}
            {!hasNextPage && rdos.length > 0 && (
              <Typography variant="caption" color="text.disabled">
                Todos os registros carregados
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}

export default MeusRdosPage;
