import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para dados do parceiro (TGFPAR) - versão básica
 */
export class PartnerDto {
  @ApiProperty({ description: 'Código do parceiro' })
  codparc: number;

  @ApiProperty({ description: 'Nome do parceiro' })
  nomeparc: string;

  @ApiProperty({ description: 'Tipo de pessoa (F=Física, J=Jurídica)' })
  tippessoa: string;

  @ApiProperty({ description: 'CPF ou CNPJ' })
  cgc_cpf: string;

  @ApiProperty({ description: 'Telefone', required: false })
  telefone?: string;

  @ApiProperty({ description: 'Email do parceiro', required: false })
  email?: string;
}

/**
 * DTO completo para dados do parceiro (TGFPAR) - todos os campos
 */
export class PartnerCompleteDto extends PartnerDto {
  @ApiProperty({ description: 'Razão social / Nome empresarial', required: false })
  razaosocial?: string;

  @ApiProperty({ description: 'Indicador se é cliente (S/N)', required: false })
  cliente?: string;

  @ApiProperty({ description: 'Indicador se é fornecedor (S/N)', required: false })
  fornecedor?: string;

  @ApiProperty({ description: 'Limite de crédito', required: false })
  limcred?: number;

  @ApiProperty({ description: 'Código do endereço', required: false })
  codend?: number;

  @ApiProperty({ description: 'Código do bairro', required: false })
  codbai?: number;

  @ApiProperty({ description: 'Código da cidade', required: false })
  codcid?: number;

  @ApiProperty({ description: 'CEP', required: false })
  cep?: string;
}

/**
 * DTO para dados do funcionário (TFPFUN) - versão completa
 */
export class EmployeeDto {
  @ApiProperty({ description: 'Código da empresa' })
  codemp: number;

  @ApiProperty({ description: 'Código do funcionário' })
  codfunc: number;

  @ApiProperty({ description: 'Nome do funcionário' })
  nomefunc: string;

  @ApiProperty({ description: 'Situação (1=Ativo, 0=Demitido, etc)' })
  situacao: string;

  @ApiProperty({ description: 'Data de admissão' })
  dtadm: Date;

  @ApiProperty({ description: 'Data de demissão', required: false })
  dtdem?: Date;

  @ApiProperty({ description: 'Status calculado', enum: ['ATIVO', 'DEMITIDO'] })
  status: 'ATIVO' | 'DEMITIDO';
}

/**
 * DTO para dados completos do funcionário (TFPFUN) - alias para compatibilidade
 */
export class EmployeeCompleteDto extends EmployeeDto {}

/**
 * DTO para dados da empresa (TSIEMP)
 */
export class CompanyDto {
  @ApiProperty({ description: 'Código da empresa' })
  codemp: number;

  @ApiProperty({ description: 'Nome fantasia da empresa' })
  nomefantasia: string;

  @ApiProperty({ description: 'Razão social da empresa' })
  razaosocial: string;

  @ApiProperty({ description: 'CNPJ da empresa', required: false })
  cgc?: string;
}

/**
 * DTO para dados do grupo de acesso (TSIGRUPO)
 * Note: TSIGRUPO table doesn't exist - only CODGRUPO is available from TSIUSU
 */
export class AccessGroupDto {
  @ApiProperty({ description: 'Código do grupo de acesso' })
  codgrupo: number;

  @ApiProperty({ description: 'Nome do grupo de acesso', required: false })
  nomegrupo?: string;

  @ApiProperty({ description: 'Descrição do grupo', required: false })
  descricao?: string;

  @ApiProperty({ description: 'Status ativo do grupo', enum: ['S', 'N'], required: false })
  ativo?: 'S' | 'N';
}

/**
 * DTO para dados básicos do usuário (TSIUSU)
 */
export class UserBasicDto {
  @ApiProperty({ description: 'Código do usuário' })
  codusu: number;

  @ApiProperty({ description: 'Nome de usuário' })
  nomeusu: string;

  @ApiProperty({ description: 'Código do funcionário vinculado', required: false })
  codfunc?: number;

  @ApiProperty({ description: 'Código do parceiro vinculado', required: false })
  codparc?: number;

  @ApiProperty({ description: 'Código do grupo de acesso', required: false })
  codgrupo?: number;

  @ApiProperty({ description: 'Email do usuário', required: false })
  email?: string;

