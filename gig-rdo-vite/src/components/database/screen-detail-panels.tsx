import {
  Box, CircularProgress, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { useScreenFields, useScreenLinks, useScreenProperties } from '@/hooks/use-screen-builder-detail';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;

const CELL_SX = { fontSize: 11, py: 0.3, px: 1 } as const;
const HEAD_SX = { ...CELL_SX, fontWeight: 700 } as const;

export function InfoRow({ label, value }: { label: string; value: unknown }) {
  if (value == null || value === '') return null;
  return (
    <Box sx={{ display: 'flex', gap: 1, py: 0.3 }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, minWidth: 120, color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all' }}>
        {String(value)}
      </Typography>
    </Box>
  );
}

export function CamposPanel({ tableName }: { tableName: string }) {
  const { data, isLoading } = useScreenFields(tableName);
  const rows: R[] = Array.isArray(data) ? data : [];
  if (isLoading) return <CircularProgress size={16} />;
  if (rows.length === 0) return <Typography sx={{ fontSize: 11 }}>Sem campos</Typography>;
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={HEAD_SX}>Campo</TableCell>
            <TableCell sx={HEAD_SX}>Descricao</TableCell>
            <TableCell sx={HEAD_SX}>Tipo</TableCell>
            <TableCell sx={HEAD_SX} align="right">Tamanho</TableCell>
            <TableCell sx={HEAD_SX} align="right">Ordem</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.NUCAMPO} hover>
              <TableCell sx={{ ...CELL_SX, fontFamily: 'monospace' }}>{r.NOMECAMPO}</TableCell>
              <TableCell sx={CELL_SX}>{r.DESCRCAMPO}</TableCell>
              <TableCell sx={CELL_SX}>{r.TIPCAMPO}</TableCell>
              <TableCell sx={CELL_SX} align="right">{r.TAMANHO}</TableCell>
              <TableCell sx={CELL_SX} align="right">{r.ORDEM}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function LinksPanel({ nuInstancia }: { nuInstancia: number }) {
  const { data, isLoading } = useScreenLinks(nuInstancia);
  const rows: R[] = Array.isArray(data) ? data : [];
  if (isLoading) return <CircularProgress size={16} />;
  if (rows.length === 0) return <Typography sx={{ fontSize: 11 }}>Sem links</Typography>;
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={HEAD_SX}>Destino</TableCell>
            <TableCell sx={HEAD_SX}>Tabela</TableCell>
            <TableCell sx={HEAD_SX}>Tipo</TableCell>
            <TableCell sx={HEAD_SX}>Campo Orig</TableCell>
            <TableCell sx={HEAD_SX}>Campo Dest</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i} hover>
              <TableCell sx={{ ...CELL_SX, fontFamily: 'monospace' }}>{r.NOMEINSTDEST}</TableCell>
              <TableCell sx={CELL_SX}>{r.TABDEST}</TableCell>
              <TableCell sx={CELL_SX}>{r.TIPLIGACAO}</TableCell>
              <TableCell sx={{ ...CELL_SX, fontFamily: 'monospace' }}>{r.CAMPO_ORIG}</TableCell>
              <TableCell sx={{ ...CELL_SX, fontFamily: 'monospace' }}>{r.CAMPO_DEST}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function PropriedadesPanel({ nuInstancia }: { nuInstancia: number }) {
  const { data, isLoading } = useScreenProperties(nuInstancia);
  const rows: R[] = Array.isArray(data) ? data : [];
  if (isLoading) return <CircularProgress size={16} />;
  if (rows.length === 0) return <Typography sx={{ fontSize: 11 }}>Sem propriedades</Typography>;
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={HEAD_SX}>Propriedade</TableCell>
            <TableCell sx={HEAD_SX}>Valor</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i} hover>
              <TableCell sx={{ ...CELL_SX, fontFamily: 'monospace', fontWeight: 600 }}>
                {r.NOME}
              </TableCell>
              <TableCell sx={{ ...CELL_SX, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {r.VALOR}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
