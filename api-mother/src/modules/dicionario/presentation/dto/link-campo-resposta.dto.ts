import { ApiProperty } from '@nestjs/swagger';
import { RelacionamentoRespostaDto } from './relacionamento-resposta.dto';

/**
 * D4-T08: DTO para link de campo (TDDLGC)
 */
export class LinkCampoRespostaDto {
  @ApiProperty({
    description: 'Nome da instância pai',
    example: 'Parceiro',
  })
  nomeInstanciaPai: string;

  @ApiProperty({
    description: 'Nome da instância filha',
    example: 'Contato',
  })
  nomeInstanciaFilho: string;

  @ApiProperty({
    description: 'Campo de origem (tabela pai)',
    example: 'CODPARC',
  })
  campoOrigem: string;

  @ApiProperty({
    description: 'Campo de destino (tabela filha)',
    example: 'CODPARC',
  })
  campoDestino: string;

  @ApiProperty({
    description: 'Ordem do campo na ligação',
    example: 1,
  })
  ordem: number;

  @ApiProperty({
    description: 'Expressão de JOIN gerada',
    example: 'pai.CODPARC = filho.CODPARC',
  })
  expressaoJoin: string;
}

/**
 * D4-T08: DTO para resposta de campos de relacionamento
 */
export class CamposRelacionamentoRespostaDto {
  @ApiProperty({
    description: 'Dados do relacionamento',
    type: RelacionamentoRespostaDto,
    nullable: true,
  })
  relacionamento: RelacionamentoRespostaDto | null;

  @ApiProperty({
    description: 'Campos de ligação (TDDLGC)',
    type: [LinkCampoRespostaDto],
  })
  camposLigacao: LinkCampoRespostaDto[];

  @ApiProperty({
    description: 'Expressão JOIN completa',
    example: 'Parceiro JOIN Contato ON pai.CODPARC = filho.CODPARC',
  })
  expressaoJoin: string;

  @ApiProperty({
    description: 'Total de campos de ligação',
    example: 1,
  })
  total: number;
}
