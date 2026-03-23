import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Typography, Stack, Chip, alpha, keyframes, IconButton,
  Tooltip, Divider, Badge,
} from '@mui/material';
import {
  ArrowBack, Fullscreen, FullscreenExit, Refresh,
  FiberManualRecord, Construction, LocalShipping,
  PrecisionManufacturing, Forklift, DirectionsCar,
  Category, Agriculture, ElectricBolt, AirportShuttle,
  ViewInAr, Inventory,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchPainel } from '@/api/hstvei';
import { PlacaVeiculo } from '@/components/shared/placa-veiculo';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { PainelVeiculo, PainelPessoa } from '@/types/hstvei-types';

// ── Constants ──

const REFRESH_MS = 30_000;

// Categorias operacionais do dia
const SAINDO_HOJE = new Set(['Agendado', 'Mobilizando', 'Checklist Saida', 'Separacao Materiais', 'Carregamento']);
const EM_TRANSITO = new Set(['Em Trânsito', 'Entregue', 'Em Serviço', 'Em Contrato']);
const RETORNANDO = new Set(['Desmobilizando', 'Retorno Pendente']);
const NO_PATIO = new Set(['No Pátio', 'Disponível', 'Checklist Patio']);
const EM_MANUTENCAO = new Set(['Em Manutenção', 'Em Planejamento', 'Aguardando Peça', 'Pausada', 'Serviço Terceiro']);

type SecaoKey = 'saindo' | 'transito' | 'retornando' | 'patio' | 'manutencao' | 'outros';

function categorizarSituacao(situacao: string): SecaoKey {
  if (SAINDO_HOJE.has(situacao)) return 'saindo';
  if (EM_TRANSITO.has(situacao)) return 'transito';
  if (RETORNANDO.has(situacao)) return 'retornando';
  if (NO_PATIO.has(situacao)) return 'patio';
  if (EM_MANUTENCAO.has(situacao)) return 'manutencao';
  return 'outros';
}

const SECAO_CONFIG: Record<SecaoKey, { label: string; color: string; order: number }> = {
  saindo:      { label: 'Saindo Hoje',      color: '#2e7d32', order: 0 },
  transito:    { label: 'Em Operacao',       color: '#1565c0', order: 1 },
  retornando:  { label: 'Retornando',        color: '#e65100', order: 2 },
  patio:       { label: 'No Patio',          color: '#546e7a', order: 3 },
  manutencao:  { label: 'Em Manutencao',     color: '#ff9800', order: 4 },
  outros:      { label: 'Outros',            color: '#757575', order: 5 },
};

// ── Familia normalization (same logic as app-painel-veiculos) ──

function normalizeFamilia(tipo: string | null): string {
  if (!tipo) return 'Outros';
  const t = tipo.trim().toUpperCase();
  if (t.includes('EMPILHADEIRA') || t.includes('EMPILHADEIR')) return 'Empilhadeiras';
  if (t.includes('GUINDASTE')) return 'Guindastes';
  if (t.includes('GUINDAUTO')) return 'Guindautos';
  if (t.includes('CARRO') || t.includes('CAMINHONETE') || t.includes('SUV')) return 'Veiculos Leves';
  if (t.includes('CAMINHAO') || t.includes('CAMINHÃO')) return 'Caminhoes';
  if (t.includes('PLATAFORMA')) return 'Plataformas';
  if (t.includes('GERADOR')) return 'Geradores';
  if (t.includes('COMPRESSOR')) return 'Compressores';
  if (t.includes('ONIBUS') || t.includes('ÔNIBUS') || t.includes('VAN') || t.includes('MICRO')) return 'Transporte';
  if (t.includes('TRATOR') || t.includes('RETROESCAV') || t.includes('ESCAVAD')) return 'Linha Amarela';
  return tipo.trim();
}

// ── Familia config: icon, color, sort order ──

interface FamiliaConfig {
  icon: React.ReactNode;
  color: string;
  order: number;
}

