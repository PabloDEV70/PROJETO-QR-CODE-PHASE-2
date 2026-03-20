import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  Box,
} from '@mui/material';
import type { PatrimonioCategoriaResumo } from '@/types/patrimonio-types';

interface PatrimonioCategoriaCardProps {
  categoria: PatrimonioCategoriaResumo;
}

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(v);

const fmtAge = (months: number) => {
  const y = Math.floor(months / 12);
  const m = Math.round(months % 12);
  return y > 0 ? `${y}a ${m}m` : `${m}m`;
};

export function PatrimonioCategoriaCard({ categoria: cat }: PatrimonioCategoriaCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/patrimonio?tab=lista&categoria=${encodeURIComponent(cat.categoria)}`);
  };

  return (
    <Card variant="outlined">
      <CardActionArea onClick={handleClick}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} noWrap sx={{ mb: 1 }}>
            {cat.categoria}
          </Typography>

          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Quantidade
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {cat.quantidade}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Valor Total
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {fmtCurrency(cat.valorTotal)}
              </Typography>
            </Stack>

            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Mobilizacao
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {cat.percentualMobilizado.toFixed(0)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(cat.percentualMobilizado, 100)}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Idade Media
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {fmtAge(cat.idadeMedia)}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                {cat.mobilizados} mobilizados / {cat.disponiveis} disponiveis
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
