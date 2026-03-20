import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { escapeSqlString, escapeSqlDate } from '../../shared/sql-sanitize';
import { TgfVei } from '../../types/TGFVEI';
import { TgfVeiPerfilCompleto } from '../../types/TGFVEI/tgf-vei-perfil-completo';
import { OsComercial } from '../../types/TGFVEI/tgf-vei-os-comercial';
import { OsManutencao } from '../../types/TGFVEI/tgf-vei-os-manutencao';
import { ContratoVeiculo } from '../../types/TGFVEI/tgf-vei-contrato';
import { PerfilVeiculoInclude } from '../../types/TGFVEI/perfil-include';
import * as Q from '../../sql-queries/TGFVEI';
import { abastecimentosPorVeiculo } from '../../sql-queries/TCFABT';
import { historicoKmPorVeiculo } from '../../sql-queries/TMSVEIHKM';
import { documentosPorVeiculo } from '../../sql-queries/TGFVEIDOC';
import { consumoPorVeiculo } from '../../sql-queries/AD_CONSUMOVEICULOS';
import { planosPorVeiculo } from '../../sql-queries/TCFMANVEI';

export interface ListVeiculosOptions {
  page: number;
  limit: number;
  ativo?: string;
  categoria?: string;
  searchTerm?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}

