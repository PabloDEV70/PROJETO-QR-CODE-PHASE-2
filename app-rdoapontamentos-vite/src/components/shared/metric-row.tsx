import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface MetricRowProps {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
  prefix?: string;
  dot?: string;
}

export function MetricRow({ label, value, bold, color, prefix, dot }: MetricRowProps) {
  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ py: 0.3 }}>
        {dot && (
          <Box component="span" sx={{
            display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
            bgcolor: dot, mr: 0.5, verticalAlign: 'middle',
          }} />
        )}
        {prefix && (
          <Typography component="span" variant="body2" color={color} sx={{ fontWeight: 600, mr: 0.5 }}>
            {prefix}
          </Typography>
        )}
        {label}
      </Typography>
      <Typography variant="body2" sx={{
        py: 0.3, fontWeight: bold ? 700 : 400, textAlign: 'right', color,
      }}>
        {value}
      </Typography>
    </>
  );
}

interface SectionLabelProps {
  children: string;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <Typography
      variant="caption"
      fontWeight={700}
      color="text.secondary"
      sx={{ gridColumn: '1 / -1', pt: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}
    >
      {children}
    </Typography>
  );
}
