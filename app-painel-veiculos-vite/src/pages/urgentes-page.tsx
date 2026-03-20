import { useMemo, useRef } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import {
  Warning, ErrorOutline, Build,
  PriorityHigh, AccessAlarm,
} from '@mui/icons-material';
import { useHstVeiPainel } from '@/hooks/use-hstvei-painel';
import { useHstVeiStats } from '@/hooks/use-hstvei-stats';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { usePainelStore } from '@/stores/painel-store';
import { getVeiculoStatusInfo } from '@/utils/status-utils';
import { getPrioridadeInfo } from '@/utils/prioridade-constants';
import type { PainelVeiculo } from '@/types/hstvei-types';

function AlertCard({ v, alertType }: { v: PainelVeiculo; alertType: 'urgente' | 'atrasado' | 'bloqueado' | 'critico' }) {
  const sit = v.situacoesAtivas[0];
  const prioInfo = getPrioridadeInfo(v.prioridadeMaxima);
  const statusInfo = getVeiculoStatusInfo(v);

  const borderColor = alertType === 'urgente' ? '#f44336'
    : alertType === 'atrasado' ? '#ff5722'
    : alertType === 'bloqueado' ? '#d32f2f'
    : '#ff9800';

  const tempoAtrasado = useMemo(() => {
    if (!sit?.dtprevisao) return null;
    const prev = new Date(sit.dtprevisao);
    const diff = Date.now() - prev.getTime();
    if (diff <= 0) return null;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (dias > 0) return `${dias}d ${horas}h atrasado`;
    return `${horas}h atrasado`;
  }, [sit?.dtprevisao]);

  return (
    <Paper sx={{
      p: 1.5, borderLeft: 4, borderColor,
      display: 'flex', gap: 2, alignItems: 'flex-start',
    }}>
      {/* Left: Vehicle info */}
      <Box sx={{ minWidth: 120 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', fontFamily: 'monospace' }}>
          {v.placa}
        </Typography>
        {v.tag && (
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {v.tag}
          </Typography>
        )}
        <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }} noWrap>
          {v.tipo}
        </Typography>
      </Box>

      {/* Center: Situation details */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box sx={{
            width: 10, height: 10, borderRadius: '50%',
            bgcolor: statusInfo.color,
          }} />
          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
            {sit?.situacao ?? 'Sem situacao'}
          </Typography>
        </Box>
        {sit?.descricao && (
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 0.5 }}>
            {sit.descricao}
          </Typography>
        )}
        {sit?.obs && (
          <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }} noWrap>
            {sit.obs}
          </Typography>
        )}
      </Box>

      {/* Right: Priority + timing */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
        <Chip
          size="small"
          label={prioInfo.label}
          sx={{
            height: 22, fontWeight: 700, fontSize: '0.7rem',
            bgcolor: `${prioInfo.color}22`, color: prioInfo.color,
            border: `1px solid ${prioInfo.color}66`,
          }}
        />
        {tempoAtrasado && (
          <Chip
            icon={<AccessAlarm sx={{ fontSize: 14 }} />}
            size="small"
            label={tempoAtrasado}
            color="error"
            sx={{ height: 22, fontSize: '0.7rem' }}
          />
        )}
        {sit?.nuos && (
          <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
            OS {sit.nuos}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function SectionHeader({ icon: Icon, title, count, color }: {
  icon: typeof Warning; title: string; count: number; color: string;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 2 }}>
      <Icon sx={{ fontSize: 20, color }} />
      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {title}
      </Typography>
      <Chip label={count} size="small" sx={{ height: 22, fontWeight: 700, bgcolor: `${color}22`, color }} />
    </Box>
  );
}

export function UrgentesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: painel } = useHstVeiPainel();
  const { data: stats } = useHstVeiStats();

  useAutoScroll(containerRef);

  const { urgentes, atrasados, bloqueados } = useMemo(() => {
    const veiculos = painel?.veiculos ?? [];
    const now = Date.now();

    const urgentes: PainelVeiculo[] = [];
    const atrasados: PainelVeiculo[] = [];
    const bloqueados: PainelVeiculo[] = [];

    for (const v of veiculos) {
      const cat = (v.situacoesAtivas[0]?.categoria ?? v.situacoesAtivas[0]?.departamento ?? '').toLowerCase();
      const isUrgente = v.prioridadeMaxima !== null && v.prioridadeMaxima <= 1;
      const isAtrasado = v.previsaoMaisProxima && new Date(v.previsaoMaisProxima).getTime() < now;
      const isBloqueado = cat.includes('bloqueado');

      if (isUrgente) urgentes.push(v);
      if (isAtrasado) atrasados.push(v);
      if (isBloqueado && !isUrgente) bloqueados.push(v);
    }

    return { urgentes, atrasados, bloqueados };
  }, [painel]);

  const totalAlertas = urgentes.length + atrasados.length + bloqueados.length;

  return (
    <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Summary bar */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.5,
        bgcolor: totalAlertas > 0 ? '#f4433611' : '#4caf5011',
        borderBottom: 1, borderColor: 'divider',
      }}>
        {totalAlertas > 0 ? (
          <Warning sx={{ fontSize: 28, color: '#f44336' }} />
        ) : (
          <Build sx={{ fontSize: 28, color: '#4caf50' }} />
        )}
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem' }}>
          {totalAlertas > 0 ? `${totalAlertas} ALERTAS ATIVOS` : 'NENHUM ALERTA ATIVO'}
        </Typography>
        {stats && (
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Chip label={`${stats.urgentes} urgentes`} size="small" color="error" />
            <Chip label={`${stats.atrasadas} atrasadas`} size="small" color="warning" />
          </Box>
        )}
      </Box>

      {/* Scrollable content */}
      <Box
        ref={containerRef}
        sx={{ flex: 1, overflow: 'auto', px: 2, pb: 2 }}
        onMouseEnter={() => usePainelStore.getState().setIsPaused(true)}
        onMouseLeave={() => usePainelStore.getState().setIsPaused(false)}
      >
        {urgentes.length > 0 && (
          <>
            <SectionHeader icon={PriorityHigh} title="Urgentes" count={urgentes.length} color="#f44336" />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {urgentes.map((v) => <AlertCard key={v.codveiculo} v={v} alertType="urgente" />)}
            </Box>
          </>
        )}

        {atrasados.length > 0 && (
          <>
            <SectionHeader icon={ErrorOutline} title="Atrasados" count={atrasados.length} color="#ff5722" />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {atrasados.map((v) => <AlertCard key={v.codveiculo} v={v} alertType="atrasado" />)}
            </Box>
          </>
        )}

        {bloqueados.length > 0 && (
          <>
            <SectionHeader icon={Warning} title="Bloqueados" count={bloqueados.length} color="#d32f2f" />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {bloqueados.map((v) => <AlertCard key={v.codveiculo} v={v} alertType="bloqueado" />)}
            </Box>
          </>
        )}

        {totalAlertas === 0 && (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Build sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography sx={{ fontSize: '1.1rem', color: 'text.secondary' }}>
              Todos os veiculos operando normalmente
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
