import { Box, Typography, Paper, Chip, LinearProgress, Skeleton } from '@mui/material';
import { Build, Warning } from '@mui/icons-material';
import type { OsManutencaoItem } from '@/api/veiculos';
import { fmtDateShort } from '@/utils/fmt';

const STATUS_MAP: Record<string, { label: string; color: 'info' | 'warning' | 'success' | 'default' }> = {
  A: { label: 'Aberta', color: 'info' },
  E: { label: 'Em Andamento', color: 'warning' },
  F: { label: 'Finalizada', color: 'success' },
};

const MANUT_LABEL: Record<string, string> = {
  P: 'Preventiva', C: 'Corretiva', O: 'Outros',
  S: 'Socorro', R: 'Revisao',
  '1': 'Nivel 1', '2': 'Nivel 2', '3': 'Nivel 3',
  '4': 'Nivel 4', '5': 'Nivel 5',
};

const SUBTIPO_LABEL: Record<string, string> = {
  I: 'Interna', E: 'Externa',
};

const STATUSGIG_LABEL: Record<string, string> = {
  MA: 'Manutencao', AN: 'Analise', SN: 'Sem Necessidade',
  AI: 'Ag. Insumo', AV: 'Avaliacao', SI: 'Sinistro',
};

interface Props { items?: OsManutencaoItem[]; isLoading: boolean }

export function VeiculoManutencaoTab({ items, isLoading }: Props) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: 2.5 }} />
        ))}
      </Box>
    );
  }

  if (!items?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
        <Build sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
        <Typography variant="body2">Nenhuma OS de manutencao ativa</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {items.map((os) => {
        const pct = os.QTD_SERVICOS ? Math.round(((os.SERVICOS_FINALIZADOS ?? 0) / os.QTD_SERVICOS) * 100) : 0;
        const status = STATUS_MAP[os.STATUS] ?? { label: os.STATUS, color: 'default' as const };
        const manutLabel = os.MANUTENCAO ? (MANUT_LABEL[os.MANUTENCAO] ?? os.MANUTENCAO) : null;
        const subtipoLabel = os.TIPO ? (SUBTIPO_LABEL[os.TIPO] ?? os.TIPO) : null;
        const statusGigLabel = os.AD_STATUSGIG ? (STATUSGIG_LABEL[os.AD_STATUSGIG] ?? os.AD_STATUSGIG) : null;

        return (
          <Paper key={os.NUOS} sx={{
            p: 0, overflow: 'hidden',
            ...(os.AD_BLOQUEIOS === 'S' && { borderColor: 'error.main', borderWidth: 2 }),
          }}>
            {os.AD_BLOQUEIOS === 'S' && (
              <Box sx={{ bgcolor: 'error.main', color: '#fff', px: 2, py: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Warning sx={{ fontSize: 14 }} />
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em' }}>BLOQUEIO COMERCIAL</Typography>
              </Box>
            )}
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'monospace' }}>
                  OS {os.NUOS}
                </Typography>
                <Chip size="small" label={status.label} color={status.color} />
                {manutLabel && <Chip size="small" label={manutLabel} variant="outlined" />}
                {subtipoLabel && <Chip size="small" label={subtipoLabel} variant="outlined" />}
                {statusGigLabel && <Chip size="small" label={statusGigLabel} variant="outlined" />}
              </Box>

              {os.SERVICO_PRINCIPAL && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  {os.SERVICO_PRINCIPAL}
                </Typography>
              )}

              {os.QTD_SERVICOS != null && os.QTD_SERVICOS > 0 && (
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Progresso dos servicos</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {os.SERVICOS_FINALIZADOS ?? 0}/{os.QTD_SERVICOS} ({pct}%)
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={pct}
                    sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover' }} />
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <MetaItem label="Abertura" value={fmtDateShort(os.DTABERTURA)} />
                {os.DTPREVISAO && <MetaItem label="Previsao" value={fmtDateShort(os.DTPREVISAO)} />}
                {os.KM != null && <MetaItem label="KM" value={os.KM.toLocaleString('pt-BR')} />}
                {os.HORIMETRO != null && <MetaItem label="Horim" value={String(os.HORIMETRO)} />}
                {os.AD_LOCALMANUTENCAO && <MetaItem label="Local" value={os.AD_LOCALMANUTENCAO} />}
              </Box>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', lineHeight: 1 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}
