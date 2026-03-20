import { QRCodeSVG } from 'qrcode.react';
import { Box, Typography, Stack } from '@mui/material';

interface ArmarioQrCodeProps {
  codarmario: number;
  tag?: string;
  size?: number;
  showLabel?: boolean;
}

const BASE_URL = import.meta.env.VITE_PUBLIC_URL || 'https://publico.gigantao.net';

export function ArmarioQrCode({
  codarmario,
  tag,
  size = 128,
  showLabel = true,
}: ArmarioQrCodeProps) {
  const url = `${BASE_URL}/p/armario/${codarmario}`;

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
          {tag || `Armario #${codarmario}`}
        </Typography>
      )}
    </Stack>
  );
}
