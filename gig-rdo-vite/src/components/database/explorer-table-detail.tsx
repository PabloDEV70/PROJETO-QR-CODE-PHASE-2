import { useMemo, useCallback } from 'react';
import { Box, Chip, CircularProgress, Typography, IconButton, Tooltip, Tabs, Tab } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { copyToClipboard } from '@/utils/clipboard';
import { useTableSchema, useTableKeys, useTableRelations } from '@/hooks/use-database-schema';
import type { FkDetail } from '@/hooks/use-database';
import {
  useDictionaryTableFields, useFieldTypesMeta, usePresentationTypesMeta,
} from '@/hooks/use-dictionary-fields';
import { TableSchemaPanel } from '@/components/database/table-schema-panel';
import { TableDataPanel } from '@/components/database/table-data-panel';
import type { ColunaSchema, CampoDicionario } from '@/types/database-types';

type SubTab = 'estrutura' | 'dados';

interface ExplorerTableDetailProps {
  tableName: string;
}

export function ExplorerTableDetail({ tableName }: ExplorerTableDetailProps) {
  const [params, setParams] = useSearchParams();
  const rawSub = params.get('tsub');
  const subTab: SubTab = rawSub === 'dados' ? 'dados' : 'estrutura';

  const { data: schema, isLoading } = useTableSchema(tableName);
  const { data: keys } = useTableKeys(tableName);
  const { data: dictFields, isLoading: dictLoading } = useDictionaryTableFields(tableName);
  const { data: relations } = useTableRelations(tableName);
  const { data: typeLabels } = useFieldTypesMeta();
  const { data: presLabels } = usePresentationTypesMeta();

  const columns: ColunaSchema[] = Array.isArray(schema) ? (schema as ColunaSchema[]) : [];
  const pkCols = useMemo(
    () => Array.isArray(keys) ? keys.map((k: { COLUMN_NAME: string }) => k.COLUMN_NAME) : [],
    [keys],
  );

  const dictMap = useMemo(() => {
    const m = new Map<string, CampoDicionario>();
    if (dictFields) dictFields.forEach((f) => m.set(f.nomeCampo, f));
    return m;
  }, [dictFields]);

  const fkMap = useMemo(() => {
    const m = new Map<string, string>();
    if (dictFields) dictFields.forEach((f) => { if (f.fkTable) m.set(f.nomeCampo, f.fkTable); });
    return m;
  }, [dictFields]);

  const fkDetailMap = useMemo(() => {
    const m = new Map<string, FkDetail>();
    // 1) SQL Server FK constraints — exact column mapping
    if (relations) {
      for (const rel of relations) {
        const parent = String(rel.ParentColumn ?? '');
        const refTable = String(rel.ReferencedTable ?? '');
        const refCol = String(rel.ReferencedColumn ?? '');
        if (parent && refTable && refCol) m.set(parent, { table: refTable, column: refCol });
      }
    }
    // 2) Dictionary FKs — fallback: assume parent column name = referenced column name
    if (dictFields) {
      for (const f of dictFields) {
        if (f.fkTable && !m.has(f.nomeCampo)) {
          m.set(f.nomeCampo, { table: f.fkTable, column: f.nomeCampo });
        }
      }
    }
    return m;
  }, [relations, dictFields]);

  const copySelect = useCallback(() => {
    copyToClipboard(`SELECT TOP 10 * FROM ${tableName}`);
  }, [tableName]);

  const handleSubTab = (_: unknown, val: SubTab) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tsub', val);
      return next;
    }, { replace: true });
  };

  if (isLoading) return <CircularProgress size={20} />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexShrink: 0,
      }}>
        <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>
          {tableName}
        </Typography>
        <Chip label={`${columns.length} cols`} size="small" variant="outlined"
          sx={{ height: 20, fontSize: 11 }} />
        {pkCols.length > 0 && (
          <Chip label={`PK: ${pkCols.join(', ')}`} size="small" color="primary"
            variant="outlined" sx={{ height: 20, fontSize: 11 }} />
        )}
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Copiar SELECT TOP 10" arrow>
          <IconButton size="small" onClick={copySelect}>
            <ContentCopy sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Tabs
        value={subTab} onChange={handleSubTab}
        sx={{
          minHeight: 30, flexShrink: 0, borderBottom: 1, borderColor: 'divider',
          '& .MuiTab-root': {
            minHeight: 30, py: 0, px: 1.5, fontSize: 12,
            textTransform: 'none', fontWeight: 500,
            '&.Mui-selected': { fontWeight: 700 },
          },
          '& .MuiTabs-indicator': { height: 2 },
        }}
      >
        <Tab value="estrutura" label="Estrutura" />
        <Tab value="dados" label="Dados" />
      </Tabs>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', mt: 0.5 }}>
        {subTab === 'estrutura' && (
          <TableSchemaPanel
            tableName={tableName} columns={columns} pkCols={pkCols}
            dictMap={dictMap} fkMap={fkMap} dictLoading={dictLoading}
            typeLabels={typeLabels ?? {}} presLabels={presLabels ?? {}}
          />
        )}
        {subTab === 'dados' && (
          <TableDataPanel tableName={tableName} dictMap={dictMap} pkCols={pkCols} fkDetailMap={fkDetailMap} />
        )}
      </Box>
    </Box>
  );
}
