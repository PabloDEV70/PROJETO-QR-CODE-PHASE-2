import { ApiProperty } from '@nestjs/swagger';
import { RelacionamentoRespostaDto } from './relacionamento-resposta.dto';

/**
 * D4-T08: DTO para instância completa com relacionamentos
 */
export class InstanciaCompletaRespostaDto {
  @ApiProperty({
    description: 'Nome da instância',
    example: 'Parceiro',
  })
  nomeInstancia: string;

  @ApiProperty({
    description: 'Nome da tabela associada',
    example: 'TGFPAR',
  })
  nomeTabela: string;

  @ApiProperty({
    description: 'Descrição da instância',
    example: 'Cadastro de Parceiros',
  })
  descricao: string;

  @ApiProperty({
    description: 'Ordem de exibição',
    example: 1,
  })
  ordem: number;

  @ApiProperty({
    description: 'Indica se a instância está ativa',
    example: true,
  })
  ativa: boolean;

  @ApiProperty({
    description: 'Relacionamentos onde esta instância é pai (origem)',
    type: [RelacionamentoRespostaDto],
  })
  relacionamentosPai: RelacionamentoRespostaDto[];

  @ApiProperty({
    description: 'Relacionamentos onde esta instância é filha (destino)',
    type: [RelacionamentoRespostaDto],
  })
  relacionamentosFilho: RelacionamentoRespostaDto[];

  @ApiProperty({
    description: 'Total de relacionamentos',
    example: 5,
  })
  totalRelacionamentos: number;
}
