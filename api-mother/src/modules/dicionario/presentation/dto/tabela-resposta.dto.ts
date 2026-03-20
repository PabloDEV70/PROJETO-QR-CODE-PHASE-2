import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de resposta para representação de uma tabela do dicionário de dados.
 *
 * Mapeia os dados da entidade Tabela para o formato de resposta da API.
 */
export class TabelaRespostaDto {
  @ApiProperty({
    description: 'Nome da tabela no banco de dados',
    example: 'TGFPAR',
  })
  nomeTabela: string;

  @ApiProperty({
    description: 'Descrição da tabela',
    example: 'Parceiros',
  })
  descricao: string;

  @ApiProperty({
    description: 'Nome da instância associada',
    example: 'Parceiro',
  })
  nomeInstancia: string;

  @ApiPropertyOptional({
    description: 'Módulo ao qual a tabela pertence',
    example: 'Comercial',
  })
  modulo: string;

  @ApiProperty({
    description: 'Indica se a tabela está ativa',
    example: true,
  })
  ativa: boolean;

  @ApiProperty({
    description: 'Tipo de operações CRUD permitidas',
    example: 'CRUD',
  })
  tipoCrud: string;

  @ApiProperty({
    description: 'Indica se é uma tabela de sistema (TSI* ou TDD*)',
    example: false,
  })
  ehSistema: boolean;
}

/**
 * DTO para listagem paginada de tabelas.
 */
export class ListaTabelasRespostaDto {
  @ApiProperty({
    description: 'Lista de tabelas',
    type: [TabelaRespostaDto],
  })
  tabelas: TabelaRespostaDto[];

  @ApiProperty({
    description: 'Total de registros disponíveis',
    example: 1500,
  })
  total: number;
}
