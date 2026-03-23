import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Typography, Stack, Chip, alpha, keyframes, Paper,
  AvatarGroup, Tooltip, IconButton, Divider,
} from '@mui/material';
import {
  FlightTakeoff, FlightLand, FiberManualRecord, Fullscreen,
  FullscreenExit, ArrowBack, AccessTime, Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchPainel } from '@/api/hstvei';
import { PlacaVeiculo } from '@/components/shared/placa-veiculo';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { PainelVeiculo, PainelPessoa } from '@/types/hstvei-types';

// ── Constants ──

const REFRESH_MS = 30_000;

const SAIDA_SITUACOES = new Set([
  'Agendado', 'Mobilizando', 'Em Trânsito', 'Entregue',
]);

const CHEGADA_SITUACOES = new Set([
  'Desmobilizando', 'Retorno Pendente', 'No Pátio',
]);

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  'Agendado':          { color: '#42a5f5', bg: '#1a237e' },
  'Mobilizando':       { color: '#ffa726', bg: '#4e342e' },
  'Em Trânsito':       { color: '#66bb6a', bg: '#1b5e20' },
  'Entregue':          { color: '#26c6da', bg: '#004d40' },
  'Desmobilizando':    { color: '#ffa726', bg: '#4e342e' },
  'Retorno Pendente':  { color: '#ef5350', bg: '#b71c1c' },
  'No Pátio':          { color: '#66bb6a', bg: '#1b5e20' },
};

const PRI_CONFIG: Record<string, { color: string; label: string }> = {
  URG: { color: '#ef5350', label: 'Urgente' },
  ALT: { color: '#ffa726', label: 'Alta' },
  NOR: { color: '#66bb6a', label: 'Normal' },
  BAI: { color: '#78909c', label: 'Baixa' },
};

// ── Animations ──

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulseGlow = keyframes`
  0%, 100% { opacity: 1; box-shadow: 0 0 4px currentColor; }
  50% { opacity: 0.5; box-shadow: 0 0 12px currentColor; }
`;

// ── Types ──

interface BoardRow {
  id: number;
  tag: string;
  placa: string;
  modelo: string;
  tipo: string;
  capacidade: string;
  situacao: string;
  destino: string;
  descricao: string;
  horario: string;
  data: string;
  prioridadeSigla: string;
  operadores: PainelPessoa[];
  mecanicos: PainelPessoa[];
}

// ── Helpers ──

function fmtTime(val: string | null | undefined): string {
  if (!val) return '--:--';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function fmtDateShort(val: string | null | undefined): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
}

function buildBoardRows(
  veiculos: PainelVeiculo[],
  filter: Set<string>,
  mode: 'saida' | 'chegada',
): BoardRow[] {
  const rows: BoardRow[] = [];
  for (const v of veiculos) {
    for (const s of v.situacoesAtivas ?? []) {
      if (!filter.has(s.situacao ?? '')) continue;
      const isSaida = mode === 'saida';
      const dateRef = isSaida ? (s.dtprevisao ?? s.dtinicio) : s.dtinicio;
      rows.push({
        id: s.id,
        tag: v.tag ?? '',
        placa: v.placa ?? '',
        modelo: v.marcaModelo ?? '',
        tipo: v.tipo ?? '',
        capacidade: v.capacidade ?? '',
        situacao: s.situacao ?? '',
        destino: s.nomeParc ?? '',
        descricao: s.descricao ?? '',
        horario: fmtTime(dateRef),
        data: fmtDateShort(dateRef),
        prioridadeSigla: s.prioridadeSigla ?? 'NOR',
        operadores: s.operadores ?? [],
        mecanicos: s.mecanicos ?? [],
      });
    }
  }
  const priOrder: Record<string, number> = { URG: 0, ALT: 1, NOR: 2, BAI: 3 };
  rows.sort((a, b) => (priOrder[a.prioridadeSigla] ?? 9) - (priOrder[b.prioridadeSigla] ?? 9));
  return rows;
}

// ── Clock ──

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <Stack alignItems="center" spacing={0}>
      <Typography
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: { xs: 32, md: 48 },
          fontWeight: 700,
          color: '#fff',
          letterSpacing: 6,
          lineHeight: 1,
          textShadow: '0 0 20px rgba(66,165,245,0.3)',
        }}
      >
        {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </Typography>
      <Typography sx={{ fontSize: 12, color: alpha('#fff', 0.5), fontWeight: 500, textTransform: 'capitalize' }}>
        {now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
      </Typography>
    </Stack>
  );
}

