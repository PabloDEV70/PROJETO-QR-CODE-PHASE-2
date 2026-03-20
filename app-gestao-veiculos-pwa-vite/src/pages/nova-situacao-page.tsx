import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import { ArrowBack, AddCircleOutline } from '@mui/icons-material';
import { SituacaoForm } from '@/components/situacoes/situacao-form';
import type { DepFilter } from '@/components/situacoes/situacao-form';
import { useCriarSituacao } from '@/hooks/use-hstvei-mutations';
import { getDepartamentoInfo } from '@/utils/departamento-constants';

const DEP_LABELS: Record<string, string> = {
  manutencao: 'MANUTENÇÃO',
  comercial: 'COMERCIAL.',
  logistica: 'LOGISTICA / PATIO',
  operacao: 'OPERAÇÃO',
  compras: 'COMPRAS',
};

const VALID_DEPS = new Set(['manutencao', 'comercial', 'logistica', 'operacao', 'compras']);

export function NovaSituacaoPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const criar = useCriarSituacao();

  const depParam = params.get('dep');
  const depFilter: DepFilter = depParam && VALID_DEPS.has(depParam) ? (depParam as DepFilter) : null;
  const depLabel = depFilter ? DEP_LABELS[depFilter] : null;
  const depInfo = depLabel ? getDepartamentoInfo(depLabel) : null;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} size="small">
          <ArrowBack />
        </IconButton>
        <AddCircleOutline sx={{ color: depInfo?.color ?? 'primary.main' }} />
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
            Nova Situacao
          </Typography>
          {depInfo && (
            <Chip
              icon={<depInfo.Icon sx={{ fontSize: 14 }} />}
              label={depInfo.label}
              size="small"
              sx={{
                mt: 0.5,
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 700,
                bgcolor: depInfo.bgLight,
                color: depInfo.color,
                '& .MuiChip-icon': { color: depInfo.color },
              }}
            />
          )}
        </Box>
      </Box>
      <SituacaoForm
        depFilter={depFilter}
        onSubmit={(values) => criar.mutate(values, { onSuccess: () => navigate(-1) })}
        loading={criar.isPending}
      />
    </>
  );
}
