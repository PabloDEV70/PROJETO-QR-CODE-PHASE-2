import MuiTypography from '@mui/material/Typography';
import type { TypographyProps } from './typography.types';

export function Typography({ children, ...props }: TypographyProps) {
  return <MuiTypography {...props}>{children}</MuiTypography>;
}

export function Heading({ level = 1, children, ...props }: { level?: 1 | 2 | 3 | 4 | 5 | 6 } & TypographyProps) {
  const variantMap = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
    4: 'h4',
    5: 'h5',
    6: 'h6',
  } as const;

  return (
    <MuiTypography variant={variantMap[level]} {...props}>
      {children}
    </MuiTypography>
  );
}

export function Text({ muted = false, children, ...props }: { muted?: boolean } & TypographyProps) {
  return (
    <MuiTypography
      variant="body1"
      color={muted ? 'text.secondary' : undefined}
      {...props}
    >
      {children}
    </MuiTypography>
  );
}

export function Label({ required = false, children, ...props }: { required?: boolean } & TypographyProps) {
  return (
    <MuiTypography variant="body2" fontWeight={500} {...props}>
      {children}
      {required && <span style={{ color: 'error.main', marginLeft: 4 }}>*</span>}
    </MuiTypography>
  );
}
