import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Limite de registros a retornar (0 ou omitido = todos)',
    example: 100,
    minimum: 0,
    maximum: 10000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Offset para paginacao',
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

export class DictionaryQueryDto {
  @ApiProperty({
    description: 'Query SQL a executar (somente SELECT em tabelas TDD*)',
    example:
      "SELECT * FROM TDDOPC WHERE NUCAMPO = (SELECT NUCAMPO FROM TDDCAM WHERE NOMETAB = 'TGFTOP' AND NOMECAMPO = 'ATUALEST')",
  })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiPropertyOptional({
    description: 'Parametros da query (usar @param1, @param2, etc)',
    example: ['TGFTOP', 'ATUALEST'],
    default: [],
  })
  @IsOptional()
  @IsArray()
  params?: any[] = [];
}

export class SearchTermDto {
  @ApiPropertyOptional({
    description: 'Termo de busca',
    example: 'PARCEIRO',
  })
  @IsOptional()
  @IsString()
  term?: string;
}
