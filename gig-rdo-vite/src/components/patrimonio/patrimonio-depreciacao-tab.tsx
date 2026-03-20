import {
  Alert,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { usePatrimonioBemDepreciacao } from '@/hooks/use-patrimonio-bem-detalhe';

interface PatrimonioDepreciacaoTabProps {
  codbem: string;
}

const fmtBRL = (v: number | null) =>
  v != null ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-';

const fmtDate = (v: string | null) => {
  if (!v) return '-';
  try {
    return new Date(v).toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
};

function ValueCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 160 }}>
      <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.25 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{value ?? '-'}</Typography>
    </Box>
  );
}

export function PatrimonioDepreciacaoTab({ codbem }: PatrimonioDepreciacaoTabProps) {
  const { data, isLoading } = usePatrimonioBemDepreciacao(codbem);

  if (isLoading) {
    return (
      <Stack spacing={1}>
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} variant="rounded" height={60} />
        ))}
      </Stack>
    );
  }

  if (!data) {
    return <Alert severity="info">Sem dados de depreciacao</Alert>;
  }

  const pct = Math.min(100, data.percentualDepreciado);

  return (
    <Stack spacing={2}>
      {data.temDepreciacao !== 'S' && (
        <Alert severity="warning" variant="outlined">
          Depreciacao nao automatizada para este bem
        </Alert>
      )}

      {/* Value cards */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <ValueCard label="Aquisicao" value={fmtBRL(data.vlrAquisicao)} />
        <ValueCard label="Depreciacao" value={fmtBRL(data.vlrDepreciacao)} color="error.main" />
        <ValueCard label="Saldo" value={fmtBRL(data.vlrSaldo)} color="success.main" />
        <Card variant="outlined" sx={{ flex: 1, minWidth: 160 }}>
          <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
            <Typography variant="caption" color="text.secondary">% Depreciado</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{pct.toFixed(1)}%</Typography>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Detalhes */}
      <Card>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Detalhes da Depreciacao
          </Typography>
          <InfoRow label="Vida Util (meses)" value={data.vidaUtil} />
          <InfoRow label="Inicio Depreciacao" value={fmtDate(data.dtInicioDep)} />
          <InfoRow label="Fim Depreciacao" value={fmtDate(data.dtFimDep)} />
          <InfoRow label="Data Compra" value={fmtDate(data.dtCompra)} />
          <InfoRow label="Valor Compra/Aquisicao" value={fmtBRL(data.vlrCompraAquisicao)} />
          <InfoRow label="Despesas do Bem" value={fmtBRL(data.vlrTotDespesaBem)} />
          <InfoRow label="Valor Presente" value={fmtBRL(data.valorPresente)} />
        </CardContent>
      </Card>

      {/* Fiscal / CIAP */}
      <Card>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Dados Fiscais (CIAP)
          </Typography>
          <InfoRow label="Valor ICMS CIAP" value={fmtBRL(data.vlrIcmsCiap)} />
          <InfoRow label="Qtd Meses CIAP" value={data.qtdMesesCiap} />
          <InfoRow label="Periodo CIAP" value={
            data.dtIniRefCiap
              ? `${fmtDate(data.dtIniRefCiap)} - ${fmtDate(data.dtFimRefCiap)}`
              : '-'
          } />
        </CardContent>
      </Card>
    </Stack>
  );
}
