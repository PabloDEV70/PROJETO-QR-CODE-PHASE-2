import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, IconButton, Chip, Paper, alpha } from '@mui/material';
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
  seguranca: 'SEGURANCA DO TRABALHO',
  programacao: 'PROGRAMAÇÃO',
};

const VALID_DEPS = new Set(['manutencao', 'comercial', 'logistica', 'operacao', 'compras', 'seguranca', 'programacao']);

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
      {/* Header com fundo sólido */}
      <Paper
        elevation={0}
        sx={(t) => ({
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 2,
          mx: -1,
          mt: -1,
          px: 2,
          py: 2,
          borderRadius: 0,
          borderBottom: `2px solid ${depInfo ? alpha(depInfo.color, 0.3) : t.palette.divider}`,
          bgcolor: depInfo ? alpha(depInfo.color, 0.04) : 'background.paper',
        })}
      >
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ mr: 0.5 }}>
          <ArrowBack />
        </IconButton>

        {depInfo ? (
          <Box sx={{
            width: 44, height: 44, borderRadius: 2,
            bgcolor: alpha(depInfo.color, 0.12),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: depInfo.color,
            flexShrink: 0,
          }}>
            <depInfo.Icon sx={{ fontSize: 24 }} />
          </Box>
        ) : (
          <AddCircleOutline sx={{ fontSize: 28, color: 'primary.main' }} />
        )}

        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2, color: 'text.primary' }}>
            Nova Situacao
          </Typography>
          {depInfo ? (
            <Chip
              label={depInfo.label}
              size="small"
              sx={{
                mt: 0.5,
                height: 24,
                fontSize: 12,
                fontWeight: 700,
                bgcolor: alpha(depInfo.color, 0.12),
                color: depInfo.color,
                border: `1px solid ${alpha(depInfo.color, 0.25)}`,
              }}
            />
          ) : (
            <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.25 }}>
              Preencha os campos abaixo
            </Typography>
          )}
        </Box>
      </Paper>

      <SituacaoForm
        depFilter={depFilter}
        onSubmit={(values) => criar.mutate(values, { onSuccess: () => navigate(-1) })}
        loading={criar.isPending}
      />
    </>
  );
}
