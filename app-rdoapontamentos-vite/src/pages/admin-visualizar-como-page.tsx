import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Typography } from '@mui/material';
import { Visibility, PlayArrow, Stop, ContentCopy } from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth-store';
import { PageLayout } from '@/components/layout/page-layout';
import { FuncionarioCombobox } from '@/components/shared/funcionario-combobox';

export function AdminVisualizarComoPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const impersonating = useAuthStore((s) => s.impersonating);
  const startImpersonating = useAuthStore((s) => s.startImpersonating);
  const stopImpersonating = useAuthStore((s) => s.stopImpersonating);

  const asParc = searchParams.get('asParc');

  const [selectedCodparc, setSelectedCodparc] = useState<number | null>(
    asParc ? parseInt(asParc, 10) : null
  );
  const [selectedNome, setSelectedNome] = useState('');

  useEffect(() => {
    if (asParc && !impersonating) {
      startImpersonating(parseInt(asParc, 10), `Parc ${asParc}`);
    }
  }, [asParc, impersonating, startImpersonating]);

  const handleChange = useCallback((codparc: number | null, nome?: string) => {
    setSelectedCodparc(codparc);
    setSelectedNome(nome ?? '');
    
    if (codparc) {
      setSearchParams({ asParc: String(codparc) });
    } else {
      setSearchParams({});
    }
  }, [setSearchParams]);

  const handleStart = useCallback(() => {
    if (!selectedCodparc) return;
    startImpersonating(selectedCodparc, `Parc ${selectedCodparc}`);
    navigate('/');
  }, [selectedCodparc, startImpersonating, navigate]);

  const handleStop = useCallback(() => {
    stopImpersonating();
    setSelectedCodparc(null);
    setSelectedNome('');
    setSearchParams({});
  }, [stopImpersonating, setSearchParams]);

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/?asParc=${selectedCodparc}`;
    navigator.clipboard.writeText(url);
  };

  if (!isAdmin) {
    return <Alert severity="error">Acesso restrito a administradores</Alert>;
  }

  return (
    <PageLayout title="Visualizar Como" icon={Visibility}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Selecione um colaborador para visualizar o app como se fosse ele.
        Use o parametro <code>asParc=123</code> na URL para compartir.
      </Alert>

      {impersonating && (
        <Card
          sx={{
            mb: 3,
            border: '2px solid #F59E0B',
            bgcolor: 'rgba(245,158,11,0.06)',
          }}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, '&:last-child': { pb: 2 } }}>
            <Visibility sx={{ color: '#F59E0B', fontSize: 28 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Visualizando como:
              </Typography>
              <Typography variant="subtitle1" fontWeight={700}>
                Parc {impersonating.codparc}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ fontFamily: 'monospace', cursor: 'pointer' }}
                onClick={handleCopyUrl}
              >
                ?asParc={impersonating.codparc}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              startIcon={<ContentCopy />}
              onClick={handleCopyUrl}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Copiar
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<Stop />}
              onClick={handleStop}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Parar
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {impersonating ? 'Trocar para outro:' : 'Buscar colaborador:'}
          </Typography>
          <FuncionarioCombobox
            value={selectedCodparc}
            onChange={handleChange}
            label="Colaborador"
            placeholder="Digite o nome para buscar..."
            size="medium"
          />
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={handleStart}
            disabled={!selectedCodparc}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              alignSelf: 'flex-start',
            }}
          >
            Visualizar
          </Button>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default AdminVisualizarComoPage;