  @ApiProperty({
    description:
      'Data limite de acesso do usuário. Se NULL, usuário não tem limite. Se menor que data atual, acesso expirado.',
    required: false,
    type: Date,
  })
  dtlimacesso?: Date;

  @ApiProperty({
    description: 'Status calculado do acesso do usuário baseado em DTLIMACESSO',
    enum: ['ATIVO', 'EXPIRADO', 'SEM_LIMITE'],
  })
  accountStatus: 'ATIVO' | 'EXPIRADO' | 'SEM_LIMITE';
}

/**
 * DTO completo do usuário com todos os vínculos - versão básica
 */
export class UserDetailDto extends UserBasicDto {
  @ApiProperty({ description: 'Dados do parceiro vinculado', required: false, type: PartnerDto })
  partner?: PartnerDto;

  @ApiProperty({ description: 'Dados do funcionário ativo', required: false, type: EmployeeDto })
  employee?: EmployeeDto;

  @ApiProperty({ description: 'Indica se o usuário tem funcionário ativo' })
  hasActiveEmployee: boolean;
}

/**
 * DTO completo do usuário com todos os relacionamentos expandidos
 */
export class UserCompleteDto extends UserBasicDto {
  @ApiProperty({ description: 'Dados completos do parceiro vinculado', required: false, type: PartnerCompleteDto })
  partner?: PartnerCompleteDto;

  @ApiProperty({ description: 'Dados completos do funcionário ativo', required: false, type: EmployeeCompleteDto })
  employee?: EmployeeCompleteDto;

  @ApiProperty({ description: 'Dados da empresa do funcionário', required: false, type: CompanyDto })
  company?: CompanyDto;

  @ApiProperty({ description: 'Dados do grupo de acesso', required: false, type: AccessGroupDto })
  accessGroup?: AccessGroupDto;

  @ApiProperty({ description: 'Indica se o usuário tem funcionário ativo' })
  hasActiveEmployee: boolean;
}

/**
 * DTO para lista de usuários
 */
export class UserListDto {
  @ApiProperty({ description: 'Lista de usuários', type: [UserDetailDto] })
  users: UserDetailDto[];

  @ApiProperty({ description: 'Total de usuários' })
  total: number;
}

/**
 * DTO para estatísticas
 */
export class UserStatsDto {
  @ApiProperty({ description: 'Total de usuários' })
  totalUsers: number;

  @ApiProperty({ description: 'Usuários com funcionário ativo' })
  activeEmployees: number;

  @ApiProperty({ description: 'Usuários sem funcionário ativo' })
  withoutActiveEmployee: number;

  @ApiProperty({ description: 'Usuários com acesso ativo (DTLIMACESSO >= hoje ou NULL)' })
  activeAccess: number;

  @ApiProperty({ description: 'Usuários com acesso expirado (DTLIMACESSO < hoje)' })
  expiredAccess: number;

  @ApiProperty({ description: 'Usuários sem limite de acesso (DTLIMACESSO IS NULL)' })
  noAccessLimit: number;

  @ApiProperty({ description: 'Distribuição por empresa', type: Object })
  byCompany: Record<number, number>;

  @ApiProperty({ description: 'Distribuição por grupo', type: Object })
  byGroup: Record<number, number>;

  @ApiProperty({ description: 'Usuários com email' })
  withEmail: number;

  @ApiProperty({ description: 'Usuários sem email' })
  withoutEmail: number;
}

/**
 * DTO para informações de acesso do usuário
 */
export class AccessInfoDto {
  @ApiProperty({ description: 'Código do grupo de acesso', required: false })
  codgrupo?: number;

  @ApiProperty({ description: 'Email do usuário', required: false })
  email?: string;

  @ApiProperty({ description: 'Data limite de acesso', required: false })
  dtlimacesso?: Date;

  @ApiProperty({ description: 'Status de acesso', enum: ['ATIVO', 'EXPIRADO', 'SEM_LIMITE'] })
  accountStatus: 'ATIVO' | 'EXPIRADO' | 'SEM_LIMITE';
}

/**
 * DTO para lista de funcionários (histórico)
 */
export class EmployeeListDto {
  @ApiProperty({ description: 'Lista de funcionários', type: [EmployeeDto] })
  employees: EmployeeDto[];

  @ApiProperty({ description: 'Total de registros' })
  total: number;
}
