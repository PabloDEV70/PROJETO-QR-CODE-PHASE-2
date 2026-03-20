import { useParams } from 'react-router-dom';
import {
  Box, Typography, Stack, Skeleton, Paper, Avatar,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QRCodeSVG } from 'qrcode.react';
import { useFuncionarioCard } from '@/hooks/use-funcionario-card';
import { getFuncionarioFotoByCodfuncUrl } from '@/api/funcionarios';
import { SituacaoBadge } from '@/components/funcionarios/situacao-badge';

const lightTheme = createTheme({
  palette: { mode: 'light' },
  typography: { fontFamily: "'Inter', sans-serif" },
});

function fmtDateSimple(dt: string | null): string {
  if (!dt) return '-';
  try {
    const d = new Date(dt);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dt;
  }
}

export function FuncionarioPublicCardPage() {
  const { codemp: rawEmp, codfunc: rawFunc } = useParams<{
    codemp: string;
    codfunc: string;
  }>();
  const codemp = rawEmp ? Number(rawEmp) : 0;
  const codfunc = rawFunc ? Number(rawFunc) : 0;
  const { data: card, isLoading, isError } = useFuncionarioCard(codemp, codfunc);

  const url = `${window.location.origin}/p/func/${codemp}/${codfunc}`;
  const fotoUrl = getFuncionarioFotoByCodfuncUrl(codemp, codfunc);

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f1f5f9',
          p: 2,
        }}
      >
        {isLoading && (
          <Paper sx={{ p: 4, borderRadius: '16px', maxWidth: 380, width: '100%' }}>
            <Stack alignItems="center" spacing={2}>
              <Skeleton variant="circular" width={100} height={100} />
              <Skeleton variant="rounded" width={200} height={24} />
              <Skeleton variant="rounded" width={160} height={16} />
              <Skeleton variant="rounded" width={120} height={120} />
            </Stack>
          </Paper>
        )}

        {!isLoading && (isError || !card) && (
          <Paper sx={{ p: 4, borderRadius: '16px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 48, mb: 1 }}>404</Typography>
            <Typography sx={{ color: '#64748b' }}>
              Funcionario nao encontrado.
            </Typography>
          </Paper>
        )}

        {!isLoading && card && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '16px',
              maxWidth: 380,
              width: '100%',
              textAlign: 'center',
              border: '1px solid rgba(148,163,184,0.2)',
            }}
          >
            <Avatar
              src={fotoUrl}
              sx={{
                width: 100, height: 100, mx: 'auto', mb: 2,
                bgcolor: '#3b82f6', fontSize: 36, fontWeight: 700,
              }}
            >
              {card.nome?.charAt(0) || '?'}
            </Avatar>

            <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>
              {card.nome}
            </Typography>

            <Typography sx={{ fontSize: 14, color: '#475569', mt: 0.5 }}>
              {[card.cargo, card.funcao].filter(Boolean).join(' · ') || '-'}
            </Typography>

            {card.departamento && (
              <Typography sx={{ fontSize: 13, color: '#64748b', mt: 0.25 }}>
                {card.departamento}
              </Typography>
            )}

            {card.empresa && (
              <Typography sx={{ fontSize: 13, color: '#64748b', fontWeight: 600, mt: 1 }}>
                {card.empresa}
              </Typography>
            )}

            <Stack
              direction="row"
              justifyContent="center"
              spacing={1.5}
              alignItems="center"
              sx={{ mt: 2 }}
            >
              <SituacaoBadge
                situacao={card.situacao}
                label={card.situacaoLabel}
                size="md"
              />
              <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
                Matricula: {card.codemp}-{card.codfunc}
              </Typography>
            </Stack>

            {card.dtadm && (
              <Typography sx={{ fontSize: 12, color: '#94a3b8', mt: 0.5 }}>
                Admissao: {fmtDateSimple(card.dtadm)}
              </Typography>
            )}

            <Box sx={{ mt: 3, display: 'inline-flex', p: 1.5, bgcolor: '#fff', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.15)' }}>
              <QRCodeSVG value={url} size={140} level="H" bgColor="#ffffff" fgColor="#1e293b" />
            </Box>

            <Typography sx={{ fontSize: 10, color: '#cbd5e1', mt: 1 }}>
              Escaneie para ver este perfil
            </Typography>
          </Paper>
        )}
      </Box>
    </ThemeProvider>
  );
}
