import { Injectable, NotFoundException } from '@nestjs/common';
import { SqlServerService } from '../database/sqlserver.service';
import {
  UserDetailDto,
  UserListDto,
  UserStatsDto,
  UserCompleteDto,
  PartnerCompleteDto,
  EmployeeCompleteDto,
  AccessInfoDto,
  CompanyDto,
  AccessGroupDto,
  EmployeeListDto,
} from './dto/user-detail.dto';

@Injectable()
export class UsersService {
  constructor(private readonly sqlServerService: SqlServerService) {}

  /**
   * Lista todos os usuários com dados completos
   */
  async findAll(): Promise<UserListDto> {
    const query = `
      SELECT
        U.CODUSU, U.NOMEUSU, U.CODFUNC, U.CODPARC, U.CODGRUPO, U.EMAIL as EMAIL_USU, U.DTLIMACESSO,
        P.NOMEPARC, P.TIPPESSOA, P.CGC_CPF, P.TELEFONE, P.EMAIL as EMAIL_PARC,
        F.CODEMP, F.NOMEFUNC, F.SITUACAO, F.DTADM, F.DTDEM
      FROM TSIUSU U WITH (NOLOCK)
      LEFT JOIN TGFPAR P WITH (NOLOCK) ON U.CODPARC = P.CODPARC
      LEFT JOIN TFPFUN F WITH (NOLOCK) ON U.CODPARC = F.CODPARC AND F.DTDEM IS NULL
      ORDER BY U.NOMEUSU
    `;

    const result = await this.sqlServerService.executeSQL(query, []);
    const users = this.mapToUserDetails(result);

    return {
      users,
      total: users.length,
    };
  }

  /**
   * Busca usuário por CODUSU
   */
  async findOne(codusu: number): Promise<UserDetailDto> {
    const query = `
      SELECT
        U.CODUSU, U.NOMEUSU, U.CODFUNC, U.CODPARC, U.CODGRUPO, U.EMAIL as EMAIL_USU, U.DTLIMACESSO,
        P.NOMEPARC, P.TIPPESSOA, P.CGC_CPF, P.TELEFONE, P.EMAIL as EMAIL_PARC,
        F.CODEMP, F.NOMEFUNC, F.SITUACAO, F.DTADM, F.DTDEM
      FROM TSIUSU U WITH (NOLOCK)
      LEFT JOIN TGFPAR P WITH (NOLOCK) ON U.CODPARC = P.CODPARC
      LEFT JOIN TFPFUN F WITH (NOLOCK) ON U.CODPARC = F.CODPARC AND F.DTDEM IS NULL
      WHERE U.CODUSU = @codusu
    `;

    const result = await this.sqlServerService.executeSQL(query, [codusu]);

    if (!result || result.length === 0) {
      throw new NotFoundException(`Usuário ${codusu} não encontrado`);
    }

    return this.mapToUserDetails(result)[0];
  }

  /**
   * Lista apenas usuários com funcionários ativos
   */
  async findActiveEmployees(): Promise<UserListDto> {
    const query = `
      SELECT
        U.CODUSU, U.NOMEUSU, U.CODFUNC, U.CODPARC, U.CODGRUPO, U.EMAIL as EMAIL_USU, U.DTLIMACESSO,
        P.NOMEPARC, P.TIPPESSOA, P.CGC_CPF, P.TELEFONE, P.EMAIL as EMAIL_PARC,
        F.CODEMP, F.NOMEFUNC, F.SITUACAO, F.DTADM, F.DTDEM
      FROM TSIUSU U WITH (NOLOCK)
      LEFT JOIN TGFPAR P WITH (NOLOCK) ON U.CODPARC = P.CODPARC
      INNER JOIN TFPFUN F WITH (NOLOCK) ON U.CODPARC = F.CODPARC AND F.DTDEM IS NULL
      ORDER BY U.NOMEUSU
    `;

    const result = await this.sqlServerService.executeSQL(query, []);
    const users = this.mapToUserDetails(result);

    return {
      users,
      total: users.length,
    };
  }

