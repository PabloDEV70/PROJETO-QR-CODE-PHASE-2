import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { 
  Box, Typography, Stack, Paper, Chip, Container, CircularProgress, 
  AppBar, Toolbar, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, ToggleButton, ToggleButtonGroup 
} from '@mui/material';
import { School } from '@mui/icons-material';
import { listarTreinamentosDoColaborador } from '@/api/treinamentos';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar'; 
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
  const [cargoColaborador, setCargoColaborador] = useState(''); // Estado para o Cargo
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const codemp = Number(searchParams.get('codemp')) || 1;

  useEffect(() => {
    const loadTreinamentos = async () => {
      if (!codfunc) return;
      setIsLoading(true);
      try {
        const result = await listarTreinamentosDoColaborador(Number(codfunc), codemp);
        const data = Array.isArray(result?.data) ? result.data : [];
        setTreinamentos(data);
        
        if (data.length > 0) {
          setNomeColaborador(data[0].NOMEFUNC);
          setCargoColaborador(data[0].DESCRCARGO); // Puxando o Cargo aqui
        }
      } catch (error) {
        console.error('Erro ao carregar treinamentos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTreinamentos();
  }, [codfunc, codemp]);

  const handleViewMode = (_: React.MouseEvent<HTMLElement>, value: 'card' | 'list' | null) => {
    if (value) setViewMode(value);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      
      {/* Header Estilizado como Cartão de Identidade */}
      <AppBar position="static" sx={{ 
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        pt: 2, pb: 4,
        borderRadius: '0 0 32px 32px' 
      }}>
        <Toolbar sx={{ flexDirection: 'column', gap: 2 }}>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.8, mb: 1 }}>
            <Typography sx={{ fontFamily: "'STOP', sans-serif", fontSize: 16, color: '#fff', letterSpacing: 2 }}>
              GIGANTAO
            </Typography>
            <Typography sx={{ fontSize: 7, fontWeight: 700, color: '#fff', letterSpacing: 3 }}>
              ENGENHARIA DE MOVIMENTAÇÃO
            </Typography>
          </Box>

          <Box sx={{ 
            position: 'relative',
            border: '4px solid #fff', 
            borderRadius: '50%', 
            p: 0.5,
            bgcolor: 'rgba(255,255,255,0.1)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
          }}>
            <FuncionarioAvatar
              codfunc={Number(codfunc)}
              codemp={codemp}
              nome={nomeColaborador}
              size="large"
              sx={{ width: 120, height: 120 }} 
            />
            <Box sx={{ 
              position: 'absolute', bottom: 5, right: 5, 
              bgcolor: '#02ff0f', borderRadius: '50%', p: 0.5,
              border: '3px solid #1b5e20', display: 'flex'
            }}>
              <School sx={{ fontSize: 16, color: '#000' }} />
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>
              {nomeColaborador || 'Colaborador'}
            </Typography>
            
            {/* CARGO ADICIONADO AQUI ABAIXO DO NOME */}
            <Typography sx={{ fontSize: 14, color: '#02ff0f', fontWeight: 700, mt: 0.5, textTransform: 'uppercase' }}>
              {cargoColaborador}
            </Typography>

            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500, mt: 1 }}>
              CONSULTA DE TREINAMENTOS ATIVOS
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: -3 }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <ToggleButtonGroup 
            value={viewMode} 
            exclusive 
            onChange={handleViewMode} 
            size="small"
            sx={{
              bgcolor: '#fff',
              borderRadius: '30px',
              p: 0.5,
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              border: 'none',
              '& .MuiToggleButton-root': {
                color: '#666',
                px: 4, py: 1,
                fontWeight: 700,
                border: 'none',
                borderRadius: '25px !important',
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  color: '#fff',
                  bgcolor: '#2e7d32',
                  boxShadow: '0 4px 10px rgba(46,125,50,0.3)',
                  '&:hover': { bgcolor: '#1b5e20' }
                }
              }
            }}
          >
            <ToggleButton value="card">CARD</ToggleButton>
            <ToggleButton value="list">LISTA</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="success" />
          </Box>
        ) : (
          <Stack spacing={3} sx={{ pb: 6 }}>
            {treinamentos.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
                <School sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">Nenhum treinamento encontrado</Typography>
              </Paper>
            ) : viewMode === 'list' ? (
              <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f1f8e9' }}>
                    <TableRow>
                      <TableCell sx={{ color: '#2e7d32', fontWeight: 700 }}>HABILITAÇÃO</TableCell>
                      <TableCell sx={{ color: '#2e7d32', fontWeight: 700, textAlign: 'right' }}>VALIDADE</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {treinamentos.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{item?.HABILITACAO}</TableCell>
                        {/* DATA VERDE NA LISTA */}
                        <TableCell sx={{ fontSize: 12, textAlign: 'right', fontWeight: 700, color: '#2e7d32' }}>
                          {item?.DTVALIDADE}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              treinamentos.map((item, idx) => {
                const status = String(item?.STATUS_VALIDADE ?? 'OK');
                const statusColors = STATUS_COLORS[status] || STATUS_COLORS['OK'];
                return (
                  <Paper key={idx} sx={{ 
                    p: 2.5, borderRadius: 4, position: 'relative', overflow: 'hidden',
                    border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, bgcolor: '#2e7d32' }
                  }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#1b5e20', pr: 4 }}>
                          {item?.HABILITACAO}
                        </Typography>
                        <Chip label={status} size="small" sx={{ fontWeight: 900, fontSize: 10, bgcolor: statusColors.bg, color: statusColors.color, borderRadius: '6px' }} />
                      </Box>
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, bgcolor: '#f9f9f9', p: 1.5, borderRadius: 2 }}>
                        <Box>
                          <Typography sx={{ fontSize: 9, color: '#888', fontWeight: 700 }}>EMISSÃO</Typography>
                          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{item?.DTEMISSAO}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 9, color: '#888888', fontWeight: 700 }}>VALIDADE</Typography>
                          {/* DATA VERDE NO CARD */}
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2e7d32' }}>{item?.DTVALIDADE}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ px: 0.5 }}>
                        <Typography sx={{ fontSize: 9, color: '#888', fontWeight: 700 }}>EMPRESA</Typography>
                        <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#444' }}>{item?.RAZAOSOCIAL}</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })
            )}
          </Stack>
        )}
      </Container>
    </Box>
  );
}