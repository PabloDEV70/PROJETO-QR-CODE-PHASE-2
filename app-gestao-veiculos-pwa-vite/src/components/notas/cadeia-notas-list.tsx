import { Paper, Box, Typography } from '@mui/material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CadeiaNotaItem } from '@/types/hstvei-types';

interface CadeiaNotasListProps {
  items: CadeiaNotaItem[];
}

export function CadeiaNotasList({ items }: CadeiaNotasListProps) {
  if (items.length === 0) return <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Nenhuma nota na cadeia</Typography>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {items.map((item, idx) => (
        <Paper key={`${item.nunotaDestino}-${idx}`} sx={{ p: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Nota {item.nunotaDestino}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {(() => { if (!item.dataNegociacao) return '-'; try { const d = new Date(typeof item.dataNegociacao === 'string' && !item.dataNegociacao.includes('T') ? item.dataNegociacao.replace(' ', 'T') : item.dataNegociacao); return isNaN(d.getTime()) ? '-' : format(d, 'dd/MM/yy', { locale: ptBR }); } catch { return '-'; } })()}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{item.tipoOperacao}</Typography>
          <Typography sx={{ fontSize: '0.75rem' }}>{item.fornecedor ?? '-'}</Typography>
          <Typography sx={{ fontSize: '0.75rem', mt: 0.5 }}>Status: {item.statusNota}</Typography>
        </Paper>
      ))}
    </Box>
  );
}
