import { Box, Typography, Skeleton, Divider } from '@mui/material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { ChamadoOcorrencia } from '@/types/chamados-types';

interface ChamadoTimelineProps {
  ocorrencias: ChamadoOcorrencia[];
  isLoading: boolean;
}

function formatDate(value: string | null | object): string {
  if (!value || typeof value !== 'string') return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('pt-BR');
}

function TimelineItem({
  ocorrencia,
  isLast,
}: {
  ocorrencia: ChamadoOcorrencia;
  isLast: boolean;
}) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <FuncionarioAvatar
          codparc={ocorrencia.CODPARCATENDENTE}
          nome={ocorrencia.NOMEATENDENTE ?? undefined}
          size="small"
        />
        {!isLast && (
          <Box sx={{ width: 2, flex: 1, minHeight: 24, bgcolor: 'divider', mt: 0.5 }} />
        )}
      </Box>

      <Box sx={{ pb: isLast ? 0 : 2, flex: 1 }}>
        <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
          {(() => {
            const dt = formatDate(ocorrencia.DHOCORRENCIA);
            const nome = ocorrencia.NOMEATENDENTE;
            if (dt !== '-' && nome) return `${dt} — ${nome}`;
            if (dt !== '-') return dt;
            if (nome) return nome;
            return '-';
          })()}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: '#475569', mt: 0.25, lineHeight: 1.5 }}>
          {ocorrencia.DESCROCORRENCIA ?? 'Sem descricao'}
        </Typography>
      </Box>
    </Box>
  );
}

export function ChamadoTimeline({ ocorrencias, isLoading }: ChamadoTimelineProps) {
  if (isLoading) {
    return (
      <Box>
        {Array.from({ length: 3 }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="40%" height={16} />
              <Skeleton width="80%" height={16} sx={{ mt: 0.5 }} />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (!ocorrencias.length) {
    return (
      <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
        Nenhuma ocorrencia registrada.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography sx={{
        fontSize: 12, fontWeight: 700, color: '#475569',
        mb: 1.5, letterSpacing: '-0.01em',
      }}>
        Ocorrencias ({ocorrencias.length})
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {ocorrencias.map((oc, idx) => (
        <TimelineItem
          key={`${oc.NUCHAMADO}-${oc.SEQUENCIA}`}
          ocorrencia={oc}
          isLast={idx === ocorrencias.length - 1}
        />
      ))}
    </Box>
  );
}
