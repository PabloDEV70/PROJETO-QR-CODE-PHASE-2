import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Stack,
  Skeleton,
  Box,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import type { PatrimonioMobilizacaoCliente } from '@/types/patrimonio-types';

interface PatrimonioMobilizacaoClientesProps {
  data: PatrimonioMobilizacaoCliente[] | undefined;
  isLoading: boolean;
}

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(v);

export function PatrimonioMobilizacaoClientes({
  data,
  isLoading,
}: PatrimonioMobilizacaoClientesProps) {
  const navigate = useNavigate();

  const handleVeiculoClick = useCallback(
    (codbem: string) => {
      navigate(`/patrimonio/bem/${encodeURIComponent(codbem)}`);
    },
    [navigate],
  );

  if (isLoading) {
    return (
      <Stack spacing={1}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
        ))}
      </Stack>
    );
  }

  if (!data?.length) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        Nenhum veiculo mobilizado encontrado.
      </Typography>
    );
  }

  return (
    <Stack spacing={0.5}>
      {data.map((cli) => (
        <Accordion key={cli.codparc} variant="outlined" disableGutters>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
              <Typography fontWeight={700} sx={{ flex: 1 }}>
                {cli.cliente}
              </Typography>
              <Chip label={`${cli.totalVeiculos} veiculos`} size="small" color="primary" />
              <Chip
                label={fmtCurrency(cli.valorPatrimonio)}
                size="small"
                variant="outlined"
              />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={0.5}>
              {cli.veiculos.map((v) => (
                <Box
                  key={v.codbem}
                  onClick={() => handleVeiculoClick(v.codbem)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Typography variant="body2" fontWeight={700} sx={{ minWidth: 100 }}>
                    {v.tag}
                  </Typography>
                  <Typography variant="body2" sx={{ minWidth: 80 }}>
                    {v.placa}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                    {v.tipoEquipamento}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {v.dias} dias
                  </Typography>
                  {v.servico && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {v.servico}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
}
