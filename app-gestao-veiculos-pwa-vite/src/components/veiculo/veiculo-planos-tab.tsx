import { Box, Typography, Paper, Chip, Skeleton } from '@mui/material';
import { EventRepeat } from '@mui/icons-material';
import type { VeiculoPlano } from '@/api/veiculos';
import { fmtDateShort } from '@/utils/fmt';

interface Props { items?: VeiculoPlano[]; isLoading: boolean }

export function VeiculoPlanosTab({ items, isLoading }: Props) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={88} sx={{ borderRadius: 2.5 }} />
        ))}
      </Box>
    );
  }

  if (!items?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
        <EventRepeat sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
        <Typography variant="body2">Nenhum plano preventivo</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {items.map((p) => {
        const ativo = p.ATIVO === 'S';
        return (
          <Paper key={p.NUPLANO} sx={{
            p: 2, borderLeft: 4,
            borderColor: ativo ? 'success.main' : 'action.disabled',
            opacity: ativo ? 1 : 0.7,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <Typography sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                #{p.NUPLANO}
              </Typography>
              <Chip size="small" label={ativo ? 'Ativo' : 'Inativo'}
                color={ativo ? 'success' : 'default'} />
              {p.TIPO && <Chip size="small" label={p.TIPO} variant="outlined" />}
              {p.GERAAUTO === 'S' && <Chip size="small" label="Auto" color="info" />}
            </Box>

            {p.DESCRICAO && (
              <Typography variant="body2" sx={{ mb: 1 }}>{p.DESCRICAO}</Typography>
            )}

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {p.TEMPO != null && <MetaItem label="Intervalo" value={`${p.TEMPO} dias`} />}
              {p.KMHORIMETRO != null && <MetaItem label="KM/Horim" value={p.KMHORIMETRO.toLocaleString('pt-BR')} />}
              {p.PERCTOLERANCIA != null && <MetaItem label="Tolerancia" value={`${p.PERCTOLERANCIA}%`} />}
              <MetaItem label="Inclusao" value={fmtDateShort(p.DTINCLUSAO)} />
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', lineHeight: 1 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}
