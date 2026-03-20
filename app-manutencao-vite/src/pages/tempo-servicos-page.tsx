import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Stack, CircularProgress } from '@mui/material';
import { FilterDatePicker } from '@/components/shared/filter-date-picker';
import { useTempoServicos } from '@/hooks/use-manutencao';
import { TempoVisaoGeral } from '@/components/tempo-servicos/visao-geral';
import { TempoPorColaborador } from '@/components/tempo-servicos/por-colaborador';
import { TempoPorGrupo } from '@/components/tempo-servicos/por-grupo';
import { TempoPorTipo } from '@/components/tempo-servicos/por-tipo';

function useUrlParam(key: string, fallback = '') {
  const [sp, setSp] = useSearchParams();
  const value = sp.get(key) ?? fallback;
  const set = useCallback(
    (v: string | null) => {
      const next = new URLSearchParams(sp);
      if (v) next.set(key, v);
      else next.delete(key);
      setSp(next, { replace: true });
    },
    [sp, setSp, key],
  );
  return [value, set] as const;
}

export function TempoServicosPage() {
  const [tabStr, setTab] = useUrlParam('tab', '0');
  const [dataInicio, setDataInicio] = useUrlParam('dataInicio');
  const [dataFim, setDataFim] = useUrlParam('dataFim');
  const [codexecStr, setCodexecStr] = useUrlParam('codexec');
  const [grupoStr, setGrupoStr] = useUrlParam('codGrupoProd');

  const tab = Number(tabStr) || 0;
  const codexec = codexecStr ? Number(codexecStr) : null;
  const codGrupoProd = grupoStr ? Number(grupoStr) : null;

  const params = {
    ...(dataInicio ? { dataInicio } : {}),
    ...(dataFim ? { dataFim } : {}),
    ...(codexec ? { codexec } : {}),
    ...(codGrupoProd ? { codGrupoProd } : {}),
  };

  const { data, isLoading } = useTempoServicos(
    Object.keys(params).length > 0 ? params : undefined,
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <Typography variant="h5" fontWeight={700}>
          Tempo de Servicos
        </Typography>
        <FilterDatePicker
          value={dataInicio || null}
          onChange={(v) => setDataInicio(v)}
          placeholder="Data inicio"
        />
        <FilterDatePicker
          value={dataFim || null}
          onChange={(v) => setDataFim(v)}
          placeholder="Data fim"
        />
        {isLoading && <CircularProgress size={18} />}
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(String(v))}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab label="Visao Geral" />
        <Tab label="Por Colaborador" />
        <Tab label="Por Grupo de Servico" />
        <Tab label="Por Tipo Manutencao" />
      </Tabs>

      {tab === 0 && <TempoVisaoGeral data={data} loading={isLoading} />}
      {tab === 1 && (
        <TempoPorColaborador
          data={data}
          loading={isLoading}
          codexec={codexec}
          onCodexecChange={(v) => setCodexecStr(v ? String(v) : null)}
        />
      )}
      {tab === 2 && (
        <TempoPorGrupo
          data={data}
          loading={isLoading}
          codGrupoProd={codGrupoProd}
          onGrupoChange={(v) => setGrupoStr(v ? String(v) : null)}
        />
      )}
      {tab === 3 && <TempoPorTipo data={data} loading={isLoading} />}
    </Box>
  );
}
