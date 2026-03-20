import { useMemo } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, IconButton, Tooltip,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';

interface QueryResultsTableProps {
  linhas: Record<string, unknown>[];
  onRowClick?: (row: Record<string, unknown>) => void;
}

export function QueryResultsTable({ linhas, onRowClick }: QueryResultsTableProps) {
  const columns = useMemo(
    () => (linhas.length ? Object.keys(linhas[0] as object) : []),
    [linhas],
  );

  if (!linhas.length) return null;

  return (
    <Paper sx={{ flex: 1, overflow: 'hidden' }}>
      <TableContainer sx={{ height: '100%' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 32, py: 0.5, px: 0.5 }} />
              {columns.map((col) => (
                <TableCell key={col} sx={{
                  fontWeight: 700, fontSize: 11, py: 0.5, whiteSpace: 'nowrap',
                }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {linhas.map((row, i) => (
              <TableRow key={i} hover sx={{ cursor: 'pointer' }}
                onClick={() => onRowClick?.(row)}>
                <TableCell sx={{ px: 0.5, py: 0 }}>
                  <Tooltip title="Ver registro" arrow>
                    <IconButton size="small" onClick={(e) => {
                      e.stopPropagation(); onRowClick?.(row);
                    }}>
                      <Visibility sx={{ fontSize: 14, color: 'text.secondary' }} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                {columns.map((col) => (
                  <TableCell key={col} sx={{
                    fontSize: 11, py: 0.25, whiteSpace: 'nowrap', maxWidth: 300,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {row[col] === null
                      ? <Typography component="span" sx={{
                          color: 'text.disabled', fontStyle: 'italic', fontSize: 11,
                        }}>NULL</Typography>
                      : String(row[col])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
