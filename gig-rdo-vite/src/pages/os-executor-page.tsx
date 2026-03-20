import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Stack, Paper, Typography, Autocomplete, TextField,
  Skeleton, Select, MenuItem, FormControl,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { EngineeringRounded } from '@mui/icons-material';
import { parseISO, format, isValid } from 'date-fns';
import { PageLayout } from '@/components/layout/page-layout';
import { OsServicosGrid } from '@/components/os/os-servicos-grid';
import { OsExecutorKpis } from '@/components/os/os-executor-kpis';
import { OsExportButton } from '@/components/os/os-export-button';
import { OsClassificationFilters } from '@/components/os/os-classification-filters';
import { OsExecutorPicker } from '@/components/os/os-executor-picker';
import { useDepartamentos } from '@/hooks/use-departamentos';
import { useFuncionariosLista } from '@/hooks/use-funcionarios-lista';
import { useOsColabServicos } from '@/hooks/use-os-list';
import { useFuncionarioPerfilSuper } from '@/hooks/use-funcionario';
import { getPeriodPresets, getActivePresetKey } from '@/utils/rdo-filter-helpers';
import type { DepartamentoOpcao } from '@/hooks/use-departamentos';

export function OsExecutorPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dataInicio = searchParams.get('dataInicio') ?? '';
  const dataFim = searchParams.get('dataFim') ?? '';
  const coddep = searchParams.get('coddep');
  const codparc = searchParams.get('codparc');
  const fTipo = searchParams.get('tipo') ?? '';
  const fManu = searchParams.get('manutencao') ?? '';
  const fLocal = searchParams.get('local') ?? '';

  const presets = useMemo(() => getPeriodPresets(), []);
  const activePreset = useMemo(
    () => getActivePresetKey(dataInicio, dataFim), [dataInicio, dataFim],
  );
  const selectValue = activePreset ?? (dataInicio || dataFim ? '__custom' : '__all');

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === '') next.delete(k); else next.set(k, v);
      });
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const { data: departamentos = [] } = useDepartamentos();
  const selectedDep = useMemo(() => {
    if (!coddep) return null;
    return departamentos.find((d) => d.codigo === Number(coddep)) ?? null;
  }, [coddep, departamentos]);

  const { data: funcData, isLoading: funcLoading } = useFuncionariosLista(coddep);
  const funcionarios = useMemo(() => funcData?.data ?? [], [funcData]);
  const selectedFunc = useMemo(() => {
    if (!codparc) return null;
    return funcionarios.find((f) => f.codparc === Number(codparc)) ?? null;
  }, [codparc, funcionarios]);

  const colabQuery = useOsColabServicos(
    codparc ? { codparc, dataInicio, dataFim } : null,
  );
  const servicosRaw = colabQuery.data ?? [];
  const servicos = useMemo(() => servicosRaw.filter((s) => {
    if (fTipo && s.TIPO !== fTipo) return false;
    if (fManu && s.MANUTENCAO !== fManu) return false;
    if (fLocal && s.localManutencao !== fLocal) return false;
    return true;
  }), [servicosRaw, fTipo, fManu, fLocal]);

  const { data: perfil } = useFuncionarioPerfilSuper(codparc ? Number(codparc) : null);

  const handlePreset = (key: string) => {
    if (key === '__all') { updateParams({ dataInicio: null, dataFim: null }); return; }
    const p = presets.find((pr) => pr.key === key);
    if (p) updateParams({ dataInicio: p.ini, dataFim: p.fim });
  };

  return (
    <PageLayout
      title="Servicos por Executor"
      subtitle="OS em que o colaborador atuou como executante"
      icon={EngineeringRounded}
    >
      <Paper sx={{ px: 1.5, py: 1, borderRadius: 3 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value={selectValue}
              onChange={(e) => handlePreset(e.target.value)}
              sx={{ fontWeight: 600, fontSize: 13, height: 32, borderRadius: 2 }}>
              {presets.map((p) => (
                <MenuItem key={p.key} value={p.key}>{p.label}</MenuItem>
              ))}
              <MenuItem value="__all">Tudo</MenuItem>
              {selectValue === '__custom' && (
                <MenuItem value="__custom">Personalizado</MenuItem>
              )}
            </Select>
          </FormControl>
          <DatePicker value={dataInicio ? parseISO(dataInicio) : null}
            onChange={(d) => updateParams({
              dataInicio: d && isValid(d) ? format(d, 'yyyy-MM-dd') : null,
            })}
            format="dd/MM/yyyy"
            slotProps={{ textField: { size: 'small', sx: { width: 145 } } }} />
          <DatePicker value={dataFim ? parseISO(dataFim) : null}
            onChange={(d) => updateParams({
              dataFim: d && isValid(d) ? format(d, 'yyyy-MM-dd') : null,
            })}
            format="dd/MM/yyyy"
            slotProps={{ textField: { size: 'small', sx: { width: 145 } } }} />

          <Autocomplete<DepartamentoOpcao>
            size="small" options={departamentos}
            value={selectedDep}
            onChange={(_e, val) => updateParams({
              coddep: val ? String(val.codigo) : null, codparc: null,
            })}
            getOptionLabel={(o) => o.nome}
            isOptionEqualToValue={(o, v) => o.codigo === v.codigo}
            renderInput={(params) => (
              <TextField {...params} placeholder="Departamento..." />
            )}
            sx={{ width: 220 }}
            noOptionsText="Nenhum" loadingText="Carregando..."
          />

          <OsExecutorPicker
            funcionarios={funcionarios} loading={funcLoading}
            value={selectedFunc} hasDepartamento={!!coddep}
            onChange={(val) => updateParams({ codparc: val ? String(val.codparc) : null })}
          />

          <OsExportButton
            funcionario={perfil ?? undefined}
            servicos={servicos}
            periodo={{ dataInicio: dataInicio || undefined, dataFim: dataFim || undefined }}
          />
        </Stack>
      </Paper>

      {codparc && servicosRaw.length > 0 && (
        <Paper sx={{ px: 1.5, py: 1, mt: 1, borderRadius: 3 }}>
          <OsClassificationFilters
            servicos={servicosRaw}
            tipo={fTipo} manutencao={fManu} local={fLocal}
            onTipoChange={(v) => updateParams({ tipo: v || null })}
            onManutencaoChange={(v) => updateParams({ manutencao: v || null })}
            onLocalChange={(v) => updateParams({ local: v || null })}
          />
        </Paper>
      )}

      <Stack spacing={2} sx={{ mt: 2 }}>
        {!codparc && (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography color="text.secondary">
              {!coddep
                ? 'Selecione um departamento e um colaborador.'
                : 'Selecione um colaborador para ver os servicos.'}
            </Typography>
          </Paper>
        )}

        {codparc && colabQuery.isLoading && (
          <Stack spacing={1}>
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} height={40} />)}
          </Stack>
        )}

        {codparc && !colabQuery.isLoading && servicos.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography color="text.secondary">
              Nenhum servico encontrado para este executor no periodo.
            </Typography>
          </Paper>
        )}

        {codparc && servicos.length > 0 && (
          <>
            <OsExecutorKpis servicos={servicos} />
            <OsServicosGrid servicos={servicos} />
          </>
        )}
      </Stack>
    </PageLayout>
  );
}
