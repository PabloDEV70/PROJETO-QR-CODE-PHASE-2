import { Injectable } from '@nestjs/common';
import { SqlServerService } from '../../../../database/sqlserver.service';
import { IRepositorioPermissaoTabela } from '../../domain/repositories/permissao-tabela.repository.interface';
import { PermissaoTabela, TipoOperacao } from '../../domain/entities/permissao-tabela.entity';

interface PermissaoTabelaCru {
  CODPERMISSAO: number;
  CODROLE: number;
  NOMETABELA: string;
  OPERACAO: TipoOperacao;
  PERMITIDO: string;
  CONDICAORLS?: string;
  CAMPOSPERMITIDOS?: string;
  CAMPOSRESTRITOS?: string;
  DTCRIACAO?: Date;
  DTALTERACAO?: Date;
}

/**
 * Implementacao do repositorio de Permissoes de Tabela usando SQL Server.
 *
 * Tabela: AD_APIPERMTAB
 */
@Injectable()
export class SankhyaPermissaoTabelaRepository implements IRepositorioPermissaoTabela {
  constructor(private readonly sqlServer: SqlServerService) {}

  async buscarTodas(): Promise<PermissaoTabela[]> {
    const sql = `
      SELECT CODPERMISSAO, CODROLE, NOMETABELA, OPERACAO, PERMITIDO,
             CONDICAORLS, CAMPOSPERMITIDOS, CAMPOSRESTRITOS, DTCRIACAO, DTALTERACAO
      FROM AD_APIPERMTAB
      ORDER BY NOMETABELA, OPERACAO
    `;
    const resultado = await this.sqlServer.executeSQL(sql, []);
    return (resultado as PermissaoTabelaCru[]).map((r) => this.paraDominio(r));
  }

