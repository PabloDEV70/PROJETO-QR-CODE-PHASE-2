import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip,
  Stack,
  Skeleton,
  Tooltip,
  Box,
  Divider,
} from '@mui/material';
import {
  PrecisionManufacturing,
  LocalShipping,
  Agriculture,
  DirectionsCar,
  Warning,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import type { PatrimonioBemListItem } from '@/types/patrimonio-types';

function getCategoryIcon(cat: string) {
  const c = (cat || '').toUpperCase();
  if (c.includes('GUINDASTE') || c.includes('GUINDAUTO')) return PrecisionManufacturing;
  if (c.includes('CAMINHAO') || c.includes('CAVALO') || c.includes('CARRETA')) return LocalShipping;
  if (c.includes('EMPILHADEIRA') || c.includes('CARREGADEIRA')) return Agriculture;
  return DirectionsCar;
}

interface PatrimonioCardsViewProps {
  bens: PatrimonioBemListItem[];
  isLoading: boolean;
}

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(v);

const fmtAge = (months: number | null) => {
  if (!months) return null;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return y > 0 ? `${y}a ${m}m` : `${m}m`;
};

export function PatrimonioCardsView({ bens, isLoading }: PatrimonioCardsViewProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {bens.map((b) => {
        const Icon = getCategoryIcon(b.categoria);
        const age = fmtAge(b.idadeMeses);
        return (
          <Grid key={`${b.codbem}-${b.codprod}-${b.codveiculo ?? 0}`} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                borderLeft: 4,
                borderLeftColor: b.mobilizado ? 'warning.main' : 'success.main',
              }}
            >
              <CardActionArea
                onClick={() =>
                  navigate(
                    `/patrimonio/bem/${encodeURIComponent(b.codbem)}${b.codprod ? `?codprod=${b.codprod}` : ''}`,
                  )
                }
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ pb: '12px !important' }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Tooltip title={`Categoria: ${b.categoria || 'N/A'}`}>
                      <Icon color="action" fontSize="small" />
                    </Tooltip>
                    <Tooltip title={`Codigo do bem: ${b.codbem}`}>
                      <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ flex: 1 }}>
                        {b.tag || b.codbem}
                      </Typography>
                    </Tooltip>
                    {b.placa && (
                      <Tooltip title="Placa do veiculo">
                        <Chip label={b.placa} size="small" variant="outlined" sx={{ height: 20 }} />
                      </Tooltip>
                    )}
                  </Stack>

                  <Tooltip title={b.marcaModelo || b.descricaoAbreviada || ''}>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.75 }}>
                      {b.descricaoAbreviada || b.marcaModelo || '-'}
                    </Typography>
                  </Tooltip>

                  <Divider sx={{ mb: 0.75 }} />

                  <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ mb: 0.75 }}>
                    <Tooltip title={b.mobilizado ? 'Veiculo alocado em cliente' : 'Veiculo disponivel'}>
                      <Chip
                        label={b.mobilizado ? 'MOBILIZADO' : 'DISPONIVEL'}
                        size="small"
                        color={b.mobilizado ? 'warning' : 'success'}
                        sx={{ height: 22, fontSize: '0.65rem' }}
                      />
                    </Tooltip>
                    {b.temPatrimonio ? (
                      <Tooltip title="Cadastrado no modulo de patrimonio (TCIBEM)">
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: 14 }} />}
                          label="PAT"
                          size="small"
                          color="info"
                          variant="outlined"
                          sx={{ height: 22, fontSize: '0.65rem' }}
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Sem cadastro no modulo de patrimonio">
                        <Chip
                          icon={<Cancel sx={{ fontSize: 14 }} />}
                          label="SEM PAT."
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ height: 22, fontSize: '0.65rem' }}
                        />
                      </Tooltip>
                    )}
                    {b.statusComissionamento && (
                      <Tooltip title={`Comissionamento: ${b.statusComissionamento}`}>
                        <Chip
                          label={b.statusComissionamento}
                          size="small"
                          color={
                            b.statusComissionamento === 'OK'
                              ? 'success'
                              : b.statusComissionamento === 'VENCIDO'
                                ? 'error'
                                : 'warning'
                          }
                          sx={{ height: 22, fontSize: '0.65rem' }}
                        />
                      </Tooltip>
                    )}
                  </Stack>

                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                    {b.vlrAquisicao > 0 && (
                      <Tooltip title="Valor de aquisicao do bem">
                        <Typography variant="caption" fontWeight={600} color="primary">
                          {fmtCurrency(b.vlrAquisicao)}
                        </Typography>
                      </Tooltip>
                    )}
                    {age && (
                      <Tooltip title="Idade do bem desde a data de compra">
                        <Typography variant="caption" color="text.secondary">
                          {age}
                        </Typography>
                      </Tooltip>
                    )}
                    {b.percentualDepreciado > 0 && (
                      <Tooltip title={`Depreciado: ${b.percentualDepreciado}% do valor`}>
                        <Typography variant="caption" color="text.secondary">
                          Dep. {b.percentualDepreciado}%
                        </Typography>
                      </Tooltip>
                    )}
                  </Box>

                  {b.clienteAtual && (
                    <Tooltip title="Cliente atual onde o veiculo esta mobilizado">
                      <Typography
                        variant="caption"
                        color="warning.main"
                        fontWeight={500}
                        noWrap
                        sx={{ mt: 0.5, display: 'block' }}
                      >
                        {b.clienteAtual}
                      </Typography>
                    </Tooltip>
                  )}

                  {b.diasVenceComissionamento != null && b.diasVenceComissionamento <= 30 && (
                    <Tooltip title={`Comissionamento vence em ${b.diasVenceComissionamento} dias`}>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                        <Warning sx={{ fontSize: 14, color: 'error.main' }} />
                        <Typography variant="caption" color="error.main" fontWeight={600}>
                          Vence em {b.diasVenceComissionamento}d
                        </Typography>
                      </Stack>
                    </Tooltip>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