  /**
   * Lista usuários por empresa
   */
  async findByCompany(codemp: number): Promise<UserListDto> {
    const query = `
      SELECT
        U.CODUSU, U.NOMEUSU, U.CODFUNC, U.CODPARC, U.CODGRUPO, U.EMAIL as EMAIL_USU, U.DTLIMACESSO,
        P.NOMEPARC, P.TIPPESSOA, P.CGC_CPF, P.TELEFONE, P.EMAIL as EMAIL_PARC,
        F.CODEMP, F.NOMEFUNC, F.SITUACAO, F.DTADM, F.DTDEM
      FROM TSIUSU U WITH (NOLOCK)
      LEFT JOIN TGFPAR P WITH (NOLOCK) ON U.CODPARC = P.CODPARC
      INNER JOIN TFPFUN F WITH (NOLOCK) ON U.CODPARC = F.CODPARC
        AND F.DTDEM IS NULL AND F.CODEMP = @codemp
      ORDER BY U.NOMEUSU
    `;

    const result = await this.sqlServerService.executeSQL(query, [codemp]);
    const users = this.mapToUserDetails(result);

    return {
      users,
      total: users.length,
    };
  }

  /**
   * Lista usuários por grupo de acesso
   */
  async findByGroup(codgrupo: number): Promise<UserListDto> {
    const query = `
      SELECT
        U.CODUSU, U.NOMEUSU, U.CODFUNC, U.CODPARC, U.CODGRUPO, U.EMAIL as EMAIL_USU, U.DTLIMACESSO,
        P.NOMEPARC, P.TIPPESSOA, P.CGC_CPF, P.TELEFONE, P.EMAIL as EMAIL_PARC,
        F.CODEMP, F.NOMEFUNC, F.SITUACAO, F.DTADM, F.DTDEM
      FROM TSIUSU U WITH (NOLOCK)
      LEFT JOIN TGFPAR P WITH (NOLOCK) ON U.CODPARC = P.CODPARC
      LEFT JOIN TFPFUN F WITH (NOLOCK) ON U.CODPARC = F.CODPARC AND F.DTDEM IS NULL
      WHERE U.CODGRUPO = @codgrupo
      ORDER BY U.NOMEUSU
    `;

    const result = await this.sqlServerService.executeSQL(query, [codgrupo]);
    const users = this.mapToUserDetails(result);

    return {
      users,
      total: users.length,
    };
  }

  /**
   * Retorna estatísticas gerais dos usuários
   */
  async getStats(): Promise<UserStatsDto> {
    const allUsers = await this.findAll();
    const users = allUsers.users;

    const byCompany: Record<number, number> = {};
    const byGroup: Record<number, number> = {};

    let activeEmployees = 0;
    let withEmail = 0;
    let activeAccess = 0;
    let expiredAccess = 0;
    let noAccessLimit = 0;

    users.forEach((user) => {
      // Contagem por empresa
      if (user.employee?.codemp) {
        byCompany[user.employee.codemp] = (byCompany[user.employee.codemp] || 0) + 1;
      }

      // Contagem por grupo
      if (user.codgrupo) {
        byGroup[user.codgrupo] = (byGroup[user.codgrupo] || 0) + 1;
      }

      // Funcionários ativos
      if (user.hasActiveEmployee) {
        activeEmployees++;
      }

      // Email
      if (user.email || user.partner?.email) {
        withEmail++;
      }

      // Status de acesso baseado em DTLIMACESSO
      if (user.accountStatus === 'ATIVO') {
        activeAccess++;
      } else if (user.accountStatus === 'EXPIRADO') {
        expiredAccess++;
      } else {
        noAccessLimit++;
      }
    });

    return {
      totalUsers: users.length,
      activeEmployees,
      withoutActiveEmployee: users.length - activeEmployees,
      activeAccess,
      expiredAccess,
      noAccessLimit,
      byCompany,
      byGroup,
      withEmail,
      withoutEmail: users.length - withEmail,
    };
  }

