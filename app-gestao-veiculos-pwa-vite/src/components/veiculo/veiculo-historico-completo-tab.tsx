import { useState } from 'react';
import { Box, Typography, Paper, Chip, Skeleton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Timeline as TimelineIcon } from '@mui/icons-material';
import { PessoaAvatar } from '@/components/shared/pessoa-avatar';
import type { HistoricoCompletoItem } from '@/api/veiculos';
import { fmtDateShort } from '@/utils/fmt';

const TIPO_STYLE = {
  MANUTENCAO: { color: '#ff9800', label: 'Manutencao', bg: '#fff3e0' },
  COMERCIAL: { color: '#2196f3', label: 'Comercial', bg: '#e3f2fd' },
} as const;

/** STATUS da OS (TCFOSCAB e TCSOSE) */
const STATUS_LABEL: Record<string, string> = {
  A: 'Aberta', E: 'Em Andamento', F: 'Finalizada', C: 'Cancelada',
  P: 'Pendente', R: 'Rejeitada',
};

/** MANUTENCAO (tipo de manutencao na TCFOSCAB) */
const MANUT_LABEL: Record<string, string> = {
  P: 'Preventiva', C: 'Corretiva', O: 'Outros',
  S: 'Socorro', R: 'Revisao',
  '1': 'Nivel 1', '2': 'Nivel 2', '3': 'Nivel 3',
  '4': 'Nivel 4', '5': 'Nivel 5',
};

/** TIPO (interna/externa na TCFOSCAB) */
const SUBTIPO_LABEL: Record<string, string> = {
  I: 'Interna', E: 'Externa',
};

function traduzir(mapa: Record<string, string>, valor: string | null): string | null {
  if (!valor || !valor.trim()) return null;
  return mapa[valor.trim()] ?? valor;
}

interface Props { items?: HistoricoCompletoItem[]; isLoading: boolean }

export function VeiculoHistoricoCompletoTab({ items, isLoading }: Props) {
  const [filtro, setFiltro] = useState<string>('TODOS');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={88} sx={{ borderRadius: 2.5 }} />
        ))}
      </Box>
    );
  }

  if (!items?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
        <TimelineIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
        <Typography variant="body2">Nenhum historico</Typography>
      </Box>
    );
  }

  const countManut = items.filter((i) => i.tipo === 'MANUTENCAO').length;
  const countCom = items.filter((i) => i.tipo === 'COMERCIAL').length;
  const filtered = filtro === 'TODOS' ? items : items.filter((i) => i.tipo === filtro);

  return (
    <Box>
      <ToggleButtonGroup
        value={filtro} exclusive size="small"
        onChange={(_, v) => { if (v) setFiltro(v); }}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="TODOS" sx={{ px: 2 }}>Todos ({items.length})</ToggleButton>
        <ToggleButton value="MANUTENCAO" sx={{ px: 2 }}>Manut ({countManut})</ToggleButton>
        <ToggleButton value="COMERCIAL" sx={{ px: 2 }}>Comerc ({countCom})</ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {filtered.map((item, idx) => {
          const style = TIPO_STYLE[item.tipo] ?? { color: '#9e9e9e', label: item.tipo, bg: '#f5f5f5' };
          const statusLabel = traduzir(STATUS_LABEL, item.status);
          const manutLabel = traduzir(MANUT_LABEL, item.tipoManut);
          const subtipoLabel = traduzir(SUBTIPO_LABEL, item.subtipo);

          return (
            <Paper key={`${item.tipo}-${item.numOs}-${idx}`} sx={{
              p: 0, overflow: 'hidden',
              borderLeft: 4, borderColor: style.color,
            }}>
              <Box sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75, flexWrap: 'wrap' }}>
                  <Chip size="small" label={style.label}
                    sx={{ bgcolor: style.bg, color: style.color, fontWeight: 600 }} />
                  <Typography sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    OS {item.numOs}
                  </Typography>
                  {statusLabel && <Chip size="small" label={statusLabel} variant="outlined" />}
                  {manutLabel && <Chip size="small" label={manutLabel} variant="outlined" />}
                  {subtipoLabel && <Chip size="small" label={subtipoLabel} variant="outlined" />}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {fmtDateShort(item.dataEvento)}
                    {item.dataFim ? ` — ${fmtDateShort(item.dataFim)}` : ''}
                  </Typography>
                  {item.km != null && item.km > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {item.km.toLocaleString('pt-BR')} km
                    </Typography>
                  )}
                </Box>

                {item.cliente && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                    <PessoaAvatar codparc={item.codparc} nome={item.cliente} size={22} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.cliente}</Typography>
                  </Box>
                )}
                {item.descricao && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{item.descricao}</Typography>
                )}
                {item.qtdDiarias != null && item.qtdDiarias > 0 && (
                  <Chip size="small" label={`${item.qtdDiarias} diarias`} variant="outlined" sx={{ mt: 0.5 }} />
                )}

                {(item.nomeUsuario || item.nomeUsuario2) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap' }}>
                    {item.nomeUsuario && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PessoaAvatar codparc={item.codparcUsuario} nome={item.nomeUsuario} size={24} />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.nomeUsuario}</Typography>
                      </Box>
                    )}
                    {item.nomeUsuario2 && item.nomeUsuario2 !== item.nomeUsuario && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PessoaAvatar codparc={item.codparcUsuario2} nome={item.nomeUsuario2} size={24} />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.nomeUsuario2}</Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