const FAMILIA_CONFIG: Record<string, FamiliaConfig> = {
  Guindastes:       { icon: <PrecisionManufacturing sx={{ fontSize: 16 }} />, color: '#c62828', order: 1 },
  Guindautos:       { icon: <LocalShipping sx={{ fontSize: 16 }} />,         color: '#e65100', order: 2 },
  Empilhadeiras:    { icon: <Forklift sx={{ fontSize: 16 }} />,              color: '#2e7d32', order: 3 },
  Plataformas:      { icon: <ViewInAr sx={{ fontSize: 16 }} />,              color: '#4527a0', order: 4 },
  'Linha Amarela':  { icon: <Agriculture sx={{ fontSize: 16 }} />,           color: '#f9a825', order: 5 },
  Caminhoes:        { icon: <LocalShipping sx={{ fontSize: 16 }} />,         color: '#37474f', order: 6 },
  Geradores:        { icon: <ElectricBolt sx={{ fontSize: 16 }} />,          color: '#00838f', order: 7 },
  Compressores:     { icon: <Inventory sx={{ fontSize: 16 }} />,             color: '#546e7a', order: 8 },
  Transporte:       { icon: <AirportShuttle sx={{ fontSize: 16 }} />,        color: '#1565c0', order: 9 },
  'Veiculos Leves': { icon: <DirectionsCar sx={{ fontSize: 16 }} />,         color: '#558b2f', order: 10 },
  Outros:           { icon: <Category sx={{ fontSize: 16 }} />,              color: '#757575', order: 99 },
};

function getFamiliaConfig(familia: string): FamiliaConfig {
  return FAMILIA_CONFIG[familia] ?? { icon: <Category sx={{ fontSize: 16 }} />, color: '#757575', order: 50 };
}

const STATUS_COLORS: Record<string, string> = {
  'Agendado': '#42a5f5',
  'Mobilizando': '#ffa726',
  'Em Trânsito': '#66bb6a',
  'Entregue': '#26c6da',
  'Desmobilizando': '#ffa726',
  'Retorno Pendente': '#ef5350',
  'No Pátio': '#78909c',
  'Em Manutenção': '#ce93d8',
  'Disponível': '#66bb6a',
};

// ── Animations ──

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ── Types ──

interface EscalaRow {
  id: number;
  codveiculo: number;
  placa: string;
  tag: string;
  tipo: string;
  familia: string;
  capacidade: string;
  operadores: PainelPessoa[];
  cliente: string;
  local: string;
  saida: string;
  data: string;
  situacao: string;
  secao: SecaoKey;
}

// ── Helpers ──

