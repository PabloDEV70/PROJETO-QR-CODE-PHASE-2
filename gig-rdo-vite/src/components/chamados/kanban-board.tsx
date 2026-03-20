import { useState, useCallback } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
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
import type { KanbanColumn, Chamado, ChamadoStatusCode } from '@/types/chamados-types';
import { DraggableKanbanCard } from '@/components/chamados/kanban-card';
import { useUpdateChamadoStatus } from '@/hooks/use-chamado-mutations';

interface KanbanBoardProps {
  columns: KanbanColumn[];
  isLoading: boolean;
  onCardClick: (nuchamado: number) => void;
}

const ACCENT: Record<string, string> = {
  warning: '#f59e0b',
  info: '#0ea5e9',
  default: '#94a3b8',
  secondary: '#8b5cf6',
  success: '#22c55e',
  error: '#ef4444',
};

function LoadingSkeleton() {
  return (
    <Box sx={{ minWidth: 300, flex: '0 0 300px' }}>
      <Skeleton variant="rounded" height={20} width={120} sx={{ mb: 2, borderRadius: 2 }} />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} variant="rounded" height={160}
          sx={{ mb: 1.25, borderRadius: '14px' }} />
      ))}
    </Box>
  );
}

function DroppableColumn({ col, children }: {
  col: KanbanColumn;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${col.status}` });
  const accent = ACCENT[col.color] ?? '#94a3b8';

  return (
    <Box ref={setNodeRef} sx={{ minWidth: 300, flex: '0 0 300px' }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 0.5, mb: 1.5,
      }}>
        <Box sx={{
          width: 8, height: 8, borderRadius: '50%', bgcolor: accent,
          boxShadow: `0 0 0 3px ${accent}22`,
          flexShrink: 0,
        }} />
        <Typography sx={{
          fontSize: 13, fontWeight: 700, color: '#1e293b',
          letterSpacing: '-0.02em', flex: 1,
        }}>
          {col.label}
        </Typography>
        <Typography sx={{
          fontSize: 12, fontWeight: 600, color: '#94a3b8',
          letterSpacing: '-0.02em',
        }}>
          {col.chamados.length}
        </Typography>
      </Box>

      <Box sx={{
        maxHeight: 'calc(100vh - 220px)',
        overflowY: 'auto',
        px: 0.25,
        borderRadius: '16px',
        transition: 'background-color 0.2s',
        bgcolor: isOver ? 'rgba(99,102,241,0.06)' : 'transparent',
        border: isOver ? '2px dashed rgba(99,102,241,0.3)' : '2px dashed transparent',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: 'rgba(148,163,184,0.25)', borderRadius: 2,
        },
      }}>
        {children}
        {col.chamados.length === 0 && (
          <Box sx={{
            py: 4, textAlign: 'center',
            border: '1px dashed rgba(148,163,184,0.25)',
            borderRadius: '16px',
          }}>
            <Typography sx={{ fontSize: 12, color: '#cbd5e1' }}>
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
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
        {[1, 2, 3, 4, 5].map((i) => <LoadingSkeleton key={i} />)}
      </Box>
    );
  }

  if (!columns.length) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography sx={{ color: '#94a3b8', fontSize: 14 }}>
          Nenhum chamado ativo encontrado.
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
            width: 300, opacity: 0.9,
            transform: 'rotate(3deg)',
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
