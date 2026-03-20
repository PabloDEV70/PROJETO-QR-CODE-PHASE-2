import { Box, Typography, CircularProgress, Chip } from '@mui/material';
import { DictFieldTable } from '@/components/database/dict-field-table';
import { DictCopyButtons } from '@/components/database/dict-copy-buttons';
import { DictInstances } from '@/components/database/dict-instances';
import type { CampoDicionario } from '@/types/database-types';

interface Props {
  selected: string;
  fieldList: CampoDicionario[];
  fieldsLoading: boolean;
  pkCols: string[];
  fkMap: Map<string, string>;
  triggerCount: number;
  typeLabels: Record<string, string>;
  presLabels: Record<string, string>;
  onSelectField: (f: CampoDicionario) => void;
}

export function DictFieldsPanel({
  selected, fieldList, fieldsLoading, pkCols, fkMap,
  triggerCount, typeLabels, presLabels, onSelectField,
}: Props) {
  return (
    <>
      <Box sx={{
        display: 'flex', gap: 0.5, mb: 0.5, flexWrap: 'wrap',
        flexShrink: 0, alignItems: 'center',
      }}>
        <Typography sx={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700 }}>
          {selected}
        </Typography>
        {pkCols.length > 0 && (
          <Chip label={`PK: ${pkCols.join(', ')}`} size="small" color="primary"
            variant="outlined" sx={{ height: 20, fontSize: 11 }} />
        )}
        {fkMap.size > 0 && (
          <Chip label={`${fkMap.size} FKs`} size="small" variant="outlined"
            sx={{ height: 20, fontSize: 11 }} />
        )}
        <Chip label={`${fieldList.length} campos`} size="small" variant="outlined"
          sx={{ height: 20, fontSize: 11 }} />
        {triggerCount > 0 && (
          <Chip label={`${triggerCount} triggers`} size="small" variant="outlined"
            color="warning" sx={{ height: 20, fontSize: 11 }} />
        )}
        <DictCopyButtons
          tableName={selected}
          fields={fieldList}
          pkCols={pkCols}
          fkMap={fkMap}
        />
      </Box>
      {fieldsLoading ? <CircularProgress size={20} /> : (
        <DictFieldTable
          fields={fieldList} pkCols={pkCols} fkMap={fkMap}
          typeLabels={typeLabels} presLabels={presLabels}
          onSelectField={onSelectField}
        />
      )}
      <DictInstances tableName={selected} />
    </>
  );
}
