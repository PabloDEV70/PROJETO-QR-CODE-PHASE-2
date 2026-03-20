import { Grid } from '@mui/material';
import { useRdoProdutividade, useRdoEficiencia } from '@/hooks/use-rdo-analytics';
import { useRdoHoraExtra, useRdoAssiduidade } from '@/hooks/use-rdo-extra';
import { ProdutividadeBarChart } from '@/components/charts/produtividade-bar-chart';
import { EficienciaTable } from '@/components/analytics/eficiencia-table';
import { HoraExtraTable } from '@/components/analytics/hora-extra-table';
import { AssiduidadeTable } from '@/components/analytics/assiduidade-table';
import { SectionCard } from './section-card';

interface RdoAnalyticsTabProps {
  filterParams: Record<string, string | number>;
}

export function RdoAnalyticsTab({ filterParams }: RdoAnalyticsTabProps) {
  const prod = useRdoProdutividade(filterParams);
  const efic = useRdoEficiencia(filterParams);
  const horaExtra = useRdoHoraExtra(filterParams);
  const assiduidade = useRdoAssiduidade(filterParams);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 7 }}>
        <SectionCard title="Top Colaboradores" subtitle="Ranking por horas trabalhadas">
          <ProdutividadeBarChart data={prod.data} isLoading={prod.isLoading} />
        </SectionCard>
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <SectionCard title="Eficiencia" subtitle="Media min/item por colaborador">
          <EficienciaTable data={efic.data} isLoading={efic.isLoading} />
        </SectionCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SectionCard title="Hora Extra" subtitle="Distribuicao por departamento">
          <HoraExtraTable
            data={horaExtra.data?.data.porDepartamento}
            isLoading={horaExtra.isLoading}
          />
        </SectionCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SectionCard title="Assiduidade" subtitle="Cumprimento de jornada">
          <AssiduidadeTable
            data={assiduidade.data?.data}
            isLoading={assiduidade.isLoading}
          />
        </SectionCard>
      </Grid>
    </Grid>
  );
}
