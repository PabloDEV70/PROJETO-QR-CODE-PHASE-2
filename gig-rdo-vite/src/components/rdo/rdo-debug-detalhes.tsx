import {
  Box, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography,
} from '@mui/material';
import type { RdoDetalheCompleto } from '@/types/rdo-types';
import { SectionTitle } from './rdo-debug-sections';

export function DetalhesSection({ detalhes }: { detalhes: RdoDetalheCompleto[] }) {
  return (
    <Box>
      <SectionTitle title="6. Apontamentos Individuais" />
      <TableContainer sx={{ maxHeight: 300 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Ini</TableCell>
              <TableCell>Fim</TableCell>
              <TableCell align="right">Min</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Sigla</TableCell>
              <TableCell>OS</TableCell>
              <TableCell>Obs</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detalhes.map((d) => (
              <TableRow key={d.ITEM} hover>
                <TableCell sx={{ fontFamily: 'monospace' }}>{d.ITEM}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{d.hriniFormatada ?? '-'}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{d.hrfimFormatada ?? '-'}</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                  {d.duracaoMinutos ?? '-'}
                </TableCell>
                <TableCell sx={{ fontSize: 11 }}>{d.motivoDescricao ?? '-'}</TableCell>
                <TableCell>
                  <Chip label={d.motivoSigla ?? '?'} size="small"
                    sx={{ height: 18, fontSize: 10 }} />
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{d.NUOS ?? '-'}</TableCell>
                <TableCell sx={{ fontSize: 11, maxWidth: 120 }}>
                  <Typography variant="caption" noWrap>{d.OBS ?? '-'}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
