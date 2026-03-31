import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Stack, Paper, Chip, Container, CircularProgress, AppBar, Toolbar } from '@mui/material';
import { School } from '@mui/icons-material';
import { listarTreinamentosDoColaborador } from '@/api/treinamentos';
import type { TreinamentoListItem } from '@/types/treinamento-types';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  'OK': { bg: 'rgba(46,125,50,0.12)', color: '#2e7d32' },
  'VENCIDO': { bg: 'rgba(211,47,47,0.12)', color: '#d32f2f' },
  'PROXIMO': { bg: 'rgba(245,127,0,0.12)', color: '#f57c00' },
};

export function TreinamentoPublicPage() {
  const { codfunc } = useParams<{ codfunc: string }>();
  const [treinamentos, setTreinamentos] = useState<TreinamentoListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nomeColaborador, setNomeColaborador] = useState('');

  useEffect(() => {
    const loadTreinamentos = async () => {
      if (!codfunc) return;
      setIsLoading(true);
      try {
        const result = await listarTreinamentosDoColaborador(Number(codfunc));
        const data = Array.isArray(result?.data) ? result.data : [];
        setTreinamentos(data);
        
        // Pegar o nome do primeiro registro
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
  }, [codfunc]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' }}>
        <Toolbar>
          <School sx={{ mr: 1.5, fontSize: 28 }} />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>
              TREINAMENTOS ATIVOS
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
              {nomeColaborador || 'Colaborador'}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="sm" sx={{ py: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : treinamentos.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <School sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">
              Nenhum treinamento ativo encontrado
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {treinamentos.map((item) => {
              const statusColors = STATUS_COLORS[item.STATUS_VALIDADE] || STATUS_COLORS['OK'];
              return (
                <Paper
                  key={`${item.CODFUNC}-${item.HABILITACAO}`}
                  sx={{
                    p: 2.5,
                    borderLeft: '4px solid #1976d2',
                  }}
                >
                  <Stack spacing={1}>
                    {/* Header com Status */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#333', flex: 1 }}>
                        {item.HABILITACAO}
                      </Typography>
                      <Chip
                        label={item.STATUS_VALIDADE || 'OK'}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: 10,
                          bgcolor: statusColors.bg,
                          color: statusColors.color,
                        }}
                      />
                    </Box>

                    {/* Informações */}
                    <Stack spacing={0.5} sx={{ fontSize: 12, color: '#666' }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        <Box>
                          <Typography sx={{ fontSize: 10, color: '#999', fontWeight: 600, mb: 0.25 }}>
                            EMISSÃO
                          </Typography>
                          <Typography>{item.DTEMISSAO}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 10, color: '#999', fontWeight: 600, mb: 0.25 }}>
                            VALIDADE
                          </Typography>
                          <Typography>{item.DTVALIDADE}</Typography>
                        </Box>
                      </Box>
                      {item.DESCRCARGO && (
                        <Box>
                          <Typography sx={{ fontSize: 10, color: '#999', fontWeight: 600, mb: 0.25 }}>
                            CARGO
                          </Typography>
                          <Typography>{item.DESCRCARGO}</Typography>
                        </Box>
                      )}
                      {item.RAZAOSOCIAL && (
                        <Box>
                          <Typography sx={{ fontSize: 10, color: '#999', fontWeight: 600, mb: 0.25 }}>
                            EMPRESA
                          </Typography>
                          <Typography>{item.RAZAOSOCIAL}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
