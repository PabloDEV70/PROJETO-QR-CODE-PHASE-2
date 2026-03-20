import { useParams } from 'react-router-dom';
import { Description } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { ServicosApontamentoTable } from '@/components/apontamentos/servicos-apontamento-table';
import { useApontamentoByCode } from '@/hooks/use-apontamentos';

export function ApontamentoDetailPage() {
  const { codigo } = useParams<{ codigo: string }>();
  const cod = codigo ? Number(codigo) : undefined;
  const query = useApontamentoByCode(cod);

  return (
    <PageLayout
      title={`Apontamento ${codigo ?? ''}`}
      subtitle="Servicos deste apontamento"
      icon={Description}
    >
      <ServicosApontamentoTable
        servicos={query.data}
        isLoading={query.isLoading}
      />
    </PageLayout>
  );
}
