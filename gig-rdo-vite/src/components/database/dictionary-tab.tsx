import { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useDictionaryTables } from '@/hooks/use-dictionary';
import {
  useDictionaryTableFields, useFieldTypesMeta,
  usePresentationTypesMeta, useTableTriggers,
} from '@/hooks/use-dictionary-fields';
import { useDebouncedParam } from '@/hooks/use-debounced-param';
import { DictTreeSidebar } from '@/components/database/dict-tree-sidebar';
import { DictFieldsPanel } from '@/components/database/dict-fields-panel';
import { DictFieldDetail } from '@/components/database/dict-field-detail';
import { DictFieldSearch } from '@/components/database/dict-field-search';
import { DictTriggerDetail } from '@/components/database/dict-trigger-detail';

export function DictionaryTab() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useDebouncedParam('dq');
  const selected = params.get('dict') || null;
  const selectedField = params.get('df') || null;
  const selectedTrigger = params.get('dt') || null;
  const isSearchMode = params.get('dv') === 'search';

  const setSelected = (name: string) => {
    setParams((p) => {
      const n = new URLSearchParams(p);
      n.set('dict', name);
      n.delete('df');
      n.delete('dt');
      n.delete('dv');
      return n;
    }, { replace: true });
  };

  const setField = (name: string) => {
    setParams((p) => {
      const n = new URLSearchParams(p);
      n.set('df', name);
      n.delete('dt');
      n.delete('dv');
      return n;
    }, { replace: true });
  };

  const clearField = () => {
    setParams((p) => {
      const n = new URLSearchParams(p);
      n.delete('df');
      return n;
    }, { replace: true });
  };

  const setTrigger = (name: string) => {
    setParams((p) => {
      const n = new URLSearchParams(p);
      n.set('dt', name);
      n.delete('df');
      n.delete('dv');
      return n;
    }, { replace: true });
  };

  const toggleSearch = () => {
    setParams((p) => {
      const n = new URLSearchParams(p);
      isSearchMode ? n.delete('dv') : n.set('dv', 'search');
      return n;
    }, { replace: true });
  };

  const { data: tables, isLoading, error } = useDictionaryTables();
  const { data: fields, isLoading: fieldsLoading } = useDictionaryTableFields(selected);
  const { data: typeLabels } = useFieldTypesMeta();
  const { data: presLabels } = usePresentationTypesMeta();
  const { data: triggers } = useTableTriggers(selected);

  const tableList = Array.isArray(tables) ? tables : [];
  const lowerSearch = search.toLowerCase();
  const filtered = useMemo(
    () => lowerSearch
      ? tableList.filter((t) =>
          t.nomeTabela?.toLowerCase().includes(lowerSearch)
          || t.descricao?.toLowerCase().includes(lowerSearch))
      : tableList,
    [tableList, lowerSearch],
  );

  const fieldList = fields ?? [];
  const triggerList = triggers ?? [];

  // Derive PK/FK from combined field query (no extra API calls)
  const pkCols = useMemo(
    () => fieldList.filter((f) => f.isPk).map((f) => f.nomeCampo),
    [fieldList],
  );
  const fkMap = useMemo(
    () => new Map(
      fieldList.filter((f) => f.fkTable).map((f) => [f.nomeCampo, f.fkTable!]),
    ),
    [fieldList],
  );

  const field = selectedField
    ? fieldList.find((f) => f.nomeCampo === selectedField) ?? null
    : null;
  const trigger = selectedTrigger
    ? triggerList.find((t) => t.nome === selectedTrigger) ?? null
    : null;

  return (
    <Box sx={{ display: 'flex', gap: 1, height: '100%' }}>
      <DictTreeSidebar
        search={search} onSearchChange={setSearch}
        filtered={filtered} isLoading={isLoading} error={error}
        selected={selected} onSelectTable={setSelected}
        fields={fieldList} fieldsLoading={fieldsLoading}
        triggers={triggerList}
        selectedField={selectedField} selectedTrigger={selectedTrigger}
        onSelectField={setField} onSelectTrigger={setTrigger}
        onGlobalSearch={toggleSearch} isSearchMode={isSearchMode}
      />

      <Paper sx={{
        flex: 1, p: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {isSearchMode ? (
          <DictFieldSearch onSelectTable={setSelected} />
        ) : selectedTrigger && trigger ? (
          <DictTriggerDetail trigger={trigger} tableName={selected!} />
        ) : !selected ? (
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
            Selecione uma tabela na arvore
          </Typography>
        ) : (
          <DictFieldsPanel
            selected={selected} fieldList={fieldList} fieldsLoading={fieldsLoading}
            pkCols={pkCols} fkMap={fkMap} triggerCount={triggerList.length}
            typeLabels={typeLabels ?? {}} presLabels={presLabels ?? {}}
            onSelectField={(f) => setField(f.nomeCampo)}
          />
        )}
      </Paper>

      <DictFieldDetail
        field={field} tableName={selected}
        pkCols={pkCols} fkMap={fkMap}
        typeLabels={typeLabels ?? {}} presLabels={presLabels ?? {}}
        onClose={clearField}
      />
    </Box>
  );
}
