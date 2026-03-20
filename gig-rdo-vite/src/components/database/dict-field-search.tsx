import {
  Box, TextField, Typography, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { useState } from 'react';
import { useSearchDictionaryFields } from '@/hooks/use-dictionary';

interface Props {
  onSelectTable: (name: string) => void;
}

export function DictFieldSearch({ onSelectTable }: Props) {
  const [term, setTerm] = useState('');
  const { data: results, isLoading } = useSearchDictionaryFields(
    term.length >= 2 ? term : null,
  );
  const list = results ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TextField
        size="small" fullWidth
        placeholder="Buscar campo em todas tabelas... (min 2 chars)"
        value={term} onChange={(e) => setTerm(e.target.value)}
        sx={{ mb: 0.5, flexShrink: 0 }}
        slotProps={{ input: { sx: { fontSize: 12 } } }}
      />
      {isLoading && <CircularProgress size={16} sx={{ mx: 'auto', my: 1 }} />}
      {!isLoading && term.length >= 2 && (
        <Typography variant="caption" color="text.secondary"
          sx={{ px: 0.5, fontSize: 11, mb: 0.5, flexShrink: 0 }}>
          {list.length} resultados
        </Typography>
      )}
      <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Campo</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Descricao</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Tabela</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Tipo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((r) => (
              <TableRow key={r.nucampo} hover sx={{ cursor: 'pointer' }}
                onClick={() => onSelectTable(r.nomeTabela)}>
                <TableCell sx={{ fontSize: 11, py: 0.2, fontFamily: 'monospace' }}>
                  {r.nomeCampo}
                </TableCell>
                <TableCell sx={{
                  fontSize: 11, py: 0.2, maxWidth: 160,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {r.descricao}
                </TableCell>
                <TableCell sx={{ fontSize: 11, py: 0.2, fontFamily: 'monospace', fontWeight: 700 }}>
                  {r.nomeTabela}
                </TableCell>
                <TableCell sx={{ fontSize: 10, py: 0.2 }}>{r.tipo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
