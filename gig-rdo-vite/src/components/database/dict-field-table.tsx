import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Tooltip,
} from '@mui/material';
import type { CampoDicionario, FieldTypesMap } from '@/types/database-types';

interface Props {
  fields: CampoDicionario[];
  pkCols: string[];
  fkMap: Map<string, string>;
  typeLabels: FieldTypesMap;
  presLabels: FieldTypesMap;
  onSelectField: (field: CampoDicionario) => void;
}

export function DictFieldTable({
  fields, pkCols, fkMap, typeLabels, presLabels, onSelectField,
}: Props) {
  return (
    <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>#</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Campo</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Descricao</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Tipo</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Tam</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Apres</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>PK</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>FK</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fields.map((f) => {
            const isPk = pkCols.includes(f.nomeCampo);
            const fkTable = fkMap.get(f.nomeCampo);
            const typeLabel = typeLabels[f.tipo] ?? f.tipo;
            const presLabel = presLabels[f.tipoapresentacao ?? ''] ?? f.tipoapresentacao;
            const hasOpts = f.qtdOpcoes > 0;
            return (
              <TableRow
                key={f.nucampo} hover
                onClick={() => onSelectField(f)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell sx={{ fontSize: 10, py: 0.2, color: 'text.secondary' }}>
                  {f.ordem || '-'}
                </TableCell>
                <TableCell sx={{
                  fontSize: 11, py: 0.2, fontFamily: 'monospace',
                  fontWeight: isPk ? 700 : 400,
                }}>
                  {f.nomeCampo}
                  {f.calculado && (
                    <Chip label="calc" size="small" sx={{ ml: 0.5, height: 14, fontSize: 8 }} />
                  )}
                  {f.sistema && (
                    <Chip label="sys" size="small" variant="outlined"
                      sx={{ ml: 0.5, height: 14, fontSize: 8 }} />
                  )}
                  {hasOpts && (
                    <Chip label={`${f.qtdOpcoes} opc`} size="small" color="info"
                      variant="outlined" sx={{ ml: 0.5, height: 14, fontSize: 8 }} />
                  )}
                </TableCell>
                <TableCell sx={{
                  fontSize: 11, py: 0.2, maxWidth: 180,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {f.descricao}
                </TableCell>
                <TableCell sx={{ fontSize: 10, py: 0.2 }}>
                  <Tooltip title={typeLabel} arrow>
                    <span>{f.tipo}</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ fontSize: 10, py: 0.2 }}>
                  {f.tamanho ?? '-'}
                </TableCell>
                <TableCell sx={{ fontSize: 10, py: 0.2 }}>
                  {presLabel !== 'Padrao' && presLabel !== f.tipoapresentacao ? (
                    <Tooltip title={presLabel} arrow>
                      <span>{f.tipoapresentacao}</span>
                    </Tooltip>
                  ) : (f.tipoapresentacao ?? '-')}
                </TableCell>
                <TableCell sx={{ fontSize: 10, py: 0.2 }}>
                  {isPk ? (
                    <Chip label="PK" size="small" color="primary"
                      sx={{ height: 16, fontSize: 9 }} />
                  ) : '-'}
                </TableCell>
                <TableCell sx={{ fontSize: 10, py: 0.2 }}>
                  {fkTable ? (
                    <Chip label={fkTable} size="small" variant="outlined"
                      sx={{ fontSize: 9, height: 18 }} />
                  ) : '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
