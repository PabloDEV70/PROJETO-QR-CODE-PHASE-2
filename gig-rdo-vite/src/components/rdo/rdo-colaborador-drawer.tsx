import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer, Box, Typography, Stack, IconButton, Button,
  Skeleton, Divider, useTheme,
} from '@mui/material';
import { Close, OpenInNew } from '@mui/icons-material';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { useRdoResumo } from '@/hooks/use-rdo';
import { useRdoMotivos, useRdoTimeline } from '@/hooks/use-rdo-analytics';
import { computeProductivityFromMotivos } from '@/utils/motivo-productivity';
import { KpiRow, MotivosBars, SparklineSection } from './rdo-colaborador-drawer-parts';

interface Props {
  codparc: number | null;
  open: boolean;
  onClose: () => void;
  filterParams: Record<string, string | number>;
  nome?: string;
  cargo?: string;
  departamento?: string;
}

export function RdoColaboradorDrawer({
  codparc, open, onClose, filterParams, nome, cargo, departamento,
}: Props) {
  const navigate = useNavigate();
  const theme = useTheme();

  const params = useMemo(() => {
    if (!codparc) return {};
    return { ...filterParams, codparc: String(codparc) };
  }, [filterParams, codparc]);

  const motivos = useRdoMotivos(params);
  const resumo = useRdoResumo(params);
  const timeline = useRdoTimeline(params);

  const motivoGroups = useMemo(() => {
    const list = motivos.data?.data;
    if (!list?.length) return [];
    return list
      .map((m) => ({
        sigla: m.sigla, descricao: m.descricao, cod: m.rdomotivocod,
        count: m.totalItens, totalMin: Math.round(Number(m.totalHoras) * 60),
        category: m.wtCategoria ?? 'externos',
        produtivo: m.produtivo === 'S',
        rdosComMotivo: Number(m.rdosComMotivo) || 0,
      }))
      .sort((a, b) => b.totalMin - a.totalMin);
  }, [motivos.data?.data]);

  const productivity = useMemo(() => {
    const list = motivos.data?.data;
    if (!motivoGroups.length || !list?.length) return null;
    const apiMap = new Map(list.map((m) => [m.rdomotivocod, m]));
    return computeProductivityFromMotivos(motivoGroups, apiMap, motivoGroups);
  }, [motivoGroups, motivos.data?.data]);

  const sparkData = useMemo(() => {
    if (!timeline.data?.length) return [];
    return timeline.data.map((p) => ({
      dt: p.DTREF, h: Math.max(0, Number(p.totalHoras)),
    }));
  }, [timeline.data]);

  if (!codparc) return null;
  const isLoading = motivos.isLoading || resumo.isLoading;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: 400, p: 0 } }}>
      <Box sx={{
        p: 2, bgcolor: 'primary.main', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 1.5,
      }}>
        <FuncionarioAvatar codparc={codparc} nome={nome} size="large"
          sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {nome || `Colaborador ${codparc}`}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            {[cargo, departamento].filter(Boolean).join(' | ') || '-'}
          </Typography>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: '#fff' }} size="small">
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
        <Button
          fullWidth variant="outlined" size="small"
          startIcon={<OpenInNew sx={{ fontSize: 16 }} />}
          onClick={() => { onClose(); navigate(`/manutencao/rdo?codparc=${codparc}`); }}
          sx={{ mb: 2, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
        >
          Ver timeline completa
        </Button>

        {isLoading ? <Skeleton variant="rounded" height={80} /> : (
          <Stack spacing={1} sx={{ mb: 2 }}>
            <KpiRow label="Horas Produtivas"
              value={productivity ? `${(productivity.totalProdMin / 60).toFixed(1)}h` : '-'} />
            <KpiRow label="Produtividade"
              value={productivity ? `${productivity.produtividadePercent}%` : '-'} />
            <KpiRow label="Total RDOs"
              value={resumo.data?.totalRdos?.toLocaleString('pt-BR') ?? '-'} />
            <KpiRow label="Dias com Dados"
              value={resumo.data?.diasComDados?.toString() ?? '-'} />
          </Stack>
        )}

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Motivos do Periodo
        </Typography>
        <MotivosBars
          groups={motivoGroups}
          isLoading={motivos.isLoading}
          hoverColor={theme.palette.action.hover}
        />

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Evolucao (horas/dia)
        </Typography>
        <SparklineSection data={sparkData} isLoading={timeline.isLoading} />
      </Box>
    </Drawer>
  );
}
