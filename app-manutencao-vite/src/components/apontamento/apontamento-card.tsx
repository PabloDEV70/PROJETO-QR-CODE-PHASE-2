import { Box, Chip, Tooltip, Typography, alpha } from '@mui/material';
import { Build } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { PlacaBadge } from '@/components/shared/placa-badge';
import {
  STATUS_OS_LABELS, STATUS_OS_COLORS, TIPO_SERVICO_MAP,
  type StatusOS, type ApontamentoListItem,
} from '@/types/apontamento-types';

const TIPO_KEYS: (keyof ApontamentoListItem)[] = ['BORRCHARIA', 'ELETRICA', 'FUNILARIA', 'MECANICA', 'CALDEIRARIA'];

function fmtDateTime(val: string | null): string {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  const date = d.toLocaleDateString('pt-BR');
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return time === '00:00' ? date : `${date} ${time}`;
}

// Status → color for bg tint
const STATUS_COLOR: Record<string, string> = {
  MA: '#e65100', AV: '#01579b', AI: '#b71c1c', AN: '#f57f17',
  SI: '#c62828', SN: '#546e7a',
};

interface ApontamentoCardProps {
  item: ApontamentoListItem;
  selected: boolean;
  onClick: () => void;
}

export function ApontamentoCard({ item, selected, onClick }: ApontamentoCardProps) {
  const status = item.STATUSOS as StatusOS | null;
  const tipos = TIPO_KEYS
    .filter((k) => item[k] && item[k] !== 'N')
    .map((k) => {
      const info = TIPO_SERVICO_MAP[k];
      const opt = info?.options.find((o) => o.value === (item[k] as string));
      return opt?.label ?? info?.label ?? k;
    });

  const statusColor = status ? STATUS_COLOR[status] ?? '#78909c' : '#90a4ae';

  return (
    <Box
      onClick={onClick}
      sx={(theme) => ({
        mx: 0.75, my: 0.5,
        cursor: 'pointer',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: selected ? 'success.main' : alpha(statusColor, 0.4),
        bgcolor: selected
          ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)
          : alpha(statusColor, theme.palette.mode === 'dark' ? 0.18 : 0.14),
        boxShadow: selected
          ? `0 0 0 2px ${alpha(theme.palette.success.main, 0.3)}`
          : `0 1px 4px ${alpha(statusColor, 0.15)}`,
        transition: 'all 0.12s ease',
        '&:hover': {
          bgcolor: selected ? undefined : alpha(statusColor, theme.palette.mode === 'dark' ? 0.25 : 0.2),
          boxShadow: `0 3px 12px ${alpha(statusColor, 0.25)}`,
        },
        p: 1.25,
      })}
    >
      {/* ── Row 1: Codigo + Status + Datetime ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'text.disabled', fontFamily: 'monospace' }}>
          #{item.CODIGO}
        </Typography>
        {status && (
          <Tooltip title={`Status: ${STATUS_OS_LABELS[status]}`}>
            <Chip
              label={STATUS_OS_LABELS[status] ?? status}
              size="small"
              color={STATUS_OS_COLORS[status] ?? 'default'}
              sx={{ fontSize: 10, height: 20, fontWeight: 700 }}
            />
          </Tooltip>
        )}
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
          {fmtDateTime(item.DTINCLUSAO)}
        </Typography>
      </Box>

      {/* ── Row 2: Avatar + Placa + Vehicle info ── */}
      <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
        <Tooltip title={item.NOMEUSU ?? 'Sem usuario'} placement="right">
          <Box sx={{ flexShrink: 0 }}>
            <FuncionarioAvatar
              codparc={item.CODPARCUSU}
              nome={item.NOMEUSU ?? undefined}
              size="medium"
              sx={{ width: 44, height: 44, fontSize: 17 }}
            />
          </Box>
        </Tooltip>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Placa Mercosul */}
          <Box sx={{ mb: 0.5 }}>
            <PlacaBadge placa={item.PLACA} tag={item.TAG} size="sm" />
          </Box>

          {/* Marca/Modelo */}
          {item.MARCAMODELO && (
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary', lineHeight: 1.2 }} noWrap>
              {item.MARCAMODELO}
            </Typography>
          )}

          {/* Tipo equipamento */}
          {item.TIPOEQPTO && (
            <Typography sx={{ fontSize: 10.5, color: 'text.secondary', lineHeight: 1.2 }} noWrap>
              {item.TIPOEQPTO}
            </Typography>
          )}

          {/* Usuario */}
          <Typography sx={{ fontSize: 10.5, color: 'text.disabled', lineHeight: 1.3, mt: 0.15 }} noWrap>
            {item.NOMEUSU ?? '-'}
          </Typography>
        </Box>
      </Box>

      {/* ── Row 3: Metadata chips ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
        {/* KM */}
        {item.KM != null && (
          <Tooltip title={`Quilometragem: ${item.KM.toLocaleString('pt-BR')}`}>
            <Typography sx={{ fontSize: 10, color: 'text.disabled', fontFamily: 'monospace' }}>
              {item.KM.toLocaleString('pt-BR')} km
            </Typography>
          </Tooltip>
        )}

        {/* Horimetro */}
        {item.HORIMETRO != null && (
          <Tooltip title={`Horimetro: ${item.HORIMETRO.toLocaleString('pt-BR')}`}>
            <Typography sx={{ fontSize: 10, color: 'text.disabled', fontFamily: 'monospace' }}>
              {item.HORIMETRO.toLocaleString('pt-BR')} hr
            </Typography>
          </Tooltip>
        )}

        {/* Servicos */}
        {item.totalServicos > 0 && (
          <Tooltip title={`${item.totalServicos} servico(s) cadastrado(s)`}>
            <Chip
              icon={<Build sx={{ fontSize: '11px !important' }} />}
              label={item.totalServicos}
              size="small" variant="outlined"
              sx={{ fontSize: 10, height: 20, fontWeight: 700 }}
            />
          </Tooltip>
        )}

        {/* OS */}
        {item.NUOS && (
          <Tooltip title={`Ordem de Servico #${item.NUOS}`}>
            <Chip
              label={`OS #${item.NUOS}`}
              size="small" color="info" variant="outlined"
              sx={{ fontSize: 10, height: 20, fontWeight: 600 }}
            />
          </Tooltip>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Tipos */}
        {tipos.map((t) => (
          <Chip
            key={t} label={t} size="small" color="success" variant="outlined"
            sx={{ fontSize: 9, height: 18, fontWeight: 600 }}
          />
        ))}
      </Box>
    </Box>
  );
}
