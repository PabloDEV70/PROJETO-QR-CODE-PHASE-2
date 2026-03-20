import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de resposta para representação de um relacionamento do dicionário de dados.
 *
 * Mapeia os dados da entidade Relacionamento para o formato de resposta da API.
 */
export class RelacionamentoRespostaDto {
  @ApiProperty({
    description: 'Nome da instância pai (origem do relacionamento)',
    example: 'Parceiro',
  })
  nomeInstanciaPai: string;

  @ApiProperty({
    description: 'Nome da instância filho (destino do relacionamento)',
    example: 'Contato',
  })
  nomeInstanciaFilho: string;

  @ApiProperty({
    description: 'Tipo de ligação (M=Master-Detail, etc.)',
    example: 'M',
  })
  tipoLigacao: string;

  @ApiProperty({
    description: 'Descrição do tipo de ligação',
    example: 'Master-Detail',
  })
  tipoLigacaoDescricao: string;

  @ApiProperty({
    description: 'Ordem de exibição',
    example: 1,
  })
  ordem: number;

  @ApiProperty({
    description: 'Indica se o relacionamento está ativo',
    example: true,
  })
  ativo: boolean;

  @ApiProperty({
    description: 'Indica se é um relacionamento Master-Detail',
    example: true,
  })
  ehMasterDetail: boolean;
}

/**
 * DTO para listagem paginada de relacionamentos.
 */
export class ListaRelacionamentosRespostaDto {
  @ApiProperty({
    description: 'Lista de relacionamentos',
    type: [RelacionamentoRespostaDto],
  })
  relacionamentos: RelacionamentoRespostaDto[];

  @ApiProperty({
    description: 'Total de registros disponíveis',
    example: 5,
  })
  total: number;
}
