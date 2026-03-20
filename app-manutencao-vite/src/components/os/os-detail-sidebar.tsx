import { Box, Typography, Stack, IconButton, TextField, MenuItem } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { parseISO, isValid } from 'date-fns';
import {
  ArrowBack, DirectionsCarRounded, CalendarTodayRounded,
  PersonRounded, InfoOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { OsStatusBadge, TipoManutBadge, StatusGigBadge } from '@/components/os/os-badges';
import { OsStatusActions } from '@/components/os/os-status-actions';
import {
  OS_STATUS_MAP, TIPO_MANUT_MAP, STATUSGIG_MAP,
  LOCAL_MANUT_OPTIONS, TIPO_OS_OPTIONS,
} from '@/utils/os-constants';
import { useUpdateOs } from '@/hooks/use-os-mutations';
import { useEmpresas } from '@/hooks/use-lookups';
import type { OrdemServico, OsDetailEnriched, OsStatusCode } from '@/types/os-types';
import type { OsUpdateData } from '@/api/ordens-servico';

function fmtCur(v: number | null) {
  if (v == null || v === 0) return 'R$ 0,00';
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

const fieldBg = (t: any) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : '#ffffff';

const fSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '4px', bgcolor: fieldBg },
  '& .MuiOutlinedInput-input': { fontSize: 13, fontWeight: 500, py: '8.5px', px: '10px' },
  '& .MuiInputLabel-root': { fontSize: 12, fontWeight: 700 },
};

const dtSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '4px', bgcolor: fieldBg },
  '& .MuiOutlinedInput-input': { fontSize: 12, fontWeight: 500, py: '8.5px', px: '10px' },
  '& .MuiInputLabel-root': { fontSize: 12, fontWeight: 700 },
  '& .MuiInputAdornment-root .MuiSvgIcon-root': { fontSize: 18 },
};

function F({ label, value, w }: { label: string; value: string; w?: string }) {
  return (
    <TextField
      label={label} value={value} size="small" variant="outlined"
      fullWidth={!w}
      slotProps={{ input: { readOnly: true }, inputLabel: { shrink: true } }}
      sx={{ ...fSx, ...(w ? { width: w } : {}) }}
    />
  );
}

function Sel({ label, value, options, onChange, w }: {
  label: string; value: string; w?: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <TextField
      select label={label} size="small" variant="outlined" value={value}
      onChange={(e) => onChange(e.target.value)} fullWidth={!w}
      slotProps={{ inputLabel: { shrink: true } }}
      sx={{ ...fSx, ...(w ? { width: w } : {}) }}
    >
      {options.map((o) => <MenuItem key={o.value} value={o.value} sx={{ fontSize: 13 }}>{o.label}</MenuItem>)}
    </TextField>
  );
}

function DT({ label, value, readOnly, onChange, w }: {
  label: string; value: string | null; readOnly?: boolean; w?: string;
  onChange?: (iso: string | null) => void;
}) {
  return (
    <DateTimePicker
      label={label}
      value={value ? parseISO(value) : null}
      onChange={(d) => onChange?.(d && isValid(d) ? d.toISOString() : null)}
      readOnly={readOnly}
      format="dd/MM/yyyy HH:mm"
      ampm={false}
      slotProps={{
        textField: {
          size: 'small', variant: 'outlined', fullWidth: !w,
          slotProps: { inputLabel: { shrink: true } },
          sx: { ...dtSx, ...(w ? { width: w } : {}) },
        },
      }}
    />
  );
}

function Section({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 2.5, mb: 1 }}>
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Typography sx={{
        fontSize: 11, fontWeight: 800, color: 'text.disabled',
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        {title}
      </Typography>
    </Stack>
  );
}

export const SIDEBAR_WIDTH = 350;

