import { Box, Paper, Typography, Stack, Chip, CircularProgress } from '@mui/material';
import { ShoppingCart, Build, RequestQuote, Warning } from '@mui/icons-material';
import { useComprasResumo } from '@/hooks/use-compras';

function KpiCard({ icon, label, value, color, loading }: {
  icon: React.ReactNode; label: string; value: number; color: string; loading: boolean;
}) {
  return (
    <Paper sx={{ p: 2, flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{
        width: 48, height: 48, borderRadius: '12px',
        bgcolor: `${color}15`, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </Box>
      <Box>
        {loading ? (
          <CircularProgress size={20} />
        ) : (
          <Typography sx={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>
            {value}
          </Typography>
        )}
        <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

export function AcompanhamentoComprasPage() {
  const { data: resumo, isLoading } = useComprasResumo();

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Portal de Compras
        </Typography>
        <Chip label="Acompanhamento" size="small" color="primary" />
      </Stack>

      {/* KPIs */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <KpiCard
          icon={<ShoppingCart sx={{ fontSize: 24, color: '#e65100' }} />}
          label="Requisicoes Compras"
          value={resumo?.requisicoesPendentesCompras ?? 0}
          color="#e65100"
          loading={isLoading}
        />
        <KpiCard
          icon={<Build sx={{ fontSize: 24, color: '#1565c0' }} />}
          label="Requisicoes Manutencao"
          value={resumo?.requisicoesPendentesManut ?? 0}
          color="#1565c0"
          loading={isLoading}
        />
        <KpiCard
          icon={<RequestQuote sx={{ fontSize: 24, color: '#2e7d32' }} />}
          label="Cotacoes Pendentes"
          value={resumo?.cotacoesPendentes ?? 0}
          color="#2e7d32"
          loading={isLoading}
        />
        <KpiCard
          icon={<Warning sx={{ fontSize: 24, color: '#c62828' }} />}
          label="Vencidas"
          value={resumo?.pedidosPendentes ?? 0}
          color="#c62828"
          loading={isLoading}
        />
      </Stack>

      <Typography sx={{ fontSize: 13, color: 'text.disabled', textAlign: 'center', mt: 4 }}>
        Use o menu lateral para acessar Requisicoes de Compras, Manutencao e Cotacoes
      </Typography>
    </Box>
  );
}
