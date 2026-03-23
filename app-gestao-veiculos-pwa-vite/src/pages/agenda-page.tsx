import { useMemo, useState } from 'react';
import {
  Box, Typography, Paper, Chip, alpha, Stack,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import {
  FiberManualRecord, Person, Warning,
  Today, CalendarMonth, ViewWeek,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useHstVeiPainel } from '@/hooks/use-hstvei-painel';
import { getPrioridadeInfo } from '@/utils/prioridade-constants';
import { DepartamentoChip } from '@/components/shared/departamento-chip';
import { PessoaAvatarGroup } from '@/components/shared/pessoa-avatar-group';
import { PlacaVeiculo } from '@/components/shared/placa-veiculo';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import type { PainelVeiculo, PainelPessoa } from '@/types/hstvei-types';

// ── Helpers ──

function safeDate(val: string | null | undefined): Date | null {
  if (!val) return null;
  const d = new Date(val.includes('T') ? val : val.replace(' ', 'T'));
  return isNaN(d.getTime()) ? null : d;
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function fmtDateFull(d: Date): string {
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}

function fmtDateShort(d: Date): string {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function isToday(d: Date): boolean {
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isTomorrow(d: Date): boolean {
  const tom = new Date();
  tom.setDate(tom.getDate() + 1);
  return d.getDate() === tom.getDate() && d.getMonth() === tom.getMonth() && d.getFullYear() === tom.getFullYear();
}

function isPast(d: Date): boolean {
  return d.getTime() < Date.now();
}

// ── Types ──

interface AgendaItem {
  sitId: number;
  codveiculo: number;
  placa: string;
  tag: string | null;
  marcaModelo: string | null;
  situacao: string;
  departamento: string | null;
  idpri: number | null;
  descricao: string | null;
  parceiro: string | null;
  dtprevisao: Date;
  dtinicio: Date | null;
  operadores: PainelPessoa[];
  mecanicos: PainelPessoa[];
  isOverdue: boolean;
}

type ViewMode = 'todos' | 'hoje' | 'semana';

// ── Build agenda from painel data ──

function buildAgenda(veiculos: PainelVeiculo[]): AgendaItem[] {
  const items: AgendaItem[] = [];

  for (const v of veiculos) {
    for (const s of v.situacoesAtivas) {
      const prev = safeDate(s.dtprevisao);
      const ini = safeDate(s.dtinicio);
      // Include items with previsao, or agendados/mobilizando with dtinicio
      const dateRef = prev ?? (s.situacao === 'Agendado' ? ini : null);
      if (!dateRef) continue;

      items.push({
        sitId: s.id,
        codveiculo: v.codveiculo,
        placa: v.placa,
        tag: v.tag,
        marcaModelo: v.marcaModelo,
        situacao: s.situacao,
        departamento: s.departamento,
        idpri: s.idpri,
        descricao: s.descricao,
        parceiro: s.nomeParc ?? s.mosCliente,
        dtprevisao: dateRef,
        dtinicio: ini,
        operadores: s.operadores,
        mecanicos: s.mecanicos,
        isOverdue: isPast(dateRef),
      });
    }
  }

  items.sort((a, b) => a.dtprevisao.getTime() - b.dtprevisao.getTime());
  return items;
}

function groupByDate(items: AgendaItem[]): Map<string, AgendaItem[]> {
  const groups = new Map<string, AgendaItem[]>();
  for (const item of items) {
    const key = item.dtprevisao.toISOString().slice(0, 10);
    const arr = groups.get(key) ?? [];
    arr.push(item);
    groups.set(key, arr);
  }
  return groups;
}

// ── Components ──

function AgendaCard({ item }: { item: AgendaItem }) {
  const navigate = useNavigate();
  const prio = getPrioridadeInfo(item.idpri);
  const allPessoas = [...item.operadores, ...item.mecanicos];

  return (
    <Paper
      onClick={() => navigate(`/situacao/${item.sitId}`)}
      sx={{
        display: 'flex', gap: 1.5, p: 1.5, cursor: 'pointer',
        transition: 'box-shadow 0.15s',
        '&:hover': { boxShadow: 3 },
        '&:active': { transform: 'scale(0.985)' },
        opacity: item.isOverdue ? 0.85 : 1,
      }}
    >
      {/* Hora */}
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minWidth: 52, flexShrink: 0,
      }}>
        <Typography sx={{
          fontSize: 18, fontWeight: 800, fontFamily: '"JetBrains Mono", monospace',
          color: item.isOverdue ? 'error.main' : 'text.primary', lineHeight: 1,
        }}>
          {fmtTime(item.dtprevisao)}
        </Typography>
        <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: 0.25 }}>
          {fmtDateShort(item.dtprevisao)}
        </Typography>
      </Box>

      {/* Priority bar */}
      <Box sx={{ width: 4, borderRadius: 1, bgcolor: prio.color, flexShrink: 0 }} />

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Placa + Tag + Situacao */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <PlacaVeiculo placa={item.placa} scale={0.4} />
          {item.tag && (
            <Typography sx={{
              fontSize: 13, fontWeight: 800, color: 'text.primary',
              fontFamily: '"JetBrains Mono", monospace',
            }}>
              {item.tag}
            </Typography>
          )}
          <FiberManualRecord sx={{ fontSize: 6, color: 'text.disabled' }} />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }}>
            {item.situacao}
          </Typography>
          {item.departamento && (
            <DepartamentoChip departamento={item.departamento} size="small" />
          )}
          {item.isOverdue && (
            <Warning sx={{ fontSize: 16, color: 'error.main', ml: 'auto' }} />
          )}
        </Box>

        {/* Parceiro */}
        {item.parceiro && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <Person sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }} noWrap>
              {item.parceiro}
            </Typography>
          </Box>
        )}

        {/* Descricao + equipe */}
        {(item.descricao || allPessoas.length > 0) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
            {item.descricao && (
              <Typography sx={{ fontSize: 12, color: 'text.secondary', flex: 1, minWidth: 0 }} noWrap>
                {item.descricao}
              </Typography>
            )}
            {allPessoas.length > 0 && (
              <PessoaAvatarGroup pessoas={allPessoas} max={3} size={20} />
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
}

function DateHeader({ dateStr }: { dateStr: string }) {
  const d = new Date(dateStr + 'T12:00:00');
  const today = isToday(d);
  const tomorrow = isTomorrow(d);
  const past = isPast(d) && !today;

  let label = fmtDateFull(d);
  if (today) label = 'Hoje — ' + label;
  else if (tomorrow) label = 'Amanha — ' + label;

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1,
      py: 1, mt: 1,
    }}>
      <Box sx={{
        width: 8, height: 8, borderRadius: '50%',
        bgcolor: today ? 'success.main' : past ? 'error.main' : 'text.disabled',
      }} />
      <Typography sx={{
        fontSize: 14, fontWeight: 800, textTransform: 'capitalize',
        color: today ? 'success.main' : past ? 'error.main' : 'text.primary',
      }}>
        {label}
      </Typography>
    </Box>
  );
}

