/**
 * DTOs: Inspection V2
 *
 * DTOs para endpoints de inspeção do banco de dados.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';

// ====================
// Request DTOs
// ====================

export class QueryRequestDto {
  @ApiProperty({
    description: 'Query SQL a ser executada (apenas SELECT)',
    example: 'SELECT * FROM TGFVEI WHERE ATIVO = 1',
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Parâmetros para a query',
    example: ['valor1', 'valor2'],
    default: [],
  })
  @IsOptional()
  @IsArray()
  params?: unknown[];
}

// ====================
// Response DTOs
// ====================

export class TabelaResponseDto {
  @ApiProperty({ description: 'Nome da tabela', example: 'TGFVEI' })
  nome: string;

  @ApiProperty({ description: 'Tipo da tabela', example: 'BASE TABLE' })
  tipo: string;
}

export class ListaTabelasResponseDto {
  @ApiProperty({ description: 'Lista de tabelas', type: [TabelaResponseDto] })
  tabelas: TabelaResponseDto[];

  @ApiProperty({ description: 'Total de tabelas', example: 150 })
  total: number;
}

export class ColunaTabelaResponseDto {
  @ApiProperty({ description: 'Nome da coluna', example: 'CODVEI' })
  nome: string;

  @ApiProperty({ description: 'Tipo de dados', example: 'int' })
  tipo: string;

  @ApiProperty({ description: 'Permite valor nulo', example: false })
  nulo: boolean;

  @ApiProperty({ description: 'Posição ordinal', example: 1 })
  posicao: number;

  @ApiPropertyOptional({ description: 'Tamanho máximo', example: 255 })
  tamanhoMaximo?: number;

  @ApiPropertyOptional({ description: 'Precisão numérica', example: 18 })
  precisao?: number;

  @ApiPropertyOptional({ description: 'Escala numérica', example: 2 })
  escala?: number;

  @ApiProperty({ description: 'Tipo formatado', example: 'varchar(255)' })
  tipoFormatado: string;
}

export class RelacaoTabelaResponseDto {
  @ApiProperty({ description: 'Nome da FK', example: 'FK_Veiculo_Parceiro' })
  nomeForeignKey: string;

  @ApiProperty({ description: 'Tabela pai', example: 'TGFVEI' })
  tabelaPai: string;

  @ApiProperty({ description: 'Coluna pai', example: 'CODPARC' })
  colunaPai: string;

  @ApiProperty({ description: 'Tabela referenciada', example: 'TGFPAR' })
  tabelaReferenciada: string;

  @ApiProperty({ description: 'Coluna referenciada', example: 'CODPARC' })
  colunaReferenciada: string;

  @ApiProperty({ description: 'Ação de delete', example: 'NO_ACTION' })
  acaoDelete: string;

  @ApiProperty({ description: 'Ação de update', example: 'NO_ACTION' })
  acaoUpdate: string;
}

export class RelacoesResponseDto {
  @ApiProperty({ description: 'Nome da tabela', example: 'TGFVEI' })
  nomeTabela: string;

  @ApiProperty({ description: 'Relações da tabela', type: [RelacaoTabelaResponseDto] })
  relacoes: RelacaoTabelaResponseDto[];

  @ApiProperty({ description: 'Total de relações', example: 5 })
  total: number;
}

export class ChavePrimariaResponseDto {
  @ApiProperty({ description: 'Nome da tabela', example: 'TGFVEI' })
  tabela: string;

  @ApiProperty({ description: 'Nome da coluna', example: 'CODVEI' })
  coluna: string;

  @ApiProperty({ description: 'Nome da constraint', example: 'PK_TGFVEI' })
  nomeConstraint: string;
}

export class ChavesPrimariasResponseDto {
  @ApiProperty({ description: 'Nome da tabela', example: 'TGFVEI' })
  nomeTabela: string;

  @ApiProperty({ description: 'Chaves primárias', type: [ChavePrimariaResponseDto] })
  chaves: ChavePrimariaResponseDto[];

  @ApiProperty({ description: 'Total de chaves', example: 1 })
  total: number;
}

export class ResultadoQueryResponseDto {
  @ApiProperty({ description: 'Query executada' })
  query: string;

  @ApiProperty({ description: 'Parâmetros utilizados' })
  parametros: unknown[];

  @ApiProperty({ description: 'Dados retornados' })
  dados: unknown[];

  @ApiProperty({ description: 'Quantidade de linhas', example: 100 })
  quantidadeLinhas: number;

  @ApiPropertyOptional({ description: 'Tempo de execução em ms', example: 45 })
  tempoExecucao?: number;
}

// ====================
// Wrapper Response
// ====================

export class ApiResponseWrapperDto<T> {
  @ApiProperty({ description: 'Indica sucesso da operação', example: true })
  sucesso: boolean;

  @ApiProperty({ description: 'Dados retornados' })
  dados: T;

  @ApiPropertyOptional({ description: 'Tempo de execução em ms', example: 45 })
  tempoExecucao?: number;
}
