import {
  Box,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Typography,
} from '@mui/material';
import { format, parseISO, isValid } from 'date-fns';
import type { VeiculoDocumento } from '@/types/veiculo-tabs-types';

interface Props {
  items?: VeiculoDocumento[];
  isLoading: boolean;
}

function safeFmt(v: string | Date | null, fmt = 'dd/MM/yyyy'): string {
  if (!v) return '-';
  const d = typeof v === 'string' ? parseISO(v) : new Date(v);
  return isValid(d) ? format(d, fmt) : '-';
}

function isVencido(v: string | Date | null): boolean {
  if (!v) return false;
  const d = typeof v === 'string' ? parseISO(v) : new Date(v);
  return isValid(d) && d < new Date();
}

function DocumentoCard({ doc }: { doc: VeiculoDocumento }) {
  const vencido = isVencido(doc.VIGENCIAFIN);

  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Documento #{doc.CODDOC}
          </Typography>
          <Chip
            label={vencido ? 'VENCIDO' : 'VIGENTE'}
            size="small"
            color={vencido ? 'error' : 'success'}
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Vigencia: {safeFmt(doc.VIGENCIAINI)} - {safeFmt(doc.VIGENCIAFIN)}
        </Typography>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <Card variant="outlined" key={i}>
          <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function VeiculoDocumentosTab({ items, isLoading }: Props) {
  const list = items ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Documentos ({isLoading ? '...' : list.length})
      </Typography>

      {isLoading ? (
        <LoadingSkeleton />
      ) : list.length === 0 ? (
        <Typography color="text.secondary">Nenhum documento</Typography>
      ) : (
        list.map((doc) => (
          <DocumentoCard key={`${doc.CODVEICULO}-${doc.CODDOC}`} doc={doc} />
        ))
      )}
    </Box>
  );
}
