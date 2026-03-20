import { Paper, Box, Typography, Tooltip } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PrioridadeBadge } from '@/components/shared/prioridade-badge';
import { DepartamentoChip } from '@/components/shared/departamento-chip';
import { PessoaAvatar } from '@/components/shared/pessoa-avatar';
import { PessoaAvatarGroup } from '@/components/shared/pessoa-avatar-group';
import { calcPrevisaoCountdown } from '@/utils/previsao-utils';
import type { PainelSituacao } from '@/types/hstvei-types';

interface SituacaoCardProps {
  situacao: PainelSituacao;
}

export function SituacaoCard({ situacao }: SituacaoCardProps) {
  const navigate = useNavigate();
  const previsao = calcPrevisaoCountdown(situacao.dtprevisao);
  const allPessoas = [...situacao.operadores, ...situacao.mecanicos];

  return (
    <Paper
      onClick={() => navigate(`/situacao/${situacao.id}`)}
      sx={{ p: 1.5, mb: 1, cursor: 'pointer', '&:active': { transform: 'scale(0.98)' } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <PrioridadeBadge idpri={situacao.idpri} />
        <DepartamentoChip departamento={situacao.departamento} />
        <Box sx={{ flex: 1 }} />
        {previsao && (
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: previsao.isOverdue ? '#f44336' : '#4caf50' }}>
            {previsao.isOverdue ? 'ATRASADO' : previsao.text}
          </Typography>
        )}
        <ChevronRight sx={{ fontSize: 18, color: 'text.disabled' }} />
      </Box>
      <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{situacao.situacao}</Typography>
      {situacao.descricao && (
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.25 }} noWrap>
          {situacao.descricao}
        </Typography>
      )}

      {/* Equipe: criador + operadores + mecanicos */}
      {(situacao.criadoPor || allPessoas.length > 0) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
          {situacao.criadoPor && (
            <Tooltip title={`Criado: ${situacao.criadoPor.nome}`}>
              <span>
                <PessoaAvatar
                  codparc={situacao.criadoPor.codparc}
                  nome={situacao.criadoPor.nome}
                  size={24}
                  sx={{ border: '2px solid', borderColor: 'success.main' }}
                />
              </span>
            </Tooltip>
          )}
          <PessoaAvatarGroup pessoas={allPessoas} max={4} size={24} />
        </Box>
      )}
    </Paper>
  );
}
