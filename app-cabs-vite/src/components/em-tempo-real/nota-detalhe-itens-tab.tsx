import {
  Paper, Typography, Stack, Chip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { Inventory } from '@mui/icons-material';
import type { NotaDetalheItem } from '@/types/em-tempo-real-types';

const fmtBRL = (v: number | null) =>
  v != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
    : '-';

const fmtQtd = (v: number | null) =>
  v != null ? v.toLocaleString('pt-BR', { maximumFractionDigits: 4 }) : '-';

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
                <TableCell sx={{ fontSize: '0.75rem' }}>{item.SEQUENCIA}</TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    {item.PRODUTO_DESCRICAO}
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.25 }}>
                    {item.PRODUTO_REFERENCIA && (
                      <Typography variant="caption" color="text.secondary">
                        Ref: {item.PRODUTO_REFERENCIA}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Cod: {item.CODPROD}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{fmtQtd(item.QTDNEG)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.UNIDADE || ''}
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
              #{item.SEQUENCIA} - {item.PRODUTO_DESCRICAO}
            </Typography>
            <Chip label={item.USOPROD_DESCRICAO} size="small" variant="outlined" />
          </Stack>
          <Divider sx={{ my: 0.5 }} />
          <Stack spacing={0.25}>
            <InfoRow label="Grupo" value={item.GRUPO_PRODUTO} />
            {item.PRODUTO_MARCA && <InfoRow label="Marca" value={item.PRODUTO_MARCA} />}
            <InfoRow label="Qtd Negociada" value={fmtQtd(item.QTDNEG)} />
            <InfoRow label="Qtd Entregue" value={fmtQtd(item.QTDENTREGUE)} />
            {item.QTD_PENDENTE > 0 && (
              <InfoRow label="Qtd Pendente" value={fmtQtd(item.QTD_PENDENTE)} />
            )}
            {item.PERCDESC != null && item.PERCDESC > 0 && (
              <InfoRow label="% Desconto" value={`${item.PERCDESC}%`} />
            )}
            {item.ALIQICMS != null && (
              <InfoRow label="Aliq. ICMS" value={`${item.ALIQICMS}%`} />
            )}
            {item.ALIQIPI != null && item.ALIQIPI > 0 && (
              <InfoRow label="Aliq. IPI" value={`${item.ALIQIPI}%`} />
            )}
            {item.CONTROLE && <InfoRow label="Controle" value={item.CONTROLE} />}
            {item.OBSERVACAO_ITEM && (
              <InfoRow label="Obs" value={item.OBSERVACAO_ITEM} />
            )}
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
      <Typography variant="caption" fontWeight="medium">{value}</Typography>
    </Stack>
  );
}
