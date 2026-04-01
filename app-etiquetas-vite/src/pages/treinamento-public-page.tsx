import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { 
  Box, Typography, Stack, Paper, Chip, Container, CircularProgress, 
  AppBar, Toolbar, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, ToggleButton, ToggleButtonGroup 
} from '@mui/material';
import { School } from '@mui/icons-material';
import { listarTreinamentosDoColaborador } from '@/api/treinamentos';
import type { TreinamentoListItem } from '@/types/treinamento-types';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  'OK': { bg: '#02ff0f', color: '#070707' },
};

export function TreinamentoPublicPage() {
  const { codfunc } = useParams<{ codfunc: string }>();
  const [searchParams] = useSearchParams();
  const [treinamentos, setTreinamentos] = useState<TreinamentoListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nomeColaborador, setNomeColaborador] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  useEffect(() => {
    const loadTreinamentos = async () => {
      if (!codfunc) return;
      setIsLoading(true);
      try {
        const codempParam = searchParams.get('codemp');
        const codemp = codempParam ? Number(codempParam) : undefined;
        const result = await listarTreinamentosDoColaborador(Number(codfunc), codemp);
        const data = Array.isArray(result?.data) ? result.data : [];
        setTreinamentos(data);
        
        if (data.length > 0) {
          setNomeColaborador(data[0].NOMEFUNC);
        }
      } catch (error) {
        console.error('Erro ao carregar treinamentos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTreinamentos();
  }, [codfunc, searchParams]);

  const handleViewMode = (_: React.MouseEvent<HTMLElement>, value: 'card' | 'list' | null) => {
    if (value) setViewMode(value);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header Centralizado */}
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #2e7d32 100%, #2e7d32 100%)', boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'center', textAlign: 'center', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <School sx={{ mr: 1.5, fontSize: 28 }} />
                <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', letterSpacing: 1 }}>
                  TREINAMENTOS
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
                {nomeColaborador || 'Colaborador'}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="success" />
          </Box>
        ) : treinamentos.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <School sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">
              Nenhum treinamento ativo encontrado
            </Typography>
          </Box>
        ) : (
          <>
            {/* Logo Gigantão */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 900, color: '#2e7d32', letterSpacing: 2 }}>
                GIGANTÃO
              </Typography>
            </Box>

            {/* View toggle arredondado */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <ToggleButtonGroup 
                value={viewMode} 
                exclusive 
                onChange={handleViewMode} 
                size="small"
                sx={{
                  bgcolor: '#fff',
                  borderRadius: '20px',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  '& .MuiToggleButton-root': {
                    color: '#000000',
                    px: 3,
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '20px',
                    '&.Mui-selected': {
                      color: '#fff',
                      bgcolor: '#19d251',
                      '&:hover': { bgcolor: '#19d251' }
                    }
                  }
                }}
              >
                <ToggleButton value="card">Cartões</ToggleButton>
                <ToggleButton value="list">Lista</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {viewMode === 'list' ? (
              <TableContainer 
                component={Paper} 
                sx={{ 
                  mb: 2, 
                  borderRadius: 2, 
                  overflow: 'hidden', 
                  bgcolor: '#ffffff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }}
              >
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#ffffff' }}>
                    <TableRow>
                      <TableCell sx={{ color: '#25ad03', fontWeight: 700, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>Habilitação</TableCell>
                      <TableCell sx={{ color: '#25ad03', fontWeight: 700, borderBottom: '1px solid rgba(0,0,0,0.08)', textAlign: 'right' }}>Validade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {treinamentos.map((item, idx) => (
                      <TableRow key={idx}>
                        {/* Corrigido para color: '#000' para aparecer no fundo branco */}
                        <TableCell sx={{ fontSize: 12, color: '#000', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                          {item?.HABILITACAO}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, color: '#000', borderBottom: '1px solid rgba(0,0,0,0.05)', textAlign: 'right' }}>
                          {item?.DTVALIDADE}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Stack spacing={4}>
                {treinamentos.map((item, idx) => {
                  const status = String(item?.STATUS_VALIDADE ?? 'OK');
                  const statusColors = STATUS_COLORS[status] || STATUS_COLORS['OK'];
                  
                  return (
                    <Box key={idx} sx={{ borderLeft: '4px solid #09a804', pl: 2 }}>
                      <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                          <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#2e7d32', flex: 1 }}>
                            {item?.HABILITACAO}
                          </Typography>
                          <Chip
                            label={status}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: 10, bgcolor: statusColors.bg, color: statusColors.color }}
                          />
                        </Box>

                        <Stack spacing={1} sx={{ fontSize: 12, color: '#000000' }}>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                            <Box>
                              <Typography sx={{ fontSize: 10, color: '#000000', fontWeight: 700, mb: 0.25 }}>EMISSÃO</Typography>
                              <Typography variant="body2">{item?.DTEMISSAO}</Typography>
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: 10, color: '#000000', fontWeight: 700, mb: 0.25 }}>VALIDADE</Typography>
                              <Typography variant="body2">{item?.DTVALIDADE}</Typography>
                            </Box>
                          </Box>
                          {item?.DESCRCARGO && (
                            <Box>
                              <Typography sx={{ fontSize: 10, color: '#000000', fontWeight: 700, mb: 0.25 }}>CARGO</Typography>
                              <Typography variant="body2">{item.DESCRCARGO}</Typography>
                            </Box>
                          )}
                          {item?.RAZAOSOCIAL && (
                            <Box>
                              <Typography sx={{ fontSize: 10, color: '#000000', fontWeight: 700, mb: 0.25 }}>EMPRESA</Typography>
                              <Typography variant="body2">{item.RAZAOSOCIAL}</Typography>
                            </Box>
                          )}
                        </Stack>
                        <Box sx={{ height: '1px', bgcolor: 'rgba(0, 0, 0, 0.08)', mt: 1 }} />
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}