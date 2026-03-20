import { Divider, GlobalStyles, Paper, Stack, Typography } from '@mui/material';
import { TextFields } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { FontSpecimen } from '@/components/shared/font-specimen';

const fontFaceStyles = (
  <GlobalStyles
    styles={{
      '@font-face': [
        {
          fontFamily: 'JetBrains Mono',
          src: "url('/fonts/JetBrainsMono-Regular.ttf') format('truetype')",
          fontWeight: 400,
          fontStyle: 'normal',
          fontDisplay: 'swap',
        },
        {
          fontFamily: 'JetBrains Mono',
          src: "url('/fonts/JetBrainsMono-Bold.ttf') format('truetype')",
          fontWeight: 700,
          fontStyle: 'normal',
          fontDisplay: 'swap',
        },
        {
          fontFamily: 'STOP',
          src: "url('/fonts/StopFont.woff2') format('woff2'), url('/fonts/StopFont.ttf') format('truetype')",
          fontWeight: 400,
          fontStyle: 'normal',
          fontDisplay: 'swap',
        },
      ] as unknown as object,
    }}
  />
);

const FONTS = [
  {
    name: 'STOP',
    family: "'STOP', sans-serif",
    files: ['/fonts/StopFont.woff2', '/fonts/StopFont.ttf'],
    weights: [{ value: 400, label: 'Normal' }],
    description: 'Display font — ideal para titulos e headers',
  },
  {
    name: 'JetBrains Mono',
    family: "'JetBrains Mono', monospace",
    files: ['/fonts/JetBrainsMono-Regular.ttf', '/fonts/JetBrainsMono-Bold.ttf'],
    weights: [
      { value: 400, label: 'Regular' },
      { value: 700, label: 'Bold' },
    ],
    description: 'Monospace — ideal para codigo e dados tabulares',
  },
];

export function TesteFontsPage() {
  return (
    <>
      {fontFaceStyles}
      <PageLayout title="Teste de Fontes" icon={TextFields}>
        <Stack spacing={4}>
          {FONTS.map((font) => (
            <Paper key={font.name} variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {font.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {font.description}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {font.files.map((f) => <code key={f}>{f}</code>).reduce(
                  (acc, el, i) => (i === 0 ? [el] : [...acc, ', ', el]) as any,
                  [] as any,
                )}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <FontSpecimen family={font.family} weights={font.weights} />
            </Paper>
          ))}
        </Stack>
      </PageLayout>
    </>
  );
}
