import { Box, Grid, Stack, Typography, LinearProgress, Chip } from '@mui/material';
import { ReadonlyField, EditableField, FieldGroup, KpiStrip } from '@/components/shared/form';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import {
  TIPO_MANUT_MAP,
  STATUSGIG_MAP,
  LOCAL_MANUT_OPTIONS,
  TIPO_OS_OPTIONS,
} from '@/utils/os-constants';
import { useEmpresas } from '@/hooks/use-lookups';
import { useMediaDiasPorTipo } from '@/hooks/use-manutencao';
import type { OsDetailEnriched } from '@/types/os-types';

interface OsBentoGridProps {
  os: OsDetailEnriched;
}

function fmtCur(v: number | null | undefined): string {
  if (v == null || v === 0) return 'R$ 0,00';
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function fmtDate(v: string | null | undefined): string {
  if (!v) return '-';
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch { return String(v); }
}

function calcLeadTimeHours(ini: string | null | undefined, fin: string | null | undefined): number {
  if (!ini) return 0;
  const start = new Date(ini);
  const end = fin ? new Date(fin) : new Date();
  if (isNaN(start.getTime())) return 0;
  return Math.max(0, (end.getTime() - start.getTime()) / 3600000);
}

function fmtHours(hours: number): string {
  if (hours <= 0) return '-';
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.floor(hours / 24);
  const rem = Math.round(hours % 24);
  return rem > 0 ? `${days}d ${rem}h` : `${days}d`;
}

export function OsBentoGrid({ os }: OsBentoGridProps) {
  const { data: empresas } = useEmpresas();
  const { data: mediaDias } = useMediaDiasPorTipo();

  const manutOpts = Object.entries(TIPO_MANUT_MAP).map(([k, v]) => ({ value: k, label: v.label }));
  const gigOpts = [
    { value: '', label: 'Nenhum' },
    ...Object.entries(STATUSGIG_MAP).map(([k, v]) => ({ value: k, label: v.label })),
  ];
  const empOpts = (empresas ?? []).map((e: { CODEMP: number; nome: string }) => ({
    value: String(e.CODEMP), label: e.nome,
  }));

  const leadHours = calcLeadTimeHours(os.DATAINI, os.DATAFIN);
  const leadDays = leadHours / 24;

  // Eficiencia: comparar lead time com media do tipo de manutencao
  const mediaTipo = mediaDias?.find((m: { tipo: string }) => m.tipo === os.MANUTENCAO);
  const mediaDiasTipo = mediaTipo?.mediaDias ?? 0;
  const eficiencia = mediaDiasTipo > 0 && leadDays > 0
    ? Math.min(100, Math.round((mediaDiasTipo / leadDays) * 100))
    : null;
  const efColor = eficiencia != null
    ? eficiencia >= 80 ? '#16a34a' : eficiencia >= 50 ? '#f59e0b' : '#ef4444'
    : undefined;

  const kpiItems = [
    { label: 'Custo Total', value: fmtCur(os.custoTotal), color: os.custoTotal > 0 ? '#16a34a' : undefined },
    { label: 'Lead Time', value: fmtHours(leadHours) },
    { label: 'Servicos', value: os.servicos.length },
    { label: 'Executores', value: os.executores.length },
    { label: 'KM', value: os.KM && os.KM > 1 ? os.KM.toLocaleString('pt-BR') : '-' },
  ];

  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <KpiStrip items={kpiItems} />

      <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
        <Grid container spacing={2.5}>
          {/* Coluna Esquerda */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2}>
              <FieldGroup title="Veiculo">
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{ flex: 1 }}>
                    <Grid container spacing={1}>
                      <Grid size={5}>
                        <ReadonlyField label="Placa" value={os.veiculo.placa} mono size="lg" />
                      </Grid>
                      <Grid size={4}>
                        <ReadonlyField label="Tag" value={os.veiculo.tag} mono />
                      </Grid>
                      <Grid size={3}>
                        <ReadonlyField label="Tipo" value={os.veiculo.tipo} size="sm" />
                      </Grid>
                      <Grid size={12}>
                        <ReadonlyField label="Marca / Modelo" value={os.veiculo.marca} />
                      </Grid>
                    </Grid>
                  </Box>
                </Stack>
                <Grid container spacing={1.5} sx={{ mt: 1 }}>
                  <Grid size={6}>
                    <EditableField label="KM Entrada" value={os.KM} type="number" mono />
                  </Grid>
                  <Grid size={6}>
                    <EditableField label="Horimetro" value={os.HORIMETRO} type="number" mono />
                  </Grid>
                </Grid>
              </FieldGroup>

              <FieldGroup title="Cronograma">
                <Grid container spacing={0.5}>
                  <Grid size={6}><ReadonlyField label="Abertura" value={fmtDate(os.DTABERTURA)} mono size="sm" /></Grid>
                  <Grid size={6}><ReadonlyField label="Inicio" value={fmtDate(os.DATAINI)} mono size="sm" /></Grid>
                  <Grid size={6}><ReadonlyField label="Fim" value={fmtDate(os.DATAFIN)} mono size="sm" /></Grid>
                  <Grid size={6}><ReadonlyField label="Previsao" value={fmtDate(os.PREVISAO)} mono size="sm" color="primary.main" /></Grid>
                </Grid>

                {/* Eficiencia */}
                {eficiencia != null && (
                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'text.disabled' }}>
                        Eficiencia vs Media ({os.manutencaoLabel ?? os.MANUTENCAO})
                      </Typography>
                      <Box sx={{ flex: 1 }} />
                      <Chip
                        label={`${eficiencia}%`}
                        size="small"
                        sx={{ height: 18, fontSize: 10, fontWeight: 800, bgcolor: `${efColor}15`, color: efColor, borderRadius: '4px' }}
                      />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={eficiencia}
                      sx={{
                        height: 6, borderRadius: 3,
                        bgcolor: 'divider',
                        '& .MuiLinearProgress-bar': { bgcolor: efColor, borderRadius: 3 },
                      }}
                    />
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                      <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
                        Esta OS: {fmtHours(leadHours)}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
                        Media: {mediaDiasTipo > 0 ? `${mediaDiasTipo.toFixed(1)}d` : '-'}
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {/* Usuarios */}
                {(os.nomeUsuInc || os.nomeUsuFin) && (
                  <Stack direction="row" spacing={2} sx={{ mt: 1.5, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    {os.nomeUsuInc && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FuncionarioAvatar codparc={os.CODPARC} nome={os.nomeUsuInc} size="small" />
                        <Box>
                          <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>Criado por</Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{os.nomeUsuInc}</Typography>
                        </Box>
                      </Stack>
                    )}
                    {os.nomeUsuFin && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FuncionarioAvatar nome={os.nomeUsuFin} size="small" />
                        <Box>
                          <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>Finalizado por</Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{os.nomeUsuFin}</Typography>
                        </Box>
                      </Stack>
                    )}
                  </Stack>
                )}
              </FieldGroup>
            </Stack>
          </Grid>

          {/* Coluna Direita */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2}>
              <FieldGroup title="Operacao">
                <Stack spacing={1.5}>
                  <EditableField label="Tipo Manutencao" value={os.MANUTENCAO || ''} select options={manutOpts} />
                  <Grid container spacing={1.5}>
                    <Grid size={6}>
                      <EditableField label="Origem" value={os.TIPO || ''} select options={TIPO_OS_OPTIONS} />
                    </Grid>
                    <Grid size={6}>
                      <EditableField label="Status GIG" value={os.AD_STATUSGIG || ''} select options={gigOpts} />
                    </Grid>
                  </Grid>
                  <EditableField label="Local Atendimento" value={os.AD_LOCALMANUTENCAO || ''} select options={LOCAL_MANUT_OPTIONS} />
                  <EditableField label="Unidade Negocio" value={os.CODEMP ? String(os.CODEMP) : ''} select options={empOpts} />
                </Stack>
              </FieldGroup>

              <FieldGroup title="Controle">
                <Grid container spacing={0.5}>
                  <Grid size={6}>
                    <ReadonlyField label="Finalizacao" value={os.finalizacaoLabel || os.AD_FINALIZACAO} />
                  </Grid>
                  <Grid size={6}>
                    <ReadonlyField label="Plano Preventivo" value={os.NUPLANO ? `Plano ${os.NUPLANO}` : null} />
                  </Grid>
                  {os.AD_OSORIGEM && (
                    <Grid size={6}><ReadonlyField label="OS Origem" value={os.AD_OSORIGEM} mono /></Grid>
                  )}
                  {os.nomeUsuAlter && (
                    <Grid size={6}><ReadonlyField label="Alterado por" value={os.nomeUsuAlter} size="sm" /></Grid>
                  )}
                </Grid>
                {os.AD_BLOQUEIOS && os.AD_BLOQUEIOS !== 'N' && (
                  <Box sx={{ mt: 1.5, p: 1, borderRadius: 1, bgcolor: 'error.main', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                    Bloqueio: {os.AD_BLOQUEIOS}
                  </Box>
                )}
              </FieldGroup>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