function fmtTime(val: string | null | undefined): string {
  if (!val) return '--:--';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(val: string | null | undefined): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function buildEscalaRows(veiculos: PainelVeiculo[], familias: Set<string>): EscalaRow[] {
  const rows: EscalaRow[] = [];

  for (const v of veiculos) {
    const familia = normalizeFamilia(v.tipo);
    if (familias.size > 0 && !familias.has(familia)) continue;

    if (!v.situacoesAtivas || v.situacoesAtivas.length === 0) continue;

    for (const s of v.situacoesAtivas) {
      const secao = categorizarSituacao(s.situacao ?? '');
      rows.push({
        id: s.id,
        codveiculo: v.codveiculo,
        placa: v.placa ?? '',
        tag: v.tag ?? '',
        tipo: v.tipo ?? '',
        familia,
        capacidade: v.capacidade ?? '',
        operadores: [...(s.operadores ?? []), ...(s.mecanicos ?? [])],
        cliente: s.nomeParc ?? s.mosCliente ?? '',
        local: s.descricao ?? '',
        saida: fmtTime(s.dtprevisao ?? s.dtinicio),
        data: fmtDate(s.dtprevisao ?? s.dtinicio),
        situacao: s.situacao ?? '',
        secao,
      });
    }
  }

  // Sort: by section order, then placa
  rows.sort((a, b) => {
    const oa = SECAO_CONFIG[a.secao].order;
    const ob = SECAO_CONFIG[b.secao].order;
    if (oa !== ob) return oa - ob;
    return a.placa.localeCompare(b.placa);
  });

  return rows;
}

// ── Count veiculos per familia ──

function countByFamilia(veiculos: PainelVeiculo[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const v of veiculos) {
    const f = normalizeFamilia(v.tipo);
    counts.set(f, (counts.get(f) ?? 0) + 1);
  }
  return counts;
}

// ── Familia Filter Chip ──

function FamiliaFilterChip({
  familia,
  count,
  selected,
  onClick,
}: {
  familia: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}) {
  const cfg = getFamiliaConfig(familia);

  return (
    <Chip
      icon={<Box sx={{ display: 'flex', color: 'inherit' }}>{cfg.icon}</Box>}
      label={
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <span>{familia}</span>
          <Badge
            badgeContent={count}
            color="default"
            sx={{
              '& .MuiBadge-badge': {
                position: 'relative',
                transform: 'none',
                fontSize: 10,
                fontWeight: 800,
                minWidth: 18,
                height: 18,
                bgcolor: selected ? alpha('#fff', 0.3) : alpha(cfg.color, 0.15),
                color: selected ? '#fff' : cfg.color,
              },
            }}
          />
        </Stack>
      }
      onClick={onClick}
      sx={{
        height: 32,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        bgcolor: selected ? cfg.color : alpha(cfg.color, 0.08),
        color: selected ? '#fff' : cfg.color,
        border: `2px solid ${selected ? cfg.color : alpha(cfg.color, 0.25)}`,
        '&:hover': {
          bgcolor: selected ? alpha(cfg.color, 0.85) : alpha(cfg.color, 0.15),
          borderColor: cfg.color,
        },
        '& .MuiChip-icon': {
          color: selected ? '#fff' : cfg.color,
        },
        '& .MuiChip-label': { pr: 1.5 },
      }}
    />
  );
}

// ── Live Clock ──

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
          fontSize: { xs: 28, md: 40 },
          fontWeight: 700,
          color: '#1a237e',
          letterSpacing: 4,
          lineHeight: 1,
        }}
      >
        {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </Typography>
      <Typography sx={{ fontSize: 11, color: alpha('#000', 0.4), fontWeight: 500, textTransform: 'capitalize' }}>
        {now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
      </Typography>
    </Stack>
  );
}

// ── Column Headers ──

const COLUMNS = [
  { label: 'PLACA', width: 130, color: '#d32f2f' },
  { label: 'OPERADOR', width: 200, color: '#1565c0' },
  { label: 'CLIENTE', flex: 1, color: '#2e7d32' },
  { label: 'LOCAL', flex: 1, color: '#f57f17' },
  { label: 'SAÍDA', width: 80, color: '#6a1b9a' },
  { label: 'DATA', width: 80, color: '#6a1b9a' },
  { label: 'STATUS', width: 140, color: '#00695c' },
];

