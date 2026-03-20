import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { Search, Warning, CheckCircle } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { investigarDocumento } from '@/api/permissions';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';

export default function InvestigarDocumentoPage() {
  const [nunota, setNunota] = useState('');
  const [numnota, setNumnota] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['investigar', nunota || numnota],
    queryFn: () => investigarDocumento({
      nunota: nunota ? Number(nunota) : undefined,
      numnota: numnota ? Number(numnota) : undefined,
    }),
    enabled: !!nunota || !!numnota,
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Investigar Documento
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Investigue documentos, registros e historico no Sankhya
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="NUNOTA (Codigo interno)"
              value={nunota}
              onChange={(e) => setNunota(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="NUMNOTA (Numero do documento)"
              value={numnota}
              onChange={(e) => setNumnota(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Search />}
              onClick={() => refetch()}
              disabled={!nunota && !numnota}
            >
              Pesquisar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {isLoading && <LoadingSkeleton message="Investigando..." />}

      {error && (
        <Alert severity="error">
          Erro ao investigar documento: {error instanceof Error ? error.message : 'Erro desconhecido'}
        </Alert>
      )}

      {data && (
        <>
          {data.excluido ? (
            <Alert severity="warning" icon={<Warning />} sx={{ mb: 3 }}>
              Este documento foi EXCLUIDO (esta na tabela {data.tabelaOriginal})
            </Alert>
          ) : (
            <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
              Documento ativo
            </Alert>
          )}

          <Grid container spacing={3}>
            {data.cab && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Cabecalho
                  </Typography>
                  <Divider />
                  <Table size="small">
                    <TableBody>
                      {Object.entries(data.cab).slice(0, 20).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>{key}</TableCell>
                          <TableCell>{String(value ?? '-')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
            )}

            {data.itens && data.itens.length > 0 && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Itens ({data.itens.length})
                  </Typography>
                  <Divider />
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Sequencia</TableCell>
                        <TableCell>Produto</TableCell>
                        <TableCell align="right">Quantidade</TableCell>
                        <TableCell align="right">Valor Unit.</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.itens.slice(0, 10).map((item: Record<string, unknown>, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{String(item.SEQUENCIA ?? '-')}</TableCell>
                          <TableCell>{String(item.CODPROD ?? '-')}</TableCell>
                          <TableCell align="right">{String(item.QTDNEG ?? '-')}</TableCell>
                          <TableCell align="right">{String(item.VLRUNIT ?? '-')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Box>
  );
}
