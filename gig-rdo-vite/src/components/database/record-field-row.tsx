import { TableRow, TableCell, Chip, CircularProgress, Typography } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { useFieldOptions } from '@/hooks/use-dictionary-fields';
import { FkValuePreview } from '@/components/database/fk-value-preview';
import type { CampoDicionario } from '@/types/database-types';
import type { FkDetail } from '@/hooks/use-database';

interface RecordFieldRowProps {
  fieldName: string;
  value: unknown;
  dict: CampoDicionario | null;
  isPk: boolean;
  fkDetail: FkDetail | null;
}

const cellSx = { fontSize: 12, py: 0.4, verticalAlign: 'top' } as const;
const labelSx = { ...cellSx, width: 180, fontWeight: 600, color: 'text.secondary' } as const;
const chipSx = { height: 16, fontSize: 9, ml: 0.5 } as const;

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function formatValue(value: unknown): React.ReactNode {
  if (value == null) {
    return <Typography component="span" sx={{ fontSize: 12, color: 'text.disabled' }}>—</Typography>;
  }
  const str = String(value);
  if (typeof value === 'boolean' || str === 'true' || str === 'false') {
    const yes = value === true || str === 'true';
    return (
      <Chip label={yes ? 'Sim' : 'Nao'} size="small"
        color={yes ? 'success' : 'default'} variant="outlined" sx={{ height: 18, fontSize: 10 }} />
    );
  }
  if (ISO_RE.test(str)) {
    try { return format(parseISO(str), 'dd/MM/yyyy HH:mm'); } catch { /* fallback */ }
  }
  if (str.length > 100) {
    return (
      <Typography component="span"
        sx={{ fontSize: 11, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {str}
      </Typography>
    );
  }
  return str;
}

function OptionValue({ nucampo, rawValue }: { nucampo: number; rawValue: string }) {
  const { data: options, isLoading } = useFieldOptions(nucampo);
  if (isLoading) {
    return (
      <Typography component="span" sx={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        {rawValue} <CircularProgress size={12} />
      </Typography>
    );
  }
  const match = options?.find((o) => o.valor === rawValue);
  if (!match) return <>{rawValue}</>;
  return (
    <Typography component="span" sx={{ fontSize: 12 }}>
      {match.opcao}{' '}
      <Typography component="span" sx={{ fontSize: 10, color: 'text.secondary' }}>
        ({rawValue})
      </Typography>
    </Typography>
  );
}

export function RecordFieldRow({ fieldName, value, dict, isPk, fkDetail }: RecordFieldRowProps) {
  if (fieldName === '__rowId') return null;

  const label = dict?.descricao || fieldName;
  const showOption = dict && dict.qtdOpcoes > 0 && value != null;

  return (
    <TableRow hover>
      <TableCell sx={labelSx}>
        {label}
        {label !== fieldName && (
          <Typography component="span" sx={{ fontSize: 10, color: 'text.disabled', ml: 0.5 }}>
            ({fieldName})
          </Typography>
        )}
        {isPk && <Chip label="PK" size="small" color="primary" sx={chipSx} />}
        {fkDetail && (
          <Chip label={`FK → ${fkDetail.table}`} size="small" variant="outlined" sx={chipSx} />
        )}
        {dict?.calculado && <Chip label="Calc" size="small" sx={chipSx} />}
        {dict?.sistema && (
          <Chip label="Sys" size="small" variant="outlined"
            sx={{ ...chipSx, opacity: 0.6 }} />
        )}
      </TableCell>
      <TableCell sx={cellSx}>
        {showOption
          ? <OptionValue nucampo={dict.nucampo} rawValue={String(value)} />
          : formatValue(value)}
        {fkDetail && value != null && (
          <FkValuePreview
            refTable={fkDetail.table} refColumn={fkDetail.column} value={value}
          />
        )}
      </TableCell>
    </TableRow>
  );
}
