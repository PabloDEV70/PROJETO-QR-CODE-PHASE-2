import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

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
}
