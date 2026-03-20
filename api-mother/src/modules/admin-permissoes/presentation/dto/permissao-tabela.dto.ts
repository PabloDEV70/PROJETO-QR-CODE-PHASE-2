import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, MaxLength, IsIn, IsPositive } from 'class-validator';
import { TipoOperacao } from '../../domain/entities/permissao-tabela.entity';

/**
 * DTO para criacao de Permissao de Tabela.
 */
export class CriarPermissaoTabelaDto {
  @ApiProperty({ description: 'Codigo da role' })
  @IsNumber()
  @IsPositive()
  codRole: number;

  @ApiProperty({ description: 'Nome da tabela', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  nomeTabela: string;

  @ApiProperty({ description: 'Tipo de operacao', enum: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] })
  @IsString()
  @IsIn(['SELECT', 'INSERT', 'UPDATE', 'DELETE'])
  operacao: TipoOperacao;

  @ApiPropertyOptional({ description: 'Se a operacao e permitida', enum: ['S', 'N'], default: 'S' })
  @IsString()
  @IsOptional()
  @IsIn(['S', 'N'])
  permitido?: string;

  @ApiPropertyOptional({ description: 'Condicao RLS (Row Level Security)' })
  @IsString()
  @IsOptional()
  condicaoRls?: string;

  @ApiPropertyOptional({ description: 'Campos permitidos (separados por virgula)' })
  @IsString()
  @IsOptional()
  camposPermitidos?: string;

  @ApiPropertyOptional({ description: 'Campos restritos (separados por virgula)' })
  @IsString()
  @IsOptional()
  camposRestritos?: string;
}

/**
 * DTO para atualizacao de Permissao de Tabela.
 */
export class AtualizarPermissaoTabelaDto {
  @ApiPropertyOptional({ description: 'Codigo da role' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  codRole?: number;

  @ApiPropertyOptional({ description: 'Nome da tabela', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nomeTabela?: string;

  @ApiPropertyOptional({ description: 'Tipo de operacao', enum: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] })
  @IsString()
  @IsOptional()
  @IsIn(['SELECT', 'INSERT', 'UPDATE', 'DELETE'])
  operacao?: TipoOperacao;

  @ApiPropertyOptional({ description: 'Se a operacao e permitida', enum: ['S', 'N'] })
  @IsString()
  @IsOptional()
  @IsIn(['S', 'N'])
  permitido?: string;

  @ApiPropertyOptional({ description: 'Condicao RLS (Row Level Security)' })
  @IsString()
  @IsOptional()
  condicaoRls?: string;

  @ApiPropertyOptional({ description: 'Campos permitidos (separados por virgula)' })
  @IsString()
  @IsOptional()
  camposPermitidos?: string;

  @ApiPropertyOptional({ description: 'Campos restritos (separados por virgula)' })
  @IsString()
  @IsOptional()
  camposRestritos?: string;
}

/**
 * DTO de resposta de Permissao de Tabela.
 */
export class PermissaoTabelaRespostaDto {
  @ApiProperty({ description: 'Codigo da permissao' })
  codPermissao: number;

  @ApiProperty({ description: 'Codigo da role' })
  codRole: number;

  @ApiProperty({ description: 'Nome da tabela' })
  nomeTabela: string;

  @ApiProperty({ description: 'Tipo de operacao', enum: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] })
  operacao: TipoOperacao;

  @ApiProperty({ description: 'Se a operacao e permitida' })
  permitido: boolean;

  @ApiPropertyOptional({ description: 'Condicao RLS' })
  condicaoRls?: string;

  @ApiPropertyOptional({ description: 'Campos permitidos', type: [String] })
  camposPermitidos?: string[];

  @ApiPropertyOptional({ description: 'Campos restritos', type: [String] })
  camposRestritos?: string[];

  @ApiPropertyOptional({ description: 'Data de criacao' })
  dataCriacao?: Date;

  @ApiPropertyOptional({ description: 'Data de alteracao' })
  dataAlteracao?: Date;
}

/**
 * DTO de resposta de listagem de Permissoes.
 */
export class ListarPermissoesTabelaRespostaDto {
  @ApiProperty({ type: [PermissaoTabelaRespostaDto] })
  permissoes: PermissaoTabelaRespostaDto[];

  @ApiProperty({ description: 'Total de permissoes' })
  total: number;
}
