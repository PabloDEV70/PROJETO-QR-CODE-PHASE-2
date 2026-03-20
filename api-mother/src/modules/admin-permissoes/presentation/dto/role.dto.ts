import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsIn } from 'class-validator';

/**
 * DTO para criacao de Role.
 */
export class CriarRoleDto {
  @ApiProperty({ description: 'Nome da role', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  nomeRole: string;

  @ApiPropertyOptional({ description: 'Descricao da role', maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descricao?: string;

  @ApiPropertyOptional({ description: 'Status ativo', enum: ['S', 'N'], default: 'S' })
  @IsString()
  @IsOptional()
  @IsIn(['S', 'N'])
  ativo?: string;
}

/**
 * DTO para atualizacao de Role.
 */
export class AtualizarRoleDto {
  @ApiPropertyOptional({ description: 'Nome da role', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nomeRole?: string;

  @ApiPropertyOptional({ description: 'Descricao da role', maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descricao?: string;

  @ApiPropertyOptional({ description: 'Status ativo', enum: ['S', 'N'] })
  @IsString()
  @IsOptional()
  @IsIn(['S', 'N'])
  ativo?: string;
}

/**
 * DTO de resposta de Role.
 */
export class RoleRespostaDto {
  @ApiProperty({ description: 'Codigo da role' })
  codRole: number;

  @ApiProperty({ description: 'Nome da role' })
  nomeRole: string;

  @ApiPropertyOptional({ description: 'Descricao da role' })
  descricao?: string;

  @ApiProperty({ description: 'Se a role esta ativa' })
  ativo: boolean;

  @ApiPropertyOptional({ description: 'Data de criacao' })
  dataCriacao?: Date;

  @ApiPropertyOptional({ description: 'Data de alteracao' })
  dataAlteracao?: Date;
}

/**
 * DTO de resposta de listagem de Roles.
 */
export class ListarRolesRespostaDto {
  @ApiProperty({ type: [RoleRespostaDto] })
  roles: RoleRespostaDto[];

  @ApiProperty({ description: 'Total de roles' })
  total: number;
}