function ColumnHeader() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 0,
        borderBottom: '3px solid #333',
        bgcolor: '#f5f0d0',
      }}
    >
      {COLUMNS.map((col) => (
        <Box
          key={col.label}
          sx={{
            flex: col.flex,
            width: col.width,
            minWidth: col.width,
            px: 1.5,
            py: 1,
            borderRight: '1px solid rgba(0,0,0,0.15)',
            '&:last-child': { borderRight: 'none' },
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 900,
              color: col.color,
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              fontFamily: '"Arial Black", "Impact", sans-serif',
            }}
          >
            {col.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

// ── Row Component ──

function EscalaRowComponent({ row, index }: { row: EscalaRow; index: number }) {
  const stColor = STATUS_COLORS[row.situacao] ?? '#78909c';
  const secaoColor = SECAO_CONFIG[row.secao].color;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        animation: `${fadeIn} 0.2s ease-out ${index * 0.02}s both`,
        minHeight: 52,
        transition: 'background-color 0.15s',
        bgcolor: index % 2 === 0 ? '#fff' : '#fafafa',
        borderLeft: `3px solid ${secaoColor}`,
        '&:hover': { bgcolor: alpha('#bbdefb', 0.2) },
      }}
    >
      {/* PLACA */}
      <Box sx={{ width: 130, minWidth: 130, px: 1, display: 'flex', alignItems: 'center', borderRight: '1px solid rgba(0,0,0,0.06)' }}>
        <PlacaVeiculo placa={row.placa} scale={0.55} />
      </Box>

      {/* OPERADOR */}
      <Box sx={{ width: 200, minWidth: 200, px: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, borderRight: '1px solid rgba(0,0,0,0.06)' }}>
        {row.operadores.length > 0 ? (
          <Stack spacing={0.25}>
            {row.operadores.slice(0, 2).map((p) => (
              <Stack key={p.codusu} direction="row" alignItems="center" spacing={0.5}>
                <FuncionarioAvatar
                  codparc={p.codparc}
                  nome={p.nome}
                  size="small"
                  sx={{ width: 24, height: 24, fontSize: 10 }}
                />
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#1a1a1a',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 150,
                  }}
                >
                  {p.nome?.split(' ').slice(0, 2).join(' ')}
                </Typography>
              </Stack>
            ))}
            {row.operadores.length > 2 && (
              <Typography sx={{ fontSize: 10, color: '#666' }}>
                +{row.operadores.length - 2} mais
              </Typography>
            )}
          </Stack>
        ) : (
          <Typography sx={{ fontSize: 11, color: '#bbb', fontStyle: 'italic' }}>--</Typography>
        )}
      </Box>

      {/* CLIENTE */}
      <Box sx={{ flex: 1, px: 1.5, overflow: 'hidden', borderRight: '1px solid rgba(0,0,0,0.06)' }}>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: '#333',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.cliente || '--'}
        </Typography>
      </Box>

      {/* LOCAL */}
      <Box sx={{ flex: 1, px: 1.5, overflow: 'hidden', borderRight: '1px solid rgba(0,0,0,0.06)' }}>
        <Typography
          sx={{
            fontSize: 11,
            color: '#555',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.local || '--'}
        </Typography>
      </Box>

      {/* SAÍDA */}
      <Box sx={{ width: 80, minWidth: 80, px: 1, textAlign: 'center', borderRight: '1px solid rgba(0,0,0,0.06)' }}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 700,
            fontFamily: '"JetBrains Mono", monospace',
            color: '#1a237e',
          }}
        >
          {row.saida || '--:--'}
        </Typography>
      </Box>

      {/* DATA */}
      <Box sx={{ width: 80, minWidth: 80, px: 1, textAlign: 'center', borderRight: '1px solid rgba(0,0,0,0.06)' }}>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            fontFamily: '"JetBrains Mono", monospace',
            color: '#555',
          }}
        >
          {row.data || '--/--'}
        </Typography>
      </Box>

      {/* STATUS */}
      <Box sx={{ width: 140, minWidth: 140, px: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Chip
          icon={<FiberManualRecord sx={{ fontSize: '8px !important', color: `${stColor} !important` }} />}
          label={row.situacao}
          size="small"
          sx={{
            height: 24,
            fontSize: 10,
            fontWeight: 700,
            bgcolor: alpha(stColor, 0.12),
            color: stColor,
            border: `1px solid ${alpha(stColor, 0.3)}`,
            borderRadius: 1,
            minWidth: 100,
            '& .MuiChip-label': { px: 0.8 },
          }}
        />
      </Box>
    </Box>
  );
}

// ── Section Divider (ROTINA / PÁTIO) ──

function SectionDivider({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 0.75,
        bgcolor: alpha(color, 0.08),
        borderBottom: `2px solid ${color}`,
        borderTop: `2px solid ${color}`,
      }}
    >
      <Box sx={{ width: 4, height: 20, bgcolor: color, borderRadius: 1 }} />
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 900,
          color,
          textTransform: 'uppercase',
          letterSpacing: 3,
          fontFamily: '"Arial Black", "Impact", sans-serif',
        }}
      >
        {label}
      </Typography>
      <Chip
        label={count}
        size="small"
        sx={{
          height: 20,
          fontSize: 11,
          fontWeight: 800,
          bgcolor: color,
          color: '#fff',
          ml: 0.5,
        }}
      />
    </Box>
  );
}

