import { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, Paper, Tabs, Tab } from '@mui/material';
import { Code, History } from '@mui/icons-material';
import { useDbQuery } from '@/hooks/use-database';
import { useGistStore } from '@/stores/gist-store';
import { useQueryDraftStore } from '@/stores/query-draft-store';
import { useQueryHistoryStore, isSystemQuery } from '@/stores/query-history-store';
import { QueryCodemirror } from '@/components/database/query-codemirror';
import { QueryToolbar } from '@/components/database/query-toolbar';
import { QueryResultsTable } from '@/components/database/query-results-table';
import { QueryGistDialog } from '@/components/database/query-gist-dialog';
import { QueryTokenDialog } from '@/components/database/query-token-dialog';
import { QueryErrorPanel } from '@/components/database/query-error-panel';
import { QueryRecordDrawer } from '@/components/database/query-record-drawer';
import { QueryHistoryPanel } from '@/components/database/query-history-panel';
import { copyToClipboard } from '@/utils/clipboard';
import { formatSql } from '@/utils/sql-format';

const TABLE_RE = /\bFROM\s+\[?(\w+)\]?/i;

const DEFAULT_SQL =
  'SELECT TOP 10 TABLE_NAME, TABLE_TYPE\nFROM INFORMATION_SCHEMA.TABLES\nORDER BY TABLE_NAME';

type SubTab = 'editor' | 'historico';

export function QueryEditor() {
  const [sql, setSql] = useState(DEFAULT_SQL);
  const [subTab, setSubTab] = useState<SubTab>('editor');
  const draftSql = useQueryDraftStore((s) => s.draftSql);
  const clearDraft = useQueryDraftStore((s) => s.clearDraft);
  const addHistoryEntry = useQueryHistoryStore((s) => s.addEntry);

  useEffect(() => {
    if (draftSql) { setSql(draftSql); clearDraft(); }
  }, [draftSql, clearDraft]);
  const [gistDialogOpen, setGistDialogOpen] = useState(false);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [activeGistId, setActiveGistId] = useState<string | null>(null);
  const [activeGistFilename, setActiveGistFilename] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<Record<string, unknown> | null>(null);

  const githubToken = useGistStore((s) => s.githubToken);
  const mutation = useDbQuery();
  const result = mutation.data;

  const queryTable = useMemo(() => TABLE_RE.exec(sql)?.[1] ?? 'Resultado', [sql]);

  const handleExecute = useCallback(() => {
    if (!sql.trim()) return;
    mutation.mutate(sql);
  }, [sql, mutation]);

  const runAndSwitch = useCallback((querySql: string) => {
    setSql(querySql);
    setSubTab('editor');
    mutation.mutate(querySql);
  }, [mutation]);

  const loadAndSwitch = useCallback((querySql: string) => {
    setSql(querySql);
    setSubTab('editor');
  }, []);

  // Save to history on successful execution (skip system queries)
  useEffect(() => {
    if (!result || !mutation.isSuccess) return;
    const executedSql = sql.trim();
    if (!executedSql || isSystemQuery(executedSql)) return;
    const table = TABLE_RE.exec(executedSql)?.[1] ?? 'Resultado';
    addHistoryEntry({
      sql: executedSql,
      tableName: table,
      rowCount: result.quantidadeLinhas ?? 0,
      execTimeMs: result.tempoExecucaoMs ?? 0,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutation.isSuccess, result]);

  const openGistDialog = useCallback((_tab: 'save' | 'load') => {
    if (!githubToken) { setTokenDialogOpen(true); return; }
    setGistDialogOpen(true);
  }, [githubToken]);

  const handleCopy = useCallback(() => {
    if (!result?.linhas?.length) return;
    const cols = Object.keys(result.linhas[0] as object);
    const text = result.linhas.map((r) => cols.map((c) => r[c]).join('\t')).join('\n');
    copyToClipboard(cols.join('\t') + '\n' + text);
  }, [result]);

  const handleLoad = useCallback((loadedSql: string, gistId: string, filename: string) => {
    setSql(loadedSql);
    setActiveGistId(gistId);
    setActiveGistFilename(filename);
  }, []);

  const handleFormat = useCallback(() => { setSql((prev) => formatSql(prev)); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); openGistDialog('save');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault(); openGistDialog('load');
      }
      if (e.shiftKey && e.altKey && e.key === 'F') {
        e.preventDefault(); handleFormat();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openGistDialog, handleFormat]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
      <Tabs value={subTab} onChange={(_, v) => setSubTab(v)} sx={{
        minHeight: 28, flexShrink: 0,
        '& .MuiTab-root': {
          minHeight: 28, py: 0, px: 1.5, fontSize: 11,
          textTransform: 'none', fontWeight: 500,
          '&.Mui-selected': { fontWeight: 700 },
        },
        '& .MuiTabs-indicator': { height: 2 },
      }}>
        <Tab value="editor" label="Editor" icon={<Code sx={{ fontSize: 14 }} />}
          iconPosition="start" />
        <Tab value="historico" label="Historico" icon={<History sx={{ fontSize: 14 }} />}
          iconPosition="start" />
      </Tabs>

      {subTab === 'editor' && (
        <>
          <Paper sx={{ p: 1.5, flexShrink: 0 }}>
            <QueryCodemirror value={sql} onChange={setSql} onExecute={handleExecute} />
            <Box sx={{ mt: 1 }}>
              <QueryToolbar
                onExecute={handleExecute} onSave={() => openGistDialog('save')}
                onLoad={() => openGistDialog('load')} onCopy={handleCopy}
                onFormat={handleFormat}
                isPending={mutation.isPending} canExecute={!!sql.trim()}
                rowCount={result?.quantidadeLinhas} execTimeMs={result?.tempoExecucaoMs}
                hasToken={!!githubToken} hasResults={!!result?.linhas?.length}
                activeGistName={activeGistFilename ?? undefined}
              />
            </Box>
          </Paper>
          {mutation.error && (
            <QueryErrorPanel error={mutation.error as Error}
              onDismiss={() => mutation.reset()} />
          )}
          {result?.linhas && (
            <QueryResultsTable linhas={result.linhas} onRowClick={setSelectedRow} />
          )}
          <QueryRecordDrawer row={selectedRow} tableName={queryTable}
            onClose={() => setSelectedRow(null)} />
        </>
      )}

      {subTab === 'historico' && (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', p: 1 }}>
          <QueryHistoryPanel onLoad={loadAndSwitch} onRun={runAndSwitch} />
        </Box>
      )}

      <QueryGistDialog
        open={gistDialogOpen} onClose={() => setGistDialogOpen(false)}
        sql={sql} activeGistId={activeGistId} activeGistFilename={activeGistFilename}
        onLoad={handleLoad}
      />
      <QueryTokenDialog open={tokenDialogOpen} onClose={() => setTokenDialogOpen(false)} />
    </Box>
  );
}
