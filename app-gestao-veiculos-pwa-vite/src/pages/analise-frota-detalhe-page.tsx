import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Paper, IconButton, Chip, Skeleton, Avatar, Collapse, Tabs, Tab } from '@mui/material';
import { ArrowBack, Build, TrendingUp, TrendingDown, TrendingFlat, ExpandMore, Schedule } from '@mui/icons-material';
import { PlacaVeiculo } from '@/components/shared/placa-veiculo';
import { fetchAnaliseVeiculo, type FrotaRow } from '@/api/analise-frota';
import { fetchOsDetail, type OsExecutor } from '@/api/os-detail';

const R = 1;
const RISCO = {
  alto: { bg: '#c62828', text: '#fff', label: 'ALTO', desc: 'Considerar venda' },
  medio: { bg: '#e65100', text: '#fff', label: 'MEDIO', desc: 'Monitorar' },
  baixo: { bg: '#2e7d32', text: '#fff', label: 'OK', desc: 'Saudavel' },
} as const;
const TEND = {
  subindo: { icon: <TrendingUp sx={{ fontSize: 18, color: '#c62828' }} />, label: 'Custo subindo' },
  estavel: { icon: <TrendingFlat sx={{ fontSize: 18, color: '#888' }} />, label: 'Estavel' },
  descendo: { icon: <TrendingDown sx={{ fontSize: 18, color: '#2e7d32' }} />, label: 'Custo caindo' },
} as const;
const STATUS_BG: Record<string, string> = { A: '#f9a825', E: '#1565c0', F: '#2e7d32', C: '#9e9e9e', R: '#c62828' };
const MANUT_BG: Record<string, string> = { C: '#e65100', P: '#1565c0' };

const R$ = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const fData = (d: string | null) => d ? new Date(d.substring(0, 10) + 'T12:00:00').toLocaleDateString('pt-BR') : '—';
const fMin = (m: number | null) => { if (!m || m <= 0) return ''; const h = Math.floor(m / 60); return h > 0 ? `${h}h${String(m % 60).padStart(2, '0')}min` : `${m}min`; };

