import { Box, Typography, Stack, Grid, TextField, MenuItem, Divider } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { parseISO } from 'date-fns';
import { 
  TIPO_MANUT_MAP, 
  STATUSGIG_MAP, 
  LOCAL_MANUT_OPTIONS, 
  TIPO_OS_OPTIONS 
} from '@/utils/os-constants';
import { useEmpresas } from '@/hooks/use-lookups';
import type { OsDetailEnriched } from '@/types/os-types';

interface OsBentoGridProps {
  os: OsDetailEnriched;
}

const fieldSx = {
  '& .MuiInputBase-root': { 
    borderRadius: 0,
    bgcolor: 'transparent',
    fontSize: 14,
    fontWeight: 700,
    '& fieldset': { border: 'none', borderBottom: '2px solid', borderColor: 'divider' },
    '&:hover fieldset': { borderColor: 'text.secondary' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderBottom: '2px solid' },
  },
  '& .MuiInputLabel-root': { 
    fontSize: 10, 
    fontWeight: 900, 
    textTransform: 'uppercase', 
    letterSpacing: '0.1em',
    color: 'text.disabled',
    '&.Mui-focused': { color: 'primary.main' }
  },
  '& .MuiOutlinedInput-input': { py: 1, px: 0 },
};

function SectionHeader({ title }: { title: string }) {
  return (
    <Typography sx={{ 
      fontSize: 11, 
      fontWeight: 900, 
      color: 'primary.main', 
      textTransform: 'uppercase', 
      letterSpacing: '0.15em',
      mb: 2,
      mt: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      '&::after': { content: '""', flex: 1, height: '1px', bgcolor: 'divider' }
    }}>
      {title}
    </Typography>
  );
}

export function OsBentoGrid({ os }: OsBentoGridProps) {
  const { data: empresas } = useEmpresas();
  const manutOpts = Object.entries(TIPO_MANUT_MAP).map(([k, v]) => ({ value: k, label: v.label }));
  const gigOpts = [{ value: '', label: 'Nenhum' }, ...Object.entries(STATUSGIG_MAP).map(([k, v]) => ({ value: k, label: v.label }))];
  const empOpts = (empresas ?? []).map((e) => ({ value: String(e.CODEMP), label: e.nome }));

  return (
    <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      {/* KPI BAR - ULTRA COMPACT */}
      <Stack 
        direction="row" 
        divider={<Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center' }} />}
        spacing={4}
        sx={{ px: 3, py: 1.5, bgcolor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <KpiItem label="CUSTO TOTAL" value={`R$ ${os.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="primary.main" />
        <KpiItem label="LEAD TIME" value="2d 4h" />
        <KpiItem label="SERVIÇOS" value={os.servicos.length} />
        <KpiItem label="EXECUTORES" value={os.executores.length} />
        <KpiItem label="KM ATUAL" value={os.KM?.toLocaleString('pt-BR') || '0'} />
      </Stack>

      {/* MASTER FORM BODY */}
      <Grid container spacing={6} sx={{ px: 3, py: 3 }}>
        {/* COLUNA 1: ATIVO */}
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionHeader title="Identificação do Ativo" />
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid size={6}><F label="PLACA" value={os.veiculo.placa} readOnly /></Grid>
              <Grid size={6}><F label="TAG" value={os.veiculo.tag} readOnly /></Grid>
            </Grid>
            <F label="MARCA / MODELO" value={os.veiculo.marca} readOnly />
            <Grid container spacing={2}>
              <Grid size={6}><F label="KM ENTRADA" value={os.KM} isNumeric /></Grid>
              <Grid size={6}><F label="HORÍMETRO" value={os.HORIMETRO} isNumeric /></Grid>
            </Grid>
          </Stack>
        </Grid>

        {/* COLUNA 2: OPERAÇÃO */}
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionHeader title="Parâmetros da Operação" />
          <Stack spacing={3}>
            <F select label="TIPO MANUTENÇÃO" value={os.MANUTENCAO || ''} options={manutOpts} />
            <Grid container spacing={2}>
              <Grid size={6}><F select label="ORIGEM (INT/EXT)" value={os.TIPO || ''} options={TIPO_OS_OPTIONS} /></Grid>
              <Grid size={6}><F select label="STATUS GIG" value={os.AD_STATUSGIG || ''} options={gigOpts} /></Grid>
            </Grid>
            <F select label="LOCAL DE ATENDIMENTO" value={os.AD_LOCALMANUTENCAO || ''} options={LOCAL_MANUT_OPTIONS} />
            <F select label="UNIDADE DE NEGÓCIO" value={os.CODEMP ? String(os.CODEMP) : ''} options={empOpts} />
          </Stack>
        </Grid>

        {/* COLUNA 3: CRONOGRAMA */}
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionHeader title="Cronograma & Controle" />
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid size={6}><DT label="INÍCIO REAL" value={os.DATAINI} readOnly /></Grid>
              <Grid size={6}><DT label="FIM REAL" value={os.DATAFIN} readOnly /></Grid>
            </Grid>
            <DT label="PREVISÃO DE ENTREGA" value={os.PREVISAO} highlight />
            <F label="TIPO DE FINALIZAÇÃO" value={os.finalizacaoLabel || os.AD_FINALIZACAO} readOnly />
            {os.AD_BLOQUEIOS && os.AD_BLOQUEIOS !== 'N' && (
              <F label="BLOQUEIOS / RESTRIÇÕES" value={os.AD_BLOQUEIOS} color="error.main" readOnly />
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

function KpiItem({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ display: 'block', fontWeight: 900, color: 'text.disabled', letterSpacing: '0.1em', fontSize: 9 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 900, fontSize: 15, color: color || 'text.primary', fontFamily: 'monospace' }}>
        {value}
      </Typography>
    </Box>
  );
}

function F({ label, value, readOnly, select, options, isNumeric, color }: any) {
  return (
    <TextField
      select={select}
      label={label}
      value={value ?? ''}
      fullWidth
      variant="outlined"
      size="small"
      slotProps={{ 
        input: { 
          readOnly,
          sx: { 
            fontFamily: isNumeric ? 'monospace' : 'inherit',
            color: color || 'inherit'
          }
        },
        inputLabel: { shrink: true }
      }}
      sx={fieldSx}
    >
      {select && options?.map((o: any) => <MenuItem key={o.value} value={o.value} sx={{ fontSize: 13, fontWeight: 700 }}>{o.label}</MenuItem>)}
    </TextField>
  );
}

function DT({ label, value, readOnly, highlight }: any) {
  return (
    <DateTimePicker
      label={label}
      value={value ? parseISO(value) : null}
      readOnly={readOnly}
      format="dd/MM/yy HH:mm"
      ampm={false}
      slotProps={{
        textField: {
          size: 'small',
          fullWidth: true,
          variant: 'outlined',
          slotProps: { inputLabel: { shrink: true } },
          sx: { 
            ...fieldSx,
            ...(highlight ? { '& .MuiInputBase-root': { color: 'primary.main', fontWeight: 900 } } : {})
          },
        },
      }}
    />
  );
}
