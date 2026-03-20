import { QRCodeSVG } from 'qrcode.react';
import { Box, Typography, Stack } from '@mui/material';

interface FuncionarioQrCodeProps {
  codemp: number;
  codfunc: number;
  nome?: string;
  size?: number;
  showLabel?: boolean;
}

export function FuncionarioQrCode({
  codemp,
  codfunc,
  nome,
  size = 128,
  showLabel = true,
}: FuncionarioQrCodeProps) {
  const url = `${window.location.origin}/p/func/${codemp}/${codfunc}`;

  return (
    <Stack alignItems="center" spacing={0.5}>
      <Box
        sx={{
          p: 1,
          bgcolor: '#fff',
          borderRadius: '8px',
          border: '1px solid rgba(148,163,184,0.2)',
          display: 'inline-flex',
        }}
      >
        <QRCodeSVG
          value={url}
          size={size}
          level="H"
          bgColor="#ffffff"
          fgColor="#1e293b"
        />
      </Box>
      {showLabel && (
        <Typography sx={{ fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>
          {nome ? nome : `${codemp}-${codfunc}`}
        </Typography>
      )}
    </Stack>
  );
}
