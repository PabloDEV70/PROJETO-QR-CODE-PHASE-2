import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, alpha, Paper,
} from '@mui/material';
import { Visibility, ExitToApp, PersonSearch } from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth-store';
import { useImpersonationNav } from '@/hooks/use-impersonation-sync';
import { FuncionarioCombobox } from '@/components/shared/funcionario-combobox';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';

export function AdminVerComoPage() {
  const navigate = useNavigate();
  const impersonating = useAuthStore((s) => s.impersonating);
  const { stopViewAs } = useImpersonationNav();

  const [selectedCodparc, setSelectedCodparc] = useState<number | null>(null);
  const [selectedNome, setSelectedNome] = useState<string>('');

  const handleSelect = useCallback((codparc: number | null, nome?: string) => {
    setSelectedCodparc(codparc);
    setSelectedNome(nome ?? '');
  }, []);

  const handleStart = () => {
    if (!selectedCodparc || !selectedNome) return;
    navigate(`/?viewAsCodParc=${selectedCodparc}&viewAsNome=${encodeURIComponent(selectedNome)}`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 500, mx: 'auto' }}>
      {/* Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <PersonSearch sx={{ fontSize: 28, color: 'primary.main' }} />
        <Box>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.3 }}>
            Visualizar como
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', fontWeight: 500 }}>
            Veja e gerencie o RDO de qualquer colaborador
          </Typography>
        </Box>
      </Box>

      {/* Currently impersonating */}
      {impersonating && (
        <Paper
          elevation={0}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            p: 2, borderRadius: 2.5,
            bgcolor: alpha('#F59E0B', 0.1),
            border: '1px solid',
            borderColor: alpha('#F59E0B', 0.3),
          }}
        >
          <Visibility sx={{ fontSize: 20, color: '#F59E0B' }} />
          <FuncionarioAvatar
            codparc={impersonating.codparc}
            nome={impersonating.nome}
            size="medium"
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
              {impersonating.nome}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontFamily: 'monospace' }}>
              #{impersonating.codparc}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ExitToApp sx={{ fontSize: 16 }} />}
            onClick={stopViewAs}
            sx={{
              textTransform: 'none', fontWeight: 700, fontSize: '0.75rem',
              borderColor: '#F59E0B', color: '#F59E0B',
              '&:hover': { borderColor: '#D97706', bgcolor: alpha('#F59E0B', 0.08) },
            }}
          >
            Parar
          </Button>
        </Paper>
      )}

      {/* Search */}
      <Box>
        <Typography sx={{
          fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary',
          textTransform: 'uppercase', letterSpacing: 1.5, mb: 1,
        }}>
          Selecionar colaborador
        </Typography>
        <FuncionarioCombobox
          value={selectedCodparc}
          onChange={handleSelect}
          label="Buscar colaborador"
          placeholder="Nome, codigo ou departamento..."
          size="medium"
        />
      </Box>

      {/* Preview + Start */}
      {selectedCodparc && (
        <Paper
          elevation={0}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            p: 2, borderRadius: 2.5,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
            border: '1px solid',
            borderColor: (t) => alpha(t.palette.primary.main, 0.2),
          }}
        >
          <FuncionarioAvatar
            codparc={selectedCodparc}
            nome={selectedNome}
            size="large"
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {selectedNome}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontFamily: 'monospace' }}>
              #{selectedCodparc}
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="medium"
            startIcon={<Visibility sx={{ fontSize: 18 }} />}
            onClick={handleStart}
            disableElevation
            sx={{
              textTransform: 'none', fontWeight: 800, fontSize: '0.85rem',
              borderRadius: 2, px: 2.5,
            }}
          >
            Ver como
          </Button>
        </Paper>
      )}
    </Box>
  );
}

export default AdminVerComoPage;
