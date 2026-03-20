import { Injectable } from '@nestjs/common';
import { SqlServerService } from '../../../../database/sqlserver.service';
import { IRepositorioUsuarioRole } from '../../domain/repositories/usuario-role.repository.interface';
import { UsuarioRole } from '../../domain/entities/usuario-role.entity';

interface UsuarioRoleCru {
  CODUSU: number;
  CODROLE: number;
  NOMEUSU?: string;
  NOMEROLE?: string;
  DTASSOCIACAO?: Date;
  ATIVO: string;
}

/**
 * Implementacao do repositorio de associacoes Usuario-Role usando SQL Server.
 *
 * Tabela: AD_APIUSUROLE
 */
@Injectable()
export class SankhyaUsuarioRoleRepository implements IRepositorioUsuarioRole {
  constructor(private readonly sqlServer: SqlServerService) {}

  async buscarPorRole(codRole: number): Promise<UsuarioRole[]> {
    const sql = `
      SELECT ur.CODUSU, ur.CODROLE, u.NOMEUSU, r.NOMEROLE, ur.DTASSOCIACAO, ur.ATIVO
      FROM AD_APIUSUROLE ur
      LEFT JOIN TSIUSU u ON ur.CODUSU = u.CODUSU
      LEFT JOIN AD_APIROLE r ON ur.CODROLE = r.CODROLE
      WHERE ur.CODROLE = @param1 AND ur.ATIVO = 'S'
      ORDER BY u.NOMEUSU
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [codRole]);
    return (resultado as UsuarioRoleCru[]).map((r) => this.paraDominio(r));
  }

  async buscarPorUsuario(codUsuario: number): Promise<UsuarioRole[]> {
    const sql = `
      SELECT ur.CODUSU, ur.CODROLE, u.NOMEUSU, r.NOMEROLE, ur.DTASSOCIACAO, ur.ATIVO
      FROM AD_APIUSUROLE ur
      LEFT JOIN TSIUSU u ON ur.CODUSU = u.CODUSU
      LEFT JOIN AD_APIROLE r ON ur.CODROLE = r.CODROLE
      WHERE ur.CODUSU = @param1 AND ur.ATIVO = 'S'
      ORDER BY r.NOMEROLE
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [codUsuario]);
    return (resultado as UsuarioRoleCru[]).map((r) => this.paraDominio(r));
  }

  async existeAssociacao(codUsuario: number, codRole: number): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) as total FROM AD_APIUSUROLE
      WHERE CODUSU = @param1 AND CODROLE = @param2 AND ATIVO = 'S'
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [codUsuario, codRole]);
    return resultado[0]?.total > 0;
  }

  async associar(usuarioRole: UsuarioRole): Promise<UsuarioRole> {
    // Verificar se ja existe (mesmo que inativo)
    const sqlVerifica = `
      SELECT COUNT(*) as total FROM AD_APIUSUROLE
      WHERE CODUSU = @param1 AND CODROLE = @param2
    `;
    const existente = await this.sqlServer.executeSQL(sqlVerifica, [usuarioRole.codUsuario, usuarioRole.codRole]);

    if (existente[0]?.total > 0) {
      // Reativar associacao existente
      const sqlUpdate = `
        UPDATE AD_APIUSUROLE
        SET ATIVO = 'S', DTASSOCIACAO = GETDATE()
        WHERE CODUSU = @param1 AND CODROLE = @param2
      `;
      await this.sqlServer.executeSQL(sqlUpdate, [usuarioRole.codUsuario, usuarioRole.codRole]);
    } else {
      // Criar nova associacao
      const sqlInsert = `
        INSERT INTO AD_APIUSUROLE (CODUSU, CODROLE, DTASSOCIACAO, ATIVO)
        VALUES (@param1, @param2, GETDATE(), 'S')
      `;
      await this.sqlServer.executeSQL(sqlInsert, [usuarioRole.codUsuario, usuarioRole.codRole]);
    }

    // Retornar associacao criada
    const sqlSelect = `
      SELECT ur.CODUSU, ur.CODROLE, u.NOMEUSU, r.NOMEROLE, ur.DTASSOCIACAO, ur.ATIVO
      FROM AD_APIUSUROLE ur
      LEFT JOIN TSIUSU u ON ur.CODUSU = u.CODUSU
      LEFT JOIN AD_APIROLE r ON ur.CODROLE = r.CODROLE
      WHERE ur.CODUSU = @param1 AND ur.CODROLE = @param2
    `;
    const resultado = await this.sqlServer.executeSQL(sqlSelect, [usuarioRole.codUsuario, usuarioRole.codRole]);
    return this.paraDominio(resultado[0] as UsuarioRoleCru);
  }

  async desassociar(codUsuario: number, codRole: number): Promise<void> {
    // Soft delete - apenas desativa
    const sql = `
      UPDATE AD_APIUSUROLE
      SET ATIVO = 'N'
      WHERE CODUSU = @param1 AND CODROLE = @param2
    `;
    await this.sqlServer.executeSQL(sql, [codUsuario, codRole]);
  }

  async listarUsuariosComRoles(): Promise<UsuarioRole[]> {
    const sql = `
      SELECT ur.CODUSU, ur.CODROLE, u.NOMEUSU, r.NOMEROLE, ur.DTASSOCIACAO, ur.ATIVO
      FROM AD_APIUSUROLE ur
      LEFT JOIN TSIUSU u ON ur.CODUSU = u.CODUSU
      LEFT JOIN AD_APIROLE r ON ur.CODROLE = r.CODROLE
      WHERE ur.ATIVO = 'S'
      ORDER BY u.NOMEUSU, r.NOMEROLE
    `;
    const resultado = await this.sqlServer.executeSQL(sql, []);
    return (resultado as UsuarioRoleCru[]).map((r) => this.paraDominio(r));
  }

  private paraDominio(cru: UsuarioRoleCru): UsuarioRole {
    const resultado = UsuarioRole.criar({
      codUsuario: cru.CODUSU,
      codRole: cru.CODROLE,
      nomeUsuario: cru.NOMEUSU,
      nomeRole: cru.NOMEROLE,
      dataAssociacao: cru.DTASSOCIACAO,
      ativo: cru.ATIVO,
    });
    if (resultado.falhou) {
      throw new Error(`Erro ao mapear usuario-role: ${resultado.erro}`);
    }
    return resultado.obterValor();
  }
}
