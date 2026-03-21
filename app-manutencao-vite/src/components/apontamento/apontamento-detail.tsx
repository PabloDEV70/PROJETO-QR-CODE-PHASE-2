import { useCallback } from 'react';
import {
  Box, Typography, Chip, IconButton, Tooltip, Divider,
} from '@mui/material';
import {
  Edit, Delete, CheckCircle, HourglassEmpty,
} from '@mui/icons-material';
import { PlacaBadge } from '@/components/shared/placa-badge';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { ServicoDataGrid } from './servico-data-grid';
import { useApontamentoServicos } from '@/hooks/use-apontamentos';
import {
  STATUS_OS_LABELS, STATUS_OS_COLORS, TIPO_SERVICO_MAP,
  type StatusOS, type ApontamentoListItem, type ServicoApontamento,
} from '@/types/apontamento-types';

function fmtDateTime(val: string | null): string {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  const date = d.toLocaleDateString('pt-BR');
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return time === '00:00' ? date : `${date} ${time}`;
}

const TIPO_KEYS: (keyof ApontamentoListItem)[] = ['BORRCHARIA', 'ELETRICA', 'FUNILARIA', 'MECANICA', 'CALDEIRARIA'];

/** Label:Value pair for the header grid */
function LV({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <Box>
      <Box component="span" sx={{ display: 'block', fontSize: 9, fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1, mb: 0.3 }}>
        {label}
      </Box>
      <Box sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', lineHeight: 1.2, fontFamily: mono ? 'monospace' : undefined }}>
        {value || '-'}
      </Box>
    </Box>
  );
}

interface ApontamentoDetailProps {
  item: ApontamentoListItem;
  onEditMestre: () => void;
  onDeleteMestre: () => void;
  onAddServico: () => void;
  onEditServico: (s: ServicoApontamento) => void;
  onDeleteServico: (s: ServicoApontamento) => void;
  /** Override the grid area with custom content (e.g. servico form) */
  contentOverride?: React.ReactNode;
}

export function ApontamentoDetail({
  item, onEditMestre, onDeleteMestre,
  onAddServico, onEditServico, onDeleteServico,
  contentOverride,
}: ApontamentoDetailProps) {
  const { data: servicos, isLoading: loadingServicos, refetch: refetchServicos } = useApontamentoServicos(item.CODIGO);
  const status = item.STATUSOS as StatusOS | null;

  const tiposAtivos = TIPO_KEYS
    .filter((k) => item[k] && item[k] !== 'N')
    .map((k) => {
      const val = item[k] as string;
      const info = TIPO_SERVICO_MAP[k];
      const opt = info?.options.find((o) => o.value === val);
      return opt?.label ?? info?.label ?? k;
    });

  const handleRefresh = useCallback(() => { refetchServicos(); }, [refetchServicos]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* ══════ HEADER ══════ */}
      <Box sx={{
        flexShrink: 0,
        borderBottom: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
      }}>
        {/* Left: Placa grande */}
        <Box sx={{
          p: 1.5, display: 'flex', alignItems: 'center',
          borderRight: '1px solid', borderColor: 'divider',
          bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
        }}>
          <PlacaBadge placa={item.PLACA} marcaModelo={item.MARCAMODELO} tag={item.TAG} size="md" />
        </Box>

        {/* Right: Info grid */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Top row: Codigo + Status + Actions */}
          <Box sx={{
            px: 1.5, py: 0.5,
            display: 'flex', alignItems: 'center', gap: 1,
            borderBottom: '1px solid', borderColor: 'divider',
            bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
          }}>
            <Typography sx={{ fontSize: 11, fontWeight: 800, fontFamily: 'monospace', color: 'text.secondary' }}>
              #{item.CODIGO}
            </Typography>
            <Divider orientation="vertical" flexItem />
            {status && (
              <Chip label={STATUS_OS_LABELS[status] ?? status} size="small" color={STATUS_OS_COLORS[status] ?? 'default'}
                sx={{ fontSize: 10, height: 20, fontWeight: 700 }} />
            )}
            {item.STATUSGERAL && (
              <Chip
                icon={item.STATUSGERAL === 'Concluido'
                  ? <CheckCircle sx={{ fontSize: '12px !important' }} />
                  : <HourglassEmpty sx={{ fontSize: '12px !important' }} />}
                label={item.STATUSGERAL} size="small"
                color={item.STATUSGERAL === 'Concluido' ? 'success' : 'warning'}
                variant="outlined" sx={{ fontSize: 10, height: 20, fontWeight: 700 }} />
            )}
            {item.NUOS && <Chip label={`OS #${item.NUOS}`} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />}
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Editar"><IconButton size="small" onClick={onEditMestre}><Edit sx={{ fontSize: 16 }} /></IconButton></Tooltip>
            <Tooltip title="Excluir"><IconButton size="small" color="error" onClick={onDeleteMestre}><Delete sx={{ fontSize: 16 }} /></IconButton></Tooltip>
          </Box>

          {/* Bottom row: Fields */}
          <Box sx={{
            px: 1.5, py: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
            gap: 1.5,
          }}>
            <Box>
              <Box component="span" sx={{ display: 'block', fontSize: 9, fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1, mb: 0.3 }}>
                Usuario
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <FuncionarioAvatar codparc={item.CODPARCUSU} nome={item.NOMEUSU ?? undefined} size="small" sx={{ width: 32, height: 32, fontSize: 13 }} />
                <Box component="span" sx={{ fontSize: 13, fontWeight: 600 }}>{item.NOMEUSU ?? '-'}</Box>
              </Box>
            </Box>
            <LV label="Inclusao" value={fmtDateTime(item.DTINCLUSAO)} />
            <LV label="KM" value={item.KM?.toLocaleString('pt-BR')} mono />
            <LV label="Horimetro" value={item.HORIMETRO?.toLocaleString('pt-BR')} mono />
            <LV label="Programacao" value={fmtDateTime(item.DTPROGRAMACAO)} />
            <LV label="Tipos" value={
              tiposAtivos.length > 0
                ? <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {tiposAtivos.map((t) => (
                      <Chip key={t} label={t} size="small" color="success" variant="outlined" sx={{ fontSize: 9, height: 18, fontWeight: 600 }} />
                    ))}
                  </Box>
                : '-'
            } />
            {item.OSEXTERNA === 'S' && (
              <LV label="OS Externa" value={item.OPEXTERNO || 'Sim'} />
            )}
            {item.OBS && (
              <Box sx={{ gridColumn: 'span 2' }}>
                <LV label="Obs" value={
                  <Tooltip title={item.OBS} placement="bottom-start">
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', cursor: 'help' }} noWrap>{item.OBS}</Typography>
                  </Tooltip>
                } />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* ══════ GRID or OVERRIDE ══════ */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', p: contentOverride ? 0 : 1 }}>
        {contentOverride ?? (
          <ServicoDataGrid
            servicos={servicos ?? []}
            isLoading={loadingServicos}
            onAdd={onAddServico}
            onEdit={onEditServico}
            onDelete={onDeleteServico}
            onRefresh={handleRefresh}
          />
        )}
      </Box>
    </Box>
  );
}