// ── People Avatars ──

function PeopleAvatars({ operadores, mecanicos }: { operadores: PainelPessoa[]; mecanicos: PainelPessoa[] }) {
  const all = [...operadores, ...mecanicos];
  if (all.length === 0) return <Typography sx={{ fontSize: 10, color: alpha('#fff', 0.25) }}>--</Typography>;

  return (
    <Stack direction="row" spacing={-0.5} alignItems="center">
      {all.slice(0, 4).map((p) => {
        const isOp = operadores.includes(p);
        return (
          <Tooltip
            key={p.codusu}
            title={`${p.nome} (${isOp ? 'Operador' : 'Mecanico'})`}
            arrow
            placement="top"
          >
            <Box sx={{
              border: `2px solid ${isOp ? '#1565c0' : '#e65100'}`,
              borderRadius: '50%',
              p: '1px',
            }}>
              <FuncionarioAvatar
                codparc={p.codparc}
                nome={p.nome}
                size="medium"
                sx={{
                  width: 38,
                  height: 38,
                  fontSize: 14,
                  bgcolor: isOp ? '#1565c0' : '#e65100',
                }}
              />
            </Box>
          </Tooltip>
        );
      })}
      {all.length > 4 && (
        <Box sx={{
          width: 38, height: 38, borderRadius: '50%',
          bgcolor: alpha('#fff', 0.1), display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography sx={{ fontSize: 11, color: alpha('#fff', 0.5), fontWeight: 700 }}>
            +{all.length - 4}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}

// ── Priority Indicator ──

function PriorityDot({ sigla }: { sigla: string }) {
  const cfg = PRI_CONFIG[sigla] ?? PRI_CONFIG.NOR;
  const isUrgent = sigla === 'URG';

  return (
    <Tooltip title={cfg.label} arrow>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: cfg.color,
          flexShrink: 0,
          animation: isUrgent ? `${pulseGlow} 1.5s infinite` : 'none',
          color: cfg.color,
        }}
      />
    </Tooltip>
  );
}

// ── Board Row ──

function BoardRowCard({ row, index }: { row: BoardRow; index: number }) {
  const stCfg = STATUS_CONFIG[row.situacao] ?? { color: '#78909c', bg: '#263238' };
  const isMoving = row.situacao === 'Em Trânsito' || row.situacao === 'Mobilizando';

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2.5,
        py: 1.5,
        mx: 1,
        mb: 1,
        bgcolor: alpha('#fff', 0.03),
        borderRadius: 2,
        border: `1px solid ${alpha('#fff', 0.06)}`,
        animation: `${fadeSlideIn} 0.3s ease-out ${index * 0.04}s both`,
        transition: 'all 0.25s ease',
        '&:hover': {
          bgcolor: alpha('#fff', 0.07),
          borderColor: alpha(stCfg.color, 0.3),
          transform: 'scale(1.005)',
        },
      }}
    >
      {/* Priority */}
      <PriorityDot sigla={row.prioridadeSigla} />

      {/* Horario */}
      <Stack alignItems="center" sx={{ minWidth: 52, flexShrink: 0 }}>
        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 16,
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1,
          }}
        >
          {row.horario}
        </Typography>
        <Typography sx={{ fontSize: 9, color: alpha('#fff', 0.4), mt: 0.25 }}>
          {row.data}
        </Typography>
      </Stack>

      {/* Placa Mercosul */}
      <Box sx={{ flexShrink: 0 }}>
        <PlacaVeiculo placa={row.placa} scale={0.75} />
      </Box>

      {/* Tag + Modelo + Capacidade */}
      <Stack sx={{ minWidth: 130, flexShrink: 0 }}>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 800,
            color: '#90caf9',
            fontFamily: 'monospace',
            lineHeight: 1.2,
          }}
        >
          {row.tag || '--'}
        </Typography>
        <Typography
          sx={{
            fontSize: 11,
            color: alpha('#fff', 0.5),
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 150,
          }}
        >
          {row.tipo || row.modelo}
        </Typography>
        {row.capacidade && (
          <Typography sx={{ fontSize: 9, color: alpha('#fff', 0.3), fontWeight: 600 }}>
            {row.capacidade}
          </Typography>
        )}
      </Stack>

      {/* Destino / Descricao */}
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: '#e0e0e0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.3,
          }}
        >
          {row.destino || row.descricao || row.modelo}
        </Typography>
        {row.destino && row.descricao && (
          <Typography
            sx={{
              fontSize: 10,
              color: alpha('#fff', 0.35),
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {row.descricao}
          </Typography>
        )}
      </Stack>

      {/* Equipe */}
      <Box sx={{ flexShrink: 0 }}>
        <PeopleAvatars operadores={row.operadores} mecanicos={row.mecanicos} />
      </Box>

      {/* Status */}
      <Chip
        icon={
          <FiberManualRecord
            sx={{
              fontSize: '8px !important',
              color: `${stCfg.color} !important`,
              animation: isMoving ? `${pulseGlow} 1.5s infinite` : 'none',
            }}
          />
        }
        label={row.situacao}
        size="small"
        sx={{
          height: 24,
          fontSize: 10,
          fontWeight: 700,
          bgcolor: alpha(stCfg.color, 0.12),
          color: stCfg.color,
          border: `1px solid ${alpha(stCfg.color, 0.25)}`,
          borderRadius: 1.5,
          flexShrink: 0,
          minWidth: 110,
          justifyContent: 'flex-start',
          '& .MuiChip-label': { px: 0.8 },
        }}
      />
    </Paper>
  );
}

