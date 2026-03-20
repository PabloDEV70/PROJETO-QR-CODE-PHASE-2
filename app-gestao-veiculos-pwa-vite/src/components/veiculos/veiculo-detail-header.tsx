import { Box, Typography, Chip } from '@mui/material';
import { DirectionsCar, Speed } from '@mui/icons-material';
import type { PainelVeiculo } from '@/types/hstvei-types';
import type { VeiculoPerfil } from '@/api/veiculos';

interface Props {
  veiculo?: PainelVeiculo;
  perfil?: VeiculoPerfil | null;
}

export function VeiculoDetailHeader({ veiculo, perfil }: Props) {
  const placa = veiculo?.placa ?? perfil?.placa ?? '';
  const tag = veiculo?.tag ?? perfil?.tag;
  const modelo = veiculo?.marcaModelo ?? perfil?.marcamodelo;
  const tipo = veiculo?.tipo ?? perfil?.tipo;
  const sitCount = veiculo?.situacoesAtivas.length ?? 0;
  const km = perfil?.kmacum;
  const ativo = perfil?.ativo === 'S';
  const bloqueado = perfil?.bloqueado === 'S';

  return (
    <Box sx={{
      mb: 2, p: 2, borderRadius: 3,
      background: 'linear-gradient(135deg, rgba(46,125,50,0.08) 0%, rgba(46,125,50,0.02) 100%)',
      border: '1px solid', borderColor: 'divider',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box sx={{
          width: 48, height: 48, borderRadius: 2,
          bgcolor: 'primary.main', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <DirectionsCar sx={{ fontSize: 28 }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 800, fontSize: '1.25rem',
            letterSpacing: '0.04em', lineHeight: 1.2,
          }}>
            {placa}
          </Typography>

          {tag && (
            <Typography sx={{
              fontSize: '0.8rem', fontWeight: 600,
              color: 'primary.main', letterSpacing: '0.02em',
            }}>
              {tag}
            </Typography>
          )}

          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.25 }} noWrap>
            {[modelo, tipo].filter(Boolean).join(' — ')}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1.5 }}>
        {sitCount > 0 && (
          <Chip size="small" label={`${sitCount} situacao${sitCount > 1 ? 'es' : ''}`}
            color="warning" variant="outlined"
            sx={{ fontWeight: 600 }} />
        )}
        {km != null && (
          <Chip size="small" icon={<Speed sx={{ fontSize: '14px !important' }} />}
            label={`${km.toLocaleString('pt-BR')} km`}
            variant="outlined" sx={{ fontWeight: 600 }} />
        )}
        {perfil && (
          <Chip size="small"
            label={ativo ? 'Ativo' : 'Inativo'}
            color={ativo ? 'success' : 'default'}
            sx={{ fontWeight: 600 }} />
        )}
        {bloqueado && (
          <Chip size="small" label="Bloqueado" color="error" sx={{ fontWeight: 600 }} />
        )}
        {perfil?.categoria && (
          <Chip size="small" label={perfil.categoria} variant="outlined" />
        )}
        {perfil?.combustivel && (
          <Chip size="small" label={perfil.combustivel} variant="outlined" />
        )}
      </Box>
    </Box>
  );
}
