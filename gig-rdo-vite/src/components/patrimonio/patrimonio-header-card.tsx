import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  AccountBalance,
  DirectionsCar,
  Business,
  Speed,
  CalendarMonth,
  LocalGasStation,
} from '@mui/icons-material';
import type { PatrimonioBemDetalhe } from '@/types/patrimonio-types';

interface PatrimonioHeaderCardProps {
  bem: PatrimonioBemDetalhe;
}

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtAge = (months: number | null) => {
  if (!months) return null;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return y > 0 ? `${y}a ${m}m` : `${m}m`;
};

function getStatusChip(bem: PatrimonioBemDetalhe) {
  if (bem.dtBaixa) return { label: 'BAIXADO', color: 'default' as const, tip: 'Bem baixado do patrimonio' };
  if (bem.mobilizado) return { label: 'MOBILIZADO', color: 'warning' as const, tip: 'Alocado em cliente com OS pendente' };
  return { label: 'DISPONIVEL', color: 'success' as const, tip: 'Disponivel para mobilizacao' };
}

export function PatrimonioHeaderCard({ bem }: PatrimonioHeaderCardProps) {
  const navigate = useNavigate();
  const status = getStatusChip(bem);
  const age = fmtAge(bem.idadeMeses);

  return (
    <Card>
      <CardContent sx={{ pb: '12px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Tooltip title="Voltar">
            <IconButton size="small" onClick={() => navigate(-1)} sx={{ mt: 0.25 }}>
              <ArrowBack fontSize="small" />
            </IconButton>
          </Tooltip>
          <AccountBalance sx={{ fontSize: 28, color: 'primary.main', mt: 0.5 }} />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Linha 1: TAG + Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Tooltip title={`Codigo do bem: ${bem.codbem} | Produto: ${bem.codprod}`}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {bem.tag || bem.codbem}
                </Typography>
              </Tooltip>
              <Tooltip title={status.tip}>
                <Chip label={status.label} color={status.color} size="small" sx={{ fontWeight: 600 }} />
              </Tooltip>
              {bem.empresa && (
                <Tooltip title="Empresa proprietaria do bem">
                  <Chip
                    icon={<Business sx={{ fontSize: 14 }} />}
                    label={`Emp ${bem.empresa}`}
                    size="small"
                    variant="outlined"
                  />
                </Tooltip>
              )}
              {bem.bloqueado === 'S' && (
                <Tooltip title="Veiculo bloqueado no sistema">
                  <Chip label="BLOQUEADO" size="small" color="error" variant="outlined" />
                </Tooltip>
              )}
              {bem.ativo !== 'S' && (
                <Tooltip title="Veiculo marcado como inativo">
                  <Chip label="INATIVO" size="small" variant="outlined" />
                </Tooltip>
              )}
            </Box>

            {/* Linha 2: Descricao / Marca / Modelo */}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {[bem.descricaoAbreviada, bem.marcaModelo, bem.tipoEquipamento].filter(Boolean).join(' | ')}
            </Typography>

            {/* Linha 3: Detalhes do veiculo */}
            <Stack direction="row" spacing={2} sx={{ mt: 0.75 }} flexWrap="wrap" useFlexGap>
              {bem.placa && (
                <Tooltip title="Placa do veiculo">
                  <Typography variant="body2" fontWeight={600}>{bem.placa}</Typography>
                </Tooltip>
              )}
              {bem.anofabric && (
                <Tooltip title="Ano de fabricacao / modelo">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CalendarMonth sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="body2">{bem.anofabric}/{bem.anomod || bem.anofabric}</Typography>
                  </Stack>
                </Tooltip>
              )}
              {bem.kmAcum != null && bem.kmAcum > 0 && (
                <Tooltip title="Quilometragem acumulada">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Speed sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="body2">{bem.kmAcum.toLocaleString('pt-BR')} km</Typography>
                  </Stack>
                </Tooltip>
              )}
              {bem.combustivel && (
                <Tooltip title="Tipo de combustivel">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <LocalGasStation sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="body2">{bem.combustivel}</Typography>
                  </Stack>
                </Tooltip>
              )}
              {bem.capacidade && (
                <Tooltip title="Capacidade do equipamento">
                  <Typography variant="body2" color="text.secondary">{bem.capacidade}</Typography>
                </Tooltip>
              )}
              {bem.fabricante && (
                <Tooltip title="Fabricante">
                  <Typography variant="body2" color="text.secondary">{bem.fabricante}</Typography>
                </Tooltip>
              )}
            </Stack>

            {/* Linha 4: Cliente mobilizado */}
            {bem.mobilizado && bem.clienteAtual && (
              <Tooltip title="Cliente onde o veiculo esta mobilizado atualmente">
                <Chip
                  label={`Em: ${bem.clienteAtual}`}
                  size="small"
                  variant="outlined"
                  color="warning"
                  sx={{ mt: 0.75, maxWidth: 400 }}
                />
              </Tooltip>
            )}
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Coluna direita: Valores */}
          <Box sx={{ textAlign: 'right', minWidth: 160 }}>
            <Tooltip title="Valor de aquisicao original do bem">
              <Box>
                <Typography variant="caption" color="text.secondary">Valor Aquisicao</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {fmtBRL(bem.vlrAquisicao)}
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Valor atual apos depreciacao">
              <Typography variant="caption" color="text.secondary">
                Saldo: {fmtBRL(bem.vlrSaldo)}
              </Typography>
            </Tooltip>
            {bem.percentualDepreciado > 0 && (
              <Tooltip title="Percentual do valor ja depreciado">
                <Typography variant="caption" display="block" color="text.secondary">
                  Depreciado: {bem.percentualDepreciado}%
                </Typography>
              </Tooltip>
            )}
            {age && (
              <Tooltip title="Idade do bem desde a data de compra">
                <Typography variant="caption" display="block" color="text.secondary">
                  Idade: {age}
                </Typography>
              </Tooltip>
            )}
            {bem.dtCompra && (
              <Tooltip title="Data de aquisicao/compra">
                <Typography variant="caption" display="block" color="text.secondary">
                  Compra: {bem.dtCompra}
                </Typography>
              </Tooltip>
            )}

            {bem.codveiculo && (
              <Tooltip title="Abrir pagina completa do veiculo">
                <Button
                  size="small"
                  startIcon={<DirectionsCar />}
                  onClick={() => navigate(`/veiculos/${bem.codveiculo}`)}
                  sx={{ mt: 0.75 }}
                >
                  Ver Veiculo
                </Button>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
