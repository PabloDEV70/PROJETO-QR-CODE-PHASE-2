import { Chip, Stack, Tooltip, Typography, Box } from '@mui/material';
import { Build } from '@mui/icons-material';
import type { RdoListItem } from '@/types/rdo-types';
import {
  getOsStatusLabel, getOsStatusColor, getOsManutencaoLabel,
  getOsStatusGigLabel, isOsBlocking, formatDateBR,
} from '@/utils/os-utils';

interface OsCellChipProps {
  row: RdoListItem;
  onClick?: () => void;
}

function OsTooltipContent({ row }: { row: RdoListItem }) {
  const statusGig = getOsStatusGigLabel(row.osStatusGig);
  const blocking = isOsBlocking(row.osStatusGig);
  return (
    <Box sx={{ p: 0.5, minWidth: 200 }}>
      <Typography variant="subtitle2" fontWeight="bold">
        OS {row.primeiroNuos}
        {row.qtdOs > 1 && (
          <Typography component="span" variant="caption" color="text.secondary">
            {' '}(+{row.qtdOs - 1} outra{row.qtdOs > 2 ? 's' : ''} OS neste RDO)
          </Typography>
        )}
      </Typography>
      <Stack spacing={0.25} sx={{ mt: 0.5 }}>
        <Typography variant="caption">
          Status: {getOsStatusLabel(row.osStatus)}
        </Typography>
        <Typography variant="caption">
          Tipo: {getOsManutencaoLabel(row.osManutencao)}
        </Typography>
        {statusGig && (
          <Typography variant="caption" color={blocking ? 'error' : 'info.main'}>
            {statusGig}
          </Typography>
        )}
        {row.veiculoPlaca && (
          <Typography variant="caption">
            Veiculo: {row.veiculoPlaca}{row.veiculoTag ? ` (${row.veiculoTag})` : ''}
          </Typography>
        )}
        {row.osDataIni && (
          <Typography variant="caption">Inicio: {formatDateBR(row.osDataIni)}</Typography>
        )}
        {row.osPrevisao && (
          <Typography variant="caption">Previsao: {formatDateBR(row.osPrevisao)}</Typography>
        )}
        {(row.osQtdServicos ?? 0) > 0 && (
          <Typography variant="caption">Servicos: {row.osQtdServicos}</Typography>
        )}
      </Stack>
      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
        Clique para ver detalhes da OS
      </Typography>
    </Box>
  );
}

export function OsCellChip({ row, onClick }: OsCellChipProps) {
  if (row.qtdOs === 0 && !row.primeiroNuos) {
    return (
      <Typography variant="caption" color="text.disabled">sem OS</Typography>
    );
  }

  const statusColor = getOsStatusColor(row.osStatus);
  const blocking = isOsBlocking(row.osStatusGig);

  return (
    <Tooltip
      title={<OsTooltipContent row={row} />}
      arrow placement="left"
      slotProps={{
        tooltip: { sx: { bgcolor: 'background.paper', color: 'text.primary', boxShadow: 3 } },
        arrow: { sx: { color: 'background.paper' } },
      }}
    >
      <Stack
        direction="row" spacing={0.5} alignItems="center"
        onClick={onClick}
        sx={{ cursor: onClick ? 'pointer' : 'default', py: 0.25 }}
      >
        <Build sx={{ fontSize: 14, color: statusColor }} />
        <Typography variant="caption" fontWeight="bold" noWrap>
          {row.primeiroNuos}
        </Typography>
        {row.qtdOs > 1 && (
          <Chip
            label={`+${row.qtdOs - 1}`}
            size="small"
            sx={{
              height: 18, fontSize: '0.65rem', fontWeight: 700,
              bgcolor: 'rgba(139,92,246,0.12)', color: '#7c3aed',
              '& .MuiChip-label': { px: 0.5 },
            }}
          />
        )}
        <Chip
          label={getOsStatusLabel(row.osStatus)}
          size="small"
          sx={{
            height: 18, fontSize: '0.6rem',
            bgcolor: statusColor, color: '#fff',
            '& .MuiChip-label': { px: 0.5 },
          }}
        />
        {blocking && (
          <Chip
            label="!" size="small" color="error"
            sx={{ height: 18, minWidth: 18, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.25 } }}
          />
        )}
      </Stack>
    </Tooltip>
  );
}