  /**
   * Busca usuário com TODOS os relacionamentos completos
   */
  async findOneComplete(codusu: number): Promise<UserCompleteDto> {
    const query = `
      SELECT
        U.CODUSU, U.NOMEUSU, U.CODFUNC, U.CODPARC, U.CODGRUPO, U.EMAIL, U.DTLIMACESSO,
        P.NOMEPARC, P.RAZAOSOCIAL, P.TIPPESSOA, P.CGC_CPF, P.TELEFONE, P.EMAIL as EMAIL_PARC,
        P.CLIENTE, P.FORNECEDOR, P.LIMCRED,
        F.CODEMP, F.NOMEFUNC, F.SITUACAO, F.DTADM, F.DTDEM,
        E.NOMEFANTASIA, E.RAZAOSOCIAL as RAZAOSOCIAL_EMP, E.CGC as CGC_EMP
      FROM TSIUSU U WITH (NOLOCK)
      LEFT JOIN TGFPAR P WITH (NOLOCK) ON U.CODPARC = P.CODPARC
      LEFT JOIN TFPFUN F WITH (NOLOCK) ON U.CODPARC = F.CODPARC AND F.DTDEM IS NULL
      LEFT JOIN TSIEMP E WITH (NOLOCK) ON F.CODEMP = E.CODEMP
      WHERE U.CODUSU = @param1
    `;

    const result = await this.sqlServerService.executeSQL(query, [codusu]);

    if (!result || result.length === 0) {
      throw new NotFoundException(`Usuário ${codusu} não encontrado`);
    }

    return this.mapToUserComplete(result[0]);
  }

  /**
   * Busca parceiro do usuário
   */
  async findPartner(codusu: number): Promise<PartnerCompleteDto> {
    const query = `
      SELECT
        P.CODPARC, P.NOMEPARC, P.RAZAOSOCIAL, P.TIPPESSOA, P.CGC_CPF,
        P.TELEFONE, P.EMAIL, P.CLIENTE, P.FORNECEDOR, P.LIMCRED
      FROM TSIUSU U WITH (NOLOCK)
      INNER JOIN TGFPAR P WITH (NOLOCK) ON U.CODPARC = P.CODPARC
      WHERE U.CODUSU = @param1
    `;

    const result = await this.sqlServerService.executeSQL(query, [codusu]);

    if (!result || result.length === 0) {
      throw new NotFoundException(`Parceiro não encontrado para o usuário ${codusu}`);
    }

    return this.mapToPartnerComplete(result[0]);
  }

  /**
   * Busca funcionário ativo do usuário
   */
  async findEmployee(codusu: number): Promise<EmployeeCompleteDto> {
    const query = `
      SELECT
        F.CODEMP, F.CODFUNC, F.NOMEFUNC, F.SITUACAO, F.DTADM, F.DTDEM,
        E.NOMEFANTASIA, E.RAZAOSOCIAL, E.CGC
      FROM TSIUSU U WITH (NOLOCK)
      INNER JOIN TFPFUN F WITH (NOLOCK) ON U.CODPARC = F.CODPARC AND F.DTDEM IS NULL
      INNER JOIN TSIEMP E WITH (NOLOCK) ON F.CODEMP = E.CODEMP
      WHERE U.CODUSU = @param1
    `;

    const result = await this.sqlServerService.executeSQL(query, [codusu]);

    if (!result || result.length === 0) {
      throw new NotFoundException(`Funcionário ativo não encontrado para o usuário ${codusu}`);
    }

    return this.mapToEmployeeComplete(result[0]);
  }

  /**
   * Busca TODOS os vínculos de funcionário do usuário (histórico)
   */
  async findEmployees(codusu: number): Promise<EmployeeListDto> {
    const query = `
      SELECT
        F.CODEMP, F.CODFUNC, F.NOMEFUNC, F.SITUACAO, F.DTADM, F.DTDEM,
        E.NOMEFANTASIA, E.RAZAOSOCIAL, E.CGC
      FROM TSIUSU U WITH (NOLOCK)
      INNER JOIN TFPFUN F WITH (NOLOCK) ON U.CODPARC = F.CODPARC
      INNER JOIN TSIEMP E WITH (NOLOCK) ON F.CODEMP = E.CODEMP
      WHERE U.CODUSU = @param1
      ORDER BY F.DTADM DESC
    `;

    const result = await this.sqlServerService.executeSQL(query, [codusu]);

    if (!result || result.length === 0) {
      throw new NotFoundException(`Nenhum vínculo de funcionário encontrado para o usuário ${codusu}`);
    }

    const employees = result.map((row) => this.mapToEmployeeComplete(row));

    return {
      employees,
      total: employees.length,
    };
  }