export class VeiculosService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getById(codveiculo: number): Promise<TgfVei | null> {
    const query = Q.buscarPorId.replace(/@codveiculo/g, codveiculo.toString());
    const rows = await this.queryExecutor.executeQuery<TgfVei>(query);
    return rows[0] || null;
  }

  async search(term: string): Promise<TgfVei[]> {
    const sanitized = escapeSqlString(term.substring(0, 100));
    const query = Q.pesquisar.replace(/@term/g, sanitized);
    return this.queryExecutor.executeQuery<TgfVei>(query);
  }

  async list(options: ListVeiculosOptions): Promise<TgfVei[]> {
    const {
      page, limit, ativo, categoria, searchTerm,
      orderBy = 'PLACA', orderDir = 'ASC',
    } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    if (ativo) {
      conditions.push(`v.ATIVO = '${ativo}'`);
    } else {
      conditions.push(`v.ATIVO = 'S'`);
    }
    if (categoria) {
      const safe = escapeSqlString(categoria.substring(0, 100));
      conditions.push(
        `ISNULL(v.AD_TIPOEQPTO, v.CATEGORIA) = '${safe}'`,
      );
    }
    if (searchTerm && searchTerm.trim().length > 0) {
      const safe = escapeSqlString(searchTerm.substring(0, 100));
      conditions.push(`(
        v.PLACA LIKE '%${safe}%'
        OR CAST(v.MARCAMODELO AS VARCHAR(200)) LIKE '%${safe}%'
        OR CAST(v.CODVEICULO AS VARCHAR) = '${safe}'
      )`);
    }

    const whereSql = conditions.length > 0
      ? `AND ${conditions.join(' AND ')}`
      : '';

    const allowedSorts = ['PLACA', 'CODVEICULO', 'MARCAMODELO'];
    const safeOrderBy = allowedSorts.includes(orderBy)
      ? `v.${orderBy}` : 'v.PLACA';
    const orderSql = `${safeOrderBy} ${orderDir}`;

    const query = Q.listar
      .replace('-- @WHERE', whereSql)
      .replace('-- @ORDER', orderSql)
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    return this.queryExecutor.executeQuery<TgfVei>(query);
  }

  async getPerfilCompleto(
    codveiculo: number,
    includes: PerfilVeiculoInclude[] = [],
  ): Promise<TgfVeiPerfilCompleto | null> {
    const query = Q.perfilCompleto.replace(/@codveiculo/g, codveiculo.toString());
    const rows = await this.queryExecutor.executeQuery<TgfVeiPerfilCompleto>(query);
    if (rows.length === 0) return null;

    const perfil = rows[0];

    if (includes.includes('osComerciais')) {
      perfil.osComerciais = await this.getOsComerciais(codveiculo);
    }
    if (includes.includes('osManutencao')) {
      perfil.osManutencao = await this.getOsManutencao(codveiculo);
    }
    if (includes.includes('contratos')) {
      perfil.contratos = await this.getContratos(codveiculo);
    }

    return perfil;
  }

  async getOsComerciais(codveiculo: number): Promise<OsComercial[]> {
    const query = Q.osComerciais.replace(/@codveiculo/g, codveiculo.toString());
    return this.queryExecutor.executeQuery<OsComercial>(query);
  }

  async getOsManutencao(codveiculo: number): Promise<OsManutencao[]> {
    const query = Q.osManutencao.replace(/@codveiculo/g, codveiculo.toString());
    return this.queryExecutor.executeQuery<OsManutencao>(query);
  }

  async getContratos(codveiculo: number): Promise<ContratoVeiculo[]> {
    const query = Q.contratos.replace(/@codveiculo/g, codveiculo.toString());
    return this.queryExecutor.executeQuery<ContratoVeiculo>(query);
  }

  async getOsManutencaoAtivasEnriched(codveiculo: number) {
    const query = Q.osManutencaoAtivasEnriched.replace(/@codveiculo/g, codveiculo.toString());
    return this.queryExecutor.executeQuery<Record<string, unknown>>(query);
  }

  async getHistoricoUnificado(codveiculo: number) {
    const query = Q.historicoOsUnificado.replace(/@codveiculo/g, codveiculo.toString());
    return this.queryExecutor.executeQuery<Record<string, unknown>>(query);
  }

  async getAgendamentosFuturos() {
    return this.queryExecutor.executeQuery<Record<string, unknown>>(Q.agendamentosFuturos);
  }

  async getAbastecimentos(codveiculo: number) {
    const query = abastecimentosPorVeiculo.replace(/@codveiculo/g, codveiculo.toString());
    return this.queryExecutor.executeQuery<Record<string, unknown>>(query);
  }

  async getHistoricoKm(codveiculo: number) {
    const query = historicoKmPorVeiculo.replace(/@codveiculo/g, codveiculo.toString());
    return this.queryExecutor.executeQuery<Record<string, unknown>>(query);
  }

  async getDocumentos(codveiculo: number) {
    const query = documentosPorVeiculo.replace(/@codveiculo/g, codveiculo.toString());
    return this.queryExecutor.executeQuery<Record<string, unknown>>(query);
  }

  async getConsumo(codveiculo: number) {
    const query = consumoPorVeiculo.replace(/@codveiculo/g, codveiculo.toString());
    return this.queryExecutor.executeQuery<Record<string, unknown>>(query);
  }

  async getPlanos(codveiculo: number) {
    const query = planosPorVeiculo.replace(/@codveiculo/g, codveiculo.toString());
    return this.queryExecutor.executeQuery<Record<string, unknown>>(query);
  }

  async getHistoricoCompleto(codveiculo: number) {
    const query = Q.historicoCompletoVeiculo.replace(/@codveiculo/g, codveiculo.toString());
    return this.queryExecutor.executeQuery<Record<string, unknown>>(query);
  }

  async getUtilizacao(codveiculo: number, dataInicio?: string, dataFim?: string) {
    const cod = codveiculo.toString();

    const [resumoRows, pessoasRows] = await Promise.all([
      this.queryExecutor.executeQuery<Record<string, unknown>>(
        Q.utilizacaoResumo.replace(/@codveiculo/g, cod),
      ),
      this.queryExecutor.executeQuery<Record<string, unknown>>(
        Q.utilizacaoPessoas.replace(/@codveiculo/g, cod),
      ),
    ]);

    const resumo = resumoRows[0] || null;

    const hoje = new Date().toISOString().slice(0, 10);
    let fim = dataFim || hoje;
    let inicio = dataInicio;
    if (!inicio && resumo) {
      const pa = resumo.primeiraAtividade;
      if (pa instanceof Date) {
        inicio = pa.toISOString().slice(0, 10);
      } else if (typeof pa === 'string' && pa.length >= 10) {
        inicio = pa.slice(0, 10);
      }
    }
    if (!inicio) {
      const d = new Date(fim);
      d.setFullYear(d.getFullYear() - 1);
      inicio = d.toISOString().slice(0, 10);
    }

    const safeInicio = escapeSqlDate(inicio);
    const safeFim = escapeSqlDate(fim);

    const mensal = await this.queryExecutor.executeQuery<Record<string, unknown>>(
      Q.utilizacaoMensal
        .replace(/@codveiculo/g, cod)
        .replace(/@dataInicio/g, `'${safeInicio}'`)
        .replace(/@dataFim/g, `'${safeFim}'`),
    );

    return {
      mensal,
      resumo,
      pessoas: pessoasRows,
      dataInicio: inicio,
      dataFim: fim,
    };
  }

}
