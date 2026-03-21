import { Box, Typography, Chip, CircularProgress, Tooltip, alpha } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  History, CheckCircle, Schedule, Person, Build,
  CalendarMonth, Speed, Timer, OpenInNew,
} from '@mui/icons-material';
import { apiClient } from '@/api/client';

interface HistoricoItem {
  CODIGO: number;
  SEQ: number;
  QTD: number | null;
  NUOS: number | null;
  DTPROGRAMACAO: string | null;
  DTINCLUSAO: string | null;
  KM_APON: number | null;
  HR_APON: number | null;
  TAG: string | null;
  NOMEUSU: string | null;
  DESCRITIVO: string | null;
  DESCRPROD: string | null;
  STATUS: string | null;
  STATUSOS: string | null;
  DTABERTURA: string | null;
  DATAFIN: string | null;
  DATAINI: string | null;
  PREVISAO: string | null;
  MANUTENCAO: string | null;
  TIPOMANUT: string | null;
  KM_OS: number | null;
  HR_OS: number | null;
  AD_STATUSGIG: string | null;
  DIAS_OS: number | null;
}

function fmtDate(val: string | null): string {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString('pt-BR');
}

interface ServicoHistoricoProps {
  codveiculo: number | null;
  codprod: number | null;
}

export function ServicoHistorico({ codveiculo, codprod }: ServicoHistoricoProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['servico-historico', codveiculo, codprod],
    queryFn: async () => {
      const { data } = await apiClient.get<HistoricoItem[]>('/apontamentos/historico-servico', {
        params: { codveiculo, codprod },
      });
      return Array.isArray(data) ? data : [];
    },
    enabled: !!codveiculo && !!codprod,
    staleTime: 60_000,
  });

  if (!codveiculo || !codprod) return null;

  const finalizadas = data?.filter((i) => i.STATUS === 'F').length ?? 0;
  const comOS = data?.filter((i) => i.NUOS).length ?? 0;
  const semOS = (data?.length ?? 0) - comOS;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* ── Header ── */}
      <Box sx={{
        px: 1.5, py: 1.25, flexShrink: 0,
        borderBottom: '1px solid', borderColor: 'divider',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
          <History sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography sx={{ fontSize: 12, fontWeight: 700, flex: 1 }}>
            Historico do Servico
          </Typography>
          {data && <Chip label={data.length} size="small" color="primary" sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />}
        </Box>
        <Typography sx={{ fontSize: 10, color: 'text.disabled', lineHeight: 1.2 }}>
          Execucoes anteriores deste mesmo servico neste veiculo
        </Typography>
      </Box>

      {/* ── Stats ── */}
      {data && data.length > 0 && (
        <Box sx={{
          display: 'flex', flexShrink: 0,
          borderBottom: '1px solid', borderColor: 'divider',
        }}>
          {[
            { label: 'Total', value: data.length, color: 'text.primary' },
            { label: 'Com OS', value: comOS, color: 'info.main' },
            { label: 'Concluidas', value: finalizadas, color: 'success.main' },
            { label: 'Sem OS', value: semOS, color: 'warning.main' },
          ].map((s) => (
            <Box key={s.label} sx={{ flex: 1, textAlign: 'center', py: 0.75, borderRight: '1px solid', borderColor: 'divider', '&:last-child': { borderRight: 0 } }}>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
              <Typography sx={{ fontSize: 8, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* ── List ── */}
      <Box sx={{
        flex: 1, overflowY: 'auto', minHeight: 0,
        scrollbarWidth: 'thin',
      }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={20} />
          </Box>
        ) : !data || data.length === 0 ? (
          <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
            <Build sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
              Primeira execucao
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
              Nenhum registro anterior deste servico para este veiculo
            </Typography>
          </Box>
        ) : (
          data.map((item, i) => {
            const isFin = item.STATUS === 'F';
            const hasOS = !!item.NUOS;

            return (
              <Box
                key={`${item.CODIGO}-${item.SEQ}-${i}`}
                sx={{
                  px: 1.5, py: 1.25,
                  borderBottom: '1px solid', borderColor: 'divider',
                  '&:last-child': { borderBottom: 0 },
                  bgcolor: (t) => isFin
                    ? alpha(t.palette.success.main, t.palette.mode === 'dark' ? 0.04 : 0.02)
                    : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {/* Line 1: Date + Apt# + Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <CalendarMonth sx={{ fontSize: 12, color: 'text.disabled' }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary' }}>
                    {fmtDate(item.DTINCLUSAO)}
                  </Typography>
                  <Typography sx={{ fontSize: 9, color: 'text.disabled', fontFamily: 'monospace' }}>
                    Apt #{item.CODIGO}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  {item.STATUSOS ? (
                    <Chip
                      icon={isFin ? <CheckCircle sx={{ fontSize: '10px !important' }} /> : <Schedule sx={{ fontSize: '10px !important' }} />}
                      label={item.STATUSOS}
                      size="small"
                      color={isFin ? 'success' : item.STATUS === 'E' ? 'info' : 'warning'}
                      variant={isFin ? 'filled' : 'outlined'}
                      sx={{ fontSize: 9, height: 18, fontWeight: 600 }}
                    />
                  ) : (
                    <Chip label="Sem OS" size="small" variant="outlined" sx={{ fontSize: 9, height: 18, color: 'text.disabled' }} />
                  )}
                </Box>

                {/* Line 2: OS info (if has OS) */}
                {hasOS && (
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5,
                    px: 1, py: 0.5, borderRadius: '4px',
                    bgcolor: (t) => alpha(t.palette.info.main, t.palette.mode === 'dark' ? 0.06 : 0.04),
                  }}>
                    <OpenInNew sx={{ fontSize: 10, color: 'info.main' }} />
                    <Typography sx={{ fontSize: 10, color: 'info.main', fontWeight: 700 }}>
                      OS #{item.NUOS}
                    </Typography>
                    {item.TIPOMANUT && (
                      <Chip label={item.TIPOMANUT} size="small" variant="outlined"
                        sx={{ fontSize: 8, height: 14, '& .MuiChip-label': { px: 0.4 } }} />
                    )}
                    {item.DIAS_OS != null && (
                      <Typography sx={{ fontSize: 9, color: 'text.disabled', ml: 'auto' }}>
                        {item.DIAS_OS}d
                      </Typography>
                    )}
                    {item.DATAFIN && (
                      <Typography sx={{ fontSize: 9, color: 'success.main' }}>
                        Fin {fmtDate(item.DATAFIN)}
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Line 3: User + KM + HR + Qty */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                  {item.NOMEUSU && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                      <Person sx={{ fontSize: 10, color: 'text.disabled' }} />
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }} noWrap>{item.NOMEUSU}</Typography>
                    </Box>
                  )}
                  <Box sx={{ flex: 1 }} />
                  {item.QTD != null && (
                    <Typography sx={{ fontSize: 9, color: 'text.disabled', fontFamily: 'monospace' }}>
                      Qtd {item.QTD}
                    </Typography>
                  )}
                  {item.KM_APON != null && item.KM_APON > 0 && (
                    <Tooltip title="KM no momento do apontamento">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.15 }}>
                        <Speed sx={{ fontSize: 9, color: 'text.disabled' }} />
                        <Typography sx={{ fontSize: 9, color: 'text.disabled', fontFamily: 'monospace' }}>
                          {item.KM_APON.toLocaleString('pt-BR')}
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                  {item.HR_APON != null && item.HR_APON > 0 && (
                    <Tooltip title="Horimetro no momento do apontamento">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.15 }}>
                        <Timer sx={{ fontSize: 9, color: 'text.disabled' }} />
                        <Typography sx={{ fontSize: 9, color: 'text.disabled', fontFamily: 'monospace' }}>
                          {item.HR_APON.toLocaleString('pt-BR')}
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                </Box>

                {/* Line 4: Descritivo */}
                {item.DESCRITIVO && (
                  <Tooltip title={item.DESCRITIVO} placement="left">
                    <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: 0.25, fontStyle: 'italic', lineHeight: 1.3 }} noWrap>
                      {item.DESCRITIVO}
                    </Typography>
                  </Tooltip>
                )}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
