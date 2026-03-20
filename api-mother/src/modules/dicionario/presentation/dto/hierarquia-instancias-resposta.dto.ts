import { ApiProperty } from '@nestjs/swagger';
import { InstanciaRespostaDto } from './instancia-resposta.dto';

/**
 * D4-T08: DTO para nodo da hierarquia de instâncias
 */
export class NodoHierarquiaRespostaDto {
  @ApiProperty({
    description: 'Dados da instância neste nível',
    type: InstanciaRespostaDto,
  })
  instancia: InstanciaRespostaDto;

  @ApiProperty({
    description: 'Tipo de ligação com o pai',
    example: 'M',
    required: false,
  })
  tipoLigacao?: string;

  @ApiProperty({
    description: 'Descrição do tipo de ligação',
    example: 'Master-Detail',
    required: false,
  })
  tipoLigacaoDescricao?: string;

  @ApiProperty({
    description: 'Nível na hierarquia (0 = raiz)',
    example: 0,
  })
  nivel: number;

  @ApiProperty({
    description: 'Instâncias filhas',
    type: [NodoHierarquiaRespostaDto],
  })
  filhos: NodoHierarquiaRespostaDto[];
}

/**
 * D4-T08: DTO para resposta de hierarquia completa
 */
export class HierarquiaInstanciasRespostaDto {
  @ApiProperty({
    description: 'Árvore de hierarquia',
    type: NodoHierarquiaRespostaDto,
    nullable: true,
  })
  hierarquia: NodoHierarquiaRespostaDto | null;

  @ApiProperty({
    description: 'Total de instâncias na hierarquia',
    example: 10,
  })
  totalInstancias: number;

  @ApiProperty({
    description: 'Profundidade máxima alcançada',
    example: 3,
  })
  profundidade: number;
}
