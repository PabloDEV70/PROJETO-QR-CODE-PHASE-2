import { Paper, Box, Typography, Chip, alpha, Divider } from '@mui/material';
import {
  Schedule, Warning, Person, FiberManualRecord,
  Storefront, Build,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getPrioridadeInfo } from '@/utils/prioridade-constants';
import { calcPrevisaoCountdown } from '@/utils/previsao-utils';
import { DepartamentoChip } from '@/components/shared/departamento-chip';
import { PessoaAvatarGroup } from '@/components/shared/pessoa-avatar-group';
import { PlacaVeiculo } from '@/components/shared/placa-veiculo';
import type { PainelVeiculo, PainelSituacao, PainelPessoa } from '@/types/hstvei-types';

interface VeiculoListItemProps {
  veiculo: PainelVeiculo;
}

const MOS_SIT_LABELS: Record<string, { label: string; color: string }> = {
  A: { label: 'Aberta', color: '#2e7d32' },
  F: { label: 'Fechada', color: '#546e7a' },
  P: { label: 'Pendente', color: '#e65100' },
  C: { label: 'Cancelada', color: '#c62828' },
};

// ── Linha de situacao com dados completos ──

function SituacaoRow({ sit }: { sit: PainelSituacao }) {
  const prio = getPrioridadeInfo(sit.idpri);
  const previsao = calcPrevisaoCountdown(sit.dtprevisao);
  const allPessoas: PainelPessoa[] = [...sit.operadores, ...sit.mecanicos];

  // Parceiro direto (vinculado a situacao)
  const parceiroDireto = sit.nomeParc;
  // Cliente da OS comercial
  const clienteOS = sit.mosCliente;
  // Situacao da OS comercial
  const mosSit = sit.mosSituacao ? MOS_SIT_LABELS[sit.mosSituacao] : null;

  return (
    <Box sx={{ py: 1 }}>
      {/* Linha 1: Situacao + departamento + prazo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
        <FiberManualRecord sx={{ fontSize: 10, color: prio.color, flexShrink: 0 }} />
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'text.primary' }}>
          {sit.situacao}
        </Typography>
        {sit.departamento && (
          <DepartamentoChip departamento={sit.departamento} size="small" />
        )}
        {previsao && (
          <Chip
            icon={<Schedule sx={{ fontSize: 12 }} />}
            label={previsao.text}
            size="small"
            sx={{
              height: 22, fontSize: 12, fontWeight: 700, ml: 'auto',
              bgcolor: alpha(previsao.isOverdue ? '#f44336' : '#43a047', 0.08),
              color: previsao.isOverdue ? '#e53935' : '#2e7d32',
              '& .MuiChip-icon': { color: previsao.isOverdue ? '#e53935' : '#2e7d32' },
            }}
          />
        )}
      </Box>

      {/* Linha 2: Parceiro / Cliente (direto) */}
      {parceiroDireto && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, pl: 2 }}>
          <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>
            {parceiroDireto}
          </Typography>
        </Box>
      )}

      {/* Linha 3: OS Comercial + cliente da OS */}
      {sit.numos && (
        <Box sx={{ mt: 0.5, pl: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            <Storefront sx={{ fontSize: 15, color: '#c62828' }} />
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#c62828', fontFamily: 'monospace' }}>
              OS {sit.numos}
            </Typography>
            {clienteOS && (
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>
                {clienteOS}
              </Typography>
            )}
            {mosSit && (
              <Chip label={mosSit.label} size="small" sx={{
                height: 18, fontSize: 10, fontWeight: 700,
                bgcolor: alpha(mosSit.color, 0.08), color: mosSit.color,
                '& .MuiChip-label': { px: 0.5 },
              }} />
            )}
          </Box>
          {/* Detalhes OS Comercial */}
          {(sit.mosLocalExec || sit.mosEndereco || sit.mosCidade) && (
            <Typography sx={{ fontSize: 11, color: 'text.secondary', pl: 2.5, mt: 0.25 }} noWrap>
              {[sit.mosLocalExec, sit.mosEndereco, sit.mosCidade].filter(Boolean).join(' · ')}
            </Typography>
          )}
          {sit.mosResponsavel && (
            <Typography sx={{ fontSize: 11, color: 'text.disabled', pl: 2.5 }} noWrap>
              Resp: {sit.mosResponsavel}
              {sit.mosNrProposta ? ` · Proposta ${sit.mosNrProposta}` : ''}
              {sit.mosContrato ? ` · Contrato ${sit.mosContrato}` : ''}
            </Typography>
          )}
        </Box>
      )}

      {/* Linha 4: OS Manutencao */}
      {sit.nuos && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, pl: 2 }}>
          <Build sx={{ fontSize: 15, color: '#ff9800' }} />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#e65100', fontFamily: 'monospace' }}>
            OS {sit.nuos}
          </Typography>
          {sit.osStatus && (
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {sit.osStatus}
            </Typography>
          )}
          {sit.osTipo && (
            <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
              · {sit.osTipo}
            </Typography>
          )}
        </Box>
      )}

      {/* Linha 5: Descricao + equipe */}
      {(sit.descricao || allPessoas.length > 0) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, pl: 2 }}>
          {sit.descricao && (
            <Typography sx={{ fontSize: 13, color: 'text.secondary', flex: 1, minWidth: 0 }} noWrap>
              {sit.descricao}
            </Typography>
          )}
          {allPessoas.length > 0 && (
            <Box sx={{ flexShrink: 0, ml: 'auto' }}>
              <PessoaAvatarGroup pessoas={allPessoas} max={3} size={22} />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export function VeiculoListItem({ veiculo }: VeiculoListItemProps) {
  const navigate = useNavigate();
  const prio = getPrioridadeInfo(veiculo.prioridadeMaxima);
  const urgentes = veiculo.situacoesAtivas.filter((s) => s.idpri === 0).length;

  const infoItems: string[] = [];
  if (veiculo.tipo) infoItems.push(veiculo.tipo);
  if (veiculo.capacidade) infoItems.push(veiculo.capacidade);

  return (
    <Paper
      onClick={() => navigate(`/veiculo/${veiculo.codveiculo}`)}
      sx={{
        mb: 1.5,
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'box-shadow 0.15s ease',
        '&:active': { transform: 'scale(0.985)' },
        '&:hover': { boxShadow: 3 },
      }}
    >
      {/* ── Header: Placa + Tag + Modelo ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, pt: 1.5, pb: 1 }}>
        <PlacaVeiculo placa={veiculo.placa} scale={0.65} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
            {veiculo.tag && (
              <Typography sx={{
                fontSize: 17, fontWeight: 800, color: 'text.primary',
                fontFamily: '"JetBrains Mono", monospace',
              }}>
                {veiculo.tag}
              </Typography>
            )}
            {infoItems.length > 0 && (
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                {infoItems.join(' · ')}
              </Typography>
            )}
          </Box>
          {veiculo.marcaModelo && (
            <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.3 }} noWrap>
              {veiculo.marcaModelo}
            </Typography>
          )}
        </Box>

        {/* Urgentes + contador */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          {urgentes > 0 && (
            <Warning sx={{ fontSize: 20, color: '#e53935' }} />
          )}
          <Typography sx={{
            fontSize: 18, fontWeight: 900, color: prio.color,
            fontFamily: '"JetBrains Mono", monospace',
          }}>
            {veiculo.totalSituacoes}
          </Typography>
        </Box>
      </Box>

      {/* ── Situacoes com dados completos ── */}
      {veiculo.situacoesAtivas.length > 0 && (
        <Box sx={{ px: 2, pb: 1.25 }}>
          <Divider />
          {veiculo.situacoesAtivas.slice(0, 3).map((sit, i) => (
            <Box key={sit.id}>
              <SituacaoRow sit={sit} />
              {i < Math.min(veiculo.situacoesAtivas.length, 3) - 1 && (
                <Divider sx={{ opacity: 0.3 }} />
              )}
            </Box>
          ))}
          {veiculo.situacoesAtivas.length > 3 && (
            <Typography sx={{ fontSize: 12, color: 'text.disabled', textAlign: 'center', pt: 0.5, fontWeight: 600 }}>
              +{veiculo.situacoesAtivas.length - 3} mais
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}
