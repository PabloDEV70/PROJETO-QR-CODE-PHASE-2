import {
  Box, Chip, Paper, Skeleton, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';

import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { ColaboradorWrenchTime, WrenchTimeBreakdown } from '@/types/wrench-time-types';
import { getBenchmarkColor, fmtMin } from '@/utils/wrench-time-categories';

interface CategoryRef { key: string; label: string; color: string }

interface WtDiaColabTableProps {
  colabs: ColaboradorWrenchTime[];
  dayBreakdowns: WrenchTimeBreakdown[];
  dtref?: string;
  isLoading?: boolean;
  codrdoMap?: Map<number, number[]>;
}

/** Build ordered category list from the day-level breakdowns (same source as donut) */
function buildDayCats(dayBreakdowns: WrenchTimeBreakdown[]): CategoryRef[] {
  return dayBreakdowns
    .filter((b) => b.totalMin > 0)
    .map((b) => ({ key: b.category, label: b.label, color: b.color }));
}

function catMin(bk: WrenchTimeBreakdown[], cat: string): number {
  return bk.find((b) => b.category === cat)?.totalMin ?? 0;
}

function catPct(bk: WrenchTimeBreakdown[], cat: string): number {
  return bk.find((b) => b.category === cat)?.percentOfTotal ?? 0;
}

function DistBar({ colab, cats }: { colab: ColaboradorWrenchTime; cats: CategoryRef[] }) {
  return (
    <Stack direction="row" sx={{
      width: '100%', minWidth: 160, height: 16,
      borderRadius: 1, overflow: 'hidden', bgcolor: 'grey.100',
    }}>
      {cats.map((c) => {
        const pct = catPct(colab.categoryBreakdown, c.key);
        if (pct <= 0) return null;
        const min = catMin(colab.categoryBreakdown, c.key);
        return (
          <Tooltip key={c.key} title={`${c.label}: ${pct}% (${fmtMin(min)})`} arrow>
            <Box sx={{
              width: `${pct}%`, height: '100%', bgcolor: c.color,
              minWidth: pct > 0 ? 3 : 0, transition: 'width 0.3s',
            }} />
          </Tooltip>
        );
      })}
    </Stack>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton width={24} /></TableCell>
          <TableCell><Skeleton width={60} /></TableCell>
          <TableCell>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Skeleton variant="circular" width={40} height={40} />
              <Stack spacing={0.25}>
                <Skeleton width={120} />
                <Skeleton width={80} height={14} />
              </Stack>
            </Stack>
          </TableCell>
          <TableCell><Skeleton width={50} /></TableCell>
          <TableCell><Skeleton width={50} /></TableCell>
          <TableCell><Skeleton width={50} /></TableCell>
          <TableCell><Skeleton width={160} height={16} /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

function RdoLinks({ codparc, codrdoMap }: { codparc: number; codrdoMap?: Map<number, number[]> }) {
  const rdos = codrdoMap?.get(codparc) ?? [];

  if (rdos.length === 0) {
    return (
      <Typography variant="body2" color="text.disabled">
        —
      </Typography>
    );
  }

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
      {rdos.map((codrdo) => (
        <Link
          key={codrdo}
          to={`/manutencao/rdo/${codrdo}`}
          style={{ textDecoration: 'none' }}
        >
          <Typography
            variant="body2"
            color="primary"
            fontWeight={500}
            sx={{
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {codrdo}
          </Typography>
        </Link>
      ))}
    </Stack>
  );
}

export function WtDiaColabTable({ colabs, dayBreakdowns, dtref, isLoading, codrdoMap }: WtDiaColabTableProps) {
  const cats = buildDayCats(dayBreakdowns);
  const empty = !isLoading && colabs.length === 0;

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Colaboradores do Dia
        </Typography>
        {!isLoading && (
          <Chip label={`${colabs.length}`} size="small" variant="outlined" />
        )}
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {cats.map((c) => (
            <Chip key={c.key} size="small" label={c.label}
              sx={{ height: 20, fontSize: 10, bgcolor: `${c.color}22`, color: c.color, fontWeight: 600 }}
            />
          ))}
        </Stack>
      </Stack>

      {empty ? (
        <Stack alignItems="center" justifyContent="center" sx={{ height: 120 }}>
          <Typography variant="body2" color="text.secondary">
            Nenhum colaborador encontrado
          </Typography>
        </Stack>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={40}>#</TableCell>
                <TableCell>Cod. RDO</TableCell>
                <TableCell>Colaborador</TableCell>
                <TableCell align="right">Prod %</TableCell>
                <TableCell align="right">N-Prod %</TableCell>
                <TableCell align="right">Horas</TableCell>
                <TableCell>Distribuicao</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? <SkeletonRows /> : colabs.map((c, idx) => {
                const nonProdPct = 100 - c.produtividadePercent;
                return (
                  <TableRow key={c.codparc} hover>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{idx + 1}</Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <RdoLinks codparc={c.codparc} codrdoMap={codrdoMap} />
                    </TableCell>
                    <TableCell sx={{ py: 1.25 }}>
                      <Link
                        to={dtref
                          ? `/rdo/wrench-time/dia/${dtref}/colab/${c.codparc}`
                          : `/rdo/colaborador/${c.codparc}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <FuncionarioAvatar codparc={c.codparc} nome={c.nomeparc} size="medium" />
                          <Stack spacing={0}>
                            <Typography variant="body2" color="primary" fontWeight={500} noWrap>
                              {c.nomeparc}
                            </Typography>
                            {(c.departamento || c.cargo) && (
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {[c.departamento, c.cargo].filter(Boolean).join(' · ')}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                      </Link>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={c.diagnostico || undefined} arrow>
                        <Chip
                          label={`${c.produtividadePercent}%`} size="small"
                          sx={{
                            bgcolor: getBenchmarkColor(c.benchmarkStatus),
                            color: '#fff', fontWeight: 700, minWidth: 52, fontSize: 12,
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {nonProdPct > 0 ? `${nonProdPct}%` : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{fmtMin(c.totalMin)}</Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 180 }}>
                      <DistBar colab={c} cats={cats} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
