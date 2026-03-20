import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid2 as Grid,
  CircularProgress,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import { Search, DirectionsCar, TwoWheeler, LocalShipping, Agriculture } from '@mui/icons-material';
import { PlacaVeiculo, PlacaVeiculoProps } from '@/components/shared/placa-veiculo';
import { listarVeiculos, Veiculo } from '@/api/veiculos';
import { useQuery } from '@tanstack/react-query';

const VehicleTypeIcon = ({ tipo }: { tipo?: string | null }) => {
  const t = tipo?.toUpperCase() ?? '';
  if (t.includes('MOTO') || t.includes('MOTOCICLETA')) return <TwoWheeler />;
  if (t.includes('CAMINHÃO') || t.includes('CAMINHAO') || t.includes('TRUCK')) return <LocalShipping />;
  if (t.includes('TRATOR') || t.includes('MÁQUINA') || t.includes('MAQUINA')) return <Agriculture />;
  return <DirectionsCar />;
};

const getVehicleTypeLabel = (tipo?: string | null): string => {
  if (!tipo) return 'AUTOMÓVEL';
  const t = tipo.toUpperCase();
  if (t.includes('MOTO') || t.includes('MOTOCICLETA')) return 'MOTOCICLETA';
  if (t.includes('CAMINHÃO') || t.includes('CAMINHAO') || t.includes('TRUCK')) return 'CAMINHÃO';
  if (t.includes('TRATOR') || t.includes('MÁQUINA') || t.includes('MAQUINA')) return 'MÁQUINA';
  return 'AUTOMÓVEL';
};

export function VeiculosPlacasPage() {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoria, setCategoria] = useState('');
  const [variant, setVariant] = useState<PlacaVeiculoProps['variant']>('mercosur');

  const veiculosQuery = useQuery({
    queryKey: ['veiculos', 'list', { searchTerm, categoria }],
    queryFn: () => listarVeiculos({
      page: 1,
      limit: 200,
      ativo: 'S',
      categoria: categoria || undefined,
      searchTerm: searchTerm || undefined,
      orderBy: 'placa',
      orderDir: 'ASC',
    }),
  });

  const veiculos: Veiculo[] = veiculosQuery.data?.data ?? [];
  const isLoading = veiculosQuery.isLoading;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Placas de Veículos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Visualize todas as placas de veículos cadastrados no sistema
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Categoria</InputLabel>
              <Select
                value={categoria}
                label="Categoria"
                onChange={(e) => setCategoria(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="AUTOMOVEL">Automóvel</MenuItem>
                <MenuItem value="MOTOCICLETA">Motocicleta</MenuItem>
                <MenuItem value="CAMINHAO">Caminhão</MenuItem>
                <MenuItem value="ONIBUS">Ônibus</MenuItem>
                <MenuItem value="MACHINE">Máquina</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Modelo da Placa</InputLabel>
              <Select
                value={variant}
                label="Modelo da Placa"
                onChange={(e) => setVariant(e.target.value as PlacaVeiculoProps['variant'])}
              >
                <MenuItem value="mercosur">Mercosul (Azul)</MenuItem>
                <MenuItem value="antiga">Antiga (Preta)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {veiculos.length} veículo(s) encontrado(s)
          </Typography>

          <Grid container spacing={3}>
            {veiculos.map((veiculo) => (
              <Grid key={veiculo.codveiculo} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: 3,
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <PlacaVeiculo
                    placa={veiculo.placa}
                    tipo={getVehicleTypeLabel(veiculo.tipo)}
                    variant={variant}
                    width={220}
                    height={140}
                    showTipo={variant === 'mercosur'}
                  />

                  <Box sx={{ textAlign: 'center', width: '100%' }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{
                        fontFamily: "'Courier New', monospace",
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        display: 'inline-block',
                      }}
                    >
                      {veiculo.placa}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VehicleTypeIcon tipo={veiculo.tipo} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {veiculo.marcamodelo || 'Não informado'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Chip
                      size="small"
                      label={veiculo.categoria || 'Sem categoria'}
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                    {veiculo.ativo === 'S' && (
                      <Chip
                        size="small"
                        label="Ativo"
                        color="success"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {veiculos.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body1" color="text.secondary">
                Nenhum veículo encontrado
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default VeiculosPlacasPage;