  /**
   * Busca informações de acesso do usuário
   */
  async findAccessInfo(codusu: number): Promise<AccessInfoDto> {
    const query = `
      SELECT
        U.CODGRUPO, U.EMAIL, U.DTLIMACESSO
      FROM TSIUSU U WITH (NOLOCK)
      WHERE U.CODUSU = @param1
    `;

    const result = await this.sqlServerService.executeSQL(query, [codusu]);

    if (!result || result.length === 0) {
      throw new NotFoundException(`Usuário ${codusu} não encontrado`);
    }

    return this.mapToAccessInfo(result[0]);
  }

  /**
   * Busca empresa do usuário (via funcionário ativo)
   */
  async findCompany(codusu: number): Promise<CompanyDto> {
    const query = `
      SELECT
        E.CODEMP, E.NOMEFANTASIA, E.RAZAOSOCIAL, E.CGC
      FROM TSIUSU U WITH (NOLOCK)
      INNER JOIN TFPFUN F WITH (NOLOCK) ON U.CODPARC = F.CODPARC AND F.DTDEM IS NULL
      INNER JOIN TSIEMP E WITH (NOLOCK) ON F.CODEMP = E.CODEMP
      WHERE U.CODUSU = @param1
    `;

    const result = await this.sqlServerService.executeSQL(query, [codusu]);

    if (!result || result.length === 0) {
      throw new NotFoundException(
        `Empresa não encontrada para o usuário ${codusu}. Verifique se o usuário tem um funcionário ativo.`,
      );
    }

    return this.mapToCompany(result[0]);
  }

  /**
   * Busca grupo de acesso do usuário
   */
  async findAccessGroup(codusu: number): Promise<AccessGroupDto> {
    const query = `
      SELECT
        U.CODGRUPO
      FROM TSIUSU U WITH (NOLOCK)
      WHERE U.CODUSU = @param1
    `;

    const result = await this.sqlServerService.executeSQL(query, [codusu]);

    if (!result || result.length === 0) {
      throw new NotFoundException(`Grupo de acesso não encontrado para o usuário ${codusu}`);
    }

    return this.mapToAccessGroup(result[0]);
  }

  /**
   * Mapeia resultado da query para DTO
   */
  private mapToUserDetails(rows: any[]): UserDetailDto[] {
    return rows.map((row) => {
      // Calcula o status do acesso baseado em DTLIMACESSO
      let accountStatus: 'ATIVO' | 'EXPIRADO' | 'SEM_LIMITE' = 'SEM_LIMITE';
      if (row.DTLIMACESSO) {
        const accessLimitDate = new Date(row.DTLIMACESSO);
        accountStatus = accessLimitDate.getTime() < Date.now() ? 'EXPIRADO' : 'ATIVO';
      }

      const user: UserDetailDto = {
        codusu: row.CODUSU,
        nomeusu: row.NOMEUSU,
        codfunc: row.CODFUNC,
        codparc: row.CODPARC,
        codgrupo: row.CODGRUPO,
        email: row.EMAIL_USU,
        dtlimacesso: row.DTLIMACESSO,
        accountStatus,
        hasActiveEmployee: false,
      };

      // Dados do parceiro
      if (row.CODPARC && row.NOMEPARC) {
        user.partner = {
          codparc: row.CODPARC,
          nomeparc: row.NOMEPARC,
          tippessoa: row.TIPPESSOA,
          cgc_cpf: row.CGC_CPF,
          telefone: row.TELEFONE,
          email: row.EMAIL_PARC,
        };
      }

      // Dados do funcionário (apenas se ativo)
      if (row.CODEMP && row.NOMEFUNC) {
        user.employee = {
          codemp: row.CODEMP,
          codfunc: row.CODFUNC,
          nomefunc: row.NOMEFUNC,
          situacao: row.SITUACAO,
          dtadm: row.DTADM,
          dtdem: row.DTDEM,
          status: row.DTDEM ? 'DEMITIDO' : 'ATIVO',
        };
        user.hasActiveEmployee = !row.DTDEM;
      }

      return user;
    });
  }

