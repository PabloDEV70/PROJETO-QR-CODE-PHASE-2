import { Injectable } from '@nestjs/common';
import { SqlServerService } from '../../../../database/sqlserver.service';
import { IRepositorioRole } from '../../domain/repositories/role.repository.interface';
import { Role } from '../../domain/entities/role.entity';

interface RoleCru {
  CODROLE: number;
  NOMEROLE: string;
  DESCRICAO?: string;
  ATIVO: string;
  DTCRIACAO?: Date;
  DTALTERACAO?: Date;
}

/**
 * Implementacao do repositorio de Roles usando SQL Server.
 *
 * Tabela: AD_APIROLE
 */
@Injectable()
export class SankhyaRoleRepository implements IRepositorioRole {
  constructor(private readonly sqlServer: SqlServerService) {}

  async buscarTodas(): Promise<Role[]> {
    const sql = `
      SELECT CODROLE, NOMEROLE, DESCRICAO, ATIVO, DTCRIACAO, DTALTERACAO
      FROM AD_APIROLE
      ORDER BY NOMEROLE
    `;
    const resultado = await this.sqlServer.executeSQL(sql, []);
    return (resultado as RoleCru[]).map((r) => this.paraDominio(r));
  }

  async buscarAtivas(): Promise<Role[]> {
    const sql = `
      SELECT CODROLE, NOMEROLE, DESCRICAO, ATIVO, DTCRIACAO, DTALTERACAO
      FROM AD_APIROLE
      WHERE ATIVO = 'S'
      ORDER BY NOMEROLE
    `;
    const resultado = await this.sqlServer.executeSQL(sql, []);
    return (resultado as RoleCru[]).map((r) => this.paraDominio(r));
  }

  async buscarPorCodigo(codRole: number): Promise<Role | null> {
    const sql = `
      SELECT CODROLE, NOMEROLE, DESCRICAO, ATIVO, DTCRIACAO, DTALTERACAO
      FROM AD_APIROLE
      WHERE CODROLE = @param1
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [codRole]);
    if (!resultado || resultado.length === 0) {
      return null;
    }
    return this.paraDominio(resultado[0] as RoleCru);
  }

  async buscarPorNome(nomeRole: string): Promise<Role | null> {
    const sql = `
      SELECT CODROLE, NOMEROLE, DESCRICAO, ATIVO, DTCRIACAO, DTALTERACAO
      FROM AD_APIROLE
      WHERE NOMEROLE = @param1
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [nomeRole]);
    if (!resultado || resultado.length === 0) {
      return null;
    }
    return this.paraDominio(resultado[0] as RoleCru);
  }

  async criar(role: Role): Promise<Role> {
    const sql = `
      INSERT INTO AD_APIROLE (NOMEROLE, DESCRICAO, ATIVO, DTCRIACAO)
      OUTPUT INSERTED.CODROLE, INSERTED.NOMEROLE, INSERTED.DESCRICAO, INSERTED.ATIVO, INSERTED.DTCRIACAO
      VALUES (@param1, @param2, @param3, GETDATE())
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [
      role.nomeRole,
      role.descricao || null,
      role.ativo ? 'S' : 'N',
    ]);
    return this.paraDominio(resultado[0] as RoleCru);
  }

  async atualizar(role: Role): Promise<Role> {
    const sql = `
      UPDATE AD_APIROLE
      SET NOMEROLE = @param2, DESCRICAO = @param3, ATIVO = @param4, DTALTERACAO = GETDATE()
      OUTPUT INSERTED.CODROLE, INSERTED.NOMEROLE, INSERTED.DESCRICAO, INSERTED.ATIVO, INSERTED.DTCRIACAO, INSERTED.DTALTERACAO
      WHERE CODROLE = @param1
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [
      role.codRole,
      role.nomeRole,
      role.descricao || null,
      role.ativo ? 'S' : 'N',
    ]);
    return this.paraDominio(resultado[0] as RoleCru);
  }

  async remover(codRole: number): Promise<void> {
    // Soft delete - apenas desativa
    const sql = `
      UPDATE AD_APIROLE
      SET ATIVO = 'N', DTALTERACAO = GETDATE()
      WHERE CODROLE = @param1
    `;
    await this.sqlServer.executeSQL(sql, [codRole]);
  }

  async existeComNome(nomeRole: string, excluirCodigo?: number): Promise<boolean> {
    let sql = `SELECT COUNT(*) as total FROM AD_APIROLE WHERE NOMEROLE = @param1`;
    const params: any[] = [nomeRole];

    if (excluirCodigo) {
      sql += ` AND CODROLE <> @param2`;
      params.push(excluirCodigo);
    }

    const resultado = await this.sqlServer.executeSQL(sql, params);
    return resultado[0]?.total > 0;
  }

  private paraDominio(cru: RoleCru): Role {
    const resultado = Role.criar({
      codRole: cru.CODROLE,
      nomeRole: cru.NOMEROLE,
      descricao: cru.DESCRICAO,
      ativo: cru.ATIVO,
      dataCriacao: cru.DTCRIACAO,
      dataAlteracao: cru.DTALTERACAO,
    });
    if (resultado.falhou) {
      throw new Error(`Erro ao mapear role: ${resultado.erro}`);
    }
    return resultado.obterValor();
  }
}
