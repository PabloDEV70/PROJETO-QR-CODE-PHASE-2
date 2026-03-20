import { Box, ButtonBase, Typography } from '@mui/material';
import { DirectionsCar, Build, Edit as EditIcon, Assignment } from '@mui/icons-material';
import { getMotivoIcon } from '@/utils/motivo-icons';
import { getCategoryMeta } from '@/utils/wrench-time-categories';
import type { RdoDetalheItem } from '@/types/rdo-types';
import { hhmmToString, formatMinutos } from '@/utils/hora-utils';

interface AtividadeCardProps {
  item: RdoDetalheItem;
  onClick?: () => void;
}

function getDuracao(item: RdoDetalheItem): number {
  if (item.duracaoMinutos != null && item.duracaoMinutos > 0) return item.duracaoMinutos;
  if (item.HRINI == null || item.HRFIM == null) return 0;
  const ini = Math.floor(item.HRINI / 100) * 60 + (item.HRINI % 100);
  const fim = Math.floor(item.HRFIM / 100) * 60 + (item.HRFIM % 100);
  return fim > ini ? fim - ini : 0;
}

/** Parse OBS: "Servico: Nome #COD | user obs" → { servico, servicoCod, obs } */
function parseObs(obs: string | null): { servico: string | null; servicoCod: string | null; obs: string | null } {
  if (!obs) return { servico: null, servicoCod: null, obs: null };
  const parts = obs.split(' | ');
  let servico: string | null = null;
  let servicoCod: string | null = null;
  const rest: string[] = [];
  for (const p of parts) {
    if (p.startsWith('Servico: ')) {
      const raw = p.slice('Servico: '.length);
      const codMatch = raw.match(/#(\d+)$/);
      if (codMatch) {
        servicoCod = codMatch[1]!;
        servico = raw.slice(0, raw.lastIndexOf('#')).trim();
      } else {
        servico = raw;
      }
    } else {
      rest.push(p);
    }
  }
  return { servico, servicoCod, obs: rest.length > 0 ? rest.join(' | ') : null };
}

/** Resolve service info: prefer backend data, fallback to OBS parsing */
function resolveServico(item: RdoDetalheItem) {
  const parsed = parseObs(item.OBS);
  const nome = item.servicoNome ?? parsed.servico;
  const cod = item.servicoCodProd ?? (parsed.servicoCod ? Number(parsed.servicoCod) : null);
  const obs = item.servicoObs ?? null;
  const userObs = parsed.obs;
  return { nome, cod, obs, userObs };
}

const MONO = '"SF Mono", "Roboto Mono", "Fira Code", monospace';

export function AtividadeCard({ item, onClick }: AtividadeCardProps) {
  const duracao = getDuracao(item);
  const catMeta = getCategoryMeta(item.motivoCategoria ?? 'wrenchTime');
  const accent = catMeta.color;
  const Icon = getMotivoIcon(item.motivoSigla);
  const svc = resolveServico(item);
  const veiculo = [item.veiculoModelo, item.veiculoPlaca].filter(Boolean).join(' · ');

  const content = (
    <Box sx={{
      display: 'flex', alignItems: 'stretch',
      borderBottom: '1px solid', borderColor: 'divider',
      ...(onClick ? {
        cursor: 'pointer',
        transition: 'background-color 120ms',
        '&:hover': { bgcolor: 'action.hover' },
        '&:active': { bgcolor: 'action.selected' },
      } : {}),
    }}>
      {/* Left accent bar */}
      <Box sx={{
        width: 3.5, flexShrink: 0, bgcolor: accent,
        borderRadius: '2px 0 0 2px',
      }} />

      {/* Content */}
      <Box sx={{ flex: 1, py: 1, px: 1.25, minWidth: 0 }}>
        {/* Row 1: sigla badge + description + duration */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{
            width: 24, height: 24, borderRadius: 1, flexShrink: 0,
            bgcolor: accent, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon sx={{ fontSize: 14 }} />
          </Box>
          <Typography sx={{
            fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700,
            color: accent, letterSpacing: '0.03em', flexShrink: 0,
          }}>
            {item.motivoSigla ?? '-'}
          </Typography>
          <Typography noWrap sx={{
            fontSize: '0.82rem', color: 'text.primary', fontWeight: 600,
            flex: 1, minWidth: 0, lineHeight: 1.3,
          }}>
            {item.motivoDescricao ?? ''}
          </Typography>
          <Typography sx={{
            fontFamily: MONO, fontSize: '0.82rem', fontWeight: 700,
            color: accent, flexShrink: 0, fontVariantNumeric: 'tabular-nums',
          }}>
            {duracao > 0 ? formatMinutos(duracao) : '—'}
          </Typography>
          {onClick && (
            <EditIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0, ml: 0.25 }} />
          )}
        </Box>

        {/* Row 2: time range */}
        <Typography sx={{
          fontFamily: MONO, fontSize: '0.72rem', fontWeight: 500,
          color: 'text.secondary', mt: 0.3, ml: 3.75,
          fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em',
        }}>
          {item.hriniFormatada ?? hhmmToString(item.HRINI)}
          {' — '}
          {item.hrfimFormatada ?? hhmmToString(item.HRFIM)}
        </Typography>

        {/* Row 3: OS + vehicle */}
        {(item.NUOS || veiculo) && (
          <Box sx={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5,
            mt: 0.5, ml: 3.75,
          }}>
            {item.NUOS && (
              <Typography sx={{
                fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700,
                color: '#3B82F6', lineHeight: 1,
              }}>
                OS {item.NUOS}
              </Typography>
            )}
            {veiculo && (
              <>
                {item.NUOS && (
                  <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', lineHeight: 1 }}>·</Typography>
                )}
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                  <DirectionsCar sx={{ fontSize: 12, color: 'text.disabled' }} />
                  <Typography sx={{
                    fontSize: '0.68rem', fontWeight: 500, color: 'text.secondary', lineHeight: 1,
                  }}>
                    {veiculo}
                  </Typography>
                </Box>
              </>
            )}
            {item.osQtdServicos != null && item.osQtdServicos > 1 && (
              <Typography sx={{
                fontSize: '0.6rem', fontWeight: 600, color: 'text.disabled', lineHeight: 1,
              }}>
                {item.osQtdServicos} servicos
              </Typography>
            )}
          </Box>
        )}

        {/* Row 4: Service — dedicated row with code + name */}
        {svc.nome && (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.4,
            mt: 0.4, ml: 3.75, minWidth: 0,
          }}>
            <Build sx={{ fontSize: 12, color: '#8B5CF6', flexShrink: 0 }} />
            {svc.cod != null && (
              <Typography sx={{
                fontSize: '0.68rem', fontWeight: 800, color: '#7C3AED',
                fontFamily: MONO, lineHeight: 1, flexShrink: 0,
              }}>
                #{svc.cod}
              </Typography>
            )}
            <Typography sx={{
              fontSize: '0.7rem', fontWeight: 600, color: '#7C3AED',
              lineHeight: 1.3, minWidth: 0,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {svc.nome}
            </Typography>
          </Box>
        )}

        {/* Row 5: service observation from TCFSERVOS */}
        {svc.obs && (
          <Typography sx={{
            fontSize: '0.68rem', color: '#7C3AED', fontWeight: 500,
            fontStyle: 'italic', mt: 0.25, ml: 3.75, opacity: 0.8,
            lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {svc.obs}
          </Typography>
        )}

        {/* Row 6: user obs */}
        {svc.userObs && (
          <Typography sx={{
            fontSize: '0.68rem', color: 'text.disabled', fontWeight: 400,
            fontStyle: 'italic', mt: 0.25, ml: 3.75,
            lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {svc.userObs}
          </Typography>
        )}

        {/* Row 7: Apontamento de origem (AD_APONTSOL) */}
        {item.apontamentoDesc && (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.4,
            mt: 0.4, ml: 3.75, minWidth: 0,
          }}>
            <Assignment sx={{ fontSize: 12, color: '#059669', flexShrink: 0 }} />
            {item.apontamentoCodProd != null && (
              <Typography sx={{
                fontSize: '0.68rem', fontWeight: 800, color: '#047857',
                fontFamily: MONO, lineHeight: 1, flexShrink: 0,
              }}>
                #{item.apontamentoCodProd}
              </Typography>
            )}
            <Typography sx={{
              fontSize: '0.7rem', fontWeight: 600, color: '#059669',
              lineHeight: 1.3, minWidth: 0,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {item.apontamentoDesc}
            </Typography>
            {item.apontamentoHr != null && (
              <Typography sx={{
                fontSize: '0.65rem', fontWeight: 500, color: '#10B981',
                fontFamily: MONO, ml: 0.5,
              }}>
                {String(Math.floor(item.apontamentoHr / 100)).padStart(2, '0')}:{String(item.apontamentoHr % 100).padStart(2, '0')}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );

  if (onClick) {
    return (
      <ButtonBase onClick={onClick} sx={{ width: '100%', textAlign: 'left', display: 'block' }}>
        {content}
      </ButtonBase>
    );
  }

  return content;
}
