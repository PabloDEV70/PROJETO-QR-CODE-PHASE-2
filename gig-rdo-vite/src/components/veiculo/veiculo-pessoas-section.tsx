import { useMemo } from 'react';
import { Avatar, Box, Card, CardContent, Chip, Tooltip, Typography } from '@mui/material';
import type { UtilizacaoPessoa } from '@/types/veiculo-tabs-types';

const API_URL = import.meta.env.VITE_API_URL || '';

const PAPEL_LABELS: Record<string, string> = {
  EXECUTOR_MANUTENCAO: 'Executor Manutencao',
  FINALIZADOR_MANUTENCAO: 'Finalizador Manutencao',
  OPERADOR_VEICULO: 'Operador do Veiculo',
  VENDEDOR_COMERCIAL: 'Vendedor/Atendente Comercial',
  FECHAMENTO_COMERCIAL: 'Fechamento Comercial',
};

const PAPEL_COLORS: Record<string, 'warning' | 'success' | 'info'> = {
  EXECUTOR_MANUTENCAO: 'warning',
  FINALIZADOR_MANUTENCAO: 'warning',
  OPERADOR_VEICULO: 'info',
  VENDEDOR_COMERCIAL: 'success',
  FECHAMENTO_COMERCIAL: 'info',
};

export function VeiculoPessoasSection({ pessoas }: { pessoas: UtilizacaoPessoa[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, UtilizacaoPessoa[]>();
    for (const p of pessoas) {
      if (!map.has(p.papel)) map.set(p.papel, []);
      map.get(p.papel)!.push(p);
    }
    return map;
  }, [pessoas]);

  if (pessoas.length === 0) return null;

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Pessoas envolvidas
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {Array.from(grouped.entries()).map(([papel, list]) => (
            <Box key={papel}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {PAPEL_LABELS[papel] || papel}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                {list.map((p) => (
                  <Tooltip
                    key={`${papel}-${p.codUsuario}`}
                    title={`${p.primeiroEnvolvimento ?? ''} — ${p.ultimoEnvolvimento ?? ''}`}
                  >
                    <Chip
                      avatar={
                        p.codparc && p.codparc > 0 ? (
                          <Avatar
                            src={`${API_URL}/funcionarios/${p.codparc}/foto`}
                            alt={p.nome}
                          >
                            {p.nome.charAt(0)}
                          </Avatar>
                        ) : undefined
                      }
                      label={`${p.nome} (${p.qtd})`}
                      size="small"
                      color={PAPEL_COLORS[papel] || 'default'}
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
