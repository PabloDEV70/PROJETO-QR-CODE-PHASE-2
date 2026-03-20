import { Box, Tabs, Tab, Stack } from '@mui/material';
import { FuncionariosKpiRow } from '@/components/funcionarios/funcionarios-kpi-row';
import { FuncionariosFilterBar } from '@/components/funcionarios/funcionarios-filter-bar';
import { FuncionariosDataGrid } from '@/components/funcionarios/funcionarios-data-grid';
import { FuncionarioDrawer } from '@/components/funcionarios/funcionario-drawer';
import { useFuncionariosGrid, useFuncionariosResumo } from '@/hooks/use-funcionarios-module';
import { useFuncionariosUrlParams } from '@/hooks/use-funcionarios-url-params';

export function FuncionariosPage() {
  const {
    situacao, codemp, coddep, codcargo, codfuncao, termo,
    dataInicio, dataFim,
    tab, page, limit, orderBy, orderDir,
    listParams, drawerCodparc, updateParams, clearAll,
  } = useFuncionariosUrlParams();

  const gridQuery = useFuncionariosGrid(listParams);
  const resumoQuery = useFuncionariosResumo();

  const handleRowClick = (codparc: number) => {
    updateParams({ drawer: String(codparc) });
  };

  const handleDrawerClose = () => {
    updateParams({ drawer: null });
  };

  const handleSituacaoClick = (sit: string) => {
    updateParams({ situacao: sit === 'all' ? 'all' : sit });
  };

  const handlePaginationChange = (newPage: number, newSize: number) => {
    updateParams({ page: String(newPage), limit: String(newSize) });
  };

  const handleSortChange = (field: string, dir: 'ASC' | 'DESC') => {
    updateParams({ orderBy: field, orderDir: dir });
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => updateParams({ tab: v === 0 ? null : String(v) })}
        >
          <Tab label="Lista" />
          <Tab label="Dashboard" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <Stack spacing={2}>
          <FuncionariosKpiRow
            resumo={resumoQuery.data}
            isLoading={resumoQuery.isLoading}
            activeSituacao={situacao}
            onSituacaoClick={handleSituacaoClick}
          />
          <FuncionariosFilterBar
            situacao={situacao}
            codemp={codemp}
            coddep={coddep}
            codcargo={codcargo}
            codfuncao={codfuncao}
            termo={termo}
            dataInicio={dataInicio}
            dataFim={dataFim}
            onUpdateParams={updateParams}
            onClearAll={clearAll}
          />
          <FuncionariosDataGrid
            rows={gridQuery.data?.data ?? []}
            rowCount={gridQuery.data?.meta.total ?? 0}
            isLoading={gridQuery.isLoading}
            page={page}
            pageSize={limit}
            orderBy={orderBy}
            orderDir={orderDir}
            onRowClick={handleRowClick}
            onPaginationChange={handlePaginationChange}
            onSortChange={handleSortChange}
          />
        </Stack>
      )}

      {tab === 1 && (
        <Stack spacing={3}>
          <FuncionariosKpiRow
            resumo={resumoQuery.data}
            isLoading={resumoQuery.isLoading}
            activeSituacao={situacao}
            onSituacaoClick={handleSituacaoClick}
          />
        </Stack>
      )}

      <FuncionarioDrawer
        open={drawerCodparc !== null}
        onClose={handleDrawerClose}
        codparc={drawerCodparc}
      />
    </Box>
  );
}
