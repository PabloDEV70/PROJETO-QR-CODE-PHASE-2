import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { usePatrimonioBemLocalizacao } from '@/hooks/use-patrimonio-bem-detalhe';

interface PatrimonioLocalizacaoTabProps {
  codbem: string;
}

const fmtDate = (v: string | null) => {
  if (!v) return '-';
  try {
    return new Date(v).toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
};

export function PatrimonioLocalizacaoTab({ codbem }: PatrimonioLocalizacaoTabProps) {
  const { data: items, isLoading } = usePatrimonioBemLocalizacao(codbem);

  if (isLoading) {
    return (
      <Stack spacing={1}>
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} variant="rounded" height={60} />
        ))}
      </Stack>
    );
  }

  if (!items?.length) {
    return <Alert severity="info">Sem historico de localizacao</Alert>;
  }

  const current = items[0]!;

  return (
    <Stack spacing={2}>
      {/* Localizacao atual */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Localizacao Atual
            </Typography>
            <Chip label="Atual" size="small" color="primary" />
          </Box>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Empresa</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {current.empresa}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Departamento</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {current.departamento}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Data Entrada</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {fmtDate(current.dtEntrada)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Historico */}
      {items.length > 1 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Historico ({items.length - 1})
          </Typography>
          <Stack spacing={1}>
            {items.slice(1).map((loc, idx) => (
              <Card key={`${loc.dtEntrada}-${idx}`} variant="outlined">
                <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Emp {loc.empresa} | Dept {loc.departamento}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Entrada: {fmtDate(loc.dtEntrada)}
                    </Typography>
                    {loc.nunota && (
                      <Typography variant="caption" color="text.secondary">
                        NF #{loc.nunota}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
}
