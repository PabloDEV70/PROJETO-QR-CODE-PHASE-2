import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, TextField, InputAdornment, Chip, Pagination,
  Paper, alpha, ToggleButtonGroup, ToggleButton, Tooltip, Divider,
} from '@mui/material';
import {
  Search, History, CheckCircle, AllInclusive, ChevronRight,
  Schedule, AccessTime, Description, Person,
} from '@mui/icons-material';
import { useHstVeiList } from '@/hooks/use-hstvei-list';
import { PrioridadeBadge } from '@/components/shared/prioridade-badge';
import { DepartamentoChip } from '@/components/shared/departamento-chip';
import { PessoaAvatar } from '@/components/shared/pessoa-avatar';
import { PessoaAvatarGroup } from '@/components/shared/pessoa-avatar-group';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDateTime, formatElapsedTime } from '@/utils/date-utils';
import { calcPrevisaoCountdown } from '@/utils/previsao-utils';
import { getDepartamentoInfo } from '@/utils/departamento-constants';
import type { HstVeiEnriched } from '@/types/hstvei-types';

type StatusFilter = 'ativas' | 'encerradas' | 'todas';

const DEP_KEYS = [
  { coddep: 1050000, label: 'Manut', nome: 'MANUTENÇÃO' },
  { coddep: 1020000, label: 'Comerc', nome: 'COMERCIAL.' },
  { coddep: 1090000, label: 'Logist', nome: 'LOGISTICA / PATIO' },
  { coddep: 1140000, label: 'Oper', nome: 'OPERAÇÃO' },
  { coddep: 1070000, label: 'Compras', nome: 'COMPRAS' },
] as const;

const PER_PAGE = 20;

/* ---- URL state helpers ---- */
function readUrl(params: URLSearchParams) {
  return {
    busca: params.get('q') ?? '',
    status: (params.get('status') ?? 'ativas') as StatusFilter,
    coddep: params.get('dep') ? Number(params.get('dep')) : null,
    page: Math.max(1, Number(params.get('page') ?? 1)),
  };
}

function writeUrl(s: ReturnType<typeof readUrl>): Record<string, string> {
  const out: Record<string, string> = {};
  if (s.busca) out.q = s.busca;
  if (s.status !== 'ativas') out.status = s.status;
  if (s.coddep) out.dep = String(s.coddep);
  if (s.page > 1) out.page = String(s.page);
  return out;
}

