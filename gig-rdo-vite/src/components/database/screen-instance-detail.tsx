import { Box, Chip, CircularProgress, Typography, Tabs, Tab } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useScreenDetail } from '@/hooks/use-screen-builder';
import { useScreenResourceId } from '@/hooks/use-screen-rbac';
import {
  InfoRow, CamposPanel, LinksPanel, PropriedadesPanel,
} from '@/components/database/screen-detail-panels';
import { MenuPanel, PermissoesPanel, AcessoPanel } from '@/components/database/screen-extra-panels';
import { TableDataPanel } from '@/components/database/table-data-panel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;

type SubTab =
  | 'resumo' | 'campos' | 'dados' | 'links'
  | 'menu' | 'permissoes' | 'acesso' | 'propriedades';
const VALID_SUBS = new Set<string>([
  'resumo', 'campos', 'dados', 'links', 'menu', 'permissoes', 'acesso', 'propriedades',
]);

interface Props { nuInstancia: number }

export function ScreenInstanceDetail({ nuInstancia }: Props) {
  const [params, setParams] = useSearchParams();
  const rawSub = params.get('tsub') ?? '';
  const subTab: SubTab = VALID_SUBS.has(rawSub) ? (rawSub as SubTab) : 'resumo';

  const { data: detail, isLoading } = useScreenDetail(nuInstancia);
  const { data: resourceId } = useScreenResourceId(nuInstancia);

  const handleSubTab = (_: unknown, val: SubTab) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tsub', val);
      return next;
    }, { replace: true });
  };

  if (isLoading) return <CircularProgress size={20} />;
  if (!detail) return <Typography sx={{ fontSize: 12 }}>Instancia nao encontrada</Typography>;

  const name = String(detail.NOMEINSTANCIA ?? '');
  const table = String(detail.NOMETAB ?? '');
  const active = detail.ATIVO === 'S' || detail.ATIVO === 1;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexShrink: 0 }}>
        <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>
          {name}
        </Typography>
        <Chip label={table} size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
        <Chip
          label={active ? 'Ativo' : 'Inativo'} size="small"
          color={active ? 'success' : 'default'} variant="outlined"
          sx={{ height: 20, fontSize: 11 }}
        />
      </Box>

      <Tabs
        value={subTab} onChange={handleSubTab}
        variant="scrollable" scrollButtons="auto"
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
        <Tab value="resumo" label="Resumo" />
        <Tab value="campos" label="Campos" />
        <Tab value="dados" label="Dados" />
        <Tab value="links" label="Links" />
        <Tab value="menu" label="Menu" />
        <Tab value="permissoes" label="Permissoes" />
        <Tab value="acesso" label="Acesso" />
        <Tab value="propriedades" label="Propriedades" />
      </Tabs>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', mt: 0.5 }}>
        {subTab === 'resumo' && <ResumoPanel detail={detail} />}
        {subTab === 'campos' && <CamposPanel tableName={table} />}
        {subTab === 'dados' && <TableDataPanel tableName={table} />}
        {subTab === 'links' && <LinksPanel nuInstancia={nuInstancia} />}
        {subTab === 'menu' && <MenuPanel resourceId={resourceId ?? null} />}
        {subTab === 'permissoes' && <PermissoesPanel resourceId={resourceId ?? null} />}
        {subTab === 'acesso' && <AcessoPanel resourceId={resourceId ?? null} />}
        {subTab === 'propriedades' && <PropriedadesPanel nuInstancia={nuInstancia} />}
      </Box>
    </Box>
  );
}

function ResumoPanel({ detail }: { detail: R }) {
  return (
    <Box sx={{ p: 0.5 }}>
      <InfoRow label="Instancia" value={detail.NUINSTANCIA} />
      <InfoRow label="Nome" value={detail.NOMEINSTANCIA} />
      <InfoRow label="Descricao" value={detail.DESCRINSTANCIA} />
      <InfoRow label="Tabela" value={detail.NOMETAB} />
      <InfoRow label="Desc. Tabela" value={detail.DESCRTAB} />
      <InfoRow label="Categoria" value={detail.CATEGORIA} />
      <InfoRow label="Tipo Form" value={detail.TIPOFORM} />
      <InfoRow label="Raiz" value={detail.RAIZ} />
      <InfoRow label="Numeracao" value={detail.TIPONUMERACAO} />
      <InfoRow label="Filtro" value={detail.FILTRO} />
    </Box>
  );
}
