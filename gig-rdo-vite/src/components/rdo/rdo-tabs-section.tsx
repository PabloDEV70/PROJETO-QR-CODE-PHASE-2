import { Alert, Chip, Tabs, Tab, Box, Stack, IconButton, Tooltip } from '@mui/material';
import { type GridPaginationModel } from '@mui/x-data-grid';
import { RdoManTable } from './rdo-man-table';
import { RdoDetalhesTable } from './rdo-detalhes-table';
import { RdoAnalyticsTab } from './rdo-analytics-tab';
import { SectionCard } from './section-card';
import { type Density, densityOptions } from '@/utils/rdo-filter-helpers';
import type { RdoListResponse, RdoDetalhesResponse } from '@/types/rdo-types';

interface MotivoOpt {
  RDOMOTIVOCOD: number;
  DESCRICAO: string;
  SIGLA?: string;
}

interface RdoTabsSectionProps {
  tab: number;
  onTabChange: (_: React.SyntheticEvent, v: number) => void;
  rdoData?: RdoListResponse;
  rdoLoading: boolean;
  detalhes?: RdoDetalhesResponse;
  detalhesLoading: boolean;
  error?: Error | null;
  filterParams: Record<string, string | number>;
  page: number;
  pageSize: number;
  density: Density;
  onDensityChange: (d: Density) => void;
  onPaginationChange: (model: GridPaginationModel) => void;
  motivosOpts?: MotivoOpt[];
  rdomotivocod: string | null;
  onClearMotivo: () => void;
}

export function RdoTabsSection({
  tab, onTabChange, rdoData, rdoLoading, detalhes, detalhesLoading,
  error, filterParams, page, pageSize, density, onDensityChange, onPaginationChange,
  motivosOpts, rdomotivocod, onClearMotivo,
}: RdoTabsSectionProps) {
  const toolbar = (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {densityOptions.map((opt) => (
        <Tooltip key={opt.value} title={opt.label}>
          <IconButton size="small" onClick={() => onDensityChange(opt.value)}
            sx={{
              color: density === opt.value ? 'primary.main' : 'action.disabled',
              bgcolor: density === opt.value ? 'rgba(46,125,50,0.08)' : 'transparent',
              borderRadius: 1,
            }}>
            <opt.icon fontSize="small" />
          </IconButton>
        </Tooltip>
      ))}
    </Stack>
  );

  const tabsHeader = (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Tabs value={tab} onChange={onTabChange}
        sx={{
          flex: 1,
          '& .MuiTab-root': { textTransform: 'none', minHeight: 40, fontWeight: 500 },
          '& .MuiTabs-indicator': { transition: 'all 0.3s ease' },
        }}>
        <Tab label="RDOs" />
        <Tab label="Detalhes" />
        <Tab label="Analytics" />
      </Tabs>
      {toolbar}
    </Box>
  );

  return (
    <SectionCard title="" action={tabsHeader} noPadding
      sx={{
        '& > :first-of-type': {
          py: 0, px: 1, bgcolor: 'background.paper',
          '& > :first-of-type': { display: 'none' },
        },
      }}>
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>Erro: {error.message}</Alert>
      )}

      {tab === 0 && (
        <RdoManTable data={rdoData} isLoading={rdoLoading}
          page={page} pageSize={pageSize} density={density}
          onPaginationChange={onPaginationChange} />
      )}

      {tab === 1 && rdomotivocod && (
        <Box sx={{ px: 2, pt: 1 }}>
          <Chip
            label={`Filtro motivo: ${
              motivosOpts?.find((m) => String(m.RDOMOTIVOCOD) === rdomotivocod)?.DESCRICAO
              || `cod ${rdomotivocod}`
            }`}
            onDelete={onClearMotivo} color="primary" variant="outlined" />
        </Box>
      )}

      {tab === 1 && (
        <RdoDetalhesTable data={detalhes} isLoading={detalhesLoading}
          page={page} pageSize={pageSize} density={density}
          onPaginationChange={onPaginationChange} />
      )}

      {tab === 2 && (
        <Box sx={{ p: 2 }}>
          <RdoAnalyticsTab filterParams={filterParams} />
        </Box>
      )}
    </SectionCard>
  );
}
