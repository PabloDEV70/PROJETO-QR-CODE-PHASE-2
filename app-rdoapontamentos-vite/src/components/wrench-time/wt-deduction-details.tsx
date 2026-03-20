import { Box, Divider, Stack, Typography } from '@mui/material';
import { Info } from '@mui/icons-material';
import { fmtMin } from '@/utils/wrench-time-categories';
import type { WtDeductions } from '@/types/wrench-time-types';

function Row({ label, value, bold, color, indent }: {
  label: string; value: string; bold?: boolean; color?: string; indent?: boolean;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={indent ? { pl: 2 } : undefined}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="caption" fontWeight={bold ? 700 : 400} color={color}>
        {value}
      </Typography>
    </Stack>
  );
}

export function AlmocoDetail({ d }: { d: WtDeductions }) {
  const mediaReal = d.totalRdos > 0 ? Math.round(d.almocoTotalMin / d.totalRdos) : 0;
  const mediaProg = d.totalRdos > 0 ? Math.round(d.almocoProgramadoMin / d.totalRdos) : 0;
  return (
    <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: '#F9731608', border: '1px solid #F9731620' }}>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.75 }}>
        <Info sx={{ fontSize: 16, color: '#F97316' }} />
        <Typography variant="caption" fontWeight={700} color="#F97316">
          Almoco — calculo especial
        </Typography>
      </Stack>
      <Stack spacing={0.25}>
        <Row label="Tempo real total de almoco" value={fmtMin(d.almocoTotalMin)} />
        <Row label={`Media por RDO (${d.totalRdos} RDOs)`}
          value={`${mediaReal}min/RDO`} indent />
        <Divider sx={{ my: 0.5 }} />
        <Row label="Almoco programado (jornada)" value={fmtMin(d.almocoProgramadoMin)} bold />
        <Row label={`Media programada por RDO (${d.totalRdos} RDOs)`}
          value={`${mediaProg}min/RDO`} indent />
        <Typography variant="caption" color="text.secondary" sx={{ pl: 2 }}>
          Baseado na escala de cada colaborador (gap entre turnos no TFPHOR)
        </Typography>
        <Divider sx={{ my: 0.5 }} />
        <Row label="Descontado da base efetiva"
          value={`-${fmtMin(d.almocoProgramadoMin)}`} color="#3B82F6" />
        <Row label="Excesso alem do programado"
          value={fmtMin(d.almocoExcessoMin)} bold
          color={d.almocoExcessoMin > 0 ? '#EF4444' : '#16A34A'} />
      </Stack>
      <Box sx={{ mt: 1, p: 1, borderRadius: 0.5, bgcolor: '#F9731610' }}>
        <Typography variant="caption">
          <b>Regra:</b> O almoco programado ({fmtMin(d.almocoProgramadoMin)} total,
          ~{mediaProg}min/funcionario) e descontado da base efetiva — nao conta como produtivo
          nem improdutivo. Apenas o excesso de{' '}
          <b>{fmtMin(d.almocoExcessoMin)}</b> aparece como perda.
        </Typography>
      </Box>
    </Box>
  );
}

export function BanheiroDetail({ d }: { d: WtDeductions }) {
  const tolPerRdo = d.totalRdos > 0 ? Math.round(d.banheiroToleranciaMin / d.totalRdos) : 10;
  const mediaReal = d.totalRdos > 0 ? Math.round(d.banheiroTotalMin / d.totalRdos) : 0;
  return (
    <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: '#8B5CF608', border: '1px solid #8B5CF620' }}>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.75 }}>
        <Info sx={{ fontSize: 16, color: '#8B5CF6' }} />
        <Typography variant="caption" fontWeight={700} color="#8B5CF6">
          Banheiro — calculo especial
        </Typography>
      </Stack>
      <Stack spacing={0.25}>
        <Row label="Tempo real total de banheiro" value={fmtMin(d.banheiroTotalMin)} />
        <Row label={`Media por RDO (${d.totalRdos} RDOs)`}
          value={`${mediaReal}min/RDO`} indent />
        <Divider sx={{ my: 0.5 }} />
        <Row label="Tolerancia por RDO" value={`${tolPerRdo}min`} />
        <Row label={`${d.totalRdos} RDOs x ${tolPerRdo}min`}
          value={fmtMin(d.banheiroToleranciaMin)} bold indent />
        <Divider sx={{ my: 0.5 }} />
        <Row label="Descontado da base efetiva"
          value={`-${fmtMin(d.banheiroToleranciaMin)}`} color="#3B82F6" />
        <Row label="Excesso alem da tolerancia"
          value={fmtMin(d.banheiroExcessoMin)} bold
          color={d.banheiroExcessoMin > 0 ? '#EF4444' : '#16A34A'} />
      </Stack>
      <Box sx={{ mt: 1, p: 1, borderRadius: 0.5, bgcolor: '#8B5CF610' }}>
        <Typography variant="caption">
          <b>Regra:</b> Cada RDO tem {tolPerRdo}min de tolerancia para banheiro.
          Com {d.totalRdos} RDOs: {d.totalRdos} x {tolPerRdo}min ={' '}
          <b>{fmtMin(d.banheiroToleranciaMin)}</b> descontados da base.
          Apenas o excesso de <b>{fmtMin(d.banheiroExcessoMin)}</b> aparece como perda.
        </Typography>
      </Box>
    </Box>
  );
}