// ── Board Column ──

interface BoardColumnProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  rows: BoardRow[];
  accentColor: string;
}

function BoardColumn({ title, subtitle, icon, rows, accentColor }: BoardColumnProps) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: alpha('#000', 0.2),
        border: `1px solid ${alpha('#fff', 0.06)}`,
      }}
    >
      {/* Column Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 2,
          background: `linear-gradient(135deg, ${alpha(accentColor, 0.15)} 0%, ${alpha(accentColor, 0.05)} 100%)`,
          borderBottom: `2px solid ${alpha(accentColor, 0.4)}`,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: alpha(accentColor, 0.15),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor,
          }}
        >
          {icon}
        </Box>
        <Stack spacing={0} sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 800,
              color: '#fff',
              letterSpacing: 3,
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ fontSize: 11, color: alpha('#fff', 0.4) }}>
            {subtitle}
          </Typography>
        </Stack>
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            bgcolor: alpha(accentColor, 0.15),
            border: `1px solid ${alpha(accentColor, 0.3)}`,
          }}
        >
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 800,
              color: accentColor,
              fontFamily: 'monospace',
              lineHeight: 1,
            }}
          >
            {rows.length}
          </Typography>
        </Box>
      </Box>

      {/* Table Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 3,
          py: 0.75,
          borderBottom: `1px solid ${alpha('#fff', 0.06)}`,
        }}
      >
        {['', 'Hora', 'Placa', 'Veiculo', 'Destino / Descricao', 'Equipe', 'Status'].map((h, i) => (
          <Typography
            key={h || i}
            sx={{
              fontSize: 9,
              fontWeight: 700,
              color: alpha('#fff', 0.25),
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              flex: h === 'Destino / Descricao' ? 1 : undefined,
              minWidth: h === 'Hora' ? 52 : h === 'Placa' ? 60 : h === 'Veiculo' ? 120 : h === 'Status' ? 110 : h === 'Equipe' ? 80 : h === '' ? 10 : undefined,
            }}
          >
            {h}
          </Typography>
        ))}
      </Box>

      {/* Rows */}
      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0, py: 0.5 }}>
        {rows.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
            <Stack alignItems="center" spacing={1}>
              <AccessTime sx={{ fontSize: 40, color: alpha('#fff', 0.1) }} />
              <Typography sx={{ color: alpha('#fff', 0.2), fontSize: 14 }}>
                Nenhuma movimentacao
              </Typography>
            </Stack>
          </Box>
        ) : (
          rows.map((row, i) => <BoardRowCard key={row.id} row={row} index={i} />)
        )}
      </Box>
    </Box>
  );
}

