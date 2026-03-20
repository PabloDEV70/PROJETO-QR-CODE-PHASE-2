import { useNavigate } from 'react-router-dom';
import { Drawer, Box, Typography, Stack, Chip, IconButton, Button } from '@mui/material';
import { Close, OpenInNew } from '@mui/icons-material';
import type { RdoListItem } from '@/types/rdo-types';
import { JornadaSection } from './drawer-sections/jornada-section';
import { OcorrenciasSection } from './drawer-sections/ocorrencias-section';
import { ProdutividadeSection } from './drawer-sections/produtividade-section';
import { HoraExtraSection } from './drawer-sections/hora-extra-section';
interface ProdutividadeDrawerProps {
  open: boolean;
  onClose: () => void;
  row: RdoListItem | null;
}

export function ProdutividadeDrawer({ open, onClose, row }: ProdutividadeDrawerProps) {
  const navigate = useNavigate();
  if (!row) return null;

  const r = row;
  const pct = r.produtividadePercent ?? 0;
  const faixa = r.diagnosticoFaixa?.faixa ?? { label: r.diagnostico || 'Critico', color: 'error' };
  const headerColor = `${faixa.color}.main`;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: 400, p: 0 } }}>
      <Box sx={{
        p: 2, bgcolor: headerColor, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Stack spacing={0.25}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" fontWeight="bold">{pct}%</Typography>
            <Chip size="small" label={faixa.label}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600 }} />
          </Stack>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            {r.nomeparc} &middot; RDO {r.CODRDO}
          </Typography>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: '#fff' }} size="small">
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
        <Button
          fullWidth variant="outlined" size="small"
          startIcon={<OpenInNew sx={{ fontSize: 16 }} />}
          onClick={() => { onClose(); navigate(`/manutencao/rdo/${r.CODRDO}`); }}
          sx={{ mb: 2, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
        >
          Ver detalhe completo do RDO {r.CODRDO}
        </Button>
        <JornadaSection row={r} />
        <OcorrenciasSection row={r} />
        <ProdutividadeSection row={r} />
        <HoraExtraSection row={r} />
      </Box>
    </Drawer>
  );
}
