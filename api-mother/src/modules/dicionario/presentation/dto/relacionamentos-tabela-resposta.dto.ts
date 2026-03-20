import { ApiProperty } from '@nestjs/swagger';
import { RelacionamentoRespostaDto } from './relacionamento-resposta.dto';

/**
 * D4-T09: DTO para resposta de relacionamentos de uma tabela categorizados
 */
export class RelacionamentosTabelaRespostaDto {
  @ApiProperty({
    description: 'Relacionamentos onde a tabela é pai (origem)',
    type: [RelacionamentoRespostaDto],
  })
  relacionamentosPai: RelacionamentoRespostaDto[];

  @ApiProperty({
    description: 'Relacionamentos onde a tabela é filha (destino)',
    type: [RelacionamentoRespostaDto],
  })
  relacionamentosFilho: RelacionamentoRespostaDto[];

  @ApiProperty({
    description: 'Todos os relacionamentos (união)',
    type: [RelacionamentoRespostaDto],
  })
  relacionamentos: RelacionamentoRespostaDto[];

  @ApiProperty({
    description: 'Total de relacionamentos únicos',
    example: 10,
  })
  total: number;

  @ApiProperty({
    description: 'Total como pai',
    example: 6,
  })
  totalComoPai: number;

  @ApiProperty({
    description: 'Total como filho',
    example: 4,
  })
  totalComoFilho: number;
}
