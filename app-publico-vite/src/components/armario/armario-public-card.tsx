import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Chip,
  Stack,
  Box,
  Divider,
} from '@mui/material';
import {
  LockOpen,
  Lock,
  LocationOn,
  Business,
  AccountTree,
  Person,
} from '@mui/icons-material';
import type { ArmarioPublico } from '@/types/armario-types';

interface ArmarioPublicCardProps {
  armario: ArmarioPublico;
}

export function ArmarioPublicCard({ armario }: ArmarioPublicCardProps) {
  const { funcionario, ocupado } = armario;

  return (
    <Card
      sx={{
        maxWidth: 420,
        width: '100%',
        mx: 'auto',
        overflow: 'hidden',
        borderRadius: '20px',
        border: 'none',
        boxShadow: '0 8px 32px rgba(27,94,32,0.12), 0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header com numero grande + status */}
      <Box
        sx={{
          background: ocupado
            ? 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)'
            : 'linear-gradient(135deg, #616161 0%, #9E9E9E 100%)',
          color: 'white',
          pt: 3,
          pb: funcionario?.fotoBase64 ? 7 : 3,
          px: 3,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Numero do armario grande */}
        <Typography
          sx={{
            fontSize: { xs: 56, sm: 64 },
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -1,
            opacity: 0.15,
            position: 'absolute',
            top: 8,
            right: 16,
            userSelect: 'none',
          }}
        >
          {armario.nuarmario}
        </Typography>

        <Typography
          variant="overline"
          sx={{
            fontSize: 11,
            letterSpacing: 2,
            opacity: 0.7,
            display: 'block',
            mb: 0.5,
          }}
        >
          ARMARIO
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: 28, sm: 32 },
            fontWeight: 800,
            letterSpacing: 1.5,
            lineHeight: 1.2,
          }}
        >
          {armario.tagArmario}
        </Typography>

        <Chip
          icon={
            ocupado
              ? <Lock sx={{ fontSize: 14, color: 'inherit !important' }} />
              : <LockOpen sx={{ fontSize: 14, color: 'inherit !important' }} />
          }
          label={ocupado ? 'OCUPADO' : 'LIVRE'}
          size="small"
          sx={{
            mt: 1.5,
            bgcolor: 'rgba(255,255,255,0.18)',
            color: 'white',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: 1,
            height: 26,
            '& .MuiChip-icon': { color: 'white' },
            backdropFilter: 'blur(4px)',
          }}
        />
      </Box>

      <CardContent sx={{ pt: 0, pb: '24px !important', px: 3, position: 'relative' }}>
        {/* Avatar flutuando sobre o header */}
        {funcionario?.fotoBase64 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: -5, mb: 2 }}>
            <Avatar
              src={funcionario.fotoBase64}
              sx={{
                width: 88,
                height: 88,
                border: '4px solid white',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              }}
            />
          </Box>
        )}

        {/* Avatar sem foto */}
        {funcionario && !funcionario.fotoBase64 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2.5, mb: 2 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: ocupado ? '#E8F5E9' : '#EEEEEE',
                color: ocupado ? '#1B5E20' : '#757575',
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {funcionario.nome.charAt(0)}
            </Avatar>
          </Box>
        )}

        {funcionario ? (
          <>
            {/* Nome centralizado */}
            <Typography
              sx={{
                fontSize: { xs: 18, sm: 20 },
                fontWeight: 700,
                textAlign: 'center',
                color: '#1B5E20',
                lineHeight: 1.3,
                mb: 0.5,
              }}
            >
              {funcionario.nome}
            </Typography>

            {/* Departamento abaixo do nome */}
            <Typography
              sx={{
                fontSize: 13,
                color: 'text.secondary',
                textAlign: 'center',
                mb: 2.5,
              }}
            >
              {funcionario.departamento || 'Sem departamento'}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {/* Info rows */}
            <Stack spacing={1.5}>
              <InfoRow
                icon={<Business sx={{ fontSize: 18 }} />}
                label="Empresa"
                value={funcionario.empresa}
              />
              <InfoRow
                icon={<AccountTree sx={{ fontSize: 18 }} />}
                label="Departamento"
                value={funcionario.departamento || 'Sem departamento'}
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
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#E8F5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Person sx={{ fontSize: 32, color: '#66BB6A' }} />
            </Box>
            <Typography
              sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary', mb: 0.5 }}
            >
              Armario disponivel
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {armario.localDescricao} - #{armario.nuarmario}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          bgcolor: '#E8F5E9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#2E7D32',
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 11, color: 'text.disabled', lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 500,
            color: 'text.primary',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}
