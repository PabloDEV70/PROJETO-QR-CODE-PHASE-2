import {
  Paper, Typography, Stack, Chip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { Inventory } from '@mui/icons-material';
import type { NotaDetalheItem } from '@/types/em-tempo-real-types';

const fmtBRL = (v: number | null | undefined) =>
  v != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
    : '-';

const fmtQtd = (v: number | null | undefined) =>
  v != null ? v.toLocaleString('pt-BR', { maximumFractionDigits: 4 }) : '-';

const str = (v: unknown): string => {
  if (v == null) return '-';
  if (typeof v === 'object') return '-';
  return String(v);
};

interface NotaDetalheItensTabProps {
  itens: NotaDetalheItem[];
}

export function NotaDetalheItensTab({ itens }: NotaDetalheItensTabProps) {
  if (itens.length === 0) {
    return (
      <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
        <Inventory sx={{ fontSize: 40, color: 'text.disabled' }} />
        <Typography color="text.secondary">Nenhum item encontrado</Typography>
      </Stack>
    );
  }

  const totalItens = itens.reduce((sum, i) => sum + (i.VLRTOT ?? 0), 0);

  return (
    <Stack spacing={2}>
      {/* Summary */}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip
          label={`${itens.length} ${itens.length === 1 ? 'item' : 'itens'}`}
          size="small"
          color="primary"
        />
        <Chip label={fmtBRL(totalItens)} size="small" variant="outlined" />
      </Stack>

      {/* Items table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>Produto</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem' }} align="right">
                Qtd
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem' }} align="right">
                Vlr Unit
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem' }} align="right">
                Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {itens.map((item) => (
              <TableRow key={item.SEQUENCIA} hover>
                <TableCell sx={{ fontSize: '0.75rem' }}>{str(item.SEQUENCIA)}</TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    {str(item.CODPROD)}
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.25 }}>
                    {item.PRODUTO_REFERENCIA && (
                      <Typography variant="caption" color="text.secondary">
                        Ref: {str(item.PRODUTO_REFERENCIA)}
                      </Typography>
                    )}
                    {item.PRODUTO_MARCA && (
                      <Typography variant="caption" color="text.secondary">
                        {str(item.PRODUTO_MARCA)}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{fmtQtd(item.QTDNEG)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {str(item.UNIDADE)}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.8rem' }}>
                  {fmtBRL(item.VLRUNIT)}
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 'medium' }}>
                  {fmtBRL(item.VLRTOT)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Item detail cards */}
      {itens.map((item) => (
        <Paper key={item.SEQUENCIA} variant="outlined" sx={{ p: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" fontWeight="bold">
              #{str(item.SEQUENCIA)} - Cod {str(item.CODPROD)}
            </Typography>
            {item.USOPROD && (
              <Chip label={str(item.USOPROD)} size="small" variant="outlined" />
            )}
          </Stack>
          <Divider sx={{ my: 0.5 }} />
          <Stack spacing={0.25}>
            {item.PRODUTO_MARCA && <InfoRow label="Marca" value={str(item.PRODUTO_MARCA)} />}
            <InfoRow label="Qtd Negociada" value={fmtQtd(item.QTDNEG)} />
            <InfoRow label="Qtd Entregue" value={fmtQtd(item.QTDENTREGUE)} />
            {item.QTD_PENDENTE > 0 && (
              <InfoRow label="Qtd Pendente" value={fmtQtd(item.QTD_PENDENTE)} />
            )}
            {item.ALIQICMS != null && (
              <InfoRow label="Aliq. ICMS" value={`${item.ALIQICMS}%`} />
            )}
            {item.ALIQIPI != null && Number(item.ALIQIPI) > 0 && (
              <InfoRow label="Aliq. IPI" value={`${item.ALIQIPI}%`} />
            )}
            {item.CONTROLE && <InfoRow label="Controle" value={str(item.CONTROLE)} />}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.15 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="caption" fontWeight="medium">{str(value)}</Typography>
    </Stack>
  );
}
