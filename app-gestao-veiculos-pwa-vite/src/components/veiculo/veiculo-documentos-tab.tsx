import { Box, Typography, Paper, Chip, Skeleton } from '@mui/material';
import { InsertDriveFile } from '@mui/icons-material';
import type { VeiculoDocumento } from '@/api/veiculos';
import { fmtDateFull } from '@/utils/fmt';

function isVigente(doc: VeiculoDocumento): boolean {
  if (!doc.VIGENCIAFIN) return false;
  return new Date(doc.VIGENCIAFIN) >= new Date();
}

interface Props { items?: VeiculoDocumento[]; isLoading: boolean }

export function VeiculoDocumentosTab({ items, isLoading }: Props) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: 2.5 }} />
        ))}
      </Box>
    );
  }

  if (!items?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
        <InsertDriveFile sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
        <Typography variant="body2">Nenhum documento</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {items.map((doc) => {
        const vigente = isVigente(doc);
        return (
          <Paper key={doc.CODDOC} sx={{
            p: 2, borderLeft: 4,
            borderColor: vigente ? 'success.main' : 'error.main',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                Doc #{doc.CODDOC}
              </Typography>
              <Chip size="small"
                label={vigente ? 'VIGENTE' : 'VENCIDO'}
                color={vigente ? 'success' : 'error'} />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.75 }}>
              Vigencia: {fmtDateFull(doc.VIGENCIAINI)} — {fmtDateFull(doc.VIGENCIAFIN)}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
}
