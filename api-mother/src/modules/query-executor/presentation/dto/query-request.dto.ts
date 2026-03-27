import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

/**
 * DTO para requisição de execução de query
 */
export class QueryRequestDto {
  @ApiProperty({
    description: 'Query SQL SELECT a ser executada',
    example: 'SELECT * FROM TGFPRO WHERE CODPROD = 123',
  })
  @IsString()
  query: string;

  @ApiProperty({
    description: 'Database a ser utilizado (opcional, usa default se não especificado)',
    example: 'SANKHYA_PROD',
    required: false,
  })
  @IsOptional()
  @IsString()
  database?: string;

  @ApiPropertyOptional({
    description: 'Limite máximo de linhas retornadas (injeta TOP automaticamente se ausente)',
    example: 5000,
    default: 5000,
    minimum: 1,
    maximum: 10000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  maxRows?: number;
}
