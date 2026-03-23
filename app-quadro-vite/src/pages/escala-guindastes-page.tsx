import { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Typography, Stack, Chip, alpha, keyframes, IconButton,
  Tooltip, Divider, Paper, Slider,
} from '@mui/material';
import {
  ArrowBack, Fullscreen, FullscreenExit, Refresh,
  FiberManualRecord, PrecisionManufacturing, LocalShipping,
  FlightTakeoff, FlightLand, AccessTime,
  Add, Remove, RestartAlt, DarkMode, LightMode,
  FormatSize,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchPainel } from '@/api/hstvei';
import { PlacaVeiculo } from '@/components/shared/placa-veiculo';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { PainelVeiculo, PainelPessoa } from '@/types/hstvei-types';

// ══════════════════════════════════════════════════════════════════
// TV 4K — scalable sizing system with user controls
// ══════════════════════════════════════════════════════════════════

const REFRESH_MS = 30_000;

// ── Scale context — everything multiplies by this ──

interface DisplaySettings {
  scale: number;           // 1.0 = base (already large), range 0.7–2.0
  darkMode: boolean;
  compact: boolean;
}

const DisplayCtx = createContext<DisplaySettings>({ scale: 1.2, darkMode: false, compact: false });


function useScale() {
  const { scale } = useContext(DisplayCtx);
  return useCallback((base: number) => Math.round(base * scale), [scale]);
}

function useDisplay() {
  return useContext(DisplayCtx);
}

// ── Data constants ──

const SAIDA_SITUACOES = new Set([
  'Agendado', 'Mobilizando', 'Em Trânsito', 'Entregue',
]);

const CHEGADA_SITUACOES = new Set([
  'Desmobilizando', 'Retorno Pendente', 'No Pátio',
]);

const FAMILIAS_FOCO = new Set(['Guindastes', 'Guindautos']);

function normalizeFamilia(tipo: string | null): string {
  if (!tipo) return 'Outros';
  const t = tipo.trim().toUpperCase();
  if (t.includes('GUINDASTE')) return 'Guindastes';
  if (t.includes('GUINDAUTO')) return 'Guindautos';
  return 'Outros';
}

function isGuindasteOuGuindauto(tipo: string | null): boolean {
  return FAMILIAS_FOCO.has(normalizeFamilia(tipo));
}

// ── Status ──

const STATUS_CONFIG: Record<string, { color: string; darkColor: string; bg: string; label: string }> = {
  'Agendado':         { color: '#1565c0', darkColor: '#64b5f6', bg: '#e3f2fd', label: 'AGENDADO' },
  'Mobilizando':      { color: '#e65100', darkColor: '#ffb74d', bg: '#fff3e0', label: 'MOBILIZANDO' },
  'Em Trânsito':      { color: '#1b5e20', darkColor: '#81c784', bg: '#e8f5e9', label: 'EM TRANSITO' },
  'Entregue':         { color: '#006064', darkColor: '#4dd0e1', bg: '#e0f7fa', label: 'ENTREGUE' },
  'Desmobilizando':   { color: '#e65100', darkColor: '#ffb74d', bg: '#fff3e0', label: 'DESMOBILIZANDO' },
  'Retorno Pendente': { color: '#b71c1c', darkColor: '#ef5350', bg: '#ffebee', label: 'RETORNO PEND.' },
  'No Pátio':         { color: '#33691e', darkColor: '#aed581', bg: '#f1f8e9', label: 'NO PATIO' },
};

const PRI_COLORS: Record<string, string> = {
  URG: '#d50000', ALT: '#e65100', NOR: '#1b5e20', BAI: '#546e7a',
};

// ── Animations ──

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 8px currentColor; }
  50% { box-shadow: 0 0 28px currentColor; }
