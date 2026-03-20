import type { ReactNode } from 'react';
import { Grid, Typography, Divider } from '@mui/material';

interface PocChartSectionProps {
  title: string;
  timeline?: ReactNode;
  pie: ReactNode;
  bar: ReactNode;
}

export function PocChartSection({ title, timeline, pie, bar }: PocChartSectionProps) {
  return (
    <>
      <Divider sx={{ my: 1 }} />
      <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      <Grid container spacing={3}>
        {timeline && (
          <Grid size={12}>
            {timeline}
          </Grid>
        )}
        <Grid size={{ xs: 12, md: 5 }}>
          {pie}
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          {bar}
        </Grid>
      </Grid>
    </>
  );
}
