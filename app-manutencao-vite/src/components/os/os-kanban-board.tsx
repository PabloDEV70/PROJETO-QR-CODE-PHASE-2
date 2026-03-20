import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Skeleton, Chip, Stack } from '@mui/material';
import { InboxRounded } from '@mui/icons-material';
import { OS_STATUS_MAP } from '@/utils/os-constants';
import type { OrdemServico, OsStatusCode, OsKanbanColumn } from '@/types/os-types';
import { OsKanbanCard } from '@/components/os/os-kanban-card';

interface Props {
  ordens: OrdemServico[];
  isLoading: boolean;
}

const KANBAN_STATUSES: OsStatusCode[] = ['A', 'E'];

function buildColumns(ordens: OrdemServico[]): OsKanbanColumn[] {
  return KANBAN_STATUSES.map((s, i) => ({
    status: s,
    label: OS_STATUS_MAP[s].label,
    color: s === 'A' ? 'warning' : 'info',
    ordem: i,
    ordens: ordens.filter((o) => o.STATUS === s),
  }));
}

function CardSkeleton() {
  return (
    <Box sx={{ p: 1.5, mb: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '4px' }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Skeleton variant="rounded" width={50} height={16} />
        <Skeleton variant="rounded" width={70} height={16} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="rounded" width={60} height={16} />
      </Box>
      <Skeleton variant="text" width="90%" height={18} />
      <Skeleton variant="text" width="60%" height={16} />
    </Box>
  );
}

function KanbanColumn({ col }: { col: OsKanbanColumn }) {
  const navigate = useNavigate();
  const statusDef = OS_STATUS_MAP[col.status as OsStatusCode];
  const accent = statusDef?.color ?? '#94a3b8';

  return (
    <Box sx={{
      minWidth: 300, flex: '1 1 300px', maxWidth: 420,
      display: 'flex', flexDirection: 'column',
    }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1, py: 0.75, mb: 1 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: accent, flexShrink: 0 }} />
        <Typography sx={{
          fontSize: 12, fontWeight: 700, color: 'text.primary',
          letterSpacing: '0.04em', textTransform: 'uppercase', flex: 1,
        }}>
          {col.label}
        </Typography>
        <Chip
          label={col.ordens.length}
          size="small"
          sx={{
            height: 20, minWidth: 26,
            fontWeight: 700, fontSize: 11,
            bgcolor: accent, color: '#fff',
            borderRadius: '4px',
          }}
        />
      </Stack>

      <Box sx={{
        flex: 1, overflowY: 'auto', px: 0.5,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 2 },
      }}>
        {col.ordens.map((o) => (
          <OsKanbanCard
            key={o.NUOS}
            os={o}
            onClick={() => navigate(`/ordens-de-servico/${o.NUOS}`)}
          />
        ))}
        {col.ordens.length === 0 && (
          <Box sx={{
            py: 4, textAlign: 'center',
            border: '1px dashed', borderColor: 'divider',
            borderRadius: '4px', bgcolor: 'action.hover',
          }}>
            <InboxRounded sx={{ fontSize: 24, color: 'text.disabled', mb: 0.5 }} />
            <Typography sx={{ fontSize: 12, color: 'text.disabled', fontWeight: 500 }}>
              Nenhuma OS
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export function OsKanbanBoard({ ordens, isLoading }: Props) {
  const columns = useMemo(() => buildColumns(ordens), [ordens]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
        {[1, 2].map((i) => (
          <Box key={i} sx={{ minWidth: 300, flex: '1 1 300px' }}>
            <Skeleton variant="rounded" height={32} sx={{ mb: 1.5, borderRadius: '4px' }} />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </Box>
        ))}
      </Box>
    );
  }

  if (!ordens.length) {
    return (
      <Box sx={{
        py: 8, textAlign: 'center',
        border: '1px dashed', borderColor: 'divider',
        borderRadius: '4px', bgcolor: 'action.hover',
      }}>
        <InboxRounded sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography sx={{ color: 'text.secondary', fontSize: 14, fontWeight: 600 }}>
          Nenhuma OS ativa
        </Typography>
        <Typography sx={{ color: 'text.disabled', fontSize: 12, mt: 0.5 }}>
          {ordens.length === 0 ? 'Todas as OS estao finalizadas ou canceladas' : ''}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography sx={{ fontSize: 11, color: 'text.disabled', mb: 1 }}>
        Mostrando {ordens.length} OS ativas (Abertas + Em Execucao)
      </Typography>
      <Box sx={{
        display: 'flex', gap: 2, overflowX: 'auto', pb: 2,
        alignItems: 'flex-start', minHeight: 420,
        '&::-webkit-scrollbar': { height: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 3 },
      }}>
        {columns.map((col) => (
          <KanbanColumn key={col.status} col={col} />
        ))}
      </Box>
    </Box>
  );
}
