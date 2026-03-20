import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

interface SectionTitleProps {
  children: string;
  count?: number;
}

export function SectionTitle({ children, count }: SectionTitleProps) {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
        {children}
        {count != null && (
          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            ({count})
          </Typography>
        )}
      </Typography>
      <Divider />
    </Box>
  );
}
