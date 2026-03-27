import MuiCard from '@mui/material/Card';
import MuiCardHeader from '@mui/material/CardHeader';
import MuiCardContent from '@mui/material/CardContent';
import MuiCardActions from '@mui/material/CardActions';
import type { CardProps, CardHeaderProps, CardContentProps, CardActionsProps } from './card.types';

export function Card({ children, ...props }: CardProps) {
  return <MuiCard {...props}>{children}</MuiCard>;
}

export function CardHeader({ title, subtitle, action, avatar }: CardHeaderProps) {
  return (
    <MuiCardHeader
      title={title}
      subheader={subtitle}
      action={action}
      avatar={avatar}
    />
  );
}

export function CardContent({ children, sx }: CardContentProps) {
  return <MuiCardContent sx={sx}>{children}</MuiCardContent>;
}

export function CardActions({ children, sx }: CardActionsProps) {
  return <MuiCardActions sx={sx}>{children}</MuiCardActions>;
}
