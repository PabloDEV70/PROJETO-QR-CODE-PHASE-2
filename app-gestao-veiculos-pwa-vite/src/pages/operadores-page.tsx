import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, TextField, InputAdornment, Chip, Paper,
  Collapse, IconButton, alpha, ToggleButtonGroup, ToggleButton,
  Divider, LinearProgress, Tooltip,
} from '@mui/material';
import {
  Search, People, ExpandMore, ExpandLess, Build, Engineering,
  DirectionsCar, AccessTime, Schedule, ChevronRight, LocalShipping,
  Handyman,
} from '@mui/icons-material';
import { useOperadores } from '@/hooks/use-hstvei-list';
import { PessoaAvatar } from '@/components/shared/pessoa-avatar';
import { DepartamentoChip } from '@/components/shared/departamento-chip';
import { PrioridadeBadge } from '@/components/shared/prioridade-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDateTime, formatElapsedTime } from '@/utils/date-utils';
import { calcPrevisaoCountdown } from '@/utils/previsao-utils';
import { getDepartamentoInfo } from '@/utils/departamento-constants';
import type { OperadorResumo, OperadorAtribuicao } from '@/api/hstvei';

type TipoFilter = 'todos' | 'operador' | 'mecanico';

/* ---- URL state ---- */
function readUrl(p: URLSearchParams) {
  return {
    busca: p.get('q') ?? '',
    tipo: (p.get('tipo') ?? 'todos') as TipoFilter,
  };
}
function writeUrl(s: ReturnType<typeof readUrl>): Record<string, string> {
  const out: Record<string, string> = {};
  if (s.busca) out.q = s.busca;
  if (s.tipo !== 'todos') out.tipo = s.tipo;
  return out;
}

/* ---- Atribuicao card ---- */
function AtribuicaoCard({ item, onClick }: { item: OperadorAtribuicao; onClick: () => void }) {
  const previsao = calcPrevisaoCountdown(item.dtprevisao);
  const depInfo = getDepartamentoInfo(item.departamento);

  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        cursor: 'pointer', overflow: 'hidden',
        borderLeft: `3px solid ${depInfo.color}`,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box sx={{ p: 1.25 }}>
        {/* Vehicle info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
          <DirectionsCar sx={{ fontSize: 16, color: depInfo.color }} />
          <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: '0.85rem' }}>
            {item.placa}
          </Typography>
          {item.veiculoTag && (
            <Chip label={item.veiculoTag} size="small" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 600 }} />
          )}
          <Box sx={{ flex: 1 }} />
          <PrioridadeBadge idpri={item.idpri} />
          <ChevronRight sx={{ fontSize: 16, color: 'text.disabled' }} />
        </Box>

        {/* Vehicle details */}
        {(item.marcaModelo || item.veiculoTipo) && (
          <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, flexWrap: 'wrap', pl: 3 }}>
            {item.marcaModelo && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {item.marcaModelo}
              </Typography>
            )}
            {item.veiculoTipo && (
              <Chip label={item.veiculoTipo} size="small" sx={{ height: 16, fontSize: '0.55rem' }} />
            )}
            {item.veiculoCapacidade && (
              <Chip label={item.veiculoCapacidade} size="small" sx={{ height: 16, fontSize: '0.55rem' }} />
            )}
          </Box>
        )}

        {/* Situacao + Department */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, pl: 3, flexWrap: 'wrap' }}>
          <DepartamentoChip departamento={item.departamento} />
          <Chip
            label={item.situacao}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.63rem', fontWeight: 700 }}
          />
          {previsao && (
            <Chip
              icon={<Schedule sx={{ fontSize: 11 }} />}
              label={previsao.text}
              size="small"
              sx={{
                height: 20, fontSize: '0.6rem', fontWeight: 700,
                bgcolor: (t) => alpha(previsao.isOverdue ? t.palette.error.main : t.palette.success.main, 0.12),
                color: previsao.isOverdue ? 'error.main' : 'success.main',
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />
          )}
        </Box>

        {/* Description */}
        {item.descricao && (
          <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ pl: 3, fontSize: '0.68rem' }}>
            {item.descricao}
          </Typography>
        )}

        {/* OS + Parceiro + Date */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, pl: 3, flexWrap: 'wrap' }}>
          {item.nuos && (
            <Chip label={`OS ${item.nuos}`} size="small" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 600 }} />
          )}
          {item.numos && (
            <Chip label={`MOS ${item.numos}`} size="small" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 600 }} />
          )}
          {item.nomeParc && (
            <Chip label={item.nomeParc} size="small" sx={{ height: 16, fontSize: '0.55rem', maxWidth: 120 }} />
          )}
          <Box sx={{ flex: 1 }} />
          <AccessTime sx={{ fontSize: 11, color: 'text.disabled' }} />
          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.disabled' }}>
            {formatDateTime(item.dtinicio, 'dd/MM/yy HH:mm')}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