// ── Stat Badge ──

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Stack
      alignItems="center"
      spacing={0}
      sx={{
        px: 1.5,
        py: 0.5,
        borderRadius: 1.5,
        bgcolor: alpha(color, 0.1),
        border: `1px solid ${alpha(color, 0.25)}`,
      }}
    >
      <Typography sx={{ fontSize: 20, fontWeight: 800, color, fontFamily: 'monospace', lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: 8, fontWeight: 700, color: alpha(color, 0.7), textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
    </Stack>
  );
}

// ── Main Page ──

export function EscalaServicosPage() {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedFamilias, setSelectedFamilias] = useState<Set<string>>(new Set());

  const { data, dataUpdatedAt } = useQuery({
    queryKey: ['hstvei', 'painel'],
    queryFn: fetchPainel,
    refetchInterval: REFRESH_MS,
    staleTime: 10_000,
  });

  const veiculos = data?.veiculos ?? [];

  // Count per familia (always from full dataset)
  const familiaCounts = useMemo(() => countByFamilia(veiculos), [veiculos]);

  // Sorted familias list
  const familiasSorted = useMemo(() => {
    return Array.from(familiaCounts.entries())
      .sort((a, b) => {
        const oa = getFamiliaConfig(a[0]).order;
        const ob = getFamiliaConfig(b[0]).order;
        return oa - ob;
      })
      .map(([f]) => f);
  }, [familiaCounts]);

  // Toggle a familia in/out of the filter set
  const toggleFamilia = useCallback((familia: string) => {
    setSelectedFamilias((prev) => {
      const next = new Set(prev);
      if (next.has(familia)) {
        next.delete(familia);
      } else {
        next.add(familia);
      }
      return next;
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => setSelectedFamilias(new Set()), []);

  const allRows = useMemo(
    () => buildEscalaRows(veiculos, selectedFamilias),
    [veiculos, selectedFamilias],
  );

  // Group rows by section
  const secoes = useMemo(() => {
    const map = new Map<SecaoKey, EscalaRow[]>();
    for (const row of allRows) {
      const arr = map.get(row.secao) ?? [];
      arr.push(row);
      map.set(row.secao, arr);
    }
    // Sort sections by order
    return Array.from(map.entries())
      .sort((a, b) => SECAO_CONFIG[a[0]].order - SECAO_CONFIG[b[0]].order);
  }, [allRows]);

  // Active filter label for subtitle
  const filterLabel = useMemo(() => {
    if (selectedFamilias.size === 0) return 'Todos os Equipamentos';
    if (selectedFamilias.size === 1) return Array.from(selectedFamilias)[0];
    return `${selectedFamilias.size} familias selecionadas`;
  }, [selectedFamilias]);

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
        bgcolor: '#f5f5f0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      {/* ── Header — Yellow bar like the physical board ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1,
          background: 'linear-gradient(180deg, #f9d71c 0%, #f5c518 100%)',
          borderBottom: '3px solid #c9a800',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        {/* Left: Title */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ flexShrink: 0 }}>
          <Tooltip title="Voltar ao Quadro">
            <IconButton onClick={() => navigate('/quadro')} sx={{ color: '#333' }}>
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Stack spacing={0}>
            <Typography
              sx={{
                fontSize: { xs: 18, md: 24 },
                fontWeight: 900,
                color: '#1a1a1a',
                letterSpacing: 3,
                textTransform: 'uppercase',
                lineHeight: 1,
                fontFamily: '"Arial Black", "Impact", sans-serif',
                textShadow: '0 1px 0 rgba(255,255,255,0.4)',
              }}
            >
              Escala de Servicos
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: '#d32f2f',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              {filterLabel}
            </Typography>
          </Stack>
        </Stack>

        {/* Right: Stats + Clock + Fullscreen */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexShrink: 0 }}>
          {secoes.map(([key, rows]) => (
            <StatBadge key={key} label={SECAO_CONFIG[key].label} value={rows.length} color={SECAO_CONFIG[key].color} />
          ))}
          <StatBadge label="Total" value={allRows.length} color="#333" />

          <Divider orientation="vertical" flexItem sx={{ borderColor: alpha('#000', 0.15) }} />

          <LiveClock />

          <Tooltip title={isFullscreen ? 'Sair do fullscreen' : 'Tela cheia'}>
            <IconButton onClick={toggleFullscreen} sx={{ color: '#333' }}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* ── Familia Filter Bar ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 0.75,
          bgcolor: '#fff',
          borderBottom: '1px solid #e0e0e0',
          flexShrink: 0,
          overflowX: 'auto',
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: 2 },
        }}
      >
        {/* "Todos" chip */}
        <Chip
          icon={<DirectionsCar sx={{ fontSize: 16 }} />}
          label={
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <span>Todos</span>
              <Box
                component="span"
                sx={{
                  fontSize: 10,
                  fontWeight: 800,
                  bgcolor: selectedFamilias.size === 0 ? alpha('#fff', 0.3) : alpha('#333', 0.1),
                  color: selectedFamilias.size === 0 ? '#fff' : '#333',
                  borderRadius: '50%',
                  minWidth: 18,
                  height: 18,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {veiculos.length}
              </Box>
            </Stack>
          }
          onClick={clearFilters}
          sx={{
            height: 32,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            bgcolor: selectedFamilias.size === 0 ? '#333' : alpha('#333', 0.06),
            color: selectedFamilias.size === 0 ? '#fff' : '#333',
            border: `2px solid ${selectedFamilias.size === 0 ? '#333' : alpha('#333', 0.2)}`,
            '&:hover': {
              bgcolor: selectedFamilias.size === 0 ? alpha('#333', 0.85) : alpha('#333', 0.12),
            },
            '& .MuiChip-icon': {
              color: selectedFamilias.size === 0 ? '#fff' : '#333',
            },
            '& .MuiChip-label': { pr: 1.5 },
          }}
        />

        <Divider orientation="vertical" flexItem sx={{ borderColor: '#e0e0e0', mx: 0.5 }} />

        {/* Familia chips */}
        {familiasSorted.map((f) => (
          <FamiliaFilterChip
            key={f}
            familia={f}
            count={familiaCounts.get(f) ?? 0}
            selected={selectedFamilias.has(f)}
            onClick={() => toggleFamilia(f)}
          />
        ))}

        {selectedFamilias.size > 0 && (
          <>
            <Divider orientation="vertical" flexItem sx={{ borderColor: '#e0e0e0', mx: 0.5 }} />
            <Chip
              label="Limpar filtros"
              size="small"
              onDelete={clearFilters}
              onClick={clearFilters}
              sx={{
                height: 26,
                fontSize: 11,
                bgcolor: alpha('#f44336', 0.08),
                color: '#d32f2f',
                '& .MuiChip-deleteIcon': { color: '#d32f2f', fontSize: 16 },
              }}
            />
          </>
        )}
      </Box>

      {/* ── Column Headers ── */}
      <ColumnHeader />

      {/* ── Body ── */}
      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {secoes.map(([key, rows]) => (
          <Box key={key}>
            <SectionDivider
              label={SECAO_CONFIG[key].label}
              count={rows.length}
              color={SECAO_CONFIG[key].color}
            />
            {rows.map((row, i) => (
              <EscalaRowComponent key={row.id} row={row} index={i} />
            ))}
          </Box>
        ))}

        {allRows.length === 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 10 }}>
            <Stack alignItems="center" spacing={1}>
              <Construction sx={{ fontSize: 48, color: '#ccc' }} />
              <Typography sx={{ color: '#999', fontSize: 16 }}>
                Nenhum equipamento encontrado
              </Typography>
            </Stack>
          </Box>
        )}
      </Box>

      {/* ── Footer ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 0.5,
          borderTop: '2px solid #ddd',
          bgcolor: '#eee',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Refresh sx={{ fontSize: 12, color: '#999' }} />
          <Typography sx={{ fontSize: 10, color: '#999' }}>
            Atualizado: {lastUpdate} | Auto-refresh: {REFRESH_MS / 1000}s
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2}>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <Stack key={status} direction="row" alignItems="center" spacing={0.5}>
              <FiberManualRecord sx={{ fontSize: 8, color }} />
              <Typography sx={{ fontSize: 9, color: '#777' }}>{status}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
