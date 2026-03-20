import { useParams } from 'react-router-dom';
import {
  Avatar, Box, Typography, Stack, Skeleton, Chip, Divider,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Lock, LockOpen, LocationOn, Business, AccountTree } from '@mui/icons-material';
import { useArmarioPublico } from '@/hooks/use-armario';

const greenTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1B5E20', light: '#4CAF50', dark: '#1B5E20' },
    secondary: { main: '#2E7D32' },
    background: { default: '#F5F7FA', paper: '#ffffff' },
  },
  typography: { fontFamily: "'Inter', 'Roboto', sans-serif" },
  shape: { borderRadius: 12 },
});

export function ArmarioPublicPage() {
  const { codarmario: raw } = useParams<{ codarmario: string }>();
  const codarmario = raw ? Number(raw) : 0;
  const { data: armario, isLoading, isError } = useArmarioPublico(codarmario);

  const func = armario?.funcionario;
  const ocupado = armario?.ocupado ?? false;

  return (
    <ThemeProvider theme={greenTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100dvh',
          background: 'linear-gradient(180deg, #E8F5E9 0%, #F5F7FA 40%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          pt: { xs: 2.5, sm: 5 }, px: 2, pb: 3,
        }}
      >
        {/* Branding */}
        <Stack alignItems="center" spacing={0.25} sx={{ mb: { xs: 2.5, sm: 4 } }}>
          <Typography sx={{
            fontFamily: "'STOP', 'Arial Black', sans-serif",
            fontSize: { xs: 20, sm: 24 }, fontWeight: 400,
            letterSpacing: '0.08em', color: '#1B5E20', lineHeight: 1,
          }}>
            GIGANTÃO
          </Typography>
          <Typography sx={{
            fontSize: 9, letterSpacing: 1.5, color: '#66BB6A', fontWeight: 600,
          }}>
            ENGENHARIA DE MOVIMENTAÇÃO
          </Typography>
        </Stack>

        {/* Loading */}
        {isLoading && <LoadingSkeleton />}

        {/* Error / Not Found */}
        {!isLoading && (isError || !armario) && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography sx={{ fontSize: 48, mb: 1, color: '#E65100' }}>404</Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              Armário não encontrado
            </Typography>
            <Typography sx={{ fontSize: 14, color: 'text.secondary', maxWidth: 260, mx: 'auto' }}>
              Verifique o QR code e tente novamente.
            </Typography>
          </Box>
        )}

        {/* Card */}
        {!isLoading && armario && (
          <Box sx={{
            maxWidth: 420, width: '100%', mx: 'auto', borderRadius: '20px',
            overflow: 'hidden', bgcolor: '#fff',
            boxShadow: '0 8px 32px rgba(27,94,32,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          }}>
            {/* Header */}
            <Box sx={{
              background: ocupado
                ? 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)'
                : 'linear-gradient(135deg, #616161 0%, #9E9E9E 100%)',
              color: '#fff', pt: 3, pb: func?.fotoBase64 ? 7 : 3, px: 3,
              textAlign: 'center', position: 'relative',
            }}>
              <Typography sx={{
                fontSize: { xs: 56, sm: 64 }, fontWeight: 900, lineHeight: 1,
                opacity: 0.15, position: 'absolute', top: 8, right: 16, userSelect: 'none',
              }}>
                {armario.nuarmario}
              </Typography>
              <Typography variant="overline" sx={{
                fontSize: 11, letterSpacing: 2, opacity: 0.7, display: 'block', mb: 0.5,
              }}>
                ARMÁRIO
              </Typography>
              <Typography sx={{
                fontSize: { xs: 28, sm: 32 }, fontWeight: 800, letterSpacing: 1.5, lineHeight: 1.2,
              }}>
                {armario.tagArmario}
              </Typography>
              <Chip
                icon={ocupado
                  ? <Lock sx={{ fontSize: 14, color: 'inherit !important' }} />
                  : <LockOpen sx={{ fontSize: 14, color: 'inherit !important' }} />}
                label={ocupado ? 'OCUPADO' : 'LIVRE'}
                size="small"
                sx={{
                  mt: 1.5, bgcolor: 'rgba(255,255,255,0.18)', color: '#fff',
                  fontWeight: 700, fontSize: 11, letterSpacing: 1, height: 26,
                  '& .MuiChip-icon': { color: '#fff' }, backdropFilter: 'blur(4px)',
                }}
              />
            </Box>

            {/* Content */}
            <Box sx={{ pt: 0, pb: 3, px: 3, position: 'relative' }}>
              {/* Photo avatar */}
              {func?.fotoBase64 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: -5, mb: 2 }}>
                  <Avatar
                    src={func.fotoBase64}
                    sx={{
                      width: 88, height: 88, border: '4px solid white',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    }}
                  />
                </Box>
              )}
              {/* Initials avatar */}
              {func && !func.fotoBase64 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2.5, mb: 2 }}>
                  <Avatar sx={{
                    width: 72, height: 72,
                    bgcolor: ocupado ? '#E8F5E9' : '#EEE',
                    color: ocupado ? '#1B5E20' : '#757575',
                    fontSize: 28, fontWeight: 700,
                  }}>
                    {func.nome?.charAt(0) || 'F'}
                  </Avatar>
                </Box>
              )}

              {func ? (
                <>
                  <Typography sx={{
                    fontSize: { xs: 18, sm: 20 }, fontWeight: 700,
                    textAlign: 'center', color: '#1B5E20', lineHeight: 1.3, mb: 0.5,
                  }}>
                    {func.nome}
                  </Typography>
                  <Typography sx={{
                    fontSize: 13, color: 'text.secondary', textAlign: 'center', mb: 2.5,
                  }}>
                    {func.departamento || 'Sem departamento'}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1.5}>
                    <InfoRow
                      icon={<Business sx={{ fontSize: 18 }} />}
                      label="Empresa" value={func.empresa}
                    />
                    <InfoRow
                      icon={<AccountTree sx={{ fontSize: 18 }} />}
                      label="Departamento" value={func.departamento || 'Sem departamento'}
                    />
                    <InfoRow
                      icon={<LocationOn sx={{ fontSize: 18 }} />}
                      label="Local"
                      value={`${armario.localDescricao} - #${armario.nuarmario}`}
                    />
                  </Stack>
                </>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Box sx={{
                    width: 64, height: 64, borderRadius: '50%', bgcolor: '#E8F5E9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 2,
                  }}>
                    <LockOpen sx={{ fontSize: 32, color: '#66BB6A' }} />
                  </Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                    Armário disponível
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                    {armario.localDescricao} - #{armario.nuarmario}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Footer */}
        <Typography sx={{
          mt: 'auto', pt: 4, fontSize: 11, color: '#A5D6A7', fontWeight: 500, letterSpacing: 0.5,
        }}>
          publico.gigantao.net
        </Typography>
      </Box>
    </ThemeProvider>
  );
}

function LoadingSkeleton() {
  return (
    <Box sx={{
      maxWidth: 420, width: '100%', borderRadius: '20px', overflow: 'hidden',
      bgcolor: '#fff', boxShadow: '0 8px 32px rgba(27,94,32,0.12)',
    }}>
      <Skeleton variant="rectangular" height={140} sx={{ bgcolor: 'rgba(27,94,32,0.08)' }} />
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Skeleton variant="circular" width={88} height={88} sx={{ mx: 'auto', mt: -5, mb: 2 }} />
        <Skeleton width="50%" height={28} sx={{ mx: 'auto', mb: 0.5 }} />
        <Skeleton width="35%" height={18} sx={{ mx: 'auto', mb: 3 }} />
        <Stack spacing={1.5}>
          {[1, 2, 3].map(i => (
            <Stack key={i} direction="row" spacing={1.5} alignItems="center">
              <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '8px' }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="30%" height={14} />
                <Skeleton width="65%" height={18} />
              </Box>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box sx={{
        width: 32, height: 32, borderRadius: '8px', bgcolor: '#E8F5E9',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: '#2E7D32',
      }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 11, color: 'text.disabled', lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography sx={{
          fontSize: 14, fontWeight: 500, color: 'text.primary', lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}
