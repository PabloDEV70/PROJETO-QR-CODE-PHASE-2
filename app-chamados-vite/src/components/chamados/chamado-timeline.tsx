import { Box, Typography, Skeleton, Divider } from '@mui/material';
import { HistoryRounded } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { formatDate, elapsedText } from '@/utils/date-helpers';
import type { ChamadoOcorrencia } from '@/types/chamados-types';

interface ChamadoTimelineProps {
  ocorrencias: ChamadoOcorrencia[];
  isLoading: boolean;
}

const DOT_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#22c55e', '#ef4444', '#06b6d4'];

function TimelineItem({
  ocorrencia,
  isLast,
  index,
}: {
  ocorrencia: ChamadoOcorrencia;
  isLast: boolean;
  index: number;
}) {
  const dotColor = DOT_COLORS[index % DOT_COLORS.length];
  const elapsed = elapsedText(ocorrencia.DHOCORRENCIA);

  return (
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        flexShrink: 0,
      }}>
        <FuncionarioAvatar
          codparc={ocorrencia.CODPARCATENDENTE}
          nome={ocorrencia.NOMEATENDENTE ?? undefined}
          size="small"
        />
        {!isLast && (
          <Box sx={{
            width: 2, flex: 1, minHeight: 24, mt: 0.5,
            background: `linear-gradient(${dotColor}, ${dotColor}33)`,
            borderRadius: 1,
          }} />
        )}
      </Box>

      <Box sx={{
        pb: isLast ? 0 : 2.5, flex: 1,
        minWidth: 0,
      }}>
        <Box sx={{
          display: 'flex', alignItems: 'baseline',
          flexWrap: 'wrap', gap: 0.5,
        }}>
          {ocorrencia.NOMEATENDENTE && (
            <Typography sx={{
              fontSize: 12, fontWeight: 700, color: '#1e293b',
            }}>
              {ocorrencia.NOMEATENDENTE}
            </Typography>
          )}
          <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
            {formatDate(ocorrencia.DHOCORRENCIA)}
          </Typography>
          {elapsed && (
            <Typography sx={{
              fontSize: 10, color: '#cbd5e1', fontWeight: 500,
              bgcolor: '#f8fafc', px: 0.75, py: 0.1,
              borderRadius: 1, border: '1px solid #f1f5f9',
            }}>
              {elapsed}
            </Typography>
          )}
        </Box>

        <Typography sx={{
          fontSize: 12.5, color: '#475569',
          mt: 0.5, lineHeight: 1.6,
          p: 1.25, bgcolor: '#f8fafc',
          borderRadius: 2, border: '1px solid #f1f5f9',
          wordBreak: 'break-word',
        }}>
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
        <Skeleton width={140} height={20} sx={{ mb: 2 }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 2.5 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="50%" height={16} />
              <Skeleton variant="rounded" height={48} sx={{ mt: 0.75, borderRadius: 2 }} />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (!ocorrencias.length) {
    return (
      <Box sx={{
        py: 3, textAlign: 'center',
        border: '1px dashed #e2e8f0', borderRadius: 2.5,
        bgcolor: '#fafbfc',
      }}>
        <HistoryRounded sx={{ fontSize: 28, color: '#cbd5e1', mb: 0.5 }} />
        <Typography sx={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
          Nenhuma ocorrencia registrada
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        mb: 2,
      }}>
        <Typography sx={{
          fontSize: 10, fontWeight: 800, color: '#94a3b8',
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          Historico ({ocorrencias.length})
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {ocorrencias.map((oc, idx) => (
        <TimelineItem
          key={`${oc.NUCHAMADO}-${oc.SEQUENCIA}`}
          ocorrencia={oc}
          isLast={idx === ocorrencias.length - 1}
          index={idx}
        />
      ))}
    </Box>
  );
}
