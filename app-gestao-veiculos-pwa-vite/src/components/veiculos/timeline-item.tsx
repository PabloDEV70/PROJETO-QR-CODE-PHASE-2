import { Box, Typography } from '@mui/material';
import { PrioridadeBadge } from '@/components/shared/prioridade-badge';
import { DepartamentoChip } from '@/components/shared/departamento-chip';
import { PessoaAvatarGroup } from '@/components/shared/pessoa-avatar-group';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { HistoricoItem } from '@/types/hstvei-types';

interface TimelineItemProps {
  item: HistoricoItem;
}

function fmtDate(val: unknown, fmt = 'dd/MM/yy HH:mm'): string {
  if (!val) return '-';
  try {
    const d = val instanceof Date ? val : new Date(typeof val === 'string' && !val.includes('T') ? val.replace(' ', 'T') : val as string);
    if (isNaN(d.getTime())) return '-';
    return format(d, fmt, { locale: ptBR });
  } catch { return '-'; }
}

export function TimelineItem({ item }: TimelineItemProps) {
  const duracao = item.duracaoMinutos
    ? item.duracaoMinutos < 60 ? `${item.duracaoMinutos}min` : `${Math.round(item.duracaoMinutos / 60)}h`
    : null;
  const allPessoas = [...(item.operadores ?? []), ...(item.mecanicos ?? [])];

  return (
    <Box sx={{ pl: 2, borderLeft: 2, borderColor: 'divider', pb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <PrioridadeBadge idpri={item.idpri} />
        <DepartamentoChip departamento={item.departamento} />
        {duracao && <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', ml: 'auto' }}>{duracao}</Typography>}
      </Box>
      <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.situacao}</Typography>
      {item.descricao && <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{item.descricao}</Typography>}

      {allPessoas.length > 0 && (
        <Box sx={{ mt: 0.5 }}>
          <PessoaAvatarGroup pessoas={allPessoas} max={4} size={22} />
        </Box>
      )}

      <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', mt: 0.5 }}>
        {fmtDate(item.dtinicio)}
        {item.dtfim ? ` — ${fmtDate(item.dtfim)}` : ''}
      </Typography>
    </Box>
  );
}
