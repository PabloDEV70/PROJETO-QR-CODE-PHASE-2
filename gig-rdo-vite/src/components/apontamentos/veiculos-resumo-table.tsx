import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Skeleton, Chip,
} from '@mui/material';
import type { ApontamentoByVeiculo } from '@/types/apontamentos-types';

interface VeiculosResumoTableProps {
  veiculos: ApontamentoByVeiculo[] | undefined;
  isLoading: boolean;
}

export function VeiculosResumoTable({ veiculos, isLoading }: VeiculosResumoTableProps) {
  const navigate = useNavigate();

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
        Resumo por Veiculo
      </Typography>
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width={80}>Cod</TableCell>
              <TableCell width={90}>Placa</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell width={80}>Tag</TableCell>
              <TableCell width={70} align="right">Servicos</TableCell>
              <TableCell width={70} align="right">Com OS</TableCell>
              <TableCell width={80} align="right">Pendentes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}><Skeleton /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              veiculos?.map((v) => (
                <TableRow
                  key={v.CODVEICULO}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(
                    `/manutencao/apontamentos/veiculo/${v.CODVEICULO}`,
                  )}
                >
                  <TableCell sx={{ fontSize: 13 }}>{v.CODVEICULO}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{v.PLACA ?? '-'}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{v.MARCAMODELO ?? '-'}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{v.TAG ?? '-'}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600 }}>
                    {v.QTD_SERVICOS}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 13 }}>
                    {v.QTD_COM_OS}
                  </TableCell>
                  <TableCell align="right">
                    {v.QTD_PENDENTES > 0 ? (
                      <Chip label={v.QTD_PENDENTES} size="small" color="warning" />
                    ) : (
                      <Typography variant="body2" sx={{ fontSize: 13 }}>0</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
