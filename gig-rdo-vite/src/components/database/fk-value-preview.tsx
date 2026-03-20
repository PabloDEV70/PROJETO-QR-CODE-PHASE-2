import { Box, CircularProgress, Typography } from '@mui/material';
import { useFkLookup } from '@/hooks/use-database-schema';

interface FkValuePreviewProps {
  refTable: string;
  refColumn: string;
  value: unknown;
}

export function FkValuePreview({ refTable, refColumn, value }: FkValuePreviewProps) {
  const { data: description, isLoading } = useFkLookup(refTable, refColumn, value);

  if (value == null || value === '') return null;

  if (isLoading) {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 0.5 }}>
        <CircularProgress size={12} />
      </Box>
    );
  }

  if (!description) return null;

  return (
    <Typography
      component="span"
      sx={{ fontSize: 11, color: 'text.secondary', display: 'block', mt: 0.2 }}
    >
      {description}
      <Typography component="span" sx={{ fontSize: 9, color: 'text.disabled', ml: 0.5 }}>
        ({refTable})
      </Typography>
    </Typography>
  );
}
