import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de resposta para representação de uma instância do dicionário de dados.
 *
 * Mapeia os dados da entidade Instancia para o formato de resposta da API.
 */
export class InstanciaRespostaDto {
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
}

/**
 * DTO para listagem paginada de instâncias.
 */
export class ListaInstanciasRespostaDto {
  @ApiProperty({
    description: 'Lista de instâncias',
    type: [InstanciaRespostaDto],
  })
  instancias: InstanciaRespostaDto[];

  @ApiProperty({
    description: 'Total de registros disponíveis',
    example: 10,
  })
  total: number;
}
