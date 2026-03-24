import { Box, Typography, Stack, Chip, alpha, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchHistorico } from '@/api/hstvei';
import { getDepartamentoInfo } from '@/utils/departamento-constants';
import { getPrioridadeInfo } from '@/utils/prioridade-constants';
import type { HistoricoItem } from '@/types/hstvei-types';

function fmtDt(val: string | null): string {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function fmtDuracao(min: number | null): string {
  if (min == null) return '';
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const r = min % 60;
  if (h < 24) return r > 0 ? `${h}h${r}min` : `${h}h`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d}d ${rh}h` : `${d}d`;
}

function TimelineItem({ item, isFirst, isLast }: { item: HistoricoItem; isFirst: boolean; isLast: boolean }) {
  const dep = getDepartamentoInfo(item.departamento);
  const pri = getPrioridadeInfo(item.idpri);
  const ativo = !item.dtfim;
  const Icon = dep.Icon;

  return (
    <Box sx={{ display: 'flex', gap: 2, position: 'relative', minHeight: 72 }}>
      {/* Linha vertical + icone */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 }}>
        {!isFirst && <Box sx={{ width: 2, flex: 1, bgcolor: 'divider' }} />}
        <Box sx={{
          width: 32, height: 32, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: ativo ? dep.color : alpha(dep.color, 0.12),
          color: ativo ? '#fff' : dep.color,
          border: ativo ? '2px solid' : 'none',
          borderColor: ativo ? dep.color : undefined,
          boxShadow: ativo ? `0 0 0 4px ${alpha(dep.color, 0.2)}` : 'none',
          animation: ativo ? 'pulse 2s ease-in-out infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': { boxShadow: `0 0 0 4px ${alpha(dep.color, 0.2)}` },
            '50%': { boxShadow: `0 0 0 8px ${alpha(dep.color, 0.1)}` },
          },
          flexShrink: 0,
        }}>
          <Icon sx={{ fontSize: 16 }} />
        </Box>
        {!isLast && <Box sx={{ width: 2, flex: 1, bgcolor: 'divider' }} />}
      </Box>

      {/* Conteudo */}
      <Box sx={{
        flex: 1, pb: 2, pt: 0.5,
      }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: dep.color }}>
            {item.situacao}
          </Typography>
          {ativo && (
            <Chip label="ATIVO" size="small" sx={{
              height: 18, fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
              bgcolor: alpha(dep.color, 0.12), color: dep.color,
            }} />
          )}
          {pri && (
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: pri.color }} />
          )}
        </Stack>

        <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 0.25 }}>
          {dep.label}
        </Typography>

        {/* Datas */}
        <Stack direction="row" spacing={2} sx={{ mb: 0.5 }}>
          <Typography sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.secondary' }}>
            {fmtDt(item.dtinicio)}
          </Typography>
          {item.dtfim && (
            <Typography sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.disabled' }}>
              → {fmtDt(item.dtfim)}
            </Typography>
          )}
          {item.duracaoMinutos != null && (
            <Chip label={fmtDuracao(item.duracaoMinutos)} size="small" variant="outlined" sx={{
              height: 18, fontSize: 10, fontWeight: 600,
            }} />
          )}
        </Stack>

        {/* Descricao */}
        {item.descricao && (
          <Typography sx={{ fontSize: 12, color: 'text.primary', lineHeight: 1.4 }}>
            {item.descricao}
          </Typography>
        )}

        {/* Criado por */}
        {item.nomeUsuInc && (
          <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: 0.5 }}>
            por {item.nomeUsuInc}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

interface VeiculoTimelineProps {
  codveiculo: number;
  compact?: boolean;
  maxItems?: number;
}

export function VeiculoTimeline({ codveiculo, compact, maxItems }: VeiculoTimelineProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['hstvei', 'historico', codveiculo],
    queryFn: () => fetchHistorico(codveiculo, 1, maxItems ?? 100),
    enabled: codveiculo > 0,
    staleTime: 30_000,
  });

  if (isLoading) return <Box sx={{ py: 3, textAlign: 'center' }}><CircularProgress size={20} /></Box>;
  if (!data?.historico?.length) return <Typography sx={{ py: 2, fontSize: 12, color: 'text.disabled', textAlign: 'center' }}>Nenhum registro encontrado</Typography>;

  const items = data.historico;

  return (
    <Box sx={{ px: compact ? 0 : 1 }}>
      {!compact && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
            Historico de Movimentacoes
          </Typography>
          <Chip label={`${items.length} registros`} size="small" sx={{ height: 20, fontSize: 10 }} />
        </Stack>
      )}
      {items.map((item, i) => (
        <TimelineItem key={item.id} item={item} isFirst={i === 0} isLast={i === items.length - 1} />
      ))}
    </Box>
  );
}
