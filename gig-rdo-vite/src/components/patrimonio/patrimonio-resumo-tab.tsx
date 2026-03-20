import { Box, Card, CardContent, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';
import type { PatrimonioBemDetalhe } from '@/types/patrimonio-types';

interface PatrimonioResumoTabProps {
  bem: PatrimonioBemDetalhe;
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

function InfoRow({ label, value, tip }: { label: string; value: string | number | null; tip?: string }) {
  const row = (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.25 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{value ?? '-'}</Typography>
    </Box>
  );
  return tip ? <Tooltip title={tip} placement="left">{row}</Tooltip> : row;
}

function KpiCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 140 }}>
      <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

export function PatrimonioResumoTab({ bem }: PatrimonioResumoTabProps) {
  const pctDep = Math.min(100, bem.percentualDepreciado);

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* Dados do Bem (TCIBEM) */}
        <Card sx={{ flex: 1, minWidth: 300 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Dados do Bem
            </Typography>
            <InfoRow label="Cod Bem" value={bem.codbem} tip="Identificador unico do bem no patrimonio (TCIBEM.CODBEM)" />
            <InfoRow label="Cod Produto" value={bem.codprod} tip="Codigo do produto na tabela de produtos (TGFPRO.CODPROD)" />
            <InfoRow label="Descricao" value={bem.descricaoAbreviada} tip="Descricao abreviada do bem" />
            <InfoRow label="Categoria" value={bem.categoria} />
            <InfoRow label="Empresa" value={bem.empresa} />
            <InfoRow label="Data Compra" value={fmtDate(bem.dtCompra)} />
            <InfoRow label="Data Baixa" value={fmtDate(bem.dtBaixa)} />
            <InfoRow label="Vida Util (meses)" value={bem.vidaUtil} />
            <InfoRow label="Valor Aquisicao" value={fmtBRL(bem.vlrAquisicao)} tip="Valor original de compra/aquisicao" />
            <InfoRow label="Valor Depreciacao" value={fmtBRL(bem.vlrDepreciacao)} tip="Total depreciado ate o momento" />
            <InfoRow label="Valor Saldo" value={fmtBRL(bem.vlrSaldo)} tip="Valor residual (aquisicao - depreciacao)" />
            <InfoRow label="NF Entrada" value={bem.nunota} />
            <InfoRow label="NF Baixa" value={bem.nunotaBaixa} />
            <InfoRow label="Contrato" value={bem.numContrato} />
          </CardContent>
        </Card>

        {/* Dados do Veiculo (TGFVEI) */}
        <Card sx={{ flex: 1, minWidth: 300 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Dados do Veiculo
            </Typography>
            <InfoRow label="Cod Veiculo" value={bem.codveiculo} />
            <InfoRow label="TAG" value={bem.tag} />
            <InfoRow label="Placa" value={bem.placa} />
            <InfoRow label="Marca/Modelo" value={bem.marcaModelo} />
            <InfoRow label="Tipo Equipamento" value={bem.tipoEquipamento} />
            <InfoRow label="Fabricante" value={bem.fabricante} />
            <InfoRow label="Capacidade" value={bem.capacidade} />
            <InfoRow label="Ano Fabric/Modelo" value={
              bem.anofabric ? `${bem.anofabric}/${bem.anomod || bem.anofabric}` : '-'
            } />
            <InfoRow label="Chassis" value={bem.chassis} />
            <InfoRow label="RENAVAM" value={bem.renavam} />
            <InfoRow label="Motor" value={bem.numMotor} />
            <InfoRow label="Cor" value={bem.cor} />
            <InfoRow label="Combustivel" value={bem.combustivel} />
            <InfoRow label="Peso Maximo" value={bem.pesoMax} />
            <InfoRow label="KM Acumulado" value={bem.kmAcum} />
            <InfoRow label="Proprio" value={bem.proprio === 'S' ? 'Sim' : 'Nao'} />
          </CardContent>
        </Card>
      </Box>

      {/* Mini KPIs */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <KpiCard
          label="Idade"
          value={bem.idadeMeses != null ? `${bem.idadeMeses} meses` : '-'}
        />
        <KpiCard
          label="Mobilizado"
          value={bem.mobilizado ? 'Sim' : 'Nao'}
          color={bem.mobilizado ? 'success.main' : 'text.secondary'}
        />
        <Card variant="outlined" sx={{ flex: 1, minWidth: 200 }}>
          <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
            <Typography variant="caption" color="text.secondary">
              % Depreciado
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {pctDep.toFixed(1)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={pctDep}
              sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
            />
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
