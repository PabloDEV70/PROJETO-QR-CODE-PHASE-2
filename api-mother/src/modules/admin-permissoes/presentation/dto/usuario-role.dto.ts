import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

/**
 * DTO para associar usuario a role.
 */
export class AssociarUsuarioRoleDto {
  @ApiProperty({ description: 'Codigo do usuario' })
  @IsNumber()
  @IsPositive()
  codUsuario: number;

  @ApiProperty({ description: 'Codigo da role' })
  @IsNumber()
  @IsPositive()
  codRole: number;
}

/**
 * DTO de resposta de associacao Usuario-Role.
 */
export class UsuarioRoleRespostaDto {
  @ApiProperty({ description: 'Codigo do usuario' })
  codUsuario: number;

  @ApiProperty({ description: 'Codigo da role' })
  codRole: number;

  @ApiPropertyOptional({ description: 'Nome do usuario' })
  nomeUsuario?: string;

  @ApiPropertyOptional({ description: 'Nome da role' })
  nomeRole?: string;

  @ApiPropertyOptional({ description: 'Data de associacao' })
  dataAssociacao?: Date;

  @ApiProperty({ description: 'Se a associacao esta ativa' })
  ativo: boolean;
}

/**
 * DTO de resposta de listagem de associacoes.
 */
export class ListarUsuariosRoleRespostaDto {
  @ApiProperty({ type: [UsuarioRoleRespostaDto] })
  associacoes: UsuarioRoleRespostaDto[];

  @ApiProperty({ description: 'Total de associacoes' })
  total: number;
}

/**
 * DTO de resposta de operacao de associacao.
 */
export class AssociacaoRespostaDto {
  @ApiProperty({ description: 'Codigo do usuario' })
  codUsuario: number;

  @ApiProperty({ description: 'Codigo da role' })
  codRole: number;

  @ApiPropertyOptional({ description: 'Nome da role' })
  nomeRole?: string;

  @ApiProperty({ description: 'Data de associacao' })
  dataAssociacao: Date;

  @ApiProperty({ description: 'Mensagem de sucesso' })
  mensagem: string;
}
