import { Box, Typography, Stack, Chip, Button, IconButton } from '@mui/material';
import {
  ArrowLeft,
  Circle,
  Save,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OS_STATUS_MAP, TIPO_MANUT_MAP } from '@/utils/os-constants';
import type { OsDetailEnriched, OsStatusCode } from '@/types/os-types';

interface OsHeroProps {
  os: OsDetailEnriched;
}

export function OsHero({ os }: OsHeroProps) {
  const navigate = useNavigate();
  const statusDef = OS_STATUS_MAP[os.STATUS as OsStatusCode] || { label: os.STATUS, color: '#666' };
  const manutDef = TIPO_MANUT_MAP[os.MANUTENCAO ?? ''];

  return (
    <Box sx={{
      px: { xs: 2, md: 3 }, py: 1,
      borderBottom: '1px solid', borderColor: 'divider',
      bgcolor: 'background.paper',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 52, gap: 2,
      flexWrap: 'wrap',
    }}>
      {/* Left: Nav + OS info */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
        <IconButton
          onClick={() => navigate('/ordens-de-servico')}
          size="small"
          sx={{ color: 'text.secondary', flexShrink: 0 }}
        >
          <ArrowLeft size={20} />
        </IconButton>

        <Typography sx={{ fontWeight: 900, fontSize: 18, fontFamily: 'monospace', flexShrink: 0 }}>
          #{os.NUOS}
        </Typography>

        <Chip
          icon={<Circle size={7} fill="currentColor" />}
          label={os.statusLabel || statusDef.label}
          size="small"
          sx={{
            height: 22, fontSize: 10, fontWeight: 800,
            bgcolor: `${statusDef.color}15`, color: statusDef.color,
            borderRadius: '4px',
            '& .MuiChip-icon': { ml: 0.5 },
          }}
        />

        {manutDef && (
          <Chip
            label={manutDef.label}
            size="small"
            sx={{
              height: 22, fontSize: 10, fontWeight: 700,
              bgcolor: `${manutDef.color}15`, color: manutDef.color,
              borderRadius: '4px',
              display: { xs: 'none', sm: 'flex' },
            }}
          />
        )}

        {os.veiculo.placa && (
          <Typography sx={{
            fontSize: 12, fontWeight: 700, color: 'text.secondary',
            fontFamily: 'monospace',
            display: { xs: 'none', md: 'block' },
          }}>
            {os.veiculo.placa}
            {os.veiculo.tag ? ` (${os.veiculo.tag})` : ''}
          </Typography>
        )}
      </Stack>

      {/* Right: Actions */}
      <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
        <Button
          variant="contained" color="success" size="small"
          startIcon={<CheckCircle2 size={15} />}
          sx={{ fontWeight: 700, height: 32, boxShadow: 'none', textTransform: 'none', fontSize: 12 }}
        >
          Finalizar
        </Button>
        <Button
          variant="contained" color="primary" size="small"
          startIcon={<Save size={15} />}
          sx={{ fontWeight: 700, height: 32, boxShadow: 'none', textTransform: 'none', fontSize: 12 }}
        >
          Salvar
        </Button>
        <IconButton size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '6px' }}>
          <MoreHorizontal size={16} />
        </IconButton>
      </Stack>
    </Box>
  );
}
