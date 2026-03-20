import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/**
 * DTO para parâmetros de pesquisa no dicionário.
 */
export class PesquisaDicionarioDto {
  @ApiProperty({
    description: 'Termo de busca (mínimo 2 caracteres)',
    example: 'PARC',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'O termo de busca deve ter pelo menos 2 caracteres' })
  termo: string;
}

/**
 * DTO para representar um item de tabela encontrado na pesquisa.
 */
export class ItemTabelaPesquisaDto {
  @ApiProperty({
    description: 'Nome da tabela',
    example: 'TGFPAR',
  })
  nomeTabela: string;

  @ApiProperty({
    description: 'Descrição da tabela',
    example: 'Parceiros',
  })
  descricao: string;

  @ApiProperty({
    description: 'Indica se a tabela está ativa',
    example: true,
  })
  ativa: boolean;
}

/**
 * DTO para representar um item de campo encontrado na pesquisa.
 */
export class ItemCampoPesquisaDto {
  @ApiProperty({
    description: 'Nome da tabela à qual o campo pertence',
    example: 'TGFPAR',
  })
  nomeTabela: string;

  @ApiProperty({
    description: 'Nome do campo',
    example: 'CODPARC',
  })
  nomeCampo: string;

  @ApiProperty({
    description: 'Descrição do campo',
    example: 'Código do Parceiro',
  })
  descricao: string;

  @ApiProperty({
    description: 'Tipo do campo',
    example: 'N',
  })
  tipo: string;
}

/**
 * DTO de resposta para resultado de pesquisa global no dicionário.
 *
 * Retorna resultados agrupados por tipo (tabelas, campos).
 */
export class ResultadoPesquisaRespostaDto {
  @ApiProperty({
    description: 'Termo pesquisado',
    example: 'PARC',
  })
  termo: string;

  @ApiProperty({
    description: 'Tabelas encontradas',
    type: [ItemTabelaPesquisaDto],
  })
  tabelas: ItemTabelaPesquisaDto[];

  @ApiProperty({
    description: 'Campos encontrados',
    type: [ItemCampoPesquisaDto],
  })
  campos: ItemCampoPesquisaDto[];

  @ApiProperty({
    description: 'Total de tabelas encontradas',
    example: 5,
  })
  totalTabelas: number;

  @ApiProperty({
    description: 'Total de campos encontrados',
    example: 25,
  })
  totalCampos: number;

  @ApiProperty({
    description: 'Total geral de resultados',
    example: 30,
  })
  totalGeral: number;
}
