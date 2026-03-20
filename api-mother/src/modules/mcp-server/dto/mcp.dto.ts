import { IsString, IsOptional, IsNumber, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class McpQueryDto {
  @ApiProperty({
    description: 'Query SQL a ser executada (apenas SELECT)',
    example: 'SELECT TOP 10 CODPARC, NOMEPARC FROM TGFPAR WHERE CODTIPPAR = ?',
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Parâmetros da query (para evitar SQL injection)',
    example: [1],
    type: [Object],
  })
  @IsOptional()
  @IsArray()
  params?: any[];

  @ApiPropertyOptional({
    description: 'Limite de registros a retornar',
    example: 100,
    default: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  limit?: number = 100;

  @ApiPropertyOptional({
    description: 'Offset para paginação',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class McpListTablesDto {
  @ApiPropertyOptional({
    description: 'Limite de tabelas a retornar',
    example: 100,
    default: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  limit?: number = 100;

  @ApiPropertyOptional({
    description: 'Offset para paginação',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class McpTableSchemaDto {
  @ApiProperty({
    description: 'Nome da tabela',
    example: 'TGFPAR',
  })
  @IsString()
  tableName: string;
}

export class McpSearchTablesDto {
  @ApiProperty({
    description: 'Termo de busca',
    example: 'PARCEIRO',
  })
  @IsString()
  term: string;

  @ApiPropertyOptional({
    description: 'Limite de resultados',
    example: 100,
    default: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  limit?: number = 100;

  @ApiPropertyOptional({
    description: 'Offset para paginação',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class McpSearchFieldsDto {
  @ApiProperty({
    description: 'Termo de busca',
    example: 'CODPARC',
  })
  @IsString()
  term: string;

  @ApiPropertyOptional({
    description: 'Limite de resultados',
    example: 100,
    default: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  limit?: number = 100;

  @ApiPropertyOptional({
    description: 'Offset para paginação',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class McpResponseDto<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
    sqlMessage?: string;
    sqlCode?: string | null;
    sqlNumber?: string | null;
    source?: string;
  };
  metadata?: {
    executionTime: number;
    rowsAffected?: number;
    timestamp: string;
    source?: string;
  };
}

export class QueryResultDto {
  columns: string[];
  rows: any[][];
  rowCount: number;
  executionTime: number;
}

export class TableInfoDto {
  TABLE_NAME: string;
  TABLE_TYPE: string;
  TABLE_SCHEMA?: string;
}

export class TableSchemaDto {
  tableName: string;
  columns: ColumnInfoDto[];
  primaryKeys: string[];
  totalColumns: number;
}

export class ColumnInfoDto {
  COLUMN_NAME: string;
  DATA_TYPE: string;
  IS_NULLABLE: string;
  ORDINAL_POSITION: number;
  COLUMN_DEFAULT?: string;
  CHARACTER_MAXIMUM_LENGTH?: number;
  NUMERIC_PRECISION?: number;
  NUMERIC_SCALE?: number;
}

export class McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export class McpDictionaryListDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  limit?: number = 100;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class McpDictionaryTableDto {
  @IsString()
  tableName: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 500;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class McpDictionaryFieldDto {
  @IsString()
  tableName: string;

  @IsString()
  fieldName: string;
}

export class McpDictionarySearchDto {
  @IsString()
  term: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  limit?: number = 100;
}

export class McpDictionaryFieldSearchDto {
  @IsString()
  term: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  limit?: number = 100;
}

export class McpDictionaryFieldsQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  limit?: number = 500;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
