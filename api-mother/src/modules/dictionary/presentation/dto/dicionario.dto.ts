import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO: QueryPaginacaoDto
 */
export class QueryPaginacaoDto {
  @ApiPropertyOptional({
    description: 'Limite de registros',
    example: 100,
    minimum: 0,
    maximum: 10000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000)
  limite?: number;

  @ApiPropertyOptional({
    description: 'Offset para paginação',
    example: 0,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

/**
 * DTO: QueryBuscaDto
 */
export class QueryBuscaDto extends QueryPaginacaoDto {
  @ApiProperty({
    description: 'Termo de busca',
    example: 'PARCEIRO',
  })
  @IsString()
  termo: string;
}

/**
 * DTO: TabelaResponseDto
 */
export class TabelaResponseDto {
  @ApiProperty({ example: 'TGFPAR' })
  nomeTabela: string;

  @ApiProperty({ example: 'Parceiros' })
  descricao: string;

  @ApiPropertyOptional({ example: 'S' })
  tipoNumeracao?: string | null;

  @ApiPropertyOptional({ example: 1 })
  numeroCampoNumeracao?: number | null;

  @ApiPropertyOptional()
  adicional?: string | null;
}

/**
 * DTO: OpcaoCampoDto
 */
export class OpcaoCampoDto {
  @ApiProperty({ example: 'S' })
  valor: string;

  @ApiProperty({ example: 'Sim' })
  opcao: string;

  @ApiPropertyOptional({ example: 'S' })
  padrao?: string | null;

  @ApiPropertyOptional({ example: 1 })
  ordem?: number | null;
}

/**
 * DTO: CampoResponseDto
 */
export class CampoResponseDto {
  @ApiProperty({ example: 12345 })
  numeroCampo: number;

  @ApiProperty({ example: 'TGFPAR' })
  nomeTabela: string;

  @ApiProperty({ example: 'CODPARC' })
  nomeCampo: string;

  @ApiProperty({ example: 'Código do Parceiro' })
  descricao: string;

  @ApiProperty({ example: 'N', enum: ['C', 'N', 'D', 'T', 'M', 'B'] })
  tipoCampo: string;

  @ApiPropertyOptional({ example: 'Numérico' })
  tipoLegivel?: string;

  @ApiPropertyOptional({ example: 10 })
  tamanho?: number | null;

  @ApiPropertyOptional({ example: true })
  permitePesquisa?: boolean;

  @ApiPropertyOptional({ example: false })
  calculado?: boolean;

  @ApiPropertyOptional({ example: 1 })
  ordem?: number | null;

  @ApiPropertyOptional({ type: [OpcaoCampoDto] })
  opcoes?: OpcaoCampoDto[];
}

/**
 * DTO: PaginacaoDto
 */
export class PaginacaoDto {
  @ApiProperty({ example: 100 })
  limite: number;

  @ApiProperty({ example: 0 })
  offset: number;

  @ApiProperty({ example: 1500 })
  total: number;
}

/**
 * DTO: ListaTabelasResponseDto
 */
export class ListaTabelasResponseDto {
  @ApiProperty({ type: [TabelaResponseDto] })
  dados: TabelaResponseDto[];

  @ApiProperty({ type: PaginacaoDto })
  paginacao: PaginacaoDto;
}

/**
 * DTO: ListaCamposResponseDto
 */
export class ListaCamposResponseDto {
  @ApiProperty({ type: [CampoResponseDto] })
  dados: CampoResponseDto[];

  @ApiProperty({ type: PaginacaoDto })
  paginacao: PaginacaoDto;
}
