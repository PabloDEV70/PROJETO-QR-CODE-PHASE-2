import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsIn } from 'class-validator';

/**
 * DTO para criacao de Parametro.
 */
export class CriarParametroDto {
  @ApiProperty({ description: 'Chave do parametro', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  chave: string;

  @ApiProperty({ description: 'Valor do parametro', maxLength: 4000 })
  @IsString()
  @MaxLength(4000)
  valor: string;

  @ApiPropertyOptional({ description: 'Descricao do parametro', maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descricao?: string;

  @ApiProperty({ description: 'Tipo do parametro', enum: ['STRING', 'NUMBER', 'BOOLEAN', 'JSON'] })
  @IsString()
  @IsIn(['STRING', 'NUMBER', 'BOOLEAN', 'JSON'])
  tipo: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';

  @ApiPropertyOptional({ description: 'Status ativo', enum: ['S', 'N'], default: 'S' })
  @IsString()
  @IsOptional()
  @IsIn(['S', 'N'])
  ativo?: string;
}

/**
 * DTO para atualizacao de Parametro.
 */
export class AtualizarParametroDto {
  @ApiPropertyOptional({ description: 'Chave do parametro', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  chave?: string;

  @ApiPropertyOptional({ description: 'Valor do parametro', maxLength: 4000 })
  @IsString()
  @IsOptional()
  @MaxLength(4000)
  valor?: string;

  @ApiPropertyOptional({ description: 'Descricao do parametro', maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descricao?: string;

  @ApiPropertyOptional({ description: 'Tipo do parametro', enum: ['STRING', 'NUMBER', 'BOOLEAN', 'JSON'] })
  @IsString()
  @IsOptional()
  @IsIn(['STRING', 'NUMBER', 'BOOLEAN', 'JSON'])
  tipo?: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';

  @ApiPropertyOptional({ description: 'Status ativo', enum: ['S', 'N'] })
  @IsString()
  @IsOptional()
  @IsIn(['S', 'N'])
  ativo?: string;
}

/**
 * DTO de resposta de Parametro.
 */
export class ParametroRespostaDto {
  @ApiProperty({ description: 'Codigo do parametro' })
  codParametro: number;

  @ApiProperty({ description: 'Chave do parametro' })
  chave: string;

  @ApiProperty({ description: 'Valor do parametro (string)' })
  valor: string;

  @ApiProperty({ description: 'Valor do parametro convertido para o tipo' })
  valorTipado: string | number | boolean | object;

  @ApiPropertyOptional({ description: 'Descricao do parametro' })
  descricao?: string;

  @ApiProperty({ description: 'Tipo do parametro', enum: ['STRING', 'NUMBER', 'BOOLEAN', 'JSON'] })
  tipo: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';

  @ApiProperty({ description: 'Se o parametro esta ativo' })
  ativo: boolean;

  @ApiPropertyOptional({ description: 'Data de criacao' })
  dataCriacao?: Date;

  @ApiPropertyOptional({ description: 'Data de alteracao' })
  dataAlteracao?: Date;
}

/**
 * DTO de resposta de listagem de Parametros.
 */
export class ListarParametrosRespostaDto {
  @ApiProperty({ type: [ParametroRespostaDto] })
  parametros: ParametroRespostaDto[];

  @ApiProperty({ description: 'Total de parametros' })
  total: number;
}
