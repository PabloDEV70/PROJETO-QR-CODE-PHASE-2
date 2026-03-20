import { Box, Typography, Paper, Grid, Chip, IconButton, CircularProgress, LinearProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import {
  useVeiculoDashboard, useVeiculoProximaManutencao, useVeiculoAderencia,
  useVeiculoHistorico, useVeiculoCustos, useVeiculoServicosFrequentes,
} from '@/hooks/use-manutencao';
import { OS_STATUS_MAP, TIPO_MANUT_MAP } from '@/utils/os-constants';
import type { VeiculoHistorico, VeiculoCusto } from '@/types/os-types';

const fmtBrl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (s: string | null | undefined) => s ? format(parseISO(s), 'dd/MM/yyyy') : '—';

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Paper sx={{ p: 2, textAlign: 'center', flex: 1 }}>
      <Typography variant="h5" fontWeight={700}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Paper>
  );
}

const HISTORICO_COLS: GridColDef<VeiculoHistorico>[] = [
  {
    field: 'nuos', headerName: 'OS', width: 80,
    renderCell: ({ value }) => <Link to={`/ordens-de-servico/${value}`} style={{ color: '#1976d2' }}>#{value}</Link>,
  },
  {
    field: 'status', headerName: 'Status', width: 120,
    renderCell: ({ row }) => {
      const s = OS_STATUS_MAP[row.status as keyof typeof OS_STATUS_MAP];
      return s ? <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.fg, fontWeight: 600 }} /> : (row.statusLabel ?? row.status);
    },
  },
  {
    field: 'tipoManutencao', headerName: 'Tipo Manut', width: 130,
    renderCell: ({ row }) => {
      const t = TIPO_MANUT_MAP[row.tipoManutencao ?? ''];
      return t ? <Chip label={t.label} size="small" sx={{ color: t.color, borderColor: t.color }} variant="outlined" /> : (row.tipoManutencaoLabel ?? row.tipoManutencao ?? '—');
    },
  },
  { field: 'dataAbertura', headerName: 'Abertura', width: 105, renderCell: ({ value }) => fmtDate(value) },
  { field: 'dataInicio', headerName: 'Inicio', width: 105, renderCell: ({ value }) => fmtDate(value) },
  { field: 'dataFin', headerName: 'Fim', width: 105, renderCell: ({ value }) => fmtDate(value) },
  { field: 'custoTotal', headerName: 'Custo', width: 120, renderCell: ({ value }) => fmtBrl(value ?? 0) },
  {
    field: 'diasAberto', headerName: 'Dias', width: 80, type: 'number',
    renderCell: ({ value }) => value != null ? `${value}d` : '—',
  },
];

export function VeiculoDetailPage() {
  const { codveiculo: codParam } = useParams();
  const navigate = useNavigate();
  const codveiculo = Number(codParam) || null;

  const { data: dash, isLoading } = useVeiculoDashboard(codveiculo);
  const { data: proximas = [] } = useVeiculoProximaManutencao(codveiculo);
  const { data: aderencia } = useVeiculoAderencia(codveiculo);
  const { data: historico = [] } = useVeiculoHistorico(codveiculo);
  const { data: custos = [] } = useVeiculoCustos(codveiculo);
  const { data: servicos = [] } = useVeiculoServicosFrequentes(codveiculo);

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;

  const veiculo = dash?.veiculo;
  const score = aderencia?.score ?? dash?.scoreAderencia ?? null;
  const scoreColor = score === null ? 'text.secondary' : score >= 80 ? 'success.main' : score >= 50 ? 'warning.main' : 'error.main';

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>
          {veiculo?.placa ? `Veiculo ${veiculo.placa}` : `Veiculo #${codveiculo}`}
        </Typography>
        {veiculo?.adTag && <Chip label={veiculo.adTag} size="small" color="primary" />}
        {veiculo?.tipoEquipamento && <Chip label={veiculo.tipoEquipamento} size="small" variant="outlined" />}
        {dash?.statusOperacional && (
          <Chip
            label={dash.statusOperacional}
            size="small"
            color={dash.statusOperacional === 'OPERACIONAL' ? 'success' : dash.statusOperacional === 'EM_MANUTENCAO' ? 'warning' : 'error'}
          />
        )}
      </Box>

      {/* KPI Row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <KpiCard label="OS Ativas" value={dash?.osAtivasCount ?? 0} />
        <KpiCard label="Custo Mes Atual" value={fmtBrl(dash?.custos?.mesAtual ?? 0)} />
        <KpiCard label="Custo Acumulado Ano" value={fmtBrl(dash?.custos?.acumuladoAno ?? 0)} />
        <KpiCard label="Media Mensal" value={fmtBrl(dash?.custos?.mediaMensal ?? 0)} />
      </Box>

      <Grid container spacing={2}>
        {/* Proxima Manutencao */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Proxima Manutencao</Typography>
            {proximas.length === 0 ? (
              <Typography color="text.secondary" variant="body2">Nenhuma manutencao prevista.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {proximas.map((p) => (
                  <Paper key={p.nuplano} variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="body2" fontWeight={600}>{p.descricao}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip label={p.tipoLabel ?? TIPO_MANUT_MAP[p.tipo ?? '']?.label ?? p.tipo} size="small" />
                      <Chip
                        label={p.statusPlano}
                        size="small"
                        color={p.statusPlano === 'ATIVO' ? 'success' : p.statusPlano === 'VENCIDO' ? 'error' : 'warning'}
                      />
                      {p.diasAtraso != null && p.diasAtraso > 0 && (
                        <Chip label={`${p.diasAtraso}d atraso`} size="small" color="error" />
                      )}
                      {p.kmProximo != null && (
                        <Chip label={`${p.kmProximo} km`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Aderencia */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Aderencia ao Plano</Typography>
            {score === null ? (
              <Typography color="text.secondary" variant="body2">Sem dados de aderencia.</Typography>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h3" fontWeight={700} color={scoreColor}>{score}%</Typography>
                <LinearProgress variant="determinate" value={score} color={score >= 80 ? 'success' : score >= 50 ? 'warning' : 'error'} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {score >= 80 ? 'Excelente' : score >= 50 ? 'Atencao' : 'Critico'} — meta 80%
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Custos Chart */}
        <Grid size={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Custos Mensais</Typography>
            {custos.length === 0 ? (
              <Typography color="text.secondary" variant="body2">Sem dados de custo.</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={custos as VeiculoCusto[]} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => fmtBrl(v as number)} />
                  <Bar dataKey="custo" fill="#1976d2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Historico DataGrid */}
        <Grid size={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Historico de OS</Typography>
            <DataGrid
              rows={historico}
              columns={HISTORICO_COLS}
              getRowId={(r) => r.nuos}
              autoHeight
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              density="compact"
              disableRowSelectionOnClick
            />
          </Paper>
        </Grid>

        {/* Servicos Frequentes */}
        {servicos.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Servicos Frequentes</Typography>
              <Box component="ol" sx={{ m: 0, pl: 2 }}>
                {servicos.slice(0, 8).map((s) => (
                  <Box component="li" key={s.codprod} sx={{ py: 0.5 }}>
                    <Typography variant="body2">
                      {s.servico ?? `#${s.codprod}`}
                      <Chip label={`${s.execucoes}x`} size="small" sx={{ ml: 1 }} />
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