`;

// ── Types ──

interface BoardRow {
  id: number;
  codveiculo: number;
  placa: string;
  tag: string;
  tipo: string;
  familia: string;
  capacidade: string;
  situacao: string;
  cliente: string;
  local: string;
  horario: string;
  data: string;
  prioridadeSigla: string;
  operadores: PainelPessoa[];
  mecanicos: PainelPessoa[];
}

type FamiliaFilter = 'todos' | 'guindastes' | 'guindautos';

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

function isToday(val: string | null | undefined): boolean {
  if (!val) return false;
  const d = new Date(val);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function buildRows(
  veiculos: PainelVeiculo[],
  situacaoFilter: Set<string>,
  _mode: 'saida' | 'chegada',
  familiaFilter: FamiliaFilter,
): BoardRow[] {
  const rows: BoardRow[] = [];
  for (const v of veiculos) {
    if (!isGuindasteOuGuindauto(v.tipo)) continue;
    const familia = normalizeFamilia(v.tipo);
    if (familiaFilter === 'guindastes' && familia !== 'Guindastes') continue;
    if (familiaFilter === 'guindautos' && familia !== 'Guindautos') continue;

    for (const s of v.situacoesAtivas ?? []) {
      if (!situacaoFilter.has(s.situacao ?? '')) continue;

      const dateRef = s.dtprevisao ?? s.dtinicio;

      // SO MOSTRAR MOVIMENTACOES DE HOJE
      if (!isToday(dateRef)) continue;

      rows.push({
        id: s.id,
        codveiculo: v.codveiculo,
        placa: v.placa ?? '',
        tag: v.tag ?? '',
        tipo: v.tipo ?? '',
        familia,
        capacidade: v.capacidade ?? '',
        situacao: s.situacao ?? '',
        cliente: s.nomeParc ?? s.mosCliente ?? '',
        local: s.descricao ?? '',
        horario: fmtTime(dateRef),
        data: fmtDateShort(dateRef),
        prioridadeSigla: s.prioridadeSigla ?? 'NOR',
        operadores: s.operadores ?? [],
        mecanicos: s.mecanicos ?? [],
      });
    }
  }

  // Ordenar por horario (cronologico como painel aeroporto)
  rows.sort((a, b) => {
    if (a.horario !== b.horario) return a.horario.localeCompare(b.horario);
    const priOrder: Record<string, number> = { URG: 0, ALT: 1, NOR: 2, BAI: 3 };
    return (priOrder[a.prioridadeSigla] ?? 9) - (priOrder[b.prioridadeSigla] ?? 9);
  });
  return rows;
}

// ── Live Clock ──

function LiveClock() {
  const [now, setNow] = useState(new Date());
  const sz = useScale();
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <Stack alignItems="center" spacing={0}>
      <Typography sx={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: sz(56), fontWeight: 700, color: '#1a237e',
        letterSpacing: 6, lineHeight: 1,
      }}>
        {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </Typography>
      <Typography sx={{
        fontSize: sz(16), color: alpha('#000', 0.45), fontWeight: 600,
        textTransform: 'capitalize', letterSpacing: 1,
      }}>
        {now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
      </Typography>
    </Stack>
  );
}

// ── People Row ──

function PeopleRow({ operadores, mecanicos }: { operadores: PainelPessoa[]; mecanicos: PainelPessoa[] }) {
  const sz = useScale();
  const { compact } = useDisplay();
  const all = [...operadores, ...mecanicos];
  if (all.length === 0) {
    return <Typography sx={{ fontSize: sz(20), color: '#bbb', fontWeight: 600 }}>--</Typography>;
  }

  const avatarSize = sz(compact ? 36 : 48);
  const showName = !compact;

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {all.slice(0, 2).map((p) => {
        const isOp = operadores.includes(p);
        return (
          <Stack key={p.codusu} direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{
              border: `${sz(3)}px solid ${isOp ? '#1565c0' : '#e65100'}`,
              borderRadius: '50%', p: '2px',
            }}>
              <FuncionarioAvatar
                codparc={p.codparc}
                nome={p.nome}
                size="medium"
                sx={{ width: avatarSize, height: avatarSize, fontSize: sz(18), bgcolor: isOp ? '#1565c0' : '#e65100' }}
              />
            </Box>
            {showName && (
              <Typography sx={{
                fontSize: sz(18), fontWeight: 700, color: '#333',
                maxWidth: sz(140), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {p.nome?.split(' ')[0]}
              </Typography>
            )}
          </Stack>
        );
      })}
      {all.length > 2 && (
        <Box sx={{
          width: avatarSize, height: avatarSize, borderRadius: '50%',
          bgcolor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography sx={{ fontSize: sz(16), color: '#555', fontWeight: 800 }}>+{all.length - 2}</Typography>
        </Box>
      )}
    </Stack>
  );
}

// ── Row Card ──

function RowCard({ row, index }: { row: BoardRow; index: number }) {
  const sz = useScale();
  const { darkMode, compact } = useDisplay();
  const stCfg = STATUS_CONFIG[row.situacao] ?? { color: '#78909c', darkColor: '#b0bec5', bg: '#eceff1', label: row.situacao };
  const priColor = PRI_COLORS[row.prioridadeSigla] ?? '#78909c';
  const isUrgent = row.prioridadeSigla === 'URG';
  const isGuindaste = row.familia === 'Guindastes';
  const statusColor = darkMode ? stCfg.darkColor : stCfg.color;

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        mx: 1,
        mb: compact ? 0.5 : 1,
        borderRadius: 2,
        overflow: 'hidden',
        animation: `${fadeIn} 0.25s ease-out ${index * 0.04}s both`,
        transition: 'all 0.15s',
        border: '2px solid',
        borderColor: darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08),
        bgcolor: darkMode ? alpha('#fff', 0.04) : '#fff',
        minHeight: sz(compact ? 64 : 88),
      }}
    >
      {/* Priority bar */}
      <Box sx={{
        width: sz(10), alignSelf: 'stretch', flexShrink: 0,
        bgcolor: priColor,
        animation: isUrgent ? `${pulseGlow} 1.5s infinite` : 'none',
        color: priColor,
      }} />

      {/* Familia icon */}
      <Box sx={{
        width: sz(52), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        color: isGuindaste ? (darkMode ? '#ef5350' : '#c62828') : (darkMode ? '#ffb74d' : '#e65100'),
      }}>
        {isGuindaste
          ? <PrecisionManufacturing sx={{ fontSize: sz(32) }} />
          : <LocalShipping sx={{ fontSize: sz(32) }} />
        }
      </Box>

      {/* Horario */}
      <Stack alignItems="center" sx={{ minWidth: sz(100), flexShrink: 0, px: 1 }}>
        <Typography sx={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: sz(28), fontWeight: 800,
          color: darkMode ? '#90caf9' : '#1a237e', lineHeight: 1,
        }}>
          {row.horario}
        </Typography>
        <Typography sx={{ fontSize: sz(16), color: darkMode ? alpha('#fff', 0.5) : '#777', fontWeight: 600, mt: 0.25 }}>
          {row.data}
        </Typography>
      </Stack>

      {/* Placa */}
      <Box sx={{ flexShrink: 0, px: 1 }}>
        <PlacaVeiculo placa={row.placa} scale={sz(100) / 100} />
      </Box>

      {/* Tag + Capacidade */}
      <Stack sx={{ minWidth: sz(160), flexShrink: 0, px: 1.5 }}>
        <Typography sx={{
          fontSize: sz(26), fontWeight: 900,
          color: isGuindaste ? (darkMode ? '#ef5350' : '#c62828') : (darkMode ? '#ffb74d' : '#e65100'),
          fontFamily: '"JetBrains Mono", monospace', lineHeight: 1.2,
        }}>
          {row.tag || '--'}
        </Typography>
        {row.capacidade && (
          <Typography sx={{ fontSize: sz(16), color: darkMode ? alpha('#fff', 0.5) : '#777', fontWeight: 700 }}>
            {row.capacidade}
          </Typography>
        )}
      </Stack>

      {/* Cliente / Local */}
      <Stack sx={{ flex: 1, minWidth: 0, px: 1.5 }}>
        <Typography sx={{
          fontSize: sz(22), fontWeight: 700, color: darkMode ? '#fff' : '#222',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3,
        }}>
          {row.cliente || '--'}
        </Typography>
        {row.local && !compact && (
          <Typography sx={{
            fontSize: sz(16), color: darkMode ? alpha('#fff', 0.4) : '#666', fontWeight: 500,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {row.local}
          </Typography>
        )}
      </Stack>

      {/* Equipe */}
      <Box sx={{ flexShrink: 0, px: 1 }}>
        <PeopleRow operadores={row.operadores} mecanicos={row.mecanicos} />
      </Box>

      {/* Status chip */}
      <Box sx={{ flexShrink: 0, px: 1.5, minWidth: sz(200) }}>
        <Chip
          icon={<FiberManualRecord sx={{ fontSize: `${sz(14)}px !important`, color: `${statusColor} !important` }} />}
          label={stCfg.label}
          sx={{
            height: sz(40), fontSize: sz(16), fontWeight: 800,
            bgcolor: darkMode ? alpha(statusColor, 0.15) : stCfg.bg,
            color: statusColor,
            border: `2px solid ${alpha(statusColor, 0.35)}`,
            borderRadius: 1.5,
            minWidth: sz(180),
            letterSpacing: 1,
            '& .MuiChip-label': { px: 1.5 },
          }}
        />
      </Box>
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
  darkAccent: string;
  headerBg: string;
  darkHeaderBg: string;
}

function BoardColumn({ title, subtitle, icon, rows, accentColor, darkAccent, headerBg, darkHeaderBg }: BoardColumnProps) {
  const sz = useScale();
  const { darkMode } = useDisplay();
  const accent = darkMode ? darkAccent : accentColor;

  return (
    <Box sx={{
      flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
      borderRadius: 3, overflow: 'hidden',
      border: `3px solid ${alpha(accent, darkMode ? 0.4 : 0.25)}`,
      bgcolor: darkMode ? alpha('#000', 0.3) : '#f5f5f5',
    }}>
      {/* Column Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2,
        background: darkMode ? darkHeaderBg : headerBg,
        borderBottom: `4px solid ${accent}`,
      }}>
        <Box sx={{
          width: sz(60), height: sz(60), borderRadius: 2,
          bgcolor: alpha(accent, 0.15),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent,
        }}>
          {icon}
        </Box>
        <Stack spacing={0} sx={{ flex: 1 }}>
          <Typography sx={{
            fontSize: sz(36), fontWeight: 900, color: accent,
            letterSpacing: 4, textTransform: 'uppercase', lineHeight: 1,
            fontFamily: '"Arial Black", "Impact", sans-serif',
          }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: sz(14), color: darkMode ? alpha('#fff', 0.4) : alpha('#000', 0.4), fontWeight: 500 }}>
            {subtitle}
          </Typography>
        </Stack>
        <Box sx={{
          px: 3, py: 1, borderRadius: 2,
          bgcolor: accent, minWidth: sz(56), textAlign: 'center',
        }}>
          <Typography sx={{
            fontSize: sz(40), fontWeight: 900, color: '#fff',
            fontFamily: '"JetBrains Mono", monospace', lineHeight: 1,
          }}>
            {rows.length}
          </Typography>
        </Box>
      </Box>

      {/* Table header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', px: 2, py: 1,
        borderBottom: `2px solid ${darkMode ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
        bgcolor: darkMode ? alpha('#fff', 0.03) : alpha('#000', 0.03),
      }}>
        {[
          { label: '', w: sz(10) },
          { label: '', w: sz(52) },
          { label: 'HORA', w: sz(100) },
          { label: 'PLACA', w: sz(110) },
          { label: 'EQUIP.', w: sz(160) },
          { label: 'CLIENTE / LOCAL', flex: 1 },
          { label: 'OPERADOR', w: sz(220) },
          { label: 'STATUS', w: sz(200) },
        ].map((h, i) => (
          <Typography key={h.label || i} sx={{
            fontSize: sz(14), fontWeight: 800,
            color: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.35),
            textTransform: 'uppercase', letterSpacing: 2,
            flex: h.flex, width: h.w, minWidth: h.w, px: 1,
          }}>
            {h.label}
          </Typography>
        ))}
      </Box>

      {/* Rows */}
      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0, py: 0.5 }}>
        {rows.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 10 }}>
            <Stack alignItems="center" spacing={2}>
              <AccessTime sx={{ fontSize: sz(72), color: darkMode ? alpha('#fff', 0.1) : '#ddd' }} />
              <Typography sx={{ color: darkMode ? alpha('#fff', 0.2) : '#aaa', fontSize: sz(24), fontWeight: 600 }}>
                Nenhuma movimentacao
              </Typography>
            </Stack>
          </Box>
        ) : (
          rows.map((row, i) => <RowCard key={row.id} row={row} index={i} />)
        )}
      </Box>
    </Box>
  );
}