// ── Page ──

export function AgendaPage() {
  const { data: painel, isLoading } = useHstVeiPainel();
  const [view, setView] = useState<ViewMode>('todos');

  const allItems = useMemo(() => buildAgenda(painel?.veiculos ?? []), [painel]);

  const filteredItems = useMemo(() => {
    const now = new Date();
    if (view === 'hoje') {
      return allItems.filter((item) => isToday(item.dtprevisao) || item.isOverdue);
    }
    if (view === 'semana') {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return allItems.filter((item) => item.dtprevisao <= weekEnd || item.isOverdue);
    }
    return allItems;
  }, [allItems, view]);

  const grouped = useMemo(() => groupByDate(filteredItems), [filteredItems]);

  const atrasados = allItems.filter((i) => i.isOverdue).length;
  const hojeCount = allItems.filter((i) => isToday(i.dtprevisao)).length;

  if (isLoading) return <LoadingSkeleton />;

  return (
    <>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonth sx={{ fontSize: 24, color: 'primary.main' }} />
          <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Agenda</Typography>
        </Box>

        <Stack direction="row" spacing={0.75}>
          {atrasados > 0 && (
            <Chip
              icon={<Warning sx={{ fontSize: 14 }} />}
              label={`${atrasados} atrasado${atrasados > 1 ? 's' : ''}`}
              size="small"
              sx={{
                height: 26, fontSize: 11, fontWeight: 700,
                bgcolor: alpha('#f44336', 0.08), color: '#e53935',
                '& .MuiChip-icon': { color: '#e53935' },
              }}
            />
          )}
          <Chip
            icon={<Today sx={{ fontSize: 14 }} />}
            label={`${hojeCount} hoje`}
            size="small"
            sx={{
              height: 26, fontSize: 11, fontWeight: 700,
              bgcolor: alpha('#2e7d32', 0.08), color: '#2e7d32',
              '& .MuiChip-icon': { color: '#2e7d32' },
            }}
          />
        </Stack>
      </Box>

      {/* View toggle */}
      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={(_, v) => { if (v) setView(v); }}
        size="small"
        sx={{
          mb: 2, width: '100%',
          '& .MuiToggleButton-root': {
            flex: 1, textTransform: 'none', fontSize: 12, fontWeight: 700, py: 0.75,
          },
        }}
      >
        <ToggleButton value="hoje">
          <Today sx={{ fontSize: 16, mr: 0.5 }} /> Hoje
        </ToggleButton>
        <ToggleButton value="semana">
          <ViewWeek sx={{ fontSize: 16, mr: 0.5 }} /> 7 dias
        </ToggleButton>
        <ToggleButton value="todos">
          <CalendarMonth sx={{ fontSize: 16, mr: 0.5 }} /> Todos
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Agenda items grouped by date */}
      {filteredItems.length === 0 ? (
        <EmptyState message={view === 'hoje' ? 'Nenhum agendamento para hoje' : 'Nenhum agendamento encontrado'} />
      ) : (
        <Stack spacing={1}>
          {Array.from(grouped.entries()).map(([dateStr, items]) => (
            <Box key={dateStr}>
              <DateHeader dateStr={dateStr} />
              <Stack spacing={1}>
                {items.map((item) => (
                  <AgendaCard key={item.sitId} item={item} />
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </>
  );
}
