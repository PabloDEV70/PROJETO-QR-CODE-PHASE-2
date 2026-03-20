import { Box, Typography, Stack, Skeleton } from '@mui/material';
import {
  Timeline, TimelineItem, TimelineSeparator,
  TimelineConnector, TimelineContent, TimelineDot,
} from '@mui/lab';
import { SituacaoBadge } from '@/components/funcionarios/situacao-badge';
import type { FuncionarioPerfilSuper } from '@/types/funcionario-types';

interface FuncionarioDrawerHistoricoProps {
  perfil: FuncionarioPerfilSuper | null | undefined;
  isLoading: boolean;
}

function fmtDate(val: string | null | undefined): string {
  if (!val) return '-';
  return new Date(val).toLocaleDateString('pt-BR');
}

function dotColor(situacao: string): 'success' | 'error' | 'warning' | 'grey' {
  if (situacao === '1') return 'success';
  if (situacao === '0') return 'error';
  if (situacao === '2') return 'warning';
  return 'grey';
}

export function FuncionarioDrawerHistorico({
  perfil, isLoading,
}: FuncionarioDrawerHistoricoProps) {
  if (isLoading) {
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={60} />)}
      </Stack>
    );
  }

  const vinculos = perfil?.historico?.vinculos ?? [];

  if (vinculos.length === 0) {
    return (
      <Typography sx={{ p: 2, color: '#94a3b8', fontSize: 13 }}>
        Nenhum historico de vinculos encontrado.
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#475569', mb: 1 }}>
        {vinculos.length} vinculo(s)
      </Typography>
      <Timeline position="right" sx={{
        p: 0, m: 0,
        '& .MuiTimelineItem-root:before': { flex: 0, padding: 0 },
      }}>
        {vinculos.map((v, idx) => (
          <TimelineItem key={`${v.codemp}-${v.codfunc}`}>
            <TimelineSeparator>
              <TimelineDot color={dotColor(v.situacao)} sx={{ my: 0.5 }} />
              {idx < vinculos.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ py: 0.5 }}>
              <Stack spacing={0.25}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                    {v.empresa ?? `Emp. ${v.codemp}`}
                  </Typography>
                  <SituacaoBadge situacao={v.situacao} label={v.situacaoLabel} />
                </Stack>
                {v.cargo && (
                  <Typography sx={{ fontSize: 12, color: '#475569' }}>
                    {v.cargo}
                  </Typography>
                )}
                <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
                  {fmtDate(v.dtadm)} — {v.dtdem ? fmtDate(v.dtdem) : 'Atual'}
                </Typography>
              </Stack>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
}
