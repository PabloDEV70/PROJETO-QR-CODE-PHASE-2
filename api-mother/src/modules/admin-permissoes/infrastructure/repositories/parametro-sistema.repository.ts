import { Injectable } from '@nestjs/common';
import { SqlServerService } from '../../../../database/sqlserver.service';
import { IRepositorioParametroSistema } from '../../domain/repositories/parametro-sistema.repository.interface';
import { ParametroSistema } from '../../domain/entities/parametro-sistema.entity';

interface ParametroSistemaCru {
  CODPARAMETRO: number;
  CHAVE: string;
  VALOR: string;
  DESCRICAO?: string;
  TIPO: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  ATIVO: string;
  DTCRIACAO?: Date;
  DTALTERACAO?: Date;
}

/**
 * Implementacao do repositorio de Parametros do Sistema usando SQL Server.
 *
 * Tabela: AD_APIPARAMS
 */
@Injectable()
export class SankhyaParametroSistemaRepository implements IRepositorioParametroSistema {
  constructor(private readonly sqlServer: SqlServerService) {}

  async buscarTodos(): Promise<ParametroSistema[]> {
    const sql = `
      SELECT CODPARAMETRO, CHAVE, VALOR, DESCRICAO, TIPO, ATIVO, DTCRIACAO, DTALTERACAO
      FROM AD_APIPARAMS
      ORDER BY CHAVE
    `;
    const resultado = await this.sqlServer.executeSQL(sql, []);
    return (resultado as ParametroSistemaCru[]).map((r) => this.paraDominio(r));
  }

  async buscarAtivos(): Promise<ParametroSistema[]> {
    const sql = `
      SELECT CODPARAMETRO, CHAVE, VALOR, DESCRICAO, TIPO, ATIVO, DTCRIACAO, DTALTERACAO
      FROM AD_APIPARAMS
      WHERE ATIVO = 'S'
      ORDER BY CHAVE
    `;
    const resultado = await this.sqlServer.executeSQL(sql, []);
    return (resultado as ParametroSistemaCru[]).map((r) => this.paraDominio(r));
  }

  async buscarPorCodigo(codParametro: number): Promise<ParametroSistema | null> {
    const sql = `
      SELECT CODPARAMETRO, CHAVE, VALOR, DESCRICAO, TIPO, ATIVO, DTCRIACAO, DTALTERACAO
      FROM AD_APIPARAMS
      WHERE CODPARAMETRO = @param1
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [codParametro]);
    if (!resultado || resultado.length === 0) {
      return null;
    }
    return this.paraDominio(resultado[0] as ParametroSistemaCru);
  }

  async buscarPorChave(chave: string): Promise<ParametroSistema | null> {
    const sql = `
      SELECT CODPARAMETRO, CHAVE, VALOR, DESCRICAO, TIPO, ATIVO, DTCRIACAO, DTALTERACAO
      FROM AD_APIPARAMS
      WHERE CHAVE = @param1
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [chave.toUpperCase()]);
    if (!resultado || resultado.length === 0) {
      return null;
    }
    return this.paraDominio(resultado[0] as ParametroSistemaCru);
  }

  async criar(parametro: ParametroSistema): Promise<ParametroSistema> {
    const sql = `
      INSERT INTO AD_APIPARAMS (CHAVE, VALOR, DESCRICAO, TIPO, ATIVO, DTCRIACAO)
      OUTPUT INSERTED.CODPARAMETRO, INSERTED.CHAVE, INSERTED.VALOR, INSERTED.DESCRICAO, INSERTED.TIPO, INSERTED.ATIVO, INSERTED.DTCRIACAO
      VALUES (@param1, @param2, @param3, @param4, @param5, GETDATE())
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [
      parametro.chave,
      parametro.valor,
      parametro.descricao || null,
      parametro.tipo,
      parametro.ativo ? 'S' : 'N',
    ]);
    return this.paraDominio(resultado[0] as ParametroSistemaCru);
  }

  async atualizar(parametro: ParametroSistema): Promise<ParametroSistema> {
    const sql = `
      UPDATE AD_APIPARAMS
      SET CHAVE = @param2, VALOR = @param3, DESCRICAO = @param4, TIPO = @param5, ATIVO = @param6, DTALTERACAO = GETDATE()
      OUTPUT INSERTED.CODPARAMETRO, INSERTED.CHAVE, INSERTED.VALOR, INSERTED.DESCRICAO, INSERTED.TIPO, INSERTED.ATIVO, INSERTED.DTCRIACAO, INSERTED.DTALTERACAO
      WHERE CODPARAMETRO = @param1
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [
      parametro.codParametro,
      parametro.chave,
      parametro.valor,
      parametro.descricao || null,
      parametro.tipo,
      parametro.ativo ? 'S' : 'N',
    ]);
    return this.paraDominio(resultado[0] as ParametroSistemaCru);
  }

  async remover(codParametro: number): Promise<void> {
    // Soft delete - apenas desativa
    const sql = `
      UPDATE AD_APIPARAMS
      SET ATIVO = 'N', DTALTERACAO = GETDATE()
      WHERE CODPARAMETRO = @param1
    `;
    await this.sqlServer.executeSQL(sql, [codParametro]);
  }

  async existeComChave(chave: string, excluirCodigo?: number): Promise<boolean> {
    let sql = `SELECT COUNT(*) as total FROM AD_APIPARAMS WHERE CHAVE = @param1`;
    const params: any[] = [chave.toUpperCase()];

    if (excluirCodigo) {
      sql += ` AND CODPARAMETRO <> @param2`;
      params.push(excluirCodigo);
    }

    const resultado = await this.sqlServer.executeSQL(sql, params);
    return resultado[0]?.total > 0;
  }

  private paraDominio(cru: ParametroSistemaCru): ParametroSistema {
    const resultado = ParametroSistema.criar({
      codParametro: cru.CODPARAMETRO,
      chave: cru.CHAVE,
      valor: cru.VALOR,
      descricao: cru.DESCRICAO,
      tipo: cru.TIPO,
      ativo: cru.ATIVO,
      dataCriacao: cru.DTCRIACAO,
      dataAlteracao: cru.DTALTERACAO,
    });
    if (resultado.falhou) {
      throw new Error(`Erro ao mapear parametro: ${resultado.erro}`);
    }
    return resultado.obterValor();
  }
}
