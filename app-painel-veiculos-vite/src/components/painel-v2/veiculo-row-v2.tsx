import { memo } from 'react';
import { Box, Typography, Chip, Tooltip } from '@mui/material';
import { getPrioridadeInfo } from '@/utils/prioridade-constants';
import { getDepartamentoInfo } from '@/utils/departamento-constants';
import { PessoaAvatarGroup } from '@/components/painel/pessoa-avatar-group';
import { PessoaAvatar } from '@/components/shared/pessoa-avatar';
import type { PainelVeiculo } from '@/types/hstvei-types';

function getStatusColor(situacao: string): string {
  const lower = situacao.toLowerCase();
  if (lower.includes('livre') || lower.includes('disponivel') || lower.includes('pátio')) return '#4caf50';
  if (lower.includes('locad') || lower.includes('contrato') || lower.includes('operação')) return '#2196f3';
  if (lower.includes('manutenç') || lower.includes('reparo') || lower.includes('corretiv')) return '#ff9800';
  if (lower.includes('aguardando') || lower.includes('pendente')) return '#ffc107';
  if (lower.includes('bloqueio') || lower.includes('parad') || lower.includes('pausad')) return '#f44336';
  if (lower.includes('reservad') || lower.includes('agendad')) return '#9c27b0';
  if (lower.includes('inspeç') || lower.includes('checklist') || lower.includes('vistoria')) return '#00bcd4';
  return '#9e9e9e';
}

function formatPrevisao(dt: string | null): string {
  if (!dt) return '--';
  const d = new Date(dt);
  if (isNaN(d.getTime())) return '--';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const VeiculoRowV2 = memo(function VeiculoRowV2({ veiculo }: { veiculo: PainelVeiculo }) {
  const sit = veiculo.situacoesAtivas[0];
  const statusText = sit?.situacao ?? 'Sem situacao';
  const statusColor = getStatusColor(statusText);
  const prioInfo = getPrioridadeInfo(veiculo.prioridadeMaxima);
  const depInfo = sit ? getDepartamentoInfo(sit.coddep) : null;
  const allPessoas = sit ? [...sit.operadores, ...sit.mecanicos] : [];

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: '80px 100px 1fr 120px 90px 70px 50px',
      alignItems: 'center',
      gap: 1,
      px: 1.5,
      py: 0.5,
      '&:hover': { bgcolor: 'action.hover' },
      borderBottom: '1px solid',
      borderColor: 'divider',
      minHeight: 36,
    }}>
      {/* Placa */}
      <Typography sx={{
        fontWeight: 700, fontSize: '0.8rem',
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        letterSpacing: '0.02em',
      }}>
        {veiculo.placa}
      </Typography>

      {/* Tag */}
      <Typography sx={{
        fontSize: '0.75rem', color: 'text.secondary',
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      }} noWrap>
        {veiculo.tag ?? '--'}
      </Typography>

      {/* Situacao */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: statusColor, flexShrink: 0 }} />
        <Typography sx={{ fontSize: '0.75rem', minWidth: 0 }} noWrap>
          {statusText}
        </Typography>
        {sit?.descricao && (
          <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', minWidth: 0 }} noWrap>
            {sit.descricao}
          </Typography>
        )}
      </Box>

      {/* Departamento */}
      {depInfo ? (
        <Chip size="small" label={depInfo.label}
          sx={{ height: 20, fontSize: '0.65rem', bgcolor: `${depInfo.color}22`, color: depInfo.color, border: `1px solid ${depInfo.color}44` }} />
      ) : <Box />}

      {/* Equipe (avatars with photos) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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

      {/* Previsao */}
      <Typography sx={{
        fontSize: '0.75rem',
        color: veiculo.previsaoMaisProxima ? 'text.primary' : 'text.disabled',
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        textAlign: 'center',
      }}>
        {formatPrevisao(veiculo.previsaoMaisProxima)}
      </Typography>

      {/* Prioridade */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box sx={{
          width: 22, height: 22, borderRadius: '50%',
          bgcolor: `${prioInfo.color}22`, color: prioInfo.color,
          border: `1px solid ${prioInfo.color}66`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.65rem', fontWeight: 700,
        }}>
          {prioInfo.sigla}
        </Box>
      </Box>
    </Box>
  );
});
