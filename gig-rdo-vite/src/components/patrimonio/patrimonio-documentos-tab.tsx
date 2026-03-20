import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { usePatrimonioBemDocumentos } from '@/hooks/use-patrimonio-bem-detalhe';

interface PatrimonioDocumentosTabProps {
  codbem: string;
}

const fmtDate = (v: string | null) => {
  if (!v) return '-';
  try {
    return new Date(v).toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
};

const STATUS_CHIP: Record<string, { label: string; color: 'success' | 'error' | 'warning' }> = {
  VIGENTE: { label: 'VIGENTE', color: 'success' },
  VENCIDO: { label: 'VENCIDO', color: 'error' },
  VENCE_EM_30D: { label: 'VENCE EM 30D', color: 'warning' },
};

export function PatrimonioDocumentosTab({ codbem }: PatrimonioDocumentosTabProps) {
  const { data: items, isLoading } = usePatrimonioBemDocumentos(codbem);

  if (isLoading) {
    return (
      <Stack spacing={1}>
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} variant="rounded" height={56} />
        ))}
      </Stack>
    );
  }

  if (!items?.length) {
    return <Alert severity="info">Nenhum documento vinculado</Alert>;
  }

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Documentos ({items.length})
      </Typography>

      {items.map((doc) => {
        const chip = STATUS_CHIP[doc.status] || { label: doc.status, color: 'success' as const };

        return (
          <Card key={`${doc.codveiculo}-${doc.coddoc}`} variant="outlined">
            <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Documento #{doc.coddoc}
                </Typography>
                <Chip
                  label={chip.label}
                  size="small"
                  color={chip.color}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                Vigencia: {fmtDate(doc.vigenciaIni)} - {fmtDate(doc.vigenciaFin)}
              </Typography>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
