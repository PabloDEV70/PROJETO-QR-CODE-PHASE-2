import { useMemo } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { useHstVeiPainel } from '@/hooks/use-hstvei-painel';
import { getStatusInfo } from '@/utils/status-utils';
import { getPrioridadeInfo } from '@/utils/prioridade-constants';
import { PessoaAvatarGroup } from '@/components/painel/pessoa-avatar-group';
import type { PainelVeiculo } from '@/types/hstvei-types';

function VeiculoKanbanCard({ v }: { v: PainelVeiculo }) {
  const sit = v.situacoesAtivas[0];
  const prioInfo = getPrioridadeInfo(v.prioridadeMaxima);
  const allPessoas = sit ? [...sit.operadores, ...sit.mecanicos] : [];

  return (
    <Paper sx={{ p: 1, borderLeft: 3, borderColor: prioInfo.color, bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', fontFamily: 'monospace' }}>
          {v.placa}
        </Typography>
        {v.tag && (
          <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>{v.tag}</Typography>
        )}
        <Box sx={{
          ml: 'auto', width: 18, height: 18, borderRadius: '50%',
          bgcolor: `${prioInfo.color}22`, color: prioInfo.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.6rem', fontWeight: 700,
        }}>
          {prioInfo.sigla}
        </Box>
      </Box>

      {v.tipo && (
        <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', mb: 0.25 }} noWrap>
          {v.tipo}
        </Typography>
      )}

      {sit && (
        <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }} noWrap>
          {sit.descricao ?? sit.situacao}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
        {sit?.dtprevisao ? (
          <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
            Prev: {sit.dtprevisao.slice(0, 10).split('-').reverse().join('/')}
          </Typography>
        ) : <Box />}
        <PessoaAvatarGroup pessoas={allPessoas} max={3} size={18} />
      </Box>
    </Paper>
  );
}

export function KanbanPage() {
  const { data: painel } = useHstVeiPainel();

  const columns = useMemo(() => {
    const veiculos = painel?.veiculos ?? [];
    const grouped = new Map<string, PainelVeiculo[]>();
    for (const v of veiculos) {
      const raw = v.situacoesAtivas[0]?.categoria || v.situacoesAtivas[0]?.departamento || 'Outro';
      const key = typeof raw === 'string' ? raw.trim().replace(/\.$/, '') : 'Outro';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(v);
    }
    return [...grouped.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([dep, vs]) => ({ ...getStatusInfo(dep), veiculos: vs }));
  }, [painel]);

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', gap: 1.5 }}>
      {columns.map((col) => (
        <Box key={col.label} sx={{
          minWidth: 220, maxWidth: 280, flex: 1,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1,
            bgcolor: `${col.color}22`, borderRadius: '10px 10px 0 0',
            borderBottom: `3px solid ${col.color}`,
          }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: col.color }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: col.color }}>
              {col.label}
            </Typography>
            <Chip label={col.veiculos.length} size="small"
              sx={{ ml: 'auto', height: 22, fontWeight: 700, fontSize: '0.75rem', bgcolor: `${col.color}33`, color: col.color }} />
          </Box>
          <Box sx={{
            flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 0.75,
            p: 0.75, bgcolor: 'action.hover', borderRadius: '0 0 10px 10px',
          }}>
            {col.veiculos.map((v) => (
              <VeiculoKanbanCard key={v.codveiculo} v={v} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
