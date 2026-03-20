import { AvatarGroup, Tooltip } from '@mui/material';
import { PessoaAvatar } from '@/components/shared/pessoa-avatar';
import type { PainelPessoa } from '@/types/hstvei-types';

interface PessoaAvatarGroupProps {
  pessoas: PainelPessoa[];
  max?: number;
  size?: number;
}

export function PessoaAvatarGroup({ pessoas, max = 3, size = 24 }: PessoaAvatarGroupProps) {
  if (pessoas.length === 0) return null;

  return (
    <AvatarGroup max={max} sx={{ '& .MuiAvatar-root': { width: size, height: size, fontSize: size * 0.42 } }}>
      {pessoas.map((p) => (
        <Tooltip key={p.codusu} title={p.nome}>
          <span>
            <PessoaAvatar codparc={p.codparc} nome={p.nome} size={size} />
          </span>
        </Tooltip>
      ))}
    </AvatarGroup>
  );
}