/* ---- Card ---- */
function RegistroCard({ item, onClick }: { item: HstVeiEnriched; onClick: () => void }) {
  const isEncerrada = !!item.DTFIM;
  const previsao = calcPrevisaoCountdown(item.DTPREVISAO ?? null);
  const depInfo = getDepartamentoInfo(item.departamentoNome);
  const allPessoas = [...(item.operadores ?? []), ...(item.mecanicos ?? [])];

  return (
    <Paper
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        overflow: 'hidden',
        opacity: isEncerrada ? 0.75 : 1,
        borderLeft: `4px solid ${depInfo.color}`,
        '&:active': { transform: 'scale(0.99)' },
        transition: 'transform 100ms',
      }}
    >
      <Box sx={{ p: 1.5 }}>
        {/* Row 1: Placa + ID + Previsao + chevron */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: '0.95rem' }}>
            {item.placa ?? '—'}
          </Typography>
          {item.veiculoTag && (
            <Chip
              label={item.veiculoTag}
              size="small"
              sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: 'action.hover' }}
            />
          )}
          {item.marcaModelo && (
            <Typography variant="caption" color="text.disabled" noWrap sx={{ flex: 1 }}>
              {item.marcaModelo}
            </Typography>
          )}
          {!item.marcaModelo && <Box sx={{ flex: 1 }} />}
          <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
            #{item.ID}
          </Typography>
          <ChevronRight sx={{ fontSize: 18, color: 'text.disabled' }} />
        </Box>

        {/* Row 2: Chips */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75, flexWrap: 'wrap' }}>
          <PrioridadeBadge idpri={item.IDPRI ?? null} />
          <DepartamentoChip departamento={item.departamentoNome} />
          <Chip
            label={item.situacaoDescricao}
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700 }}
          />
          {isEncerrada && (
            <Chip
              icon={<CheckCircle sx={{ fontSize: 12 }} />}
              label="Encerrada"
              size="small"
              sx={{
                height: 22, fontSize: '0.65rem', fontWeight: 700,
                bgcolor: (t) => alpha(t.palette.success.main, 0.12),
                color: 'success.main',
                '& .MuiChip-icon': { color: 'success.main' },
              }}
            />
          )}
          {previsao && !isEncerrada && (
            <Chip
              icon={<Schedule sx={{ fontSize: 12 }} />}
              label={previsao.text}
              size="small"
              sx={{
                height: 22, fontSize: '0.65rem', fontWeight: 700,
                bgcolor: (t) => alpha(previsao.isOverdue ? t.palette.error.main : t.palette.success.main, 0.12),
                color: previsao.isOverdue ? 'error.main' : 'success.main',
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />
          )}
        </Box>

        {/* Row 3: Descricao */}
        {item.DESCRICAO && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.5 }}>
            <Description sx={{ fontSize: 14, color: 'text.disabled', mt: '2px', flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', lineHeight: 1.3 }}>
              {item.DESCRICAO.length > 120 ? `${item.DESCRICAO.slice(0, 120)}...` : item.DESCRICAO}
            </Typography>
          </Box>
        )}

        {/* Row 4: Vinculacoes inline */}
        {(item.NUOS || item.NUMOS || item.nomeParc) && (
          <Box sx={{ display: 'flex', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
            {item.NUOS && (
              <Chip label={`OS ${item.NUOS}`} size="small" sx={{ height: 18, fontSize: '0.58rem', fontWeight: 600 }} />
            )}
            {item.NUMOS && (
              <Chip label={`MOS ${item.NUMOS}`} size="small" sx={{ height: 18, fontSize: '0.58rem', fontWeight: 600 }} />
            )}
            {item.nomeParc && (
              <Chip label={item.nomeParc} size="small" sx={{ height: 18, fontSize: '0.58rem', fontWeight: 600, maxWidth: 160 }} />
            )}
          </Box>
        )}

        <Divider sx={{ my: 0.75 }} />

        {/* Row 5: Footer — Dates + People */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Creator */}
          {item.criadoPor && (
            <Tooltip title={`Criado por ${item.criadoPor.nome}`}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PessoaAvatar
                  codparc={item.criadoPor.codparc}
                  nome={item.criadoPor.nome}
                  size={22}
                  sx={{ border: '2px solid', borderColor: 'success.main' }}
                />
                <Typography variant="caption" sx={{ fontSize: '0.62rem', color: 'text.disabled', maxWidth: 60 }} noWrap>
                  {item.criadoPor.nome.split(' ')[0]}
                </Typography>
              </Box>
            </Tooltip>
          )}

          {/* Equipe */}
          {allPessoas.length > 0 && (
            <PessoaAvatarGroup pessoas={allPessoas} max={3} size={22} />
          )}

          <Box sx={{ flex: 1 }} />

          {/* Dates */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime sx={{ fontSize: 12, color: 'text.disabled' }} />
            <Typography variant="caption" sx={{ fontSize: '0.62rem', color: 'text.disabled' }}>
              {formatDateTime(item.DTINICIO, 'dd/MM/yy HH:mm')}
            </Typography>
          </Box>
          {item.DTFIM && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircle sx={{ fontSize: 11, color: 'success.main' }} />
              <Typography variant="caption" sx={{ fontSize: '0.62rem', color: 'success.main' }}>
                {formatDateTime(item.DTFIM, 'dd/MM/yy')}
              </Typography>
            </Box>
          )}
          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.disabled', fontStyle: 'italic' }}>
            {formatElapsedTime(item.DTCRIACAO)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

/* ---- Page ---- */
export function RegistrosPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const state = readUrl(params);

  // Local input for debounce
  const [inputBusca, setInputBusca] = useState(state.busca);

  // Debounce search → URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (inputBusca !== state.busca) {
        setParams(writeUrl({ ...state, busca: inputBusca, page: 1 }), { replace: true });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [inputBusca]);

  const setField = useCallback(<K extends keyof ReturnType<typeof readUrl>>(
    key: K,
    value: ReturnType<typeof readUrl>[K],
  ) => {
    const next = { ...readUrl(params), [key]: value, page: key === 'page' ? value : 1 };
    setParams(writeUrl(next as ReturnType<typeof readUrl>), { replace: true });
  }, [params, setParams]);

  const apiParams = useMemo(() => ({
    page: state.page,
    limit: PER_PAGE,
    orderBy: 'DTCRIACAO',
    orderDir: 'DESC' as const,
    ...(state.status === 'ativas' && { ativas: 'true' as const }),
    ...(state.status === 'encerradas' && { ativas: 'false' as const }),
    ...(state.coddep && { coddep: state.coddep }),
    ...(state.busca && { busca: state.busca }),
  }), [state]);

  const { data, isLoading } = useHstVeiList(apiParams);
  const items = data?.data ?? [];
  const total = data?.meta.totalRegistros ?? 0;
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <History sx={{ color: 'primary.main', fontSize: 28 }} />
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1.1}>Registros</Typography>
          <Typography variant="caption" color="text.disabled">
            Situacoes cadastradas
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Chip
          label={`${total} registro${total !== 1 ? 's' : ''}`}
          size="small"
          sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}
        />
      </Box>

      {/* Search */}
      <TextField
        placeholder="Buscar placa, TAG, situacao, descricao..."
        value={inputBusca}
        onChange={(e) => setInputBusca(e.target.value)}
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
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: 'background.paper',
          },
        }}
      />

      {/* Filters row */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Status toggle */}
        <ToggleButtonGroup
          value={state.status}
          exclusive
          onChange={(_, v) => { if (v) setField('status', v); }}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              fontSize: '0.68rem', fontWeight: 700, py: 0.4, px: 1.5,
              textTransform: 'none',
            },
          }}
        >
          <ToggleButton value="ativas">Ativas</ToggleButton>
          <ToggleButton value="encerradas">Encerradas</ToggleButton>
          <ToggleButton value="todas">
            <AllInclusive sx={{ fontSize: 13, mr: 0.5 }} /> Todas
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Department filters */}
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        <Chip
          label="Todos"
          size="small"
          onClick={() => setField('coddep', null)}
          variant={state.coddep === null ? 'filled' : 'outlined'}
          color={state.coddep === null ? 'primary' : 'default'}
          sx={{ fontWeight: 700, fontSize: '0.68rem' }}
        />
        {DEP_KEYS.map((d) => {
          const info = getDepartamentoInfo(d.nome);
          const selected = state.coddep === d.coddep;
          return (
            <Chip
              key={d.coddep}
              icon={<info.Icon sx={{ fontSize: 14 }} />}
              label={d.label}
              size="small"
              onClick={() => setField('coddep', selected ? null : d.coddep)}
              sx={{
                fontWeight: 700, fontSize: '0.68rem',
                bgcolor: selected ? info.bgLight : undefined,
                color: selected ? info.color : undefined,
                borderColor: selected ? info.color : undefined,
                '& .MuiChip-icon': { color: selected ? info.color : 'text.disabled' },
              }}
              variant={selected ? 'filled' : 'outlined'}
            />
          );
        })}
      </Box>

      {/* Results */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          message={state.busca ? `Nenhum resultado para "${state.busca}"` : 'Nenhum registro encontrado'}
          icon={<Person sx={{ fontSize: 48 }} />}
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {items.map((item) => (
            <RegistroCard
              key={item.ID}
              item={item}
              onClick={() => navigate(`/situacao/${item.ID}`)}
            />
          ))}
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          <Pagination
            count={totalPages}
            page={state.page}
            onChange={(_, p) => setField('page', p)}
            size="small"
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
