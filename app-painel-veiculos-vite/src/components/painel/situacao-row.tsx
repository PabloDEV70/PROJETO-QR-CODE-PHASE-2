import { Box, Typography, Tooltip } from '@mui/material';
import { PrioridadeBadge } from '@/components/painel/prioridade-badge';
import { DepartamentoChip } from '@/components/painel/departamento-chip';
import { PrevisaoCountdown } from '@/components/painel/previsao-countdown';
import { PessoaAvatarGroup } from '@/components/painel/pessoa-avatar-group';
import { PessoaAvatar } from '@/components/shared/pessoa-avatar';
import type { PainelSituacao } from '@/types/hstvei-types';

interface SituacaoRowProps {
  situacao: PainelSituacao;
}

export function SituacaoRow({ situacao }: SituacaoRowProps) {
  const allPessoas = [...situacao.operadores, ...situacao.mecanicos];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, flexWrap: 'wrap' }}>
      <PrioridadeBadge idpri={situacao.idpri} />
      <DepartamentoChip coddep={situacao.coddep} />
      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', flex: 1, minWidth: 0 }} noWrap>
        {situacao.situacao}{situacao.descricao ? ` — ${situacao.descricao}` : ''}
      </Typography>
      <PrevisaoCountdown dtprevisao={situacao.dtprevisao} />
      {situacao.criadoPor && (
        <Tooltip title={`Criado: ${situacao.criadoPor.nome}`}>
          <span>
            <PessoaAvatar codparc={situacao.criadoPor.codparc} nome={situacao.criadoPor.nome} size={20}
              sx={{ border: '2px solid', borderColor: 'success.main' }} />
          </span>
        </Tooltip>
      )}
      <PessoaAvatarGroup pessoas={allPessoas} />
    </Box>
  );
}
