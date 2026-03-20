import { Box, Typography, Tooltip, Stack, AvatarGroup, Chip, Card } from '@mui/material';
import {
  AccessTime, BusinessRounded, CalendarTodayRounded, AttachFileRounded,
} from '@mui/icons-material';
import { useDraggable } from '@dnd-kit/core';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { PrioBadge } from '@/components/chamados/chamado-badges';
import type { Chamado } from '@/types/chamados-types';

interface KanbanCardProps {
  chamado: Chamado;
  onClick: () => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}

const TIPO_MAP: Record<string, string> = {
  '01': 'Incidente', '02': 'Requisicao', '03': 'Melhoria',
  '04': 'Duvida', '05': 'Problema', '06': 'Tarefa',
  '07': 'Projeto', '08': 'Mudanca', '09': 'Liberacao', '99': 'Outros',
};

function elapsed(dateStr: string | null): string {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const h = Math.floor((Date.now() - new Date(dateStr).getTime()) / 3_600_000);
  if (isNaN(h) || h < 0) return '';
  if (h < 1) return 'agora';
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return d < 30 ? `${d}d` : `${Math.floor(d / 30)}m`;
}

function fmtDateShort(val: string | null): string {
  if (!val || typeof val !== 'string') return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

interface PersonInfo {
  nome: string | null;
  codparc: number | null;
  role: string;
}

function PeopleRow({ people }: { people: PersonInfo[] }) {
  const valid = people.filter((p) => p.nome);
  if (!valid.length) return null;
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <AvatarGroup max={4} sx={{
        '& .MuiAvatar-root': {
          width: 24, height: 24, fontSize: 10,
          border: '2px solid', borderColor: 'background.paper',
        },
      }}>
        {valid.map((p) => (
          <Tooltip key={p.role} title={`${p.role}: ${p.nome}`} placement="top" arrow>
            <Box component="span">
              <FuncionarioAvatar
                codparc={p.codparc}
                nome={p.nome ?? undefined}
                size="small"
                sx={{ width: 24, height: 24, fontSize: 10 }}
              />
            </Box>
          </Tooltip>
        ))}
      </AvatarGroup>
      <Typography variant="caption" sx={{
        color: 'text.secondary', ml: 0.5,
        overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap', flex: 1,
      }}>
        {valid.map((p) => p.nome?.split(' ')[0]).join(', ')}
      </Typography>
    </Stack>
  );
}

function CardContent({ chamado }: { chamado: Chamado }) {
  const tipo = chamado.TIPOCHAMADO ? TIPO_MAP[chamado.TIPOCHAMADO] : null;

  const people: PersonInfo[] = [
    { nome: chamado.NOMESOLICITANTE, codparc: chamado.CODPARCSOLICITANTE, role: 'Solicitante' },
    { nome: chamado.NOMEATRIBUIDO, codparc: chamado.CODPARCATRIBUIDO, role: 'Atribuido' },
    { nome: chamado.NOMEFINALIZADOR, codparc: chamado.CODPARCFINALIZADOR, role: 'Finalizador' },
  ];

  return (
    <>
      {/* Header: ID + priority + tipo */}
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
        <Typography variant="caption" fontWeight={800} color="text.primary">
          #{chamado.NUCHAMADO}
        </Typography>
        <PrioBadge prioridade={chamado.PRIORIDADE} size="sm" />
        {chamado.TEM_ANEXO > 0 && (
          <Tooltip title={`${chamado.TEM_ANEXO} anexo(s)`} placement="top" arrow>
            <AttachFileRounded sx={{ fontSize: 14, color: 'text.disabled' }} />
          </Tooltip>
        )}
        <Box sx={{ flex: 1 }} />
        {tipo && (
          <Chip label={tipo} size="small" sx={{
            height: 18, fontSize: 10, fontWeight: 600,
            bgcolor: 'action.hover', color: 'text.secondary',
          }} />
        )}
      </Stack>

      {/* Description */}
      <Typography variant="body2" sx={{
        lineHeight: 1.5, color: 'text.secondary',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden', mb: 1,
      }}>
        {chamado.DESCRCHAMADO ?? 'Sem descricao'}
      </Typography>

      {/* Setor chip */}
      {chamado.SETOR && (
        <Chip
          icon={<BusinessRounded sx={{ fontSize: '13px !important' }} />}
          label={chamado.SETOR}
          size="small"
          sx={{
            mb: 0.75, height: 20, fontSize: 10.5, fontWeight: 600,
            bgcolor: 'rgba(139,92,246,0.08)', color: 'rgb(109,40,217)',
            '& .MuiChip-icon': { color: 'rgb(139,92,246)' },
          }}
        />
      )}

      {/* People avatars row */}
      <Box sx={{ mb: 0.75 }}>
        <PeopleRow people={people} />
      </Box>

      {/* Footer: dates + meta */}
      <Stack direction="row" alignItems="center" spacing={0.5}
        sx={{
          color: 'text.disabled', pt: 0.75,
          borderTop: 1, borderColor: 'divider',
        }}>
        <AccessTime sx={{ fontSize: 13 }} />
        <Typography variant="caption" sx={{ fontSize: 10.5 }}>
          {elapsed(chamado.DHCHAMADO)}
        </Typography>
        {chamado.DHPREVENTREGA && typeof chamado.DHPREVENTREGA === 'string' && (
          <>
            <Box sx={{
              width: 1, height: 10,
              bgcolor: 'divider', mx: 0.25,
            }} />
            <CalendarTodayRounded sx={{ fontSize: 12 }} />
            <Tooltip title="Previsao de entrega" placement="top" arrow>
              <Typography variant="caption" sx={{ fontSize: 10.5 }}>
                {fmtDateShort(chamado.DHPREVENTREGA)}
              </Typography>
            </Tooltip>
          </>
        )}
        <Box sx={{ flex: 1 }} />
        {chamado.NOMEPARC && (
          <Tooltip title={`Parceiro: ${chamado.NOMEPARC}`} placement="top" arrow>
            <Typography variant="caption" sx={{
              maxWidth: 80,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {chamado.NOMEPARC}
            </Typography>
          </Tooltip>
        )}
      </Stack>
    </>
  );
}

export function DraggableKanbanCard({
  chamado, onClick, isDragging, isOverlay,
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `card-${chamado.NUCHAMADO}`,
  });

  const style = transform && !isOverlay
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <Card
      ref={isOverlay ? undefined : setNodeRef}
      {...(isOverlay ? {} : listeners)}
      {...(isOverlay ? {} : attributes)}
      onClick={(e) => {
        if (isDragging) return;
        e.stopPropagation();
        onClick();
      }}
      style={style}
      variant="outlined"
      sx={{
        borderRadius: 3,
        p: 1.5,
        mb: 1.25,
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.3 : 1,
        boxShadow: isOverlay ? 8 : 1,
        transition: isDragging
          ? 'none'
          : 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': isDragging ? {} : {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
        '&:active': isDragging ? {} : { transform: 'scale(0.98)' },
        touchAction: 'none',
      }}
    >
      <CardContent chamado={chamado} />
    </Card>
  );
}

export { DraggableKanbanCard as KanbanCard };
