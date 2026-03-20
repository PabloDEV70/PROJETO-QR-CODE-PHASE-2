import { Paper, Box, Typography, Chip, Divider, alpha, useTheme } from '@mui/material';
import { DirectionsCar, Schedule, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getPrioridadeInfo } from '@/utils/prioridade-constants';
import { calcPrevisaoCountdown } from '@/utils/previsao-utils';
import { DepartamentoChip } from '@/components/shared/departamento-chip';
import { PessoaAvatarGroup } from '@/components/shared/pessoa-avatar-group';
import type { PainelVeiculo, PainelPessoa } from '@/types/hstvei-types';

interface VeiculoListItemProps {
  veiculo: PainelVeiculo;
}

export function VeiculoListItem({ veiculo }: VeiculoListItemProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const prio = getPrioridadeInfo(veiculo.prioridadeMaxima);
  const previsao = calcPrevisaoCountdown(veiculo.previsaoMaisProxima);

  const departments = [...new Set(
    veiculo.situacoesAtivas.map((s) => s.departamento).filter(Boolean),
  )] as string[];

  const allPessoas: PainelPessoa[] = [];
  const seenIds = new Set<number>();
  for (const sit of veiculo.situacoesAtivas) {
    for (const p of [...sit.operadores, ...sit.mecanicos]) {
      if (!seenIds.has(p.codusu)) {
        seenIds.add(p.codusu);
        allPessoas.push(p);
      }
    }
  }

  const urgentes = veiculo.situacoesAtivas.filter((s) => s.idpri === 0).length;

  // Build info pairs: label → value (only if value exists)
  const infoPairs: { label: string; value: string }[] = [];
  if (veiculo.marcaModelo) infoPairs.push({ label: 'Modelo', value: veiculo.marcaModelo });
  if (veiculo.tipo) infoPairs.push({ label: 'Tipo', value: veiculo.tipo });
  if (veiculo.fabricante) infoPairs.push({ label: 'Fabricante', value: veiculo.fabricante });
  if (veiculo.capacidade) infoPairs.push({ label: 'Capacidade', value: veiculo.capacidade });

  return (
    <Paper
      onClick={() => navigate(`/veiculo/${veiculo.codveiculo}`)}
      sx={{
        mb: 1.5,
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'border-color 0.15s ease',
        '&:active': { transform: 'scale(0.985)' },
        '&:hover': { borderColor: alpha(prio.color, 0.35) },
      }}
    >
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.75, pt: 1.5, pb: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            flexShrink: 0,
          }}
        >
          <DirectionsCar sx={{ fontSize: 22, color: 'primary.main' }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                fontSize: '0.95rem',
                letterSpacing: '0.03em',
                lineHeight: 1.2,
              }}
            >
              {veiculo.placa}
            </Typography>
            {veiculo.tag && (
              <Typography sx={{ fontSize: '0.73rem', fontWeight: 500, color: 'primary.main' }}>
                {veiculo.tag}
              </Typography>
            )}
          </Box>
        </Box>

        <Chip
          label={`${veiculo.totalSituacoes} sit.`}
          size="small"
          sx={{
            height: 26,
            fontWeight: 600,
            fontSize: '0.72rem',
            bgcolor: alpha(prio.color, 0.1),
            color: prio.color,
            flexShrink: 0,
          }}
        />
      </Box>

      {/* ── Info rows: each on its own line, label inline ── */}
      {infoPairs.length > 0 && (
        <Box sx={{ px: 1.75, pb: 1 }}>
          {infoPairs.map(({ label, value }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mb: 0.3 }}>
              <Typography
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: 'text.disabled',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  lineHeight: 1.4,
                  flexShrink: 0,
                  minWidth: 72,
                }}
              >
                {label}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 450,
                  color: 'text.primary',
                  lineHeight: 1.4,
                }}
              >
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* ── Alerts ── */}
      {(urgentes > 0 || previsao) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.75, pb: 1 }}>
          {urgentes > 0 && (
            <Chip
              icon={<Warning sx={{ fontSize: 14 }} />}
              label={`${urgentes} urgente${urgentes > 1 ? 's' : ''}`}
              size="small"
              sx={{
                height: 24,
                fontSize: '0.7rem',
                fontWeight: 600,
                bgcolor: alpha('#f44336', 0.08),
                color: '#e53935',
                '& .MuiChip-icon': { color: '#e53935' },
              }}
            />
          )}
          {previsao && (
            <Chip
              icon={<Schedule sx={{ fontSize: 14 }} />}
              label={previsao.isOverdue ? previsao.text : `Prazo ${previsao.text}`}
              size="small"
              sx={{
                height: 24,
                fontSize: '0.7rem',
                fontWeight: 600,
                bgcolor: alpha(previsao.isOverdue ? '#f44336' : '#43a047', 0.08),
                color: previsao.isOverdue ? '#e53935' : '#2e7d32',
                '& .MuiChip-icon': { color: previsao.isOverdue ? '#e53935' : '#2e7d32' },
              }}
            />
          )}
        </Box>
      )}

      {/* ── Footer: departments + equipe ── */}
      {(departments.length > 0 || allPessoas.length > 0) && (
        <>
          <Divider sx={{ mx: 1.75, borderColor: alpha(theme.palette.divider, 0.5) }} />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              px: 1.75,
              py: 1.25,
            }}
          >
            {departments.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                {departments.slice(0, 3).map((dep) => (
                  <DepartamentoChip key={dep} departamento={dep} size="small" />
                ))}
                {departments.length > 3 && (
                  <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', fontWeight: 500 }}>
                    +{departments.length - 3}
                  </Typography>
                )}
              </Box>
            )}
            {allPessoas.length > 0 && (
              <Box sx={{ flexShrink: 0 }}>
                <PessoaAvatarGroup pessoas={allPessoas} max={4} size={24} />
              </Box>
            )}
          </Box>
        </>
      )}
    </Paper>
  );
}
