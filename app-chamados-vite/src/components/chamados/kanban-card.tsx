import { Box, Typography, Tooltip, Stack, AvatarGroup, Card } from '@mui/material';
import {
  AccessTime, BusinessRounded, CalendarTodayRounded, AttachFileRounded,
  WarningAmberRounded,
} from '@mui/icons-material';
import { useDraggable } from '@dnd-kit/core';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { PrioBadge } from '@/components/chamados/chamado-badges';
import { TIPO_MAP } from '@/utils/chamados-constants';
import { elapsedShort, fmtDateShort } from '@/utils/date-helpers';
import type { Chamado } from '@/types/chamados-types';

interface KanbanCardProps {
  chamado: Chamado;
  onClick: () => void;
  isDragging?: boolean;
  isOverlay?: boolean;
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
      <AvatarGroup max={3} sx={{
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
        color: 'text.disabled', ml: 0.5, fontSize: 11,
        overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap', flex: 1,
      }}>
        {valid.map((p) => p.nome?.split(' ')[0]).join(', ')}
      </Typography>
    </Stack>
  );
}

function KanbanCardContent({ chamado }: { chamado: Chamado }) {
  const tipo = chamado.TIPOCHAMADO ? TIPO_MAP[chamado.TIPOCHAMADO] : null;
  const isOverdue = chamado.DHPREVENTREGA
    && typeof chamado.DHPREVENTREGA === 'string'
    && new Date(chamado.DHPREVENTREGA) < new Date()
    && chamado.STATUS !== 'F' && chamado.STATUS !== 'C';

  const people: PersonInfo[] = [
    { nome: chamado.NOMESOLICITANTE, codparc: chamado.CODPARCSOLICITANTE, role: 'Solicitante' },
    { nome: chamado.NOMEATRIBUIDO, codparc: chamado.CODPARCATRIBUIDO, role: 'Atribuido' },
    { nome: chamado.NOMEFINALIZADOR, codparc: chamado.CODPARCFINALIZADOR, role: 'Finalizador' },
  ];

  return (
    <>
      {/* Overdue banner */}
      {isOverdue && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.5,
          px: 1, py: 0.3, mb: 1, mx: -0.5, mt: -0.5,
          bgcolor: 'error.light', borderRadius: '6px',
        }}>
          <WarningAmberRounded sx={{ fontSize: 13, color: 'error.main' }} />
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'error.main', letterSpacing: '0.04em' }}>
            ATRASADO
          </Typography>
        </Box>
      )}

      {/* Header row */}
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
        <Typography sx={{
          fontSize: 12, fontWeight: 700, color: 'text.primary',
          letterSpacing: '-0.01em',
        }}>
          #{chamado.NUCHAMADO}
        </Typography>
        <PrioBadge prioridade={chamado.PRIORIDADE} size="sm" />
        {chamado.TEM_ANEXO > 0 && (
          <Tooltip title={`${chamado.TEM_ANEXO} anexo(s)`} placement="top" arrow>
            <AttachFileRounded sx={{ fontSize: 13, color: 'text.disabled' }} />
          </Tooltip>
        )}
        <Box sx={{ flex: 1 }} />
        {tipo && (
          <Typography sx={{
            fontSize: 10, fontWeight: 500, color: 'text.disabled',
            bgcolor: 'action.hover', px: 0.75, py: 0.15,
            borderRadius: '4px',
          }}>
            {tipo}
          </Typography>
        )}
      </Stack>

      {/* Description */}
      <Typography sx={{
        fontSize: 12.5, lineHeight: 1.45, color: 'text.secondary',
        fontWeight: 400,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden', mb: 1,
      }}>
        {chamado.DESCRCHAMADO ?? 'Sem descricao'}
      </Typography>

      {/* Sector */}
      {chamado.SETOR && (
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.3,
          mb: 0.75, fontSize: 10.5, fontWeight: 500,
          color: 'text.disabled',
        }}>
          <BusinessRounded sx={{ fontSize: 12 }} />
          {chamado.SETOR}
        </Box>
      )}

      {/* People */}
      <Box sx={{ mb: 0.5 }}>
        <PeopleRow people={people} />
      </Box>

      {/* Footer */}
      <Stack direction="row" alignItems="center" spacing={0.5}
        sx={{
          color: 'text.disabled', pt: 0.5,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}>
        <AccessTime sx={{ fontSize: 12 }} />
        <Typography sx={{ fontSize: 10.5 }}>
          {elapsedShort(chamado.DHCHAMADO)}
        </Typography>
        {chamado.DHPREVENTREGA && typeof chamado.DHPREVENTREGA === 'string' && (
          <>
            <Box sx={{
              width: 1, height: 10,
              bgcolor: 'divider', mx: 0.25,
            }} />
            <CalendarTodayRounded sx={{
              fontSize: 11,
              color: isOverdue ? 'error.main' : 'inherit',
            }} />
            <Tooltip title={isOverdue ? 'Atrasado!' : 'Previsao de entrega'} placement="top" arrow>
              <Typography sx={{
                fontSize: 10.5,
                color: isOverdue ? 'error.main' : 'inherit',
                fontWeight: isOverdue ? 700 : 400,
              }}>
                {fmtDateShort(chamado.DHPREVENTREGA)}
              </Typography>
            </Tooltip>
          </>
        )}
        <Box sx={{ flex: 1 }} />
        {chamado.NOMEPARC && (
          <Tooltip title={`Parceiro: ${chamado.NOMEPARC}`} placement="top" arrow>
            <Typography sx={{
              maxWidth: 80, fontSize: 10.5,
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
      elevation={isOverlay ? 8 : 0}
      sx={{
        borderRadius: '10px',
        p: 1.5,
        mb: 1,
        border: '1px solid',
        borderColor: 'divider',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.3 : 1,
        transition: isDragging
          ? 'none'
          : 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        minHeight: 44,
        '&:hover': isDragging ? {} : {
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderColor: 'primary.light',
        },
        '&:active': isDragging ? {} : { transform: 'scale(0.98)' },
        touchAction: 'none',
      }}
    >
      <KanbanCardContent chamado={chamado} />
    </Card>
  );
}

export { DraggableKanbanCard as KanbanCard };
