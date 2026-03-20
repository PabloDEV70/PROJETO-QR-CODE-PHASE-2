import {
  Typography, Box, Chip, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import { useFieldOptions } from '@/hooks/use-dictionary-fields';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>;

export const cellSx = { fontSize: 12, py: 0.4 } as const;
export const labelSx = { ...cellSx, fontWeight: 700, color: 'text.secondary', width: 130 } as const;

export function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === '' || value === '-') return null;
  return (
    <TableRow>
      <TableCell sx={labelSx}>{label}</TableCell>
      <TableCell sx={cellSx}>{value}</TableCell>
    </TableRow>
  );
}

export function BoolChip({ value, label }: { value?: boolean; label: string }) {
  if (!value) return null;
  return <Chip label={label} size="small" color="primary" sx={{ height: 18, fontSize: 9 }} />;
}

export function OptionsSection({ nucampo }: { nucampo: number }) {
  const { data: options, isLoading } = useFieldOptions(nucampo);
  const list = options ?? [];
  if (isLoading) return <CircularProgress size={16} sx={{ mt: 1 }} />;
  if (list.length === 0) return null;

  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>
        Opcoes ({list.length})
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.3 }}>Valor</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.3 }}>Descricao</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.3 }}>Padrao</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {list.map((o) => (
            <TableRow key={o.valor} hover>
              <TableCell sx={{ fontSize: 12, py: 0.25, fontFamily: 'monospace', fontWeight: 700 }}>
                {o.valor}
              </TableCell>
              <TableCell sx={{ fontSize: 12, py: 0.25 }}>{o.opcao}</TableCell>
              <TableCell sx={{ py: 0.25 }}>
                {o.padrao && <Chip label="default" size="small" color="primary"
                  sx={{ height: 16, fontSize: 9 }} />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

/** Build full type string: varchar(100), numeric(18,2), etc. */
export function fullTypeName(col: Raw): string {
  const dt = String(col.DATA_TYPE ?? '');
  const charMax = col.CHARACTER_MAXIMUM_LENGTH;
  const numPrec = col.NUMERIC_PRECISION;
  const numScale = col.NUMERIC_SCALE;
  if (charMax != null && Number(charMax) > 0) return `${dt}(${charMax})`;
  if (numPrec != null && numScale != null && Number(numScale) > 0)
    return `${dt}(${numPrec},${numScale})`;
  if (numPrec != null) return `${dt}(${numPrec})`;
  return dt;
}