  /**
   * Mapeia para UserCompleteDto com todos os relacionamentos
   */
  private mapToUserComplete(row: any): UserCompleteDto {
    const accountStatus = this.calculateAccountStatus(row.DTLIMACESSO);

    const user: UserCompleteDto = {
      codusu: row.CODUSU,
      nomeusu: row.NOMEUSU,
      codfunc: row.CODFUNC,
      codparc: row.CODPARC,
      codgrupo: row.CODGRUPO,
      email: row.EMAIL,
      dtlimacesso: row.DTLIMACESSO,
      accountStatus,
      hasActiveEmployee: false,
    };

    // Dados completos do parceiro
    if (row.CODPARC && row.NOMEPARC) {
      user.partner = {
        codparc: row.CODPARC,
        nomeparc: row.NOMEPARC,
        tippessoa: row.TIPPESSOA,
        cgc_cpf: row.CGC_CPF,
        telefone: row.TELEFONE,
        email: row.EMAIL_PARC,
        razaosocial: row.RAZAOSOCIAL,
        cliente: row.CLIENTE,
        fornecedor: row.FORNECEDOR,
        limcred: row.LIMCRED,
      };
    }

    // Dados do funcionário ativo
    if (row.CODEMP && row.NOMEFUNC) {
      user.employee = {
        codemp: row.CODEMP,
        codfunc: row.CODFUNC,
        nomefunc: row.NOMEFUNC,
        situacao: row.SITUACAO,
        dtadm: row.DTADM,
        dtdem: row.DTDEM,
        status: row.DTDEM ? 'DEMITIDO' : 'ATIVO',
      };
      user.hasActiveEmployee = !row.DTDEM;
    }

    // Dados da empresa
    if (row.CODEMP && row.NOMEFANTASIA) {
      user.company = {
        codemp: row.CODEMP,
        nomefantasia: row.NOMEFANTASIA,
        razaosocial: row.RAZAOSOCIAL_EMP,
        cgc: row.CGC_EMP,
      };
    }

    // Dados do grupo de acesso
    if (row.CODGRUPO) {
      user.accessGroup = {
        codgrupo: row.CODGRUPO,
      };
    }

    return user;
  }

  /**
   * Mapeia para PartnerCompleteDto
   */
  private mapToPartnerComplete(row: any): PartnerCompleteDto {
    return {
      codparc: row.CODPARC,
      nomeparc: row.NOMEPARC,
      tippessoa: row.TIPPESSOA,
      cgc_cpf: row.CGC_CPF,
      telefone: row.TELEFONE,
      email: row.EMAIL,
      razaosocial: row.RAZAOSOCIAL,
      cliente: row.CLIENTE,
      fornecedor: row.FORNECEDOR,
      limcred: row.LIMCRED,
    };
  }

  /**
   * Mapeia para EmployeeCompleteDto
   */
  private mapToEmployeeComplete(row: any): EmployeeCompleteDto {
    return {
      codemp: row.CODEMP,
      codfunc: row.CODFUNC,
      nomefunc: row.NOMEFUNC,
      situacao: row.SITUACAO,
      dtadm: row.DTADM,
      dtdem: row.DTDEM,
      status: row.DTDEM ? 'DEMITIDO' : 'ATIVO',
    };
  }

  /**
   * Mapeia para CompanyDto
   */
  private mapToCompany(row: any): CompanyDto {
    return {
      codemp: row.CODEMP,
      nomefantasia: row.NOMEFANTASIA,
      razaosocial: row.RAZAOSOCIAL,
      cgc: row.CGC,
    };
  }

  /**
   * Mapeia para AccessGroupDto
   */
  private mapToAccessGroup(row: any): AccessGroupDto {
    return {
      codgrupo: row.CODGRUPO,
    };
  }

  /**
   * Mapeia para AccessInfoDto
   */
  private mapToAccessInfo(row: any): AccessInfoDto {
    const accountStatus = this.calculateAccountStatus(row.DTLIMACESSO);

    const accessInfo: AccessInfoDto = {
      codgrupo: row.CODGRUPO,
      email: row.EMAIL,
      dtlimacesso: row.DTLIMACESSO,
      accountStatus,
    };

    return accessInfo;
  }

  /**
   * Calcula o status do acesso baseado em DTLIMACESSO
   */
  private calculateAccountStatus(dtlimacesso: Date | null): 'ATIVO' | 'EXPIRADO' | 'SEM_LIMITE' {
    if (!dtlimacesso) {
      return 'SEM_LIMITE';
    }
    const accessLimitDate = new Date(dtlimacesso);
    return accessLimitDate.getTime() < Date.now() ? 'EXPIRADO' : 'ATIVO';
  }
}
