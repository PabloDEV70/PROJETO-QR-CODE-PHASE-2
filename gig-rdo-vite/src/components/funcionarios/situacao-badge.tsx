import { Box, Typography } from '@mui/material';
import {
  CheckCircleRounded, CancelRounded, PauseCircleRounded,
  LocalHospitalRounded, MilitaryTechRounded, PregnantWomanRounded,
  SwapHorizRounded, ElderlyRounded, HelpOutlineRounded,
  MedicalServicesRounded,
} from '@mui/icons-material';

interface BadgeStyle {
  label: string;
  fg: string;
  bg: string;
  icon: React.ReactNode;
}

const I = { fontSize: '13px !important' };

const SITUACAO_STYLES: Record<string, BadgeStyle> = {
  '1': {
    label: 'Ativo', fg: '#15803d', bg: '#dcfce7',
    icon: <CheckCircleRounded sx={I} />,
  },
  '0': {
    label: 'Demitido', fg: '#b91c1c', bg: '#fee2e2',
    icon: <CancelRounded sx={I} />,
  },
  '2': {
    label: 'Afastado', fg: '#b45309', bg: '#fef3c7',
    icon: <PauseCircleRounded sx={I} />,
  },
  '3': {
    label: 'Acid. Trabalho', fg: '#9333ea', bg: '#f3e8ff',
    icon: <LocalHospitalRounded sx={I} />,
  },
  '4': {
    label: 'Serv. Militar', fg: '#475569', bg: '#f1f5f9',
    icon: <MilitaryTechRounded sx={I} />,
  },
  '5': {
    label: 'Lic. Gestante', fg: '#db2777', bg: '#fce7f3',
    icon: <PregnantWomanRounded sx={I} />,
  },
  '6': {
    label: 'Doenca >15d', fg: '#0369a1', bg: '#e0f2fe',
    icon: <MedicalServicesRounded sx={I} />,
  },
  '7': {
    label: 'Reservado', fg: '#475569', bg: '#f1f5f9',
    icon: <HelpOutlineRounded sx={I} />,
  },
  '8': {
    label: 'Transferido', fg: '#0e7490', bg: '#cffafe',
    icon: <SwapHorizRounded sx={I} />,
  },
  '9': {
    label: 'Aposentado', fg: '#6d28d9', bg: '#ede9fe',
    icon: <ElderlyRounded sx={I} />,
  },
};

interface SituacaoBadgeProps {
  situacao: string;
  label?: string;
  size?: 'sm' | 'md';
}

export function SituacaoBadge({ situacao, label, size = 'sm' }: SituacaoBadgeProps) {
  const style = SITUACAO_STYLES[situacao] ?? {
    label: `Sit. ${situacao}`, fg: '#475569', bg: '#f1f5f9',
    icon: <HelpOutlineRounded sx={I} />,
  };
  const isSm = size === 'sm';
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.4,
      px: isSm ? 0.75 : 1, py: isSm ? 0.15 : 0.3,
      borderRadius: '6px', bgcolor: style.bg, color: style.fg,
      lineHeight: 1,
    }}>
      {style.icon}
      <Typography sx={{
        fontSize: isSm ? 10.5 : 11.5, fontWeight: 600,
        letterSpacing: '-0.01em', lineHeight: 1,
      }}>
        {label || style.label}
      </Typography>
    </Box>
  );
}

export { SITUACAO_STYLES };
