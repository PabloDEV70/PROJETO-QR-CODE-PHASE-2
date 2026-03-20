import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

interface MotivoChipProps {
  sigla: string | null;
  descricao?: string | null;
  produtivo?: 'S' | 'N' | null;
  size?: 'small' | 'medium';
}

export function MotivoChip({ sigla, descricao, produtivo, size = 'small' }: MotivoChipProps) {
  const color = produtivo === 'S' ? 'success' : produtivo === 'N' ? 'warning' : 'default';
  const chip = <Chip label={sigla || 'N/A'} color={color} size={size} />;

  if (descricao) {
    return <Tooltip title={descricao}>{chip}</Tooltip>;
  }

  return chip;
}
