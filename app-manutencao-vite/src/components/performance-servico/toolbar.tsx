import { useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import {
  Toolbar, ToolbarButton, ColumnsPanelTrigger, FilterPanelTrigger,
  ExportCsv, ExportPrint,
  QuickFilter, QuickFilterControl, QuickFilterTrigger,
} from '@mui/x-data-grid';
import {
  Badge, Divider, InputAdornment, ListItemText,
  Menu, MenuItem, TextField, Tooltip, Typography, Chip,
} from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';

export interface PerfServicoToolbarProps {
  servicoNome?: string;
  servicoCod?: number | null;
  servicoGrupo?: string | null;
  resumoExecutores?: number;
  resumoExecucoes?: number;
  resumoMediaMin?: number;
  resumoTotalMin?: number;
}

declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides extends PerfServicoToolbarProps {}
}

type OwnerState = { expanded: boolean };

const StyledQuickFilter = styled(QuickFilter)({
  display: 'grid',
  alignItems: 'center',
});

const StyledSearchTrigger = styled(ToolbarButton)<{ ownerState: OwnerState }>(
  ({ theme, ownerState }) => ({
    gridArea: '1 / 1',
    width: 'min-content',
    height: 'min-content',
    zIndex: 1,
    opacity: ownerState.expanded ? 0 : 1,
    pointerEvents: ownerState.expanded ? 'none' : 'auto',
    transition: theme.transitions.create(['opacity']),
  }),
);

const StyledSearchField = styled(TextField)<{ ownerState: OwnerState }>(
  ({ theme, ownerState }) => ({
    gridArea: '1 / 1',
    overflowX: 'clip',
    width: ownerState.expanded ? 200 : 'var(--trigger-width)',
    opacity: ownerState.expanded ? 1 : 0,
    transition: theme.transitions.create(['width', 'opacity']),
  }),
);

function fmtMin(min?: number) {
  if (!min || min <= 0) return '-';
  if (min < 60) return `${min.toFixed(0)}min`;
  const h = min / 60;
  return h < 24 ? `${h.toFixed(1)}h` : `${(h / 24).toFixed(1)}d`;
}

export function PerfServicoToolbar(props: PerfServicoToolbarProps) {
  const {
    servicoNome, servicoCod, servicoGrupo,
    resumoExecutores, resumoExecucoes, resumoMediaMin, resumoTotalMin,
  } = props;

  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLButtonElement>(null);

  return (
    <Toolbar>
      {servicoNome ? (
        <Typography fontWeight={700} fontSize={13} noWrap sx={{ mr: 0.5, maxWidth: 300 }}>
          {servicoNome}
        </Typography>
      ) : (
        <Typography fontWeight="medium" sx={{ mx: 0.5 }}>
          Executores
        </Typography>
      )}

      {servicoCod && (
        <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color: 'text.disabled', mr: 0.5 }}>
          #{servicoCod}
        </Typography>
      )}

      {servicoGrupo && (
        <Chip label={servicoGrupo} size="small" sx={{ fontSize: 9, height: 18, mr: 0.5 }} />
      )}

      {resumoExecucoes != null && resumoExecucoes > 0 && (
        <>
          <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10.5 }}>
            <b>{resumoExecutores}</b> exec. &middot; <b>{resumoExecucoes}</b> total
            &middot; media <b>{fmtMin(resumoMediaMin)}</b>
            &middot; <b>{(resumoTotalMin ?? 0) > 0 ? `${((resumoTotalMin ?? 0) / 60).toFixed(1)}h` : '-'}</b>
          </Typography>
        </>
      )}

      <div style={{ flex: 1 }} />

      <Tooltip title="Colunas">
        <ColumnsPanelTrigger render={<ToolbarButton />}>
          <ViewColumnIcon fontSize="small" />
        </ColumnsPanelTrigger>
      </Tooltip>

      <Tooltip title="Filtros">
        <FilterPanelTrigger
          render={(fp, state) => (
            <ToolbarButton {...fp} color="default">
              <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                <FilterListIcon fontSize="small" />
              </Badge>
            </ToolbarButton>
          )}
        />
      </Tooltip>

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title="Exportar">
        <ToolbarButton ref={exportRef} onClick={() => setExportOpen(true)}>
          <FileDownloadIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>
      <Menu
        anchorEl={exportRef.current}
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <ExportPrint render={<MenuItem />} onClick={() => setExportOpen(false)}>
          <ListItemText>Imprimir</ListItemText>
        </ExportPrint>
        <ExportCsv render={<MenuItem />} onClick={() => setExportOpen(false)}>
          <ListItemText>Baixar CSV</ListItemText>
        </ExportCsv>
      </Menu>

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      <StyledQuickFilter>
        <QuickFilterTrigger
          render={(triggerProps, state) => (
            <Tooltip title="Buscar" enterDelay={0}>
              <StyledSearchTrigger
                {...triggerProps}
                ownerState={{ expanded: state.expanded }}
                color="default"
                aria-disabled={state.expanded}
              >
                <SearchIcon fontSize="small" />
              </StyledSearchTrigger>
            </Tooltip>
          )}
        />
        <QuickFilterControl
          render={({ ref, ...controlProps }, state) => (
            <StyledSearchField
              {...controlProps}
              ownerState={{ expanded: state.expanded }}
              inputRef={ref}
              aria-label="Buscar"
              placeholder="Buscar executor..."
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </StyledQuickFilter>
    </Toolbar>
  );
}
