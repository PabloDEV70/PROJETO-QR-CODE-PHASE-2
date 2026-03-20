import { Box, Typography, Stack, Divider, IconButton } from '@mui/material';
import { ArrowBack, DirectionsCarRounded, BuildRounded, EngineeringRounded, AccessTime } from '@mui/icons-material';
import { OsStatusBadge, TipoManutBadge, StatusGigBadge } from '@/components/os/os-badges';
import { useOsById } from '@/hooks/use-ordens-servico';
import { useChatColors } from './use-chat-colors';
import type { OsDetailServico } from '@/types/os-types';

interface OsChatDetailProps {
  nuos: number;
  onBack?: () => void;
}

function ServicoRow({ s, bg, text }: { s: OsDetailServico; bg: string; text: string }) {
  return (
    <Box sx={{ p: 1.5, bgcolor: bg, borderRadius: '10px', mb: 0.75 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: text, mb: 0.25 }}>
        {s.nomeProduto ?? `Produto #${s.CODPROD}`}
      </Typography>
      <Stack direction="row" spacing={1.5}>
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Qtd: {s.QTD ?? '-'}</Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
          R$ {s.VLRTOT?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) ?? '0'}
        </Typography>
        {s.TEMPO && <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{s.TEMPO}min</Typography>}
      </Stack>
    </Box>
  );
}

export function OsChatDetail({ nuos, onBack }: OsChatDetailProps) {
  const c = useChatColors();
  const { data: os, isLoading } = useOsById(nuos);

  if (isLoading || !os) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: c.textMuted }}>
        {isLoading ? 'Carregando...' : 'OS nao encontrada'}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ minHeight: 64, bgcolor: c.headerBg, px: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        {onBack && <IconButton onClick={onBack} size="small" sx={{ color: c.textSecondary }}><ArrowBack /></IconButton>}
        <DirectionsCarRounded sx={{ fontSize: 20, color: c.accent }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: c.textPrimary }}>
            #{os.NUOS} {os.veiculo.placa ?? 'Sem veiculo'} {os.veiculo.tag ? `(${os.veiculo.tag})` : ''}
          </Typography>
          <Typography sx={{ fontSize: 12, color: c.textSecondary }}>{os.veiculo.marca ?? '-'}</Typography>
        </Box>
        <OsStatusBadge status={os.STATUS} size="sm" />
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: c.convBg, p: 2 }}>
        <Box sx={{
          maxWidth: '90%', mx: 'auto', mb: 2,
          bgcolor: c.ticketBg, border: `1px solid ${c.ticketBorder}`,
          borderRadius: '12px', px: 2, py: 1.5,
        }}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
            <BuildRounded sx={{ fontSize: 16, color: c.accent }} />
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: c.textPrimary, flex: 1 }}>OS #{os.NUOS}</Typography>
            <OsStatusBadge status={os.STATUS} size="sm" />
          </Stack>

          <Stack spacing={0.5} sx={{ mb: 1 }}>
            <Stack direction="row" spacing={1}>
              <Typography sx={{ fontSize: 12, color: c.textMuted, width: 80 }}>Tipo</Typography>
              <TipoManutBadge tipo={os.MANUTENCAO} size="sm" />
            </Stack>
            <Stack direction="row" spacing={1}>
              <Typography sx={{ fontSize: 12, color: c.textMuted, width: 80 }}>Status GIG</Typography>
              <StatusGigBadge statusGig={os.AD_STATUSGIG} />
            </Stack>
          </Stack>

          <Divider sx={{ borderColor: c.listDivider, mb: 1 }} />

          <Stack direction="row" spacing={1.5} sx={{ mb: 1 }}>
            <Typography sx={{ fontSize: 12, color: c.textSecondary }}>KM: {os.KM?.toLocaleString() ?? '-'}</Typography>
            {os.HORIMETRO && <Typography sx={{ fontSize: 12, color: c.textSecondary }}>Horimetro: {os.HORIMETRO}</Typography>}
          </Stack>

          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ pt: 0.5, borderTop: `1px solid ${c.listDivider}` }}>
            {[{ l: 'Abertura', v: os.DTABERTURA }, { l: 'Inicio', v: os.DATAINI }, { l: 'Fim', v: os.DATAFIN }]
              .filter((d) => d.v)
              .map((d) => (
                <Box key={d.l} sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <AccessTime sx={{ fontSize: 11, color: c.textMuted }} />
                  <Typography sx={{ fontSize: 10, color: c.textMuted }}>{d.l}:</Typography>
                  <Typography sx={{ fontSize: 10, color: c.textSecondary }}>
                    {new Date(d.v!).toLocaleDateString('pt-BR')}
                  </Typography>
                </Box>
              ))}
          </Stack>

          <Box sx={{ mt: 1, pt: 0.5, borderTop: `1px solid ${c.listDivider}`, display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 11, color: c.textMuted }}>Custo Total</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: c.accent }}>
              R$ {os.custoTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) ?? '0,00'}
            </Typography>
          </Box>
        </Box>

        {os.servicos && os.servicos.length > 0 && (
          <Box sx={{ maxWidth: '90%', mx: 'auto' }}>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
              <EngineeringRounded sx={{ fontSize: 14, color: c.textMuted }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: c.textPrimary }}>Servicos ({os.servicos.length})</Typography>
            </Stack>
            {os.servicos.map((s: OsDetailServico) => (
              <ServicoRow key={`${s.NUOS}-${s.SEQUENCIA}`} s={s} bg={c.searchInputBg} text={c.textPrimary} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
