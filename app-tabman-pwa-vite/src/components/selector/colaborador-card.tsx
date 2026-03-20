import { useState, useCallback, useMemo } from 'react';
import { Paper, Avatar, Typography, Box, alpha } from '@mui/material';
import { FiberManualRecord } from '@mui/icons-material';
import type { ColaboradorGrid } from '@/types/funcionario-types';
import { getFotoUrl } from '@/api/funcionarios';

interface ColaboradorCardProps {
  colaborador: ColaboradorGrid;
  onClick: () => void;
  atividade?: { sigla: string; hrini: string } | null;
}

function getInitials(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  return ((parts[0]?.charAt(0) ?? '') + (parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : '')).toUpperCase();
}

export function ColaboradorCard({ colaborador, onClick, atividade }: ColaboradorCardProps) {
  const [imgError, setImgError] = useState(false);
  const handleImgError = useCallback(() => setImgError(true), []);
  const fotoUrl = useMemo(() => getFotoUrl(colaborador.codparc), [colaborador.codparc]);
  const initials = useMemo(() => getInitials(colaborador.nomeparc), [colaborador.nomeparc]);
  const showPhoto = colaborador.temFoto && !imgError;
  const isActive = !!atividade;
  const isAfastado = colaborador.situacao !== null && colaborador.situacao !== '1';
  const emFerias = colaborador.emFerias ?? false;
  const situacaoLabel = emFerias ? 'Em ferias' : (colaborador.situacaoLabel ?? null);

  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        cursor: 'pointer',
        p: 1.5,
        display: 'flex',
        gap: 1.5,
        borderRadius: 2,
        border: '2px solid',
        borderColor: emFerias ? 'info.main' : isAfastado ? 'warning.main' : isActive ? 'primary.main' : 'divider',
        bgcolor: emFerias
          ? (t) => alpha(t.palette.info.main, 0.05)
          : isAfastado
            ? (t) => alpha(t.palette.warning.main, 0.04)
            : isActive ? (t) => alpha(t.palette.primary.main, 0.03) : 'background.paper',
        opacity: (isAfastado && !emFerias) ? 0.7 : 1,
        overflow: 'hidden',
        minWidth: 0,
        '&:active': { transform: 'scale(0.98)' },
        '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
        transition: 'box-shadow 0.15s, transform 0.1s',
      }}
    >
      {/* Left: foto */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <Avatar
          src={showPhoto ? fotoUrl : undefined}
          slotProps={{ img: { onError: handleImgError } }}
          sx={{
            width: 72, height: 72,
            bgcolor: 'primary.main', fontSize: '1.3rem', fontWeight: 800,
          }}
        >
          {initials}
        </Avatar>
      </Box>

      {/* Right: info */}
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.2 }}>
        {/* Nome — biggest, boldest */}
        <Typography sx={{ fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.25 }} noWrap>
          {colaborador.nomeparc}
        </Typography>

        {/* Cargo */}
        {colaborador.cargo && (
          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', fontWeight: 500, lineHeight: 1.3 }} noWrap>
            {colaborador.cargo}
          </Typography>
        )}

        {/* Departamento */}
        {colaborador.departamento && (
          <Typography sx={{ fontSize: '0.75rem', color: 'primary.main', fontWeight: 600, lineHeight: 1.3 }} noWrap>
            {colaborador.departamento}
          </Typography>
        )}

        {/* Bottom row: codparc + situacao + atividade */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
          <Typography sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.68rem', color: 'text.disabled', fontWeight: 600,
          }}>
            #{colaborador.codparc}
          </Typography>

          <Typography sx={{
            fontSize: '0.68rem', fontWeight: 700, lineHeight: 1,
            color: emFerias ? 'info.main' : isAfastado ? 'warning.dark' : 'success.main',
          }}>
            {situacaoLabel ?? 'Ativo'}
          </Typography>

          {isActive && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <FiberManualRecord sx={{
                fontSize: 7, color: 'primary.main',
                animation: 'tabman-pulse 2s infinite',
                '@keyframes tabman-pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
              }} />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: 'primary.main' }}>
                {atividade.sigla}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
