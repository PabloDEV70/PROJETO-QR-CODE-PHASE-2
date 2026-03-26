import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Skeleton, Chip, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { InboxRounded } from '@mui/icons-material';
import { OS_STATUS_MAP, STATUSGIG_MAP } from '@/utils/os-constants';
import type { OrdemServico, OsStatusCode } from '@/types/os-types';
import { OsKanbanCard } from '@/components/os/os-kanban-card';

interface Props {
  ordens: OrdemServico[];
  isLoading: boolean;
  groupBy?: 'status' | 'statusGig';
  onGroupByChange?: (v: 'status' | 'statusGig') => void;
}

interface KanbanCol {
  key: string;
  label: string;
  color: string;
  ordens: OrdemServico[];
}

const STATUS_COLORS: Record<string, string> = {
  A: '#f59e0b', E: '#0ea5e9', F: '#22c55e', C: '#ef4444', R: '#a855f7',
};

const GIG_COLORS: Record<string, string> = {
  AN: '#f59e0b',
  AV: '#3b82f6',
  MA: '#f97316',
  AI: '#10b981',
  SI: '#22c55e',
  SN: '#ef4444',
};

const GIG_ORDER = ['AN', 'AV', 'MA', 'AI', 'SI', 'SN'];

function buildByStatus(ordens: OrdemServico[]): KanbanCol[] {
  const statuses: OsStatusCode[] = ['A', 'E'];
  return statuses.map((s) => ({
    key: s,
    label: OS_STATUS_MAP[s]?.label ?? s,
    color: STATUS_COLORS[s] ?? '#94a3b8',
    ordens: ordens.filter((o) => o.STATUS === s),
  }));
}

function buildByStatusGig(ordens: OrdemServico[]): KanbanCol[] {
  const grouped = new Map<string, OrdemServico[]>();
  for (const o of ordens) {
    const gig = o.AD_STATUSGIG ?? '(vazio)';
    if (!grouped.has(gig)) grouped.set(gig, []);
    grouped.get(gig)!.push(o);
  }

  const cols: KanbanCol[] = [];
  for (const gig of GIG_ORDER) {
    const items = grouped.get(gig);
    if (items && items.length > 0) {
      const def = STATUSGIG_MAP[gig];
      cols.push({
        key: gig,
        label: def?.label ?? gig,
        color: GIG_COLORS[gig] ?? '#94a3b8',
        ordens: items,
      });
    }
  }
  for (const [gig, items] of grouped.entries()) {
    if (!GIG_ORDER.includes(gig) && items.length > 0) {
      cols.push({
        key: gig,
        label: gig === '(vazio)' ? 'Sem Status GIG' : gig,
        color: '#94a3b8',
        ordens: items,
      });
    }
  }
  return cols;
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

function KanbanColumn({ col }: { col: KanbanCol }) {
  const navigate = useNavigate();

  return (
    <Box sx={{
      minWidth: 260, flex: '1 1 260px', maxWidth: 380,
      display: 'flex', flexDirection: 'column',
    }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1, py: 0.75, mb: 1 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: col.color, flexShrink: 0 }} />
        <Typography sx={{
          fontSize: 11, fontWeight: 700, color: 'text.primary',
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
            bgcolor: col.color, color: '#fff',
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

export function OsKanbanBoard({ ordens, isLoading, groupBy = 'statusGig', onGroupByChange }: Props) {
  const columns = useMemo(() => {
    return groupBy === 'statusGig' ? buildByStatusGig(ordens) : buildByStatus(ordens);
  }, [ordens, groupBy]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} sx={{ minWidth: 260, flex: '1 1 260px' }}>
            <Skeleton variant="rounded" height={32} sx={{ mb: 1.5, borderRadius: '4px' }} />
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
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: 11, color: 'text.disabled', flex: 1 }}>
          {ordens.length} OS ativas
        </Typography>
        {onGroupByChange && (
          <ToggleButtonGroup
            value={groupBy}
            exclusive
            onChange={(_, v) => { if (v) onGroupByChange(v); }}
            size="small"
            sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontSize: 11, fontWeight: 600, px: 1.5, py: 0.25 } }}
          >
            <ToggleButton value="statusGig">Status GIG</ToggleButton>
            <ToggleButton value="status">Status OS</ToggleButton>
          </ToggleButtonGroup>
        )}
      </Stack>
      <Box sx={{
        display: 'flex', gap: 2, overflowX: 'auto', pb: 2,
        alignItems: 'flex-start', minHeight: 420,
        '&::-webkit-scrollbar': { height: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 3 },
      }}>
        {columns.map((col) => (
          <KanbanColumn key={col.key} col={col} />
        ))}
      </Box>
    </Box>
  );
}
