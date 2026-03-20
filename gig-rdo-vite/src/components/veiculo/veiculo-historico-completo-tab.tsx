import { useMemo } from 'react';
import {
  Avatar, Box, Card, CardContent, Chip, Skeleton,
  ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { Build, Business } from '@mui/icons-material';
import { parseISO, isValid, format } from 'date-fns';
import type { HistoricoCompletoItem } from '@/types/veiculo-tabs-types';

interface Props {
  items?: HistoricoCompletoItem[];
  isLoading: boolean;
  filter: string;
  onFilterChange: (f: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL || '';

function safeFmt(v: string | Date | null): string {
  if (!v) return '-';
  const d = typeof v === 'string' ? parseISO(v) : new Date(v);
  return isValid(d) ? format(d, 'dd/MM/yyyy') : '-';
}

const STATUS_MAP: Record<string, {
  label: string; color: 'warning' | 'error' | 'success' | 'info' | 'default';
}> = {
  A: { label: 'Aberta', color: 'warning' },
  E: { label: 'Em execucao', color: 'info' },
  F: { label: 'Fechada', color: 'success' },
  P: { label: 'Pendente', color: 'warning' },
};

const MANUT_MAP: Record<string, string> = {
  P: 'Preventiva', C: 'Corretiva', O: 'Outros', '2': 'Garantia',
};

function FotoAvatar({ codparc, nome }: { codparc: number | null; nome: string }) {
  if (!codparc || codparc <= 0) return null;
  return (
    <Avatar
      src={`${API_URL}/funcionarios/${codparc}/foto`}
      alt={nome}
      sx={{ width: 28, height: 28, fontSize: '0.7rem' }}
    >
      {nome.charAt(0)}
    </Avatar>
  );
}

function HistoricoItem({ item }: { item: HistoricoCompletoItem }) {
  const isManut = item.tipo === 'MANUTENCAO';
  const st = STATUS_MAP[item.status] || { label: item.status, color: 'default' as const };

  return (
    <Card variant="outlined" sx={{ position: 'relative', overflow: 'visible' }}>
      <Box sx={{
        position: 'absolute', left: -18, top: 12,
        width: 36, height: 36, borderRadius: '50%',
        bgcolor: isManut ? 'warning.main' : 'success.main',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', zIndex: 1,
      }}>
        {isManut ? <Build sx={{ fontSize: 18 }} /> : <Business sx={{ fontSize: 18 }} />}
      </Box>
      <CardContent sx={{ pl: 4, py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
          <Chip label={isManut ? 'Manutencao' : 'Comercial'} size="small"
            color={isManut ? 'warning' : 'success'} sx={{ fontSize: '0.65rem', height: 20 }} />
          <Chip label={st.label} size="small" variant="outlined"
            color={st.color} sx={{ fontSize: '0.65rem', height: 20 }} />
          <Typography variant="caption" color="text.secondary">
            OS {item.numOs}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {safeFmt(item.dataEvento)}
            {item.dataFim ? ` — ${safeFmt(item.dataFim)}` : ''}
          </Typography>
        </Box>

        {isManut && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {item.tipoManut && (
              <Typography variant="caption" color="text.secondary">
                {MANUT_MAP[item.tipoManut] || item.tipoManut}
              </Typography>
            )}
            {item.km > 0 && (
              <Typography variant="caption" color="text.secondary">
                KM: {item.km.toLocaleString('pt-BR')}
              </Typography>
            )}
          </Box>
        )}

        {!isManut && (
          <>
            {item.cliente && (
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                {item.cliente}
              </Typography>
            )}
            {item.qtdDiarias > 0 && (
              <Chip label={`${item.qtdDiarias} diaria${item.qtdDiarias > 1 ? 's' : ''}`}
                size="small" variant="outlined"
                sx={{ fontSize: '0.6rem', height: 18, mt: 0.5 }} />
            )}
            {item.descricao && (
              <Typography variant="caption" color="text.secondary" sx={{
                display: 'block', mt: 0.5, fontSize: '0.7rem',
              }}>
                {item.descricao}
              </Typography>
            )}
          </>
        )}

        <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
          {item.nomeUsuario && item.nomeUsuario.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <FotoAvatar codparc={item.codparcUsuario} nome={item.nomeUsuario} />
              <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                {isManut ? 'Criador' : 'Vendedor'}: {item.nomeUsuario}
              </Typography>
            </Box>
          )}
          {item.nomeUsuario2 && item.nomeUsuario2.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <FotoAvatar codparc={item.codparcUsuario2} nome={item.nomeUsuario2} />
              <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                {isManut ? 'Finalizou' : 'Fechou'}: {item.nomeUsuario2}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export function VeiculoHistoricoCompletoTab({
  items, isLoading, filter, onFilterChange,
}: Props) {
  const filtered = useMemo(() => {
    if (!items) return [];
    if (filter === 'TODOS') return items;
    return items.filter((i) => i.tipo === filter);
  }, [items, filter]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={80} />)}
      </Box>
    );
  }

  if (!items?.length) {
    return (
      <Card><CardContent>
        <Typography color="text.secondary">Sem historico registrado</Typography>
      </CardContent></Card>
    );
  }

  const totalManut = items.filter((i) => i.tipo === 'MANUTENCAO').length;
  const totalCom = items.filter((i) => i.tipo === 'COMERCIAL').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Historico Completo ({items.length})
        </Typography>
        <ToggleButtonGroup size="small" value={filter} exclusive
          onChange={(_, v) => v && onFilterChange(v)}>
          <ToggleButton value="TODOS" sx={{ fontSize: '0.7rem', py: 0.5 }}>
            Todos ({items.length})
          </ToggleButton>
          <ToggleButton value="MANUTENCAO" sx={{ fontSize: '0.7rem', py: 0.5 }}>
            Manutencao ({totalManut})
          </ToggleButton>
          <ToggleButton value="COMERCIAL" sx={{ fontSize: '0.7rem', py: 0.5 }}>
            Comercial ({totalCom})
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 2,
        borderLeft: '2px solid', borderColor: 'divider' }}>
        {filtered.map((item) => (
          <HistoricoItem key={`${item.tipo}-${item.numOs}`} item={item} />
        ))}
      </Box>
    </Box>
  );
}
