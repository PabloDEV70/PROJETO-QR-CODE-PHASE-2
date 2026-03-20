import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de resposta para verificação de permissão de escrita.
 */
export class VerificarPermissaoRespostaDto {
  @ApiProperty({ description: 'Código do usuário' })
  codUsuario: number;

  @ApiProperty({ description: 'Nome da tabela' })
  tabela: string;

  @ApiProperty({ description: 'Operação (I, U, D, S)' })
  operacao: string;

  @ApiProperty({ description: 'Se a operação é permitida' })
  permitido: boolean;

  @ApiProperty({ description: 'Motivo da decisão' })
  motivo: string;

  @ApiPropertyOptional({ description: 'Condição RLS aplicável' })
  condicaoRLS?: string | null;

  @ApiProperty({ description: 'Se requer aprovação' })
  requerAprovacao: boolean;

  @ApiPropertyOptional({ description: 'Nome da role aplicada (se via role)' })
  roleAplicada?: string | null;
}

/**
 * DTO de permissão individual para resposta da API.
 */
export class PermissaoEscritaItemDto {
  @ApiProperty({ description: 'ID da permissão' })
  permissaoId: number;

  @ApiProperty({ description: 'Nome da tabela' })
  tabela: string;

  @ApiProperty({ description: 'Sigla da operação (I, U, D, S)' })
  operacao: string;

  @ApiProperty({ description: 'Descrição da operação' })
  operacaoDescricao: string;

  @ApiPropertyOptional({ description: 'Condição RLS' })
  condicaoRLS: string | null;

  @ApiProperty({ description: 'Se está ativa' })
  ativa: boolean;

  @ApiPropertyOptional({ description: 'Descrição da permissão' })
  descricao: string | null;

  @ApiProperty({ description: 'Se requer aprovação' })
  requerAprovacao: boolean;

  @ApiPropertyOptional({ description: 'Data de validade' })
  dataValidade: Date | null;

  @ApiProperty({ description: 'Tipo: DIRETA ou VIA_ROLE' })
  tipoPermissao: 'DIRETA' | 'VIA_ROLE';

  @ApiPropertyOptional({ description: 'Nome da role (se VIA_ROLE)' })
  roleNome?: string;
}

/**
 * DTO de role para resposta da API.
 */
export class RoleItemDto {
  @ApiProperty({ description: 'ID da role' })
  roleId: number;

  @ApiProperty({ description: 'Nome da role' })
  nome: string;

  @ApiPropertyOptional({ description: 'Descrição da role' })
  descricao: string | null;

  @ApiProperty({ description: 'Se está ativa' })
  ativa: boolean;
}

/**
 * DTO de resposta com permissões do usuário.
 */
export class PermissoesUsuarioRespostaDto {
  @ApiProperty({ description: 'Código do usuário' })
  codUsuario: number;

  @ApiProperty({ description: 'Lista de permissões', type: [PermissaoEscritaItemDto] })
  permissoes: PermissaoEscritaItemDto[];

  @ApiProperty({ description: 'Roles do usuário', type: [RoleItemDto] })
  roles: RoleItemDto[];

  @ApiProperty({ description: 'Total de permissões' })
  totalPermissoes: number;

  @ApiProperty({ description: 'Total de roles' })
  totalRoles: number;

  @ApiProperty({ description: 'Resumo de operações por tabela' })
  resumoPorTabela: Record<string, string[]>;
}

/**
 * DTO para verificar múltiplas permissões.
 */
export class VerificarMultiplasPermissoesDto {
  @ApiProperty({ description: 'Lista de verificações', type: [VerificarPermissaoRespostaDto] })
  verificacoes: VerificarPermissaoRespostaDto[];

  @ApiProperty({ description: 'Total de verificações' })
  total: number;

  @ApiProperty({ description: 'Total de permitidas' })
  totalPermitidas: number;

  @ApiProperty({ description: 'Total de negadas' })
  totalNegadas: number;
}
