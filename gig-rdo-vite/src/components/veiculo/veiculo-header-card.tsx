import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  LocalShipping,
  ContentCopy,
} from '@mui/icons-material';
import type { VeiculoPerfil } from '@/types/veiculo-perfil-types';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  COMBUSTIVEL_MAP,
} from '@/types/veiculo-perfil-types';

interface VeiculoHeaderCardProps {
  perfil?: VeiculoPerfil;
  isLoading: boolean;
}

export function VeiculoHeaderCard({ perfil, isLoading }: VeiculoHeaderCardProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Skeleton width="40%" height={36} />
          <Skeleton width="60%" height={24} sx={{ mt: 0.5 }} />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Skeleton width={80} height={28} />
            <Skeleton width={100} height={28} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!perfil) return null;

  const subtitleParts: string[] = [];
  if (perfil.fabricante) subtitleParts.push(perfil.fabricante);
  if (perfil.capacidade) subtitleParts.push(perfil.capacidade);
  if (perfil.anofabric) {
    subtitleParts.push(`${perfil.anofabric}/${perfil.anomod || perfil.anofabric}`);
  }
  if (perfil.combustivel) {
    subtitleParts.push(COMBUSTIVEL_MAP[perfil.combustivel] || perfil.combustivel);
  }

  const statusLabel = STATUS_LABELS[perfil.status] || perfil.status;
  const statusColor = STATUS_COLORS[perfil.status] || 'default';

  return (
    <Card>
      <CardContent sx={{ pb: '12px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Tooltip title="Voltar">
            <IconButton size="small" onClick={() => navigate(-1)} sx={{ mt: 0.25 }}>
              <ArrowBack fontSize="small" />
            </IconButton>
          </Tooltip>
          <LocalShipping sx={{ fontSize: 28, color: 'primary.main', mt: 0.5 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {perfil.marcamodelo || 'Veiculo'}
              </Typography>
              <Chip
                label={statusLabel}
                color={statusColor}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {subtitleParts.join(' | ') || perfil.categoria}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1 }}>
              {perfil.tag && (
                <Chip
                  label={perfil.tag}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              )}
              {perfil.placa && (
                <Chip
                  label={perfil.placa}
                  size="small"
                  sx={{ fontWeight: 700, fontFamily: 'monospace' }}
                  onDelete={() => navigator.clipboard.writeText(perfil.placa)}
                  deleteIcon={
                    <Tooltip title="Copiar placa">
                      <ContentCopy sx={{ fontSize: '14px !important' }} />
                    </Tooltip>
                  }
                />
              )}
              {perfil.categoria && (
                <Chip label={perfil.categoria} size="small" variant="outlined" />
              )}
              {perfil.bloqueado === 'S' && (
                <Chip label="Bloqueado" size="small" color="error" variant="outlined" />
              )}
              {perfil.ativo !== 'S' && (
                <Chip label="Inativo" size="small" color="default" variant="outlined" />
              )}
              {perfil.motoristaNome && (
                <Chip
                  label={`Op: ${perfil.motoristaNome}`}
                  size="small"
                  variant="outlined"
                  color="info"
                />
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