  async buscarPorRole(codRole: number): Promise<PermissaoTabela[]> {
    const sql = `
      SELECT CODPERMISSAO, CODROLE, NOMETABELA, OPERACAO, PERMITIDO,
             CONDICAORLS, CAMPOSPERMITIDOS, CAMPOSRESTRITOS, DTCRIACAO, DTALTERACAO
      FROM AD_APIPERMTAB
      WHERE CODROLE = @param1
      ORDER BY NOMETABELA, OPERACAO
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [codRole]);
    return (resultado as PermissaoTabelaCru[]).map((r) => this.paraDominio(r));
  }

  async buscarPorTabela(nomeTabela: string): Promise<PermissaoTabela[]> {
    const sql = `
      SELECT CODPERMISSAO, CODROLE, NOMETABELA, OPERACAO, PERMITIDO,
             CONDICAORLS, CAMPOSPERMITIDOS, CAMPOSRESTRITOS, DTCRIACAO, DTALTERACAO
      FROM AD_APIPERMTAB
      WHERE NOMETABELA = @param1
      ORDER BY CODROLE, OPERACAO
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [nomeTabela.toUpperCase()]);
    return (resultado as PermissaoTabelaCru[]).map((r) => this.paraDominio(r));
  }

  async buscarPorCodigo(codPermissao: number): Promise<PermissaoTabela | null> {
    const sql = `
      SELECT CODPERMISSAO, CODROLE, NOMETABELA, OPERACAO, PERMITIDO,
             CONDICAORLS, CAMPOSPERMITIDOS, CAMPOSRESTRITOS, DTCRIACAO, DTALTERACAO
      FROM AD_APIPERMTAB
      WHERE CODPERMISSAO = @param1
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [codPermissao]);
    if (!resultado || resultado.length === 0) {
      return null;
    }
    return this.paraDominio(resultado[0] as PermissaoTabelaCru);
  }

  async buscarPorRoleTabelaOperacao(
    codRole: number,
    nomeTabela: string,
    operacao: TipoOperacao,
  ): Promise<PermissaoTabela | null> {
    const sql = `
      SELECT CODPERMISSAO, CODROLE, NOMETABELA, OPERACAO, PERMITIDO,
             CONDICAORLS, CAMPOSPERMITIDOS, CAMPOSRESTRITOS, DTCRIACAO, DTALTERACAO
      FROM AD_APIPERMTAB
      WHERE CODROLE = @param1 AND NOMETABELA = @param2 AND OPERACAO = @param3
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [codRole, nomeTabela.toUpperCase(), operacao]);
    if (!resultado || resultado.length === 0) {
      return null;
    }
    return this.paraDominio(resultado[0] as PermissaoTabelaCru);
  }

  async criar(permissao: PermissaoTabela): Promise<PermissaoTabela> {
    const sql = `
      INSERT INTO AD_APIPERMTAB (CODROLE, NOMETABELA, OPERACAO, PERMITIDO, CONDICAORLS, CAMPOSPERMITIDOS, CAMPOSRESTRITOS, DTCRIACAO)
      OUTPUT INSERTED.CODPERMISSAO, INSERTED.CODROLE, INSERTED.NOMETABELA, INSERTED.OPERACAO, INSERTED.PERMITIDO,
             INSERTED.CONDICAORLS, INSERTED.CAMPOSPERMITIDOS, INSERTED.CAMPOSRESTRITOS, INSERTED.DTCRIACAO
      VALUES (@param1, @param2, @param3, @param4, @param5, @param6, @param7, GETDATE())
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [
      permissao.codRole,
      permissao.nomeTabela,
      permissao.operacao,
      permissao.permitido ? 'S' : 'N',
      permissao.condicaoRls || null,
      permissao.camposPermitidos?.join(',') || null,
      permissao.camposRestritos?.join(',') || null,
    ]);
    return this.paraDominio(resultado[0] as PermissaoTabelaCru);
  }

  async atualizar(permissao: PermissaoTabela): Promise<PermissaoTabela> {
    const sql = `
      UPDATE AD_APIPERMTAB
      SET CODROLE = @param2, NOMETABELA = @param3, OPERACAO = @param4, PERMITIDO = @param5,
          CONDICAORLS = @param6, CAMPOSPERMITIDOS = @param7, CAMPOSRESTRITOS = @param8, DTALTERACAO = GETDATE()
      OUTPUT INSERTED.CODPERMISSAO, INSERTED.CODROLE, INSERTED.NOMETABELA, INSERTED.OPERACAO, INSERTED.PERMITIDO,
             INSERTED.CONDICAORLS, INSERTED.CAMPOSPERMITIDOS, INSERTED.CAMPOSRESTRITOS, INSERTED.DTCRIACAO, INSERTED.DTALTERACAO
      WHERE CODPERMISSAO = @param1
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [
      permissao.codPermissao,
      permissao.codRole,
      permissao.nomeTabela,
      permissao.operacao,
      permissao.permitido ? 'S' : 'N',
      permissao.condicaoRls || null,
      permissao.camposPermitidos?.join(',') || null,
      permissao.camposRestritos?.join(',') || null,
    ]);
    return this.paraDominio(resultado[0] as PermissaoTabelaCru);
  }

  async remover(codPermissao: number): Promise<void> {
    const sql = `DELETE FROM AD_APIPERMTAB WHERE CODPERMISSAO = @param1`;
    await this.sqlServer.executeSQL(sql, [codPermissao]);
  }

  async existePermissao(
    codRole: number,
    nomeTabela: string,
    operacao: TipoOperacao,
    excluirCodigo?: number,
  ): Promise<boolean> {
    let sql = `SELECT COUNT(*) as total FROM AD_APIPERMTAB WHERE CODROLE = @param1 AND NOMETABELA = @param2 AND OPERACAO = @param3`;
    const params: any[] = [codRole, nomeTabela.toUpperCase(), operacao];

    if (excluirCodigo) {
      sql += ` AND CODPERMISSAO <> @param4`;
      params.push(excluirCodigo);
    }

    const resultado = await this.sqlServer.executeSQL(sql, params);
    return resultado[0]?.total > 0;
  }

  private paraDominio(cru: PermissaoTabelaCru): PermissaoTabela {
    const resultado = PermissaoTabela.criar({
      codPermissao: cru.CODPERMISSAO,
      codRole: cru.CODROLE,
      nomeTabela: cru.NOMETABELA,
      operacao: cru.OPERACAO,
      permitido: cru.PERMITIDO,
      condicaoRls: cru.CONDICAORLS,
      camposPermitidos: cru.CAMPOSPERMITIDOS,
      camposRestritos: cru.CAMPOSRESTRITOS,
      dataCriacao: cru.DTCRIACAO,
      dataAlteracao: cru.DTALTERACAO,
    });
    if (resultado.falhou) {
      throw new Error(`Erro ao mapear permissao tabela: ${resultado.erro}`);
    }
    return resultado.obterValor();
  }
}
