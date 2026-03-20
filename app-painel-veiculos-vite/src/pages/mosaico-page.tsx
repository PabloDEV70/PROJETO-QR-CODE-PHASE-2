import { useMemo, useState } from 'react';
import { Box, Typography, Tooltip, Chip, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useHstVeiPainel } from '@/hooks/use-hstvei-painel';
import {
  getVeiculoStatusInfo, contarPorDepartamento, normalizeFamilia,
  getStatusInfo,
} from '@/utils/status-utils';
import type { PainelVeiculo } from '@/types/hstvei-types';

type GroupBy = 'status' | 'familia';

function TooltipContent({ v }: { v: PainelVeiculo }) {
  const sit = v.situacoesAtivas[0];
  return (
    <Box sx={{ p: 0.5, maxWidth: 250 }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{v.placa}</Typography>
      {v.tag && <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{v.tag}</Typography>}
      <Typography sx={{ fontSize: '0.75rem' }}>{v.marcaModelo}</Typography>
      {sit && (
        <>
          <Typography sx={{ fontSize: '0.8rem', mt: 0.5, fontWeight: 600 }}>{sit.situacao}</Typography>
          {sit.descricao && <Typography sx={{ fontSize: '0.75rem' }}>{sit.descricao}</Typography>}
        </>
      )}
    </Box>
  );
}

function MosaicoCell({ v }: { v: PainelVeiculo }) {
  const info = getVeiculoStatusInfo(v);
  return (
    <Tooltip title={<TooltipContent v={v} />} arrow placement="top">
      <Box sx={{
        width: 52, height: 52,
        bgcolor: `${info.color}22`,
        border: `2px solid ${info.color}`,
        borderRadius: 1.5,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'transform 0.15s',
        '&:hover': { transform: 'scale(1.15)', zIndex: 10 },
      }}>
        <Typography sx={{
          fontSize: '0.6rem', fontWeight: 700,
          fontFamily: 'monospace', lineHeight: 1.2,
          color: info.color,
        }}>
          {v.tag ?? v.placa}
        </Typography>
      </Box>
    </Tooltip>
  );
}

export function MosaicoPage() {
  const { data: painel } = useHstVeiPainel();
  const [groupBy, setGroupBy] = useState<GroupBy>('status');

  const veiculos = painel?.veiculos ?? [];
  const counts = useMemo(() => contarPorDepartamento(veiculos), [veiculos]);

  const groups = useMemo(() => {
    if (groupBy === 'status') {
      const map = new Map<string, { color: string; veiculos: PainelVeiculo[] }>();
      for (const v of veiculos) {
        const info = getVeiculoStatusInfo(v);
        if (!map.has(info.label)) map.set(info.label, { color: info.color, veiculos: [] });
        map.get(info.label)!.veiculos.push(v);
      }
      return [...map.entries()]
        .sort((a, b) => b[1].veiculos.length - a[1].veiculos.length)
        .map(([label, g]) => ({ label, color: g.color, veiculos: g.veiculos }));
    }

    const map = new Map<string, PainelVeiculo[]>();
    for (const v of veiculos) {
      const key = normalizeFamilia(v.tipo);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    }
    return [...map.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([label, vs]) => ({ label, color: '#66bb6a', veiculos: vs }));
  }, [veiculos, groupBy]);

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
      {/* Legend bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <ToggleButtonGroup
          value={groupBy}
          exclusive
          onChange={(_, v) => { if (v) setGroupBy(v); }}
          size="small"
        >
          <ToggleButton value="status" sx={{ fontSize: '0.7rem', px: 1.5 }}>Por Status</ToggleButton>
          <ToggleButton value="familia" sx={{ fontSize: '0.7rem', px: 1.5 }}>Por Familia</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ flex: 1 }} />

        {Object.entries(counts).map(([dep, count]) => {
          if (count === 0) return null;
          const info = getStatusInfo(dep);
          return (
            <Chip
              key={dep}
              size="small"
              label={`${info.label} ${count}`}
              sx={{
                height: 22, fontSize: '0.7rem', fontWeight: 600,
                bgcolor: `${info.color}22`, color: info.color,
                border: `1px solid ${info.color}44`,
              }}
            />
          );
        })}
      </Box>

      {/* Groups */}
      {groups.map(({ label, color, veiculos: gVeiculos }) => (
        <Box key={label} sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box sx={{ width: 4, height: 20, bgcolor: color, borderRadius: 1 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {label}
            </Typography>
            <Chip label={gVeiculos.length} size="small"
              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: `${color}22`, color }} />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {gVeiculos.map((v) => (
              <MosaicoCell key={v.codveiculo} v={v} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
