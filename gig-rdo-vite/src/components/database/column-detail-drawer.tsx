import {
  Drawer, Typography, Box, Chip, Divider, CircularProgress,
  Table, TableBody,
} from '@mui/material';
import { CodeBlock } from '@/components/shared/code-block';
import { MetaRow, BoolChip, OptionsSection, fullTypeName } from './column-detail-parts';
import type { ColunaSchema, CampoDicionario, FieldTypesMap } from '@/types/database-types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>;

interface Props {
  column: ColunaSchema | null;
  dict: CampoDicionario | null;
  dictLoading?: boolean;
  tableName: string | null;
  pkCols: string[];
  fkMap: Map<string, string>;
  typeLabels: FieldTypesMap;
  presLabels: FieldTypesMap;
  onClose: () => void;
}

export function ColumnDetailDrawer({
  column, dict, dictLoading, tableName,
  pkCols, fkMap, typeLabels, presLabels, onClose,
}: Props) {
  if (!column) return null;
  const raw = column as Raw;
  const name = column.COLUMN_NAME;
  const isPk = pkCols.includes(name);
  const fkRef = fkMap.get(name);
  const typeLabel = dict ? (typeLabels[dict.tipo] ?? dict.tipo) : null;
  const presLabel = dict?.tipoapresentacao
    ? (presLabels[dict.tipoapresentacao] ?? dict.tipoapresentacao) : null;

  return (
    <Drawer anchor="right" open={!!column} onClose={onClose}
      slotProps={{ paper: { sx: { width: 380, p: 2, overflow: 'auto' } } }}>
      <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16 }}>
        {name}
      </Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>
        {tableName}{dict ? ` \u00b7 #${dict.nucampo}` : ''}
      </Typography>

      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
        {isPk && <Chip label="PK" size="small" color="primary" sx={{ height: 20, fontSize: 10 }} />}
        {fkRef && <Chip label={`FK \u2192 ${fkRef}`} size="small" variant="outlined"
          sx={{ height: 20, fontSize: 10 }} />}
        {dict?.calculado && <Chip label="Calculado" size="small" sx={{ height: 20, fontSize: 10 }} />}
        {dict?.sistema && <Chip label="Sistema" size="small" variant="outlined"
          sx={{ height: 20, fontSize: 10 }} />}
        {dict?.adicional && <Chip label="Adicional" size="small" variant="outlined"
          sx={{ height: 20, fontSize: 10 }} />}
      </Box>

      <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
        Schema (INFORMATION_SCHEMA)
      </Typography>
      <Table size="small">
        <TableBody>
          <MetaRow label="Tipo completo" value={fullTypeName(raw)} />
          <MetaRow label="Tipo base" value={column.DATA_TYPE} />
          <MetaRow label="Tamanho max" value={raw.CHARACTER_MAXIMUM_LENGTH} />
          <MetaRow label="Precisao" value={raw.NUMERIC_PRECISION} />
          <MetaRow label="Escala" value={raw.NUMERIC_SCALE} />
          <MetaRow label="Nullable" value={column.IS_NULLABLE} />
          <MetaRow label="Default" value={column.COLUMN_DEFAULT} />
          <MetaRow label="Posicao" value={column.ORDINAL_POSITION} />
          <MetaRow label="Collation" value={raw.COLLATION_NAME} />
          <MetaRow label="Char set" value={raw.CHARACTER_SET_NAME} />
        </TableBody>
      </Table>

      {dictLoading && (
        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={14} />
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
            Carregando dicionario...
          </Typography>
        </Box>
      )}

      {dict && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
            Dicionario Sankhya
          </Typography>
          <Table size="small">
            <TableBody>
              <MetaRow label="Descricao" value={dict.descricao} />
              <MetaRow label="Tipo" value={typeLabel ? `${typeLabel} (${dict.tipo})` : dict.tipo} />
              <MetaRow label="Tamanho" value={dict.tamanho} />
              <MetaRow label="Apresentacao"
                value={presLabel ? `${presLabel} (${dict.tipoapresentacao})` : null} />
              <MetaRow label="Mascara" value={dict.mascara} />
              <MetaRow label="Ordem" value={dict.ordem} />
              <MetaRow label="Pesquisavel"
                value={<BoolChip value={dict.permitePesquisa} label="Sim" />} />
              <MetaRow label="Permite Padrao"
                value={<BoolChip value={dict.permitepadrao} label="Sim" />} />
              <MetaRow label="Visivel Grid"
                value={<BoolChip value={dict.visivelgridpesquisa} label="Sim" />} />
              <MetaRow label="Domain" value={dict.domain} />
              <MetaRow label="Controle" value={dict.controle} />
            </TableBody>
          </Table>
        </>
      )}

      {!dict && !dictLoading && (
        <Box sx={{ mt: 1.5, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
            Sem dados no dicionario Sankhya (TDDCAM) para esta tabela
          </Typography>
        </Box>
      )}

      {dict?.expressao && (
        <Box sx={{ mt: 1.5 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>Expressao</Typography>
          <CodeBlock code={dict.expressao} language="sql" compact maxHeight={200} />
        </Box>
      )}

      {dict && dict.qtdOpcoes > 0 && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <OptionsSection nucampo={dict.nucampo} />
        </>
      )}
    </Drawer>
  );
}
