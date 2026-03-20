import { Injectable } from '@nestjs/common';
import { IRepositorioPermissaoEscrita } from '../../domain/repositories/permissao-escrita.repository.interface';
import { PermissaoEscrita } from '../../domain/entities/permissao-escrita.entity';
import { TipoOperacaoSigla } from '../../domain/value-objects/tipo-operacao.vo';
import { SqlServerService } from '../../../../database/sqlserver.service';
import {
  ObterPermissoesUsuarioQuery,
  ObterPermissoesUsuarioTabelaQuery,
} from '../queries/obter-permissoes-usuario.query';
import { VerificarPermissaoQuery, ObterPermissaoEspecificaQuery } from '../queries/verificar-permissao.query';

/**
 * Interface para dados crus do banco de dados.
 */
interface PermissaoEscritaCru {
  permissaoId: number;
  tabela: string;
  operacao: string;
  condicaoRLS: string | null;
  roleId: number | null;
  codUsuario: number | null;
  ativa: string;
  descricao: string | null;
  requerAprovacao: string | null;
  dataValidade: Date | null;
}

/**
 * Implementação do repositório de permissões de escrita usando SQL Server.
 */
@Injectable()
export class SqlPermissaoEscritaRepository implements IRepositorioPermissaoEscrita {
  constructor(private readonly sqlServer: SqlServerService) {}

  async buscarPorUsuario(codUsuario: number): Promise<PermissaoEscrita[]> {
    const query = new ObterPermissoesUsuarioQuery(codUsuario);
    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);
    return this.mapearLista(resultado as PermissaoEscritaCru[]);
  }

  async buscarPorUsuarioETabela(codUsuario: number, tabela: string): Promise<PermissaoEscrita[]> {
    const query = new ObterPermissoesUsuarioTabelaQuery(codUsuario, tabela);
    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);
    return this.mapearLista(resultado as PermissaoEscritaCru[]);
  }

  async buscarPorRole(roleId: number): Promise<PermissaoEscrita[]> {
    const sql = `
      SELECT
        pe.PERMISSAOID as permissaoId,
        pe.TABELA as tabela,
        pe.OPERACAO as operacao,
        pe.CONDICAO_RLS as condicaoRLS,
        pe.ROLEID as roleId,
        pe.CODUSU as codUsuario,
        pe.ATIVA as ativa,
        pe.DESCRICAO as descricao,
        pe.REQUER_APROVACAO as requerAprovacao,
        pe.DATA_VALIDADE as dataValidade
      FROM API_PERMISSAO_ESCRITA pe
      WHERE pe.ROLEID = @param1
        AND pe.ATIVA = 'S'
        AND (pe.DATA_VALIDADE IS NULL OR pe.DATA_VALIDADE >= GETDATE())
      ORDER BY pe.TABELA, pe.OPERACAO
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [roleId]);
    return this.mapearLista(resultado as PermissaoEscritaCru[]);
  }

  async verificarPermissao(codUsuario: number, tabela: string, operacao: TipoOperacaoSigla): Promise<boolean> {
    const query = new VerificarPermissaoQuery(codUsuario, tabela, operacao);
    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);
    return resultado[0]?.temPermissao === 1;
  }

  async buscarPermissaoEspecifica(
    codUsuario: number,
    tabela: string,
    operacao: TipoOperacaoSigla,
  ): Promise<PermissaoEscrita | null> {
    const query = new ObterPermissaoEspecificaQuery(codUsuario, tabela, operacao);
    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);

    if (!resultado || resultado.length === 0) {
      return null;
    }

    return this.mapearParaDominio(resultado[0] as PermissaoEscritaCru);
  }

  async buscarPorTabela(tabela: string): Promise<PermissaoEscrita[]> {
    const sql = `
      SELECT
        pe.PERMISSAOID as permissaoId,
        pe.TABELA as tabela,
        pe.OPERACAO as operacao,
        pe.CONDICAO_RLS as condicaoRLS,
        pe.ROLEID as roleId,
        pe.CODUSU as codUsuario,
        pe.ATIVA as ativa,
        pe.DESCRICAO as descricao,
        pe.REQUER_APROVACAO as requerAprovacao,
        pe.DATA_VALIDADE as dataValidade
      FROM API_PERMISSAO_ESCRITA pe
      WHERE pe.TABELA = @param1
        AND pe.ATIVA = 'S'
        AND (pe.DATA_VALIDADE IS NULL OR pe.DATA_VALIDADE >= GETDATE())
      ORDER BY pe.OPERACAO
    `;
    const resultado = await this.sqlServer.executeSQL(sql, [tabela.toUpperCase()]);
    return this.mapearLista(resultado as PermissaoEscritaCru[]);
  }

  private mapearLista(registros: PermissaoEscritaCru[]): PermissaoEscrita[] {
    if (!registros || registros.length === 0) {
      return [];
    }
    return registros.map((r) => this.mapearParaDominio(r));
  }

  private mapearParaDominio(cru: PermissaoEscritaCru): PermissaoEscrita {
    const resultado = PermissaoEscrita.criar({
      permissaoId: cru.permissaoId,
      tabela: cru.tabela,
      operacao: cru.operacao,
      condicaoRLS: cru.condicaoRLS,
      roleId: cru.roleId,
      codUsuario: cru.codUsuario,
      ativa: cru.ativa,
      descricao: cru.descricao,
      requerAprovacao: cru.requerAprovacao,
      dataValidade: cru.dataValidade,
    });

    if (resultado.falhou) {
      throw new Error(`Erro ao mapear permissão de escrita: ${resultado.erro}`);
    }

    return resultado.obterValor();
  }
}