export function OsDetailSidebar({ os }: { os: OsDetailEnriched }) {
  const navigate = useNavigate();
  const updateOs = useUpdateOs();
  const { data: empresas } = useEmpresas();
  const statusDef = OS_STATUS_MAP[os.STATUS as OsStatusCode];

  const patch = (field: keyof OsUpdateData, value: unknown) => {
    updateOs.mutate([os.NUOS, { [field]: value ?? undefined } as OsUpdateData]);
  };

  const manutOpts = Object.entries(TIPO_MANUT_MAP).map(([k, v]) => ({ value: k, label: v.label }));
  const gigOpts = [{ value: '', label: 'Nenhum' }, ...Object.entries(STATUSGIG_MAP).map(([k, v]) => ({ value: k, label: v.label }))];
  const empOpts = (empresas ?? []).map((e) => ({ value: String(e.CODEMP), label: e.nome }));

  return (
    <Box sx={{
      width: SIDEBAR_WIDTH, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider',
      display: 'flex', flexDirection: 'column', height: '100%',
      bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(0,0,0,0.12)' : '#f4f6f8',
    }}>
      <Box sx={{ height: 3, bgcolor: statusDef?.color ?? '#666', flexShrink: 0 }} />

      {/* Header */}
      <Box sx={{ px: 2, pt: 1.5, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
          <IconButton onClick={() => navigate('/ordens-de-servico')} size="small">
            <ArrowBack fontSize="small" />
          </IconButton>
          <Typography sx={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em' }}>
            OS #{os.NUOS}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ mb: 1.5 }}>
          <OsStatusBadge status={os.STATUS} size="sm" />
          <TipoManutBadge tipo={os.MANUTENCAO} size="sm" />
          <StatusGigBadge statusGig={os.AD_STATUSGIG} />
        </Stack>
        <OsStatusActions nuos={os.NUOS} status={os.STATUS as OrdemServico['STATUS']} />
      </Box>

      {/* Custo sticky */}
      <Box sx={{
        mx: 2, my: 1.5, p: 1.5, borderRadius: '4px', flexShrink: 0,
        border: '1px solid', borderColor: 'divider',
        bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(46,125,50,0.10)' : 'rgba(46,125,50,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box>
          <Typography sx={{ fontSize: 9, fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase' }}>Custo Total</Typography>
          <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>{os.totalServicos} servico{os.totalServicos !== 1 ? 's' : ''}</Typography>
        </Box>
        <Typography sx={{ fontSize: 20, fontWeight: 900, color: 'primary.main', fontFamily: 'monospace' }}>
          {fmtCur(os.custoTotal)}
        </Typography>
      </Box>

      {/* Scrollable form */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pb: 3 }}>

        {/* Veiculo */}
        <Section icon={<DirectionsCarRounded sx={{ fontSize: 16 }} />} title="Veiculo" />
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1}>
            <F label="Placa" value={os.veiculo.placa ?? '-'} w="55%" />
            <F label="Tag" value={os.veiculo.tag ?? '-'} w="45%" />
          </Stack>
          <F label="Marca / Modelo" value={os.veiculo.marca ?? '-'} />
          {os.veiculo.tipo && <F label="Equipamento" value={os.veiculo.tipo} />}
          <Stack direction="row" spacing={1}>
            <F label="KM" value={os.KM != null && os.KM > 1 ? os.KM.toLocaleString('pt-BR') : '-'} w="50%" />
            <F label="Horimetro" value={os.HORIMETRO ? os.HORIMETRO.toLocaleString('pt-BR') : '-'} w="50%" />
          </Stack>
        </Stack>

        {/* Detalhes */}
        <Section icon={<InfoOutlined sx={{ fontSize: 16 }} />} title="Detalhes" />
        <Stack spacing={1.25}>
          <F label="Status" value={os.statusLabel ?? os.STATUS} />
          <Stack direction="row" spacing={1}>
            <Sel label="Tipo Manut." value={os.MANUTENCAO ?? ''} options={manutOpts} onChange={(v) => patch('MANUTENCAO', v)} w="50%" />
            <Sel label="Int / Ext" value={os.TIPO ?? ''} options={TIPO_OS_OPTIONS} onChange={(v) => patch('TIPO', v)} w="50%" />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Sel label="Status GIG" value={os.AD_STATUSGIG ?? ''} options={gigOpts} onChange={(v) => patch('AD_STATUSGIG', v)} w="50%" />
            <Sel label="Local" value={os.AD_LOCALMANUTENCAO ?? ''} options={LOCAL_MANUT_OPTIONS} onChange={(v) => patch('AD_LOCALMANUTENCAO', v)} w="50%" />
          </Stack>
          <Sel label="Empresa" value={os.CODEMP ? String(os.CODEMP) : ''} options={empOpts} onChange={(v) => patch('CODEMP', v ? Number(v) : undefined)} />
          {os.AD_BLOQUEIOS && os.AD_BLOQUEIOS !== 'N' && <F label="Bloqueios" value={os.AD_BLOQUEIOS} />}
        </Stack>

        {/* Cronograma */}
        <Section icon={<CalendarTodayRounded sx={{ fontSize: 14 }} />} title="Cronograma" />
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1}>
            <DT label="Abertura" value={os.DTABERTURA} readOnly w="50%" />
            <DT label="Inicio" value={os.DATAINI} readOnly w="50%" />
          </Stack>
          <Stack direction="row" spacing={1}>
            <DT label="Previsao" value={os.PREVISAO} onChange={(v) => patch('PREVISAO', v)} w="50%" />
            <DT label="Fim" value={os.DATAFIN} readOnly w="50%" />
          </Stack>
          <Stack direction="row" spacing={1}>
            <DT label="Ult. Alteracao" value={os.DHALTER} readOnly w="50%" />
            <F label="Tipo Final." value={os.finalizacaoLabel ?? os.AD_FINALIZACAO ?? '-'} w="50%" />
          </Stack>
        </Stack>

        {/* Responsaveis */}
        <Section icon={<PersonRounded sx={{ fontSize: 16 }} />} title="Responsaveis" />
        <Stack spacing={1.25}>
          <F label="Criado por" value={os.nomeUsuInc ?? '-'} />
          <F label="Alterado por" value={os.nomeUsuAlter ?? '-'} />
          <F label="Finalizado por" value={os.nomeUsuFin ?? '-'} />
        </Stack>
      </Box>
    </Box>
  );
}
