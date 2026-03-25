import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Tooltip,
  IconButton,
  alpha,
} from '@mui/material';
import {
  LocalShipping,
  CheckCircle,
  Cancel,
  OpenInNew,
  Block,
  Description,
} from '@mui/icons-material';
import { useProdutoVeiculos } from '@/hooks/use-locais';
import type { VeiculoProduto } from '@/types/local-produto';

const COMBUSTIVEL_MAP: Record<string, string> = {
  D: 'Diesel',
  G: 'Gasolina',
  A: 'Alcool',
  E: 'Eletrico',
  F: 'Flex',
  N: 'GNV',
};

interface VeiculosProdutoListProps {
  codProd: number;
  usoProd?: string;
}

function VeiculoRow({ v }: { v: VeiculoProduto }) {
  const navigate = useNavigate();
  const isAtivo = v.ativo === 'S';
  const isBloqueado = v.bloqueado === 'S';

  const detailParts: string[] = [];
  if (v.fabricante) detailParts.push(v.fabricante);
  if (v.capacidade) detailParts.push(v.capacidade);
  if (v.anoFabric) detailParts.push(`${v.anoFabric}/${v.anoMod || v.anoFabric}`);
  if (v.combustivel) {
    detailParts.push(COMBUSTIVEL_MAP[v.combustivel] || v.combustivel);
  }
  if (v.tipoMotor) detailParts.push(v.tipoMotor);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        py: 0.75,
        px: 1,
        borderRadius: 1,
        bgcolor: (t) => alpha(t.palette.text.primary, 0.02),
        opacity: isAtivo ? 1 : 0.55,
        '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.06) },
      }}
    >
      <LocalShipping
        sx={{
          fontSize: 16,
          color: isAtivo ? 'primary.main' : 'text.disabled',
          flexShrink: 0,
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3 }} noWrap>
          {v.marcaModelo || v.tipoEqpto || 'Veiculo'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.25 }}>
          {v.tag && (
            <Chip
              label={v.tag}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
            />
          )}
          {v.placa && (
            <Chip
              label={v.placa}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 700,
                fontFamily: 'monospace',
              }}
            />
          )}
          {v.tipoEqpto && v.marcaModelo && (
            <Chip
              label={v.tipoEqpto}
              size="small"
              variant="outlined"
              sx={{ height: 18, fontSize: '0.6rem' }}
            />
          )}
          {v.emContrato === 'S' && (
            <Chip
              icon={<Description sx={{ fontSize: '12px !important' }} />}
              label="Contrato"
              size="small"
              color="info"
              variant="outlined"
              sx={{ height: 18, fontSize: '0.6rem' }}
            />
          )}
          {isBloqueado && (
            <Chip
              icon={<Block sx={{ fontSize: '12px !important' }} />}
              label="Bloqueado"
              size="small"
              color="error"
              variant="outlined"
              sx={{ height: 18, fontSize: '0.6rem' }}
            />
          )}
        </Box>

        {detailParts.length > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: '0.6rem', lineHeight: 1.2, display: 'block', mt: 0.25 }}
            noWrap
          >
            {detailParts.join(' | ')}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
        {isAtivo ? (
          <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
        ) : (
          <Cancel sx={{ fontSize: 14, color: 'text.disabled' }} />
        )}
        <Tooltip title="Ver historico completo do veiculo" arrow>
          <IconButton
            size="small"
            onClick={() => navigate(`/manutencao/veiculo/${v.codVeiculo}`)}
            sx={{ p: 0.25 }}
          >
            <OpenInNew sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

export function VeiculosProdutoList({ codProd, usoProd }: VeiculosProdutoListProps) {
  const { data: veiculos, isLoading } = useProdutoVeiculos(codProd, usoProd);

  if (usoProd !== 'I') return null;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
        <CircularProgress size={14} />
        <Typography variant="caption" color="text.secondary">
          Carregando veiculos...
        </Typography>
      </Box>
    );
  }

  if (!veiculos || veiculos.length === 0) return null;

  const ativos = veiculos.filter((v) => v.ativo === 'S').length;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <LocalShipping sx={{ fontSize: 18, color: 'primary.main' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
          Veiculos / Equipamentos
        </Typography>
        <Chip
          label={`${ativos} ativos de ${veiculos.length}`}
          size="small"
          color="success"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.65rem' }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        Vinculados via TGFVEI.AD_TIPOEQPTO
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          maxHeight: 300,
          overflow: 'auto',
        }}
      >
        {veiculos.map((v) => (
          <VeiculoRow key={v.codVeiculo} v={v} />
        ))}
      </Box>
    </>
  );
}