/* ---- Operator card ---- */
function OperadorCard({ operador }: { operador: OperadorResumo }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const isMec = operador.tipo === 'mecanico';

  const veiculos = useMemo(() => {
    const seen = new Set<number>();
    return operador.atribuicoes.filter((a) => {
      if (seen.has(a.codveiculo)) return false;
      seen.add(a.codveiculo);
      return true;
    });
  }, [operador.atribuicoes]);

  // Most recent activity
  const maisRecente = operador.atribuicoes.reduce((a, b) =>
    a.dtinicio > b.dtinicio ? a : b
  );
  const previsaoProxima = operador.atribuicoes
    .filter((a) => a.dtprevisao)
    .sort((a, b) => String(a.dtprevisao ?? '').localeCompare(String(b.dtprevisao ?? '')))[0];
  const previsao = previsaoProxima ? calcPrevisaoCountdown(previsaoProxima.dtprevisao) : null;

  // Unique departments
  const deps = useMemo(() => {
    const set = new Set<string>();
    operador.atribuicoes.forEach((a) => { if (a.departamento) set.add(a.departamento); });
    return [...set];
  }, [operador.atribuicoes]);

  return (
    <Paper
      sx={{
        overflow: 'hidden',
        borderLeft: `4px solid ${isMec ? '#ff9800' : '#1976d2'}`,
      }}
    >
      <Box sx={{ p: 1.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PessoaAvatar
            codparc={operador.codparc}
            nome={operador.nome}
            size={48}
            sx={{
              border: '3px solid',
              borderColor: isMec ? 'warning.main' : 'info.main',
              boxShadow: `0 2px 8px ${alpha(isMec ? '#ff9800' : '#1976d2', 0.3)}`,
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ fontSize: '0.95rem' }}>
                {operador.nome}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, flexWrap: 'wrap' }}>
              <Chip
                icon={isMec ? <Handyman sx={{ fontSize: 13 }} /> : <Engineering sx={{ fontSize: 13 }} />}
                label={isMec ? 'Mecanico' : 'Operador'}
                size="small"
                sx={{
                  height: 22, fontSize: '0.65rem', fontWeight: 800,
                  bgcolor: (t) => alpha(isMec ? t.palette.warning.main : t.palette.info.main, 0.15),
                  color: isMec ? 'warning.dark' : 'info.dark',
                  '& .MuiChip-icon': { color: 'inherit' },
                }}
              />
              {deps.map((d) => (
                <DepartamentoChip key={d} departamento={d} />
              ))}
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        {/* Stats row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.25, flexWrap: 'wrap' }}>
          <Tooltip title="Veiculos atribuidos">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DirectionsCar sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
                {veiculos.length}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
                veiculo{veiculos.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Tooltip>

          <Tooltip title="Situacoes ativas">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocalShipping sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
                {operador.atribuicoes.length}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
                situacao{operador.atribuicoes.length !== 1 ? 'es' : ''}
              </Typography>
            </Box>
          </Tooltip>

          <Box sx={{ flex: 1 }} />

          {previsao && (
            <Chip
              icon={<Schedule sx={{ fontSize: 12 }} />}
              label={previsao.isOverdue ? `ATRASADO ${previsao.text}` : previsao.text}
              size="small"
              sx={{
                height: 22, fontSize: '0.63rem', fontWeight: 700,
                bgcolor: (t) => alpha(previsao.isOverdue ? t.palette.error.main : t.palette.success.main, 0.12),
                color: previsao.isOverdue ? 'error.main' : 'success.main',
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime sx={{ fontSize: 12, color: 'text.disabled' }} />
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.disabled' }}>
              {formatElapsedTime(maisRecente.dtinicio)}
            </Typography>
          </Box>
        </Box>

        {/* Vehicle chips (collapsed view) */}
        {!expanded && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
            {veiculos.slice(0, 6).map((v) => {
              const vDepInfo = getDepartamentoInfo(v.departamento);
              return (
                <Chip
                  key={v.codveiculo}
                  icon={<DirectionsCar sx={{ fontSize: 12 }} />}
                  label={`${v.placa}${v.veiculoTag ? ` (${v.veiculoTag})` : ''}`}
                  size="small"
                  onClick={(e) => { e.stopPropagation(); navigate(`/veiculo/${v.codveiculo}`); }}
                  sx={{
                    height: 24, fontSize: '0.68rem', fontWeight: 700,
                    cursor: 'pointer',
                    bgcolor: alpha(vDepInfo.color, 0.08),
                    color: vDepInfo.color,
                    borderLeft: `3px solid ${vDepInfo.color}`,
                    '& .MuiChip-icon': { color: vDepInfo.color },
                    '&:hover': { bgcolor: alpha(vDepInfo.color, 0.16) },
                  }}
                />
              );
            })}
            {veiculos.length > 6 && (
              <Chip
                label={`+${veiculos.length - 6} mais`}
                size="small"
                onClick={() => setExpanded(true)}
                sx={{ height: 24, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer' }}
              />
            )}
          </Box>
        )}

        {/* Expanded: full atribuicoes */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Atribuicoes ativas ({operador.atribuicoes.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {operador.atribuicoes.map((a) => (
              <AtribuicaoCard
                key={a.hstveiId}
                item={a}
                onClick={() => navigate(`/situacao/${a.hstveiId}`)}
              />
            ))}
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
}

/* ---- Page ---- */
export function OperadoresPage() {
  const [params, setParams] = useSearchParams();
  const state = readUrl(params);
  const [inputBusca, setInputBusca] = useState(state.busca);
  const { data: operadores, isLoading } = useOperadores();

  // Debounce handled in onChange directly

  const setField = useCallback(<K extends keyof ReturnType<typeof readUrl>>(
    key: K,
    value: ReturnType<typeof readUrl>[K],
  ) => {
    setParams(writeUrl({ ...readUrl(params), [key]: value }), { replace: true });
  }, [params, setParams]);

  const filtered = useMemo(() => {
    if (!operadores) return [];
    let result = operadores;
    if (state.tipo !== 'todos') {
      result = result.filter((o) => o.tipo === state.tipo);
    }
    if (state.busca) {
      const lower = state.busca.toLowerCase();
      result = result.filter((o) =>
        o.nome.toLowerCase().includes(lower) ||
        o.atribuicoes.some((a) =>
          a.placa.toLowerCase().includes(lower) ||
          a.veiculoTag?.toLowerCase().includes(lower) ||
          a.marcaModelo?.toLowerCase().includes(lower)
        )
      );
    }
    return result;
  }, [operadores, state]);

  // Summary stats
  const totalVeiculos = useMemo(() => {
    const set = new Set<number>();
    filtered.forEach((o) => o.atribuicoes.forEach((a) => set.add(a.codveiculo)));
    return set.size;
  }, [filtered]);
  const totalSituacoes = filtered.reduce((s, o) => s + o.atribuicoes.length, 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <People sx={{ color: 'primary.main', fontSize: 28 }} />
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1.1}>Equipe</Typography>
          <Typography variant="caption" color="text.disabled">
            Operadores e mecanicos ativos
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight={800} color="primary.main">
            {filtered.length} pessoa{filtered.length !== 1 ? 's' : ''}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
            {totalVeiculos} veiculos · {totalSituacoes} situacoes
          </Typography>
        </Box>
      </Box>

      {isLoading && <LinearProgress />}

      {/* Search */}
      <TextField
        placeholder="Buscar nome, placa, TAG, modelo..."
        value={inputBusca}
        onChange={(e) => {
          setInputBusca(e.target.value);
          // Direct update since debounce via useState is minimal
          const t = setTimeout(() => setField('busca', e.target.value), 300);
          return () => clearTimeout(t);
        }}
        size="small"
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 20, color: 'primary.main' }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }}
      />

      {/* Type filter */}
      <ToggleButtonGroup
        value={state.tipo}
        exclusive
        onChange={(_, v) => { if (v) setField('tipo', v); }}
        size="small"
        fullWidth
        sx={{
          '& .MuiToggleButton-root': {
            fontSize: '0.7rem', fontWeight: 700, py: 0.5, textTransform: 'none',
          },
        }}
      >
        <ToggleButton value="todos">Todos ({operadores?.length ?? 0})</ToggleButton>
        <ToggleButton value="operador">
          <Engineering sx={{ fontSize: 15, mr: 0.5 }} />
          Operadores ({operadores?.filter((o) => o.tipo === 'operador').length ?? 0})
        </ToggleButton>
        <ToggleButton value="mecanico">
          <Build sx={{ fontSize: 15, mr: 0.5 }} />
          Mecanicos ({operadores?.filter((o) => o.tipo === 'mecanico').length ?? 0})
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Results */}
      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          message={state.busca ? `Nenhum resultado para "${state.busca}"` : 'Nenhum operador com atribuicao ativa'}
          icon={<People sx={{ fontSize: 48 }} />}
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {filtered.map((op) => (
            <OperadorCard key={op.codusu} operador={op} />
          ))}
        </Box>
      )}
    </Box>
  );
}