// ── Stat Badge ──

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  const sz = useScale();
  const { darkMode } = useDisplay();
  return (
    <Stack alignItems="center" spacing={0} sx={{
      px: 2.5, py: 0.5, borderRadius: 2,
      bgcolor: alpha(color, darkMode ? 0.2 : 0.1), border: `2px solid ${alpha(color, 0.3)}`,
    }}>
      <Typography sx={{ fontSize: sz(38), fontWeight: 900, color, fontFamily: '"JetBrains Mono", monospace', lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: sz(13), fontWeight: 800, color: alpha(color, 0.7), textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Typography>
    </Stack>
  );
}

// ── Filter chip ──

function FamChip({
  label, icon, count, selected, color, onClick,
}: {
  label: string; icon: React.ReactNode; count: number;
  selected: boolean; color: string; onClick: () => void;
}) {
  const sz = useScale();
  return (
    <Chip
      icon={<Box sx={{ display: 'flex', color: 'inherit' }}>{icon}</Box>}
      label={
        <Stack direction="row" alignItems="center" spacing={1}>
          <span>{label}</span>
          <Box component="span" sx={{
            fontSize: sz(16), fontWeight: 900,
            bgcolor: selected ? alpha('#fff', 0.3) : alpha(color, 0.15),
            color: selected ? '#fff' : color,
            borderRadius: '50%', minWidth: sz(30), height: sz(30),
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {count}
          </Box>
        </Stack>
      }
      onClick={onClick}
      sx={{
        height: sz(50), fontSize: sz(18), fontWeight: 800,
        cursor: 'pointer', transition: 'all 0.15s ease',
        bgcolor: selected ? color : alpha(color, 0.06),
        color: selected ? '#fff' : color,
        border: `3px solid ${selected ? color : alpha(color, 0.25)}`,
        borderRadius: 3,
        '&:hover': { bgcolor: selected ? alpha(color, 0.85) : alpha(color, 0.12), borderColor: color },
        '& .MuiChip-icon': { color: selected ? '#fff' : color, '& svg': { fontSize: sz(24) } },
        '& .MuiChip-label': { pr: 2, pl: 0.5 },
      }}
    />
  );
}

// ══════════════════════════════════════════════════════════════════
// DISPLAY CONTROLS TOOLBAR
// ══════════════════════════════════════════════════════════════════

interface DisplayControlsProps {
  scale: number;
  onScaleChange: (v: number) => void;
  darkMode: boolean;
  onToggleDark: () => void;
  compact: boolean;
  onToggleCompact: () => void;
}

function DisplayControls({ scale, onScaleChange, darkMode, onToggleDark, compact, onToggleCompact }: DisplayControlsProps) {
  const pct = Math.round(scale * 100);
  const btnSx = {
    color: darkMode ? '#fff' : '#333',
    bgcolor: darkMode ? alpha('#fff', 0.08) : alpha('#000', 0.06),
    border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.12)}`,
    borderRadius: 1.5,
    width: 36, height: 36,
    '&:hover': { bgcolor: darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1) },
  };

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      px: 2, py: 0.5,
      bgcolor: darkMode ? alpha('#000', 0.5) : alpha('#000', 0.03),
      borderBottom: `1px solid ${darkMode ? alpha('#fff', 0.06) : alpha('#000', 0.08)}`,
      flexShrink: 0,
    }}>
      <FormatSize sx={{ fontSize: 20, color: darkMode ? alpha('#fff', 0.5) : '#888' }} />
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: darkMode ? alpha('#fff', 0.5) : '#888', mr: 0.5 }}>
        Tamanho:
      </Typography>

      <Tooltip title="Diminuir (-)">
        <IconButton size="small" onClick={() => onScaleChange(Math.max(0.6, scale - 0.1))} sx={btnSx}>
          <Remove sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      <Slider
        value={scale}
        min={0.6}
        max={2.0}
        step={0.05}
        onChange={(_, v) => onScaleChange(v as number)}
        sx={{
          width: 160,
          color: darkMode ? '#90caf9' : '#1565c0',
          '& .MuiSlider-thumb': { width: 18, height: 18 },
          '& .MuiSlider-track': { height: 4 },
          '& .MuiSlider-rail': { height: 4 },
        }}
      />

      <Tooltip title="Aumentar (+)">
        <IconButton size="small" onClick={() => onScaleChange(Math.min(2.0, scale + 0.1))} sx={btnSx}>
          <Add sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      <Typography sx={{
        fontSize: 13, fontWeight: 800, fontFamily: 'monospace',
        color: darkMode ? '#90caf9' : '#1565c0',
        minWidth: 44, textAlign: 'center',
      }}>
        {pct}%
      </Typography>

      <Tooltip title="Resetar (100%)">
        <IconButton size="small" onClick={() => onScaleChange(1.0)} sx={btnSx}>
          <RestartAlt sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ borderColor: darkMode ? alpha('#fff', 0.08) : alpha('#000', 0.1), mx: 0.5 }} />

      <Tooltip title={darkMode ? 'Modo claro' : 'Modo escuro (TV)'}>
        <IconButton size="small" onClick={onToggleDark} sx={btnSx}>
          {darkMode ? <LightMode sx={{ fontSize: 18 }} /> : <DarkMode sx={{ fontSize: 18 }} />}
        </IconButton>
      </Tooltip>

      <Tooltip title={compact ? 'Modo expandido' : 'Modo compacto (+ linhas)'}>
        <Chip
          label={compact ? 'Compacto' : 'Expandido'}
          size="small"
          onClick={onToggleCompact}
          sx={{
            height: 28, fontSize: 11, fontWeight: 700, cursor: 'pointer',
            bgcolor: compact ? (darkMode ? '#1565c0' : '#1565c0') : (darkMode ? alpha('#fff', 0.08) : alpha('#000', 0.06)),
            color: compact ? '#fff' : (darkMode ? alpha('#fff', 0.6) : '#666'),
            border: `1px solid ${compact ? '#1565c0' : (darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1))}`,
          }}
        />
      </Tooltip>

      <Box sx={{ flex: 1 }} />

      <Typography sx={{ fontSize: 11, color: darkMode ? alpha('#fff', 0.25) : '#bbb', fontStyle: 'italic' }}>
        Atalhos: + / - para tamanho | D para dark mode
      </Typography>
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════

export function EscalaGuindastesPage() {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [familiaFilter, setFamiliaFilter] = useState<FamiliaFilter>('todos');
  const [scale, setScale] = useState(1.2);
  const [darkMode, setDarkMode] = useState(false);
  const [compact, setCompact] = useState(false);

  const displaySettings = useMemo<DisplaySettings>(
    () => ({ scale, darkMode, compact }),
    [scale, darkMode, compact],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '+' || e.key === '=') { e.preventDefault(); setScale((s) => Math.min(2.0, s + 0.1)); }
      if (e.key === '-') { e.preventDefault(); setScale((s) => Math.max(0.6, s - 0.1)); }
      if (e.key === '0') { e.preventDefault(); setScale(1.0); }
      if (e.key === 'd' || e.key === 'D') { e.preventDefault(); setDarkMode((d) => !d); }
      if (e.key === 'c' || e.key === 'C') { e.preventDefault(); setCompact((c) => !c); }
      if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFullscreen(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const { data, dataUpdatedAt } = useQuery({
    queryKey: ['hstvei', 'painel'],
    queryFn: fetchPainel,
    refetchInterval: REFRESH_MS,
    staleTime: 10_000,
  });

  const veiculos = data?.veiculos ?? [];

  const counts = useMemo(() => {
    let gc = 0, ga = 0;
    for (const v of veiculos) {
      const f = normalizeFamilia(v.tipo);
      if (f === 'Guindastes') gc++;
      else if (f === 'Guindautos') ga++;
    }
    return { guindastes: gc, guindautos: ga, total: gc + ga };
  }, [veiculos]);

  const saidas = useMemo(
    () => buildRows(veiculos, SAIDA_SITUACOES, 'saida', familiaFilter),
    [veiculos, familiaFilter],
  );

  const chegadas = useMemo(
    () => buildRows(veiculos, CHEGADA_SITUACOES, 'chegada', familiaFilter),
    [veiculos, familiaFilter],
  );

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const lastUpdate = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('pt-BR')
    : '--:--:--';

  const sz = useCallback((base: number) => Math.round(base * scale), [scale]);

  return (
    <DisplayCtx.Provider value={displaySettings}>
      <Box sx={{
        width: '100vw', height: '100vh',
        bgcolor: darkMode ? '#0a1929' : '#efede4',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', position: 'fixed',
        top: 0, left: 0, zIndex: 9999,
        transition: 'background-color 0.3s',
      }}>
        {/* ── Header ── */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 4, py: 1.5,
          background: darkMode
            ? `linear-gradient(180deg, ${alpha('#f9d71c', 0.15)} 0%, ${alpha('#f5c518', 0.05)} 100%)`
            : 'linear-gradient(180deg, #f9d71c 0%, #f5c518 100%)',
          borderBottom: darkMode ? `3px solid ${alpha('#f9d71c', 0.3)}` : '4px solid #c9a800',
          flexShrink: 0,
          boxShadow: darkMode ? '0 4px 16px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.15)',
        }}>
          {/* Left */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flexShrink: 0 }}>
            <Tooltip title="Voltar">
              <IconButton onClick={() => navigate('/escala-servicos')} sx={{ color: darkMode ? '#fff' : '#333' }}>
                <ArrowBack sx={{ fontSize: sz(32) }} />
              </IconButton>
            </Tooltip>
            <Stack spacing={0}>
              <Typography sx={{
                fontSize: sz(36), fontWeight: 900, color: darkMode ? '#f9d71c' : '#1a1a1a',
                letterSpacing: 4, textTransform: 'uppercase', lineHeight: 1,
                fontFamily: '"Arial Black", "Impact", sans-serif',
              }}>
                Escala de Servicos
              </Typography>
              <Typography sx={{
                fontSize: sz(18), fontWeight: 800,
                color: darkMode ? '#ef5350' : '#c62828',
                letterSpacing: 3, textTransform: 'uppercase',
              }}>
                Guindastes & Guindautos
              </Typography>
            </Stack>
          </Stack>

          {/* Center: filter */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <FamChip label="Todos" icon={<PrecisionManufacturing />} count={counts.total}
              selected={familiaFilter === 'todos'} color={darkMode ? '#90caf9' : '#333'}
              onClick={() => setFamiliaFilter('todos')} />
            <FamChip label="Guindastes" icon={<PrecisionManufacturing />} count={counts.guindastes}
              selected={familiaFilter === 'guindastes'} color={darkMode ? '#ef5350' : '#c62828'}
              onClick={() => setFamiliaFilter('guindastes')} />
            <FamChip label="Guindautos" icon={<LocalShipping />} count={counts.guindautos}
              selected={familiaFilter === 'guindautos'} color={darkMode ? '#ffb74d' : '#e65100'}
              onClick={() => setFamiliaFilter('guindautos')} />
          </Stack>

          {/* Right */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flexShrink: 0 }}>
            <StatBadge label="Saidas" value={saidas.length} color={darkMode ? '#66bb6a' : '#1b5e20'} />
            <StatBadge label="Chegadas" value={chegadas.length} color={darkMode ? '#ff7043' : '#bf360c'} />
            <StatBadge label="Frota" value={counts.total} color={darkMode ? '#90caf9' : '#333'} />
            <Divider orientation="vertical" flexItem sx={{ borderColor: darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.15) }} />
            <LiveClock />
            <Tooltip title={isFullscreen ? 'Sair fullscreen (F)' : 'Tela cheia (F)'}>
              <IconButton onClick={toggleFullscreen} sx={{ color: darkMode ? '#fff' : '#333' }}>
                {isFullscreen ? <FullscreenExit sx={{ fontSize: sz(32) }} /> : <Fullscreen sx={{ fontSize: sz(32) }} />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* ── Display Controls ── */}
        <DisplayControls
          scale={scale} onScaleChange={setScale}
          darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)}
          compact={compact} onToggleCompact={() => setCompact((c) => !c)}
        />

        {/* ── Board Columns ── */}
        <Box sx={{ flex: 1, display: 'flex', gap: 2, p: 2, minHeight: 0 }}>
          <BoardColumn
            title="Saidas"
            subtitle="Agendados, mobilizando, em transito e entregues"
            icon={<FlightTakeoff sx={{ fontSize: sz(36) }} />}
            rows={saidas}
            accentColor="#1b5e20"
            darkAccent="#66bb6a"
            headerBg={`linear-gradient(135deg, ${alpha('#1b5e20', 0.06)} 0%, ${alpha('#e8f5e9', 0.6)} 100%)`}
            darkHeaderBg={`linear-gradient(135deg, ${alpha('#66bb6a', 0.1)} 0%, ${alpha('#1b5e20', 0.2)} 100%)`}
          />
          <BoardColumn
            title="Chegadas"
            subtitle="Desmobilizando, retorno pendente e no patio"
            icon={<FlightLand sx={{ fontSize: sz(36) }} />}
            rows={chegadas}
            accentColor="#bf360c"
            darkAccent="#ff7043"
            headerBg={`linear-gradient(135deg, ${alpha('#bf360c', 0.06)} 0%, ${alpha('#fff3e0', 0.6)} 100%)`}
            darkHeaderBg={`linear-gradient(135deg, ${alpha('#ff7043', 0.1)} 0%, ${alpha('#bf360c', 0.2)} 100%)`}
          />
        </Box>

        {/* ── Footer ── */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 4, py: 0.75,
          borderTop: `3px solid ${darkMode ? alpha('#fff', 0.06) : '#ddd'}`,
          bgcolor: darkMode ? alpha('#000', 0.4) : '#e8e8e0',
          flexShrink: 0,
        }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Refresh sx={{ fontSize: 16, color: darkMode ? alpha('#fff', 0.3) : '#999' }} />
            <Typography sx={{ fontSize: 14, color: darkMode ? alpha('#fff', 0.3) : '#888', fontWeight: 600 }}>
              Atualizado: {lastUpdate} | Auto-refresh: {REFRESH_MS / 1000}s
            </Typography>
          </Stack>

          <Stack direction="row" spacing={3}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <Stack key={key} direction="row" alignItems="center" spacing={0.75}>
                <FiberManualRecord sx={{ fontSize: 12, color: darkMode ? cfg.darkColor : cfg.color }} />
                <Typography sx={{ fontSize: 13, color: darkMode ? alpha('#fff', 0.4) : '#666', fontWeight: 600 }}>{cfg.label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </DisplayCtx.Provider>
  );
}