// ── Stat Card ──

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Stack
      alignItems="center"
      spacing={0}
      sx={{
        px: 2,
        py: 0.5,
        borderRadius: 2,
        bgcolor: alpha(color, 0.08),
        border: `1px solid ${alpha(color, 0.15)}`,
      }}
    >
      <Typography
        sx={{
          fontSize: 24,
          fontWeight: 800,
          color,
          fontFamily: '"JetBrains Mono", monospace',
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
      <Typography sx={{ fontSize: 9, color: alpha('#fff', 0.4), textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Typography>
    </Stack>
  );
}

// ── Main Page ──

export function PainelAeroportoPage() {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data, dataUpdatedAt } = useQuery({
    queryKey: ['hstvei', 'painel'],
    queryFn: fetchPainel,
    refetchInterval: REFRESH_MS,
    staleTime: 10_000,
  });

  const veiculos = data?.veiculos ?? [];

  const saidas = useMemo(
    () => buildBoardRows(veiculos, SAIDA_SITUACOES, 'saida'),
    [veiculos],
  );

  const chegadas = useMemo(
    () => buildBoardRows(veiculos, CHEGADA_SITUACOES, 'chegada'),
    [veiculos],
  );

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const lastUpdate = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('pt-BR')
    : '--:--:--';

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(180deg, #0a1929 0%, #0d2137 50%, #0a1929 100%)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1.5,
          borderBottom: `1px solid ${alpha('#fff', 0.06)}`,
          bgcolor: alpha('#000', 0.3),
          backdropFilter: 'blur(10px)',
          flexShrink: 0,
        }}
      >
        {/* Left */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Tooltip title="Voltar ao Quadro">
            <IconButton onClick={() => navigate('/quadro')} sx={{ color: alpha('#fff', 0.4) }}>
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Stack spacing={0}>
            <Typography
              sx={{
                fontSize: 24,
                fontWeight: 900,
                background: 'linear-gradient(90deg, #42a5f5, #26c6da)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: 4,
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              Gigantao Locadora
            </Typography>
            <Typography sx={{ fontSize: 11, color: alpha('#fff', 0.3), letterSpacing: 2 }}>
              Painel de Movimentacao da Frota
            </Typography>
          </Stack>
        </Stack>

        {/* Center: Clock */}
        <LiveClock />

        {/* Right */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <StatCard label="Frota" value={veiculos.length} color="#42a5f5" />
          <StatCard label="Saidas" value={saidas.length} color="#66bb6a" />
          <StatCard label="Chegadas" value={chegadas.length} color="#ffa726" />

          <Divider orientation="vertical" flexItem sx={{ borderColor: alpha('#fff', 0.08) }} />

          <Tooltip title={isFullscreen ? 'Sair do fullscreen' : 'Tela cheia'}>
            <IconButton onClick={toggleFullscreen} sx={{ color: alpha('#fff', 0.4) }}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* ── Board Columns ── */}
      <Box sx={{ flex: 1, display: 'flex', gap: 2, p: 2, minHeight: 0 }}>
        <BoardColumn
          title="Saidas"
          subtitle="Veiculos em mobilizacao e transito"
          icon={<FlightTakeoff sx={{ fontSize: 26 }} />}
          rows={saidas}
          accentColor="#66bb6a"
        />
        <BoardColumn
          title="Chegadas"
          subtitle="Veiculos retornando e no patio"
          icon={<FlightLand sx={{ fontSize: 26 }} />}
          rows={chegadas}
          accentColor="#ffa726"
        />
      </Box>

      {/* ── Footer ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 0.75,
          borderTop: `1px solid ${alpha('#fff', 0.04)}`,
          bgcolor: alpha('#000', 0.3),
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Refresh sx={{ fontSize: 12, color: alpha('#fff', 0.2) }} />
          <Typography sx={{ fontSize: 10, color: alpha('#fff', 0.2) }}>
            Atualizado: {lastUpdate} | Auto-refresh: {REFRESH_MS / 1000}s
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2.5}>
          {Object.entries(PRI_CONFIG).map(([sigla, cfg]) => (
            <Stack key={sigla} direction="row" alignItems="center" spacing={0.5}>
              <FiberManualRecord sx={{ fontSize: 8, color: cfg.color }} />
              <Typography sx={{ fontSize: 9, color: alpha('#fff', 0.3) }}>{cfg.label}</Typography>
            </Stack>
          ))}
          <Divider orientation="vertical" flexItem sx={{ borderColor: alpha('#fff', 0.06) }} />
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1565c0' }} />
            <Typography sx={{ fontSize: 9, color: alpha('#fff', 0.3) }}>Operador</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#e65100' }} />
            <Typography sx={{ fontSize: 9, color: alpha('#fff', 0.3) }}>Mecanico</Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
