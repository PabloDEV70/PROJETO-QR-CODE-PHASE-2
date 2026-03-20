import { memo } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { getVeiculoStatusInfo } from '@/utils/status-utils';
import { PessoaAvatarGroup } from '@/components/painel/pessoa-avatar-group';
import { PessoaAvatar } from '@/components/shared/pessoa-avatar';
import type { PainelVeiculo } from '@/types/hstvei-types';

interface QuadroRowProps {
  veiculo: PainelVeiculo;
  isEven: boolean;
}

function fmtDt(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatData(v: PainelVeiculo): string {
  const sit = v.situacoesAtivas[0];
  if (!sit) return '--';
  const cat = (sit.categoria ?? sit.departamento ?? '').toLowerCase();
  const inicio = fmtDt(sit.dtinicio);
  const previsao = fmtDt(sit.dtprevisao);

  // Comercial sem previsao = contrato fixo
  if (cat.includes('comercial') && !previsao) return 'FIXO';
  // Tem inicio e previsao = range
  if (inicio && previsao) return `${inicio} a ${previsao}`;
  // Só previsao
  if (previsao) return `ate ${previsao}`;
  // Só inicio (sem previsao)
  if (inicio) return `Desde ${inicio}`;
  return '--';
}

function formatSaida(v: PainelVeiculo): string {
  const sit = v.situacoesAtivas[0];
  if (!sit?.dtinicio) return '--';
  const d = new Date(sit.dtinicio);
  if (isNaN(d.getTime())) return '--';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function extractLocal(v: PainelVeiculo): string {
  const sit = v.situacoesAtivas[0];
  if (!sit) return '--';
  const obs = sit.obs ?? '';
  if (obs) {
    const parts = obs.split(' - ');
    if (parts.length > 1) return parts[parts.length - 1].trim();
    if (obs.length < 30) return obs;
  }
  return sit.descricao?.split(' - ').pop()?.trim() ?? '--';
}

function extractCliente(v: PainelVeiculo): string {
  const sit = v.situacoesAtivas[0];
  if (!sit) return '--';
  if (sit.nomeParc) return sit.nomeParc;
  if (sit.mosCliente) return sit.mosCliente;
  const desc = sit.descricao?.toLowerCase() ?? '';
  if (desc.includes('locada')) {
    const parts = sit.descricao?.split(' - ');
    if (parts && parts.length > 1) return parts[parts.length - 1].trim();
  }
  return '--';
}

export const QuadroRow = memo(function QuadroRow({ veiculo, isEven }: QuadroRowProps) {
  const statusInfo = getVeiculoStatusInfo(veiculo);
  const sit = veiculo.situacoesAtivas[0];
  const data = formatData(veiculo);
  const isFixo = data === 'FIXO';
  const allPessoas = sit ? [...sit.operadores, ...sit.mecanicos] : [];

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: '100px 120px 180px 140px 100px 130px 160px 1fr',
      alignItems: 'center',
      minHeight: 34,
      bgcolor: isEven ? 'transparent' : 'action.hover',
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:hover': { bgcolor: 'action.selected' },
    }}>
      {/* PLACA */}
      <Box sx={{ px: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography sx={{
          fontWeight: 800, fontSize: '0.8rem',
          fontFamily: '"JetBrains Mono", monospace',
          color: statusInfo.color,
        }}>
          {veiculo.placa}
        </Typography>
      </Box>

      {/* EQUIPE (avatars with photos) */}
      <Box sx={{ px: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {sit?.criadoPor && (
          <Tooltip title={`Criado: ${sit.criadoPor.nome}`}>
            <span>
              <PessoaAvatar codparc={sit.criadoPor.codparc} nome={sit.criadoPor.nome} size={20}
                sx={{ border: '2px solid', borderColor: 'success.main' }} />
            </span>
          </Tooltip>
        )}
        <PessoaAvatarGroup pessoas={allPessoas} max={2} size={20} />
      </Box>

      {/* CLIENTE */}
      <Box sx={{ px: 1 }}>
        <Typography sx={{ fontSize: '0.75rem' }} noWrap>
          {extractCliente(veiculo)}
        </Typography>
      </Box>

      {/* LOCAL */}
      <Box sx={{ px: 1 }}>
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }} noWrap>
          {extractLocal(veiculo)}
        </Typography>
      </Box>

      {/* SAIDA */}
      <Box sx={{ px: 1 }}>
        <Typography sx={{ fontSize: '0.75rem', fontFamily: '"JetBrains Mono", monospace' }}>
          {formatSaida(veiculo)}
        </Typography>
      </Box>

      {/* DATA */}
      <Box sx={{ px: 1 }}>
        <Typography sx={{
          fontSize: '0.75rem',
          fontWeight: isFixo ? 700 : 400,
          color: isFixo ? '#1565c0' : 'text.primary',
          fontFamily: '"JetBrains Mono", monospace',
        }}>
          {data}
        </Typography>
      </Box>

      {/* SITUACAO */}
      <Box sx={{ px: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box sx={{
          width: 8, height: 8, borderRadius: '50%',
          bgcolor: statusInfo.color, flexShrink: 0,
        }} />
        <Typography sx={{ fontSize: '0.7rem' }} noWrap>
          {sit?.situacao ?? '--'}
        </Typography>
      </Box>

      {/* OBS */}
      <Box sx={{ px: 1 }}>
        <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }} noWrap>
          {sit?.obs ?? ''}
        </Typography>
      </Box>
    </Box>
  );
});
