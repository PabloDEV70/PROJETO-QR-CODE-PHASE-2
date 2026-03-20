import { useState, useCallback } from 'react';
import { Box, Typography, Skeleton, Chip } from '@mui/material';
import { InboxRounded } from '@mui/icons-material';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { STATUS_MAP } from '@/utils/chamados-constants';
import type { KanbanColumn, Chamado, ChamadoStatusCode } from '@/types/chamados-types';
import { DraggableKanbanCard } from '@/components/chamados/kanban-card';
import { useUpdateChamadoStatus } from '@/hooks/use-chamado-mutations';

interface KanbanBoardProps {
  columns: KanbanColumn[];
  isLoading: boolean;
  onCardClick: (nuchamado: number) => void;
}

function CardSkeleton() {
  return (
    <Box sx={{
      p: 1.5, mb: 1, borderRadius: '10px',
      bgcolor: 'background.paper',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Skeleton variant="rounded" width={50} height={16} />
        <Skeleton variant="rounded" width={36} height={16} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="rounded" width={60} height={16} />
      </Box>
      <Skeleton variant="text" width="90%" height={18} />
      <Skeleton variant="text" width="70%" height={18} sx={{ mb: 1 }} />
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="circular" width={24} height={24} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="text" width={40} height={16} />
      </Box>
    </Box>
  );
}

function LoadingSkeleton() {
  return (
    <Box sx={{
      minWidth: 280, flex: '0 0 280px',
      '@media (min-width: 600px)': { minWidth: 300, flex: '0 0 300px' },
    }}>
      <Skeleton variant="rounded" height={32} sx={{ mb: 1.5, borderRadius: '8px' }} />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </Box>
  );
}

function DroppableColumn({ col, children }: {
  col: KanbanColumn;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${col.status}` });
  const statusDef = STATUS_MAP[col.status as ChamadoStatusCode];
  const accent = statusDef?.color ?? '#94a3b8';

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minWidth: 280, flex: '0 0 280px',
        scrollSnapAlign: 'start',
        '@media (min-width: 600px)': { minWidth: 300, flex: '0 0 300px' },
      }}
    >
      {/* Column header - clean, no colored border */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 1, py: 0.75, mb: 1,
      }}>
        <Box sx={{
          width: 8, height: 8, borderRadius: '50%', bgcolor: accent,
          flexShrink: 0,
        }} />
        <Typography sx={{
          fontSize: 12, fontWeight: 700, color: 'text.primary',
          letterSpacing: '0.04em', flex: 1,
          textTransform: 'uppercase',
        }}>
          {col.label}
        </Typography>
        <Chip
          label={col.chamados.length}
          size="small"
          sx={{
            height: 20, minWidth: 26,
            fontWeight: 700, fontSize: 11,
            bgcolor: 'action.hover',
            color: 'text.secondary',
            borderRadius: '6px',
          }}
        />
      </Box>

      {/* Cards container */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        px: 0.25,
        borderRadius: '10px',
        transition: 'background-color 0.2s ease',
        bgcolor: isOver ? 'action.hover' : 'transparent',
        border: isOver ? '2px dashed' : '2px dashed transparent',
        borderColor: isOver ? 'primary.light' : 'transparent',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 2,
        },
      }}>
        {children}
        {col.chamados.length === 0 && (
          <Box sx={{
            py: 4, textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: '10px',
            bgcolor: 'action.hover',
          }}>
            <InboxRounded sx={{ fontSize: 24, color: 'text.disabled', mb: 0.5 }} />
            <Typography sx={{ fontSize: 12, color: 'text.disabled', fontWeight: 500 }}>
              Nenhum chamado
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export function KanbanBoard({ columns, isLoading, onCardClick }: KanbanBoardProps) {
  const [activeCard, setActiveCard] = useState<Chamado | null>(null);
  const statusMutation = useUpdateChamadoStatus();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const findCard = useCallback((id: string): Chamado | null => {
    const nuchamado = Number(id.replace('card-', ''));
    for (const col of columns) {
      const c = col.chamados.find((ch) => ch.NUCHAMADO === nuchamado);
      if (c) return c;
    }
    return null;
  }, [columns]);

  const handleDragStart = (event: DragStartEvent) => {
    const card = findCard(String(event.active.id));
    setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);

    const { active, over } = event;
    if (!over) return;

    const overId = String(over.id);
    if (!overId.startsWith('col-')) return;

    const newStatus = overId.replace('col-', '') as ChamadoStatusCode;
    const card = findCard(String(active.id));
    if (!card || card.STATUS === newStatus) return;

    statusMutation.mutate({ nuchamado: card.NUCHAMADO, status: newStatus });
  };

  if (isLoading) {
    return (
      <Box sx={{
        display: 'flex', gap: 1.5, overflowX: 'auto', pb: 2,
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
      }}>
        {[1, 2, 3, 4, 5].map((i) => <LoadingSkeleton key={i} />)}
      </Box>
    );
  }

  if (!columns.length) {
    return (
      <Box sx={{
        py: 8, textAlign: 'center',
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'action.hover',
      }}>
        <InboxRounded sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography sx={{ color: 'text.secondary', fontSize: 14, fontWeight: 600 }}>
          Nenhum chamado ativo encontrado
        </Typography>
        <Typography sx={{ color: 'text.disabled', fontSize: 12, mt: 0.5 }}>
          Crie um novo chamado para comecar
        </Typography>
      </Box>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{
        display: 'flex', gap: 1.5, overflowX: 'auto', pb: 2,
        alignItems: 'flex-start', minHeight: 420,
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        '&::-webkit-scrollbar': { height: 4 },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 3,
        },
      }}>
        {columns.map((col) => (
          <DroppableColumn key={col.status} col={col}>
            {col.chamados.map((c) => (
              <DraggableKanbanCard
                key={c.NUCHAMADO}
                chamado={c}
                onClick={() => onCardClick(c.NUCHAMADO)}
                isDragging={activeCard?.NUCHAMADO === c.NUCHAMADO}
              />
            ))}
          </DroppableColumn>
        ))}
      </Box>

      <DragOverlay dropAnimation={null}>
        {activeCard && (
          <Box sx={{
            width: 300, opacity: 0.92,
            transform: 'rotate(2deg)',
            pointerEvents: 'none',
          }}>
            <DraggableKanbanCard
              chamado={activeCard}
              onClick={() => {}}
              isOverlay
            />
          </Box>
        )}
      </DragOverlay>
    </DndContext>
  );
}
