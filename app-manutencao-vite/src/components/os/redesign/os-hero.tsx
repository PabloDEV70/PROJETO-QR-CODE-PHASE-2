import { Box, Typography, Stack, Breadcrumbs, Link, Chip, Button, IconButton } from '@mui/material';
import { 
  ChevronRight, 
  Printer, 
  ArrowLeft,
  Circle,
  Save,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OS_STATUS_MAP } from '@/utils/os-constants';
import type { OsDetailEnriched, OsStatusCode } from '@/types/os-types';
import { format } from 'date-fns';

interface OsHeroProps {
  os: OsDetailEnriched;
}

export function OsHero({ os }: OsHeroProps) {
  const navigate = useNavigate();
  const statusDef = OS_STATUS_MAP[os.STATUS as OsStatusCode] || { label: os.STATUS, color: '#666' };

  return (
    <Box sx={{ 
      px: 3, 
      py: 1, 
      borderBottom: '1px solid', 
      borderColor: 'divider',
      bgcolor: 'background.paper',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 56
    }}>
      <Stack direction="row" alignItems="center" spacing={3}>
        <IconButton onClick={() => navigate('/ordens-de-servico')} size="small" sx={{ color: 'text.secondary' }}>
          <ArrowLeft size={20} />
        </IconButton>
        
        <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ '& .MuiBreadcrumbs-li': { fontSize: 13 } }}>
          <Link underline="hover" color="text.secondary" href="/ordens-de-servico" onClick={(e) => { e.preventDefault(); navigate('/ordens-de-servico'); }}>
            MANUTENÇÃO
          </Link>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '0.05em' }}>
              OS #{os.NUOS}
            </Typography>
            <Chip 
              icon={<Circle size={8} fill="currentColor" />}
              label={os.statusLabel || statusDef.label} 
              size="small"
              sx={{ 
                height: 22, 
                fontSize: 10, 
                fontWeight: 900, 
                bgcolor: `${statusDef.color}15`, 
                color: statusDef.color,
                borderRadius: 0.5,
                '& .MuiChip-icon': { ml: 0.5 }
              }} 
            />
          </Stack>
        </Breadcrumbs>

        <Stack direction="row" spacing={2} sx={{ borderLeft: '1px solid', borderColor: 'divider', pl: 3, display: { xs: 'none', md: 'flex' } }}>
          <Box>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', lineHeight: 1, fontWeight: 800 }}>CRIADOR</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 12 }}>{os.nomeUsuInc || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', lineHeight: 1, fontWeight: 800 }}>DATA ABERTURA</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 12 }}>{os.DTABERTURA ? format(new Date(os.DTABERTURA), 'dd/MM/yy HH:mm') : '-'}</Typography>
          </Box>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1}>
        <Button variant="outlined" color="inherit" size="small" startIcon={<Printer size={16} />} sx={{ fontWeight: 800, height: 32 }}>Imprimir</Button>
        <Button variant="contained" color="success" size="small" startIcon={<CheckCircle2 size={16} />} sx={{ fontWeight: 800, height: 32, boxShadow: 'none' }}>Finalizar</Button>
        <Button variant="contained" color="primary" size="small" startIcon={<Save size={16} />} sx={{ fontWeight: 800, height: 32, boxShadow: 'none' }}>Salvar</Button>
        <IconButton size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 0.5 }}><MoreHorizontal size={18} /></IconButton>
      </Stack>
    </Box>
  );
}
