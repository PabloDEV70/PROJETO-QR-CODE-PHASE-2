import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Skeleton,
  Card,
  CardContent,
  Alert,
  Stack,
} from '@mui/material';
import { SentimentDissatisfied } from '@mui/icons-material';
import { ArmarioPublicCard } from '@/components/armario/armario-public-card';
import { fetchArmarioPublico } from '@/api/armario';
import type { ArmarioPublico } from '@/types/armario-types';

export function ArmarioPublicPage() {
  const { codarmario } = useParams<{ codarmario: string }>();
  const [armario, setArmario] = useState<ArmarioPublico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const id = Number(codarmario);
    if (!codarmario || isNaN(id) || id < 1) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    fetchArmarioPublico(id)
      .then((data) => {
        if (!data) {
          setNotFound(true);
        } else {
          setArmario(data);
        }
      })
      .catch(() => {
        setError('Erro ao carregar dados do armario. Tente novamente.');
      })
      .finally(() => setLoading(false));
  }, [codarmario]);

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #E8F5E9 0%, #F5F7FA 40%, #F5F7FA 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: { xs: 2.5, sm: 5 },
        px: 2,
        pb: 3,
      }}
    >
      {/* Logo / Branding */}
      <Stack alignItems="center" spacing={0.25} sx={{ mb: { xs: 2.5, sm: 4 } }}>
        <Typography
          sx={{
            fontFamily: "'STOP', 'Arial Black', sans-serif",
            fontSize: { xs: 20, sm: 24 },
            fontWeight: 400,
            letterSpacing: '0.08em',
            color: '#1B5E20',
            lineHeight: 1,
          }}
        >
          GIGANTAO
        </Typography>
        <Typography
          sx={{
            fontSize: 9,
            letterSpacing: 1.5,
            color: '#66BB6A',
            fontWeight: 600,
          }}
        >
          ENGENHARIA DE MOVIMENTACAO
        </Typography>
      </Stack>

      {/* Loading Skeleton */}
      {loading && (
        <Card
          sx={{
            maxWidth: 420,
            width: '100%',
            borderRadius: '20px',
            overflow: 'hidden',
            border: 'none',
            boxShadow: '0 8px 32px rgba(27,94,32,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Skeleton
            variant="rectangular"
            height={140}
            sx={{ bgcolor: 'rgba(27,94,32,0.08)' }}
          />
          <CardContent sx={{ pt: 0, textAlign: 'center' }}>
            <Skeleton
              variant="circular"
              width={88}
              height={88}
              sx={{ mx: 'auto', mt: -5, mb: 2 }}
            />
            <Skeleton width="50%" height={28} sx={{ mx: 'auto', mb: 0.5 }} />
            <Skeleton width="35%" height={18} sx={{ mx: 'auto', mb: 3 }} />
            <Stack spacing={1.5}>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Not Found */}
      {notFound && !loading && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: '#FFF3E0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <SentimentDissatisfied sx={{ fontSize: 40, color: '#E65100' }} />
          </Box>
          <Typography
            sx={{ fontSize: 18, fontWeight: 700, color: 'text.primary', mb: 0.5 }}
          >
            Armario nao encontrado
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary', maxWidth: 260, mx: 'auto' }}>
            Verifique o QR code e tente novamente.
          </Typography>
        </Box>
      )}

      {/* Error */}
      {error && !loading && (
        <Alert
          severity="error"
          sx={{
            maxWidth: 420,
            width: '100%',
            borderRadius: '12px',
          }}
        >
          {error}
        </Alert>
      )}

      {/* Armario Card */}
      {armario && !loading && <ArmarioPublicCard armario={armario} />}

      {/* Footer */}
      <Typography
        sx={{
          mt: 'auto',
          pt: 4,
          fontSize: 11,
          color: '#A5D6A7',
          fontWeight: 500,
          letterSpacing: 0.5,
        }}
      >
        publico.gigantao.net
      </Typography>
    </Box>
  );
}

function SkeletonRow() {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '8px' }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton width="30%" height={14} />
        <Skeleton width="65%" height={18} />
      </Box>
    </Stack>
  );
}