function getFotoUrl(codparc: number): string {
  const base = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3000`;
  try {
    const stored = JSON.parse(localStorage.getItem('gestao-veiculos-auth') || '{}');
    const token = stored?.state?.user?.token || '';
    return `${base}/funcionarios/${codparc}/foto?token=${token}`;
  } catch {
    return `${base}/funcionarios/${codparc}/foto`;
  }
}

function Tag({ label, color }: { label: string; color?: string }) {
  return <Box sx={{ px: 0.6, py: 0.2, borderRadius: R, bgcolor: color ?? '#eee', display: 'inline-flex' }}><Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: color ? '#fff' : '#555' }}>{label}</Typography></Box>;
}

export function AnaliseFrotaDetalhePage() {
  const nav = useNavigate();
  const { codveiculo } = useParams<{ codveiculo: string }>();
  const cod = Number(codveiculo);
  const [tab, setTab] = useState(0);

  const { data, isLoading } = useQuery({ queryKey: ['analise-frota-det', cod], queryFn: () => fetchAnaliseVeiculo(cod), enabled: cod > 0 });
  const v = data?.veiculo as FrotaRow | null;
  const osHistory = (data?.osHistory ?? []) as any[];
  const notas = (data?.notasComerciais ?? []) as any[];

  if (isLoading) return <Box sx={{ p: 2 }}>{[1, 2, 3].map((i) => <Skeleton key={i} variant="rectangular" height={100} sx={{ mb: 1, borderRadius: R }} />)}</Box>;
  if (!v) return <Box sx={{ p: 2 }}><IconButton onClick={() => nav(-1)}><ArrowBack /></IconButton><Typography sx={{ mt: 2, textAlign: 'center', color: '#999' }}>Veiculo nao encontrado</Typography></Box>;

  const rc = RISCO[v.risco];
  const td = TEND[v.tendencia];

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
        <IconButton onClick={() => nav(-1)} size="small" sx={{ minWidth: 44, minHeight: 44 }}><ArrowBack /></IconButton>
        <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>Detalhe do Veiculo</Typography>
      </Box>

      {/* Placa + info */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.75 }}><PlacaVeiculo placa={v.placa} label={v.tag || 'VEI'} scale={1} /></Box>
      <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}>{v.marcamodelo}</Typography>
      <Typography sx={{ fontSize: '0.82rem', color: '#888', textAlign: 'center' }}>{v.tipoEqpto} · {v.idadeAnos} anos · {v.categoria}</Typography>

      {/* Score */}
      <Paper sx={{ p: 1.5, my: 1.5, borderRadius: R, bgcolor: rc.bg, color: rc.text, textAlign: 'center' }}>
        <Typography sx={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{v.scoreRisco}</Typography>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>Risco {rc.label} — {rc.desc}</Typography>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>{td.icon}<Typography sx={{ fontSize: '0.78rem' }}>{td.label}</Typography></Box>
      </Paper>

      {/* KPIs */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75, mb: 1.5 }}>
        <Kpi label="Total de OS" value={`${v.totalOS}`} color="#1565c0" />
        <Kpi label="OS em aberto" value={`${v.osAbertas}`} color={v.osAbertas > 0 ? '#c62828' : '#2e7d32'} />
        <Kpi label="Custo ult. 6 meses" value={R$(v.custo6m)} color="#1565c0" />
        <Kpi label="Custo total" value={R$(v.custoTotal)} color="#c62828" />
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, t) => setTab(t)} sx={{ mb: 1, '& .MuiTab-root': { fontSize: '0.82rem', fontWeight: 700, textTransform: 'none', minHeight: 44 } }}>
        <Tab label={`OS Manutencao (${osHistory.length})`} />
        <Tab label={`Notas (${notas.length})`} />
      </Tabs>

      {/* Tab 0: OS */}
      {tab === 0 && osHistory.map((o: any) => <OsCard key={o.nuos} os={o} />)}
      {tab === 0 && osHistory.length === 0 && <Empty text="Nenhuma OS" />}

      {/* Tab 1: Notas */}
      {tab === 1 && notas.map((n: any) => (
        <Paper key={n.nunota} elevation={0} sx={{ mb: 0.75, borderRadius: R, border: '1px solid #e0e0e0', p: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700 }}>Nota {n.numnota}</Typography>
            <Chip label={n.statusLabel} size="small" sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, borderRadius: R }} />
            <Box sx={{ flex: 1 }} />
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#c62828' }}>{R$(n.vlrNota ?? 0)}</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.78rem', color: '#1565c0', fontWeight: 600 }}>{n.tipoOperacao}</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>{fData(n.dtNeg)} · {n.parceiro}</Typography>
          {n.usuInclusao && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              {n.codparcUsu > 0 && <Avatar src={getFotoUrl(n.codparcUsu)} sx={{ width: 22, height: 22, fontSize: '0.55rem', bgcolor: '#999' }}>{n.usuInclusao.charAt(0)}</Avatar>}
              <Typography sx={{ fontSize: '0.68rem', color: '#aaa' }}>por {n.usuInclusao}</Typography>
            </Box>
          )}
        </Paper>
      ))}
      {tab === 1 && notas.length === 0 && <Empty text="Nenhuma nota" />}
    </Box>
  );
}

/* ── OS Card ── */
function OsCard({ os: o }: { os: any }) {
  const [open, setOpen] = useState(false);
  const { data: detail } = useQuery({ queryKey: ['os-detail', o.nuos], queryFn: () => fetchOsDetail(o.nuos), enabled: open });
  const stBg = STATUS_BG[o.status] ?? '#999';

  return (
    <Paper elevation={0} sx={{ mb: 1, borderRadius: R, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
      <Box onClick={() => setOpen(!open)} sx={{ cursor: 'pointer', '&:active': { bgcolor: '#fafafa' } }}>
        {/* Line 1: numero + status + custo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.25, pt: 1.25 }}>
          <Build sx={{ fontSize: 18, color: stBg }} />
          <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>OS {o.nuos}</Typography>
          <Chip label={o.statusLabel} size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 700, bgcolor: stBg, color: '#fff', borderRadius: R }} />
          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: o.custoOS > 0 ? '#c62828' : '#bbb' }}>{R$(o.custoOS ?? 0)}</Typography>
          <ExpandMore sx={{ fontSize: 22, color: '#999', transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        </Box>

        {/* Line 2: tags */}
        <Box sx={{ display: 'flex', gap: 0.5, px: 1.25, py: 0.5, flexWrap: 'wrap' }}>
          {o.manutencaoLabel && <Tag label={o.manutencaoLabel} color={MANUT_BG[o.manutencao]} />}
          {o.tipoLabel && <Tag label={o.tipoLabel} />}
          {o.localLabel && <Tag label={o.localLabel} />}
          {o.finalizacaoLabel && <Tag label={o.finalizacaoLabel} />}
        </Box>

        {/* Line 3: servico principal (SEM noWrap — texto completo!) */}
        {o.primeiroServico && (
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#333', px: 1.25, pb: 0.5, lineHeight: 1.3 }}>
            {o.primeiroServico}
          </Typography>
        )}

        {/* Line 4: datas + quem abriu */}
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1.25, pb: 1.25 }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#888', flex: 1 }}>
            {fData(o.dtAbertura)}{o.dtFim ? ` → ${fData(o.dtFim)}` : ''} · {o.dias} dias · {o.qtdServicos} serv.
          </Typography>
          {o.abrPor && o.abrCodparc > 0 && (
            <Avatar src={getFotoUrl(o.abrCodparc)} sx={{ width: 22, height: 22, fontSize: '0.55rem', bgcolor: '#2e7d32' }}>{o.abrPor.charAt(0)}</Avatar>
          )}
        </Box>
      </Box>

      {/* Expanded: servicos + executores */}
      <Collapse in={open}>
        <Box sx={{ px: 1.25, pb: 1.5, borderTop: '1px solid #f0f0f0' }}>
          {detail ? (
            <>
              {/* Servicos — COMPLETOS */}
              {detail.servicos?.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, mb: 0.75 }}>Servicos ({detail.servicos.length})</Typography>
                  {detail.servicos.map((s: any, i: number) => {
                    const sBg = STATUS_BG[s.STATUS] ?? '#999';
                    return (
                      <Paper key={i} elevation={0} sx={{ p: 1, mb: 0.75, borderRadius: R, bgcolor: '#fafafa', border: '1px solid #eee' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                          <Box sx={{ flex: 1 }}>
                            {/* Nome completo do servico — SEM noWrap */}
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#333', lineHeight: 1.3 }}>
                              {s.nomeProduto ?? 'Servico'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.68rem', color: '#999', fontFamily: 'monospace' }}>
                              Cod. {s.CODPROD}{s.nomeGrupo ? ` · ${s.nomeGrupo}` : ''}
                            </Typography>
                          </Box>
                          <Chip label={s.statusLabel ?? s.STATUS} size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 700, bgcolor: sBg, color: '#fff', borderRadius: R, flexShrink: 0 }} />
                        </Box>
                        {/* Tempo + valor */}
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          {s.TEMPO > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                              <Schedule sx={{ fontSize: 13, color: '#999' }} />
                              <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>{fMin(s.TEMPO)}</Typography>
                            </Box>
                          )}
                          {s.VLRTOT > 0 && <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#c62828' }}>{R$(s.VLRTOT)}</Typography>}
                        </Box>
                        {/* Observacao — SEM noWrap */}
                        {s.OBSERVACAO && (
                          <Typography sx={{ fontSize: '0.72rem', color: '#888', mt: 0.5, fontStyle: 'italic', lineHeight: 1.3 }}>
                            {s.OBSERVACAO}
                          </Typography>
                        )}
                      </Paper>
                    );
                  })}
                </Box>
              )}

              {/* Executores com fotos */}
              {detail.executores?.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, mb: 0.75 }}>Executores ({detail.executores.length})</Typography>
                  {detail.executores.map((ex: OsExecutor, i: number) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75, borderBottom: '1px solid #f5f5f5' }}>
                      <Avatar
                        src={ex.codparc && ex.codparc > 0 ? getFotoUrl(ex.codparc) : undefined}
                        sx={{ width: 40, height: 40, bgcolor: '#2e7d32', fontSize: '0.85rem', fontWeight: 700 }}
                      >
                        {(ex.nomeColaborador ?? ex.nomeUsuario ?? '?').charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 600 }}>
                          {ex.nomeColaborador ?? ex.nomeUsuario}
                        </Typography>
                        {ex.nomeUsuario && (
                          <Typography sx={{ fontSize: '0.72rem', color: '#1565c0', fontWeight: 600 }}>@{ex.nomeUsuario}</Typography>
                        )}
                        <Typography sx={{ fontSize: '0.68rem', color: '#888' }}>
                          {ex.dtIni ? fData(ex.dtIni) : ''}{ex.dtFin ? ` → ${fData(ex.dtFin)}` : ''}
                          {ex.minutos && ex.minutos > 0 ? ` · ${fMin(ex.minutos)}` : ''}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              {!detail.servicos?.length && !detail.executores?.length && <Empty text="Sem detalhes" />}
            </>
          ) : (
            <Box sx={{ py: 2 }}><Skeleton variant="rectangular" height={60} sx={{ borderRadius: R }} /></Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

function Empty({ text }: { text: string }) {
  return <Typography sx={{ textAlign: 'center', color: '#bbb', py: 3, fontSize: '0.85rem' }}>{text}</Typography>;
}

function Kpi({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: R, border: '1px solid #e0e0e0' }}>
      <Typography sx={{ fontSize: '0.68rem', color: '#999', fontWeight: 600 }}>{label}</Typography>
      <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color }} noWrap>{value}</Typography>
    </Paper>
  );
}
