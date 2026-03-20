import { useNavigate } from 'react-router-dom';
import { Paper, Typography } from '@mui/material';
import { PersonSearch } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { FuncionarioSearchLive } from '@/components/shared/funcionario-search-live';

export function ColaboradorSearchPage() {
  const navigate = useNavigate();

  return (
    <PageLayout title="Buscar Colaborador" icon={PersonSearch}>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Busque por nome ou codigo do colaborador para visualizar
          a timeline de atividades.
        </Typography>
        <FuncionarioSearchLive
          value={null}
          onChange={(func) => {
            if (func) navigate(`/rdo/colaborador/${func.codparc}`);
          }}
          label="Colaborador"
          size="medium"
        />
      </Paper>
    </PageLayout>
  );
}
