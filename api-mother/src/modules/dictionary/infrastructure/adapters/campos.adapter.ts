import { Injectable, Logger } from '@nestjs/common';
import { SqlServerService } from '../../../../database/sqlserver.service';
import { Campo, OpcaoCampo } from '../../domain/entities';
import { IProvedorCampos, OpcoesPaginacao, ResultadoPaginado } from '../../application/ports';

/**
 * Infrastructure Adapter: CamposAdapter
 *
 * Implementa IProvedorCampos consultando TDDCAM no SQL Server.
 */
@Injectable()
export class CamposAdapter implements IProvedorCampos {
  private readonly logger = new Logger(CamposAdapter.name);

  constructor(private readonly sqlServerService: SqlServerService) {}

  async listarCamposDaTabela(nomeTabela: string, opcoes?: OpcoesPaginacao): Promise<ResultadoPaginado<Campo>> {
    const limite = opcoes?.limite ?? 10000;
    const offset = opcoes?.offset ?? 0;

    const query = `
      SELECT TOP (@param2)
        NUCAMPO, NOMETAB, NOMECAMPO, DESCRCAMPO, TIPCAMPO, TIPOAPRESENTACAO,
        TAMANHO, MASCARA, EXPRESSAO, PERMITEPESQUISA, CALCULADO, PERMITEPADRAO,
        APRESENTACAO, ORDEM, VISIVELGRIDPESQUISA, SISTEMA, ADICIONAL, CONTROLE
      FROM TDDCAM WITH (NOLOCK)
      WHERE NOMETAB = @param1
      ORDER BY ORDEM, NOMECAMPO
    `;

    const result = await this.sqlServerService.executeSQL(query, [nomeTabela, limite]);

    const countQuery = `SELECT COUNT(*) AS total FROM TDDCAM WITH (NOLOCK) WHERE NOMETAB = @param1`;
    const countResult = await this.sqlServerService.executeSQL(countQuery, [nomeTabela]);

    const campos = result.map((row: any) => Campo.criar(row));

    this.logger.debug(`Listados ${campos.length} campos da tabela ${nomeTabela}`);

    return {
      dados: campos,
      paginacao: {
        limite,
        offset,
        total: countResult[0]?.total || 0,
      },
    };
  }

  async obterCampo(nomeTabela: string, nomeCampo: string): Promise<Campo | null> {
    const query = `
      SELECT
        NUCAMPO, NOMETAB, NOMECAMPO, DESCRCAMPO, TIPCAMPO, TIPOAPRESENTACAO,
        TAMANHO, MASCARA, EXPRESSAO, PERMITEPESQUISA, CALCULADO, PERMITEPADRAO,
        APRESENTACAO, ORDEM, VISIVELGRIDPESQUISA, SISTEMA, ADICIONAL, CONTROLE
      FROM TDDCAM WITH (NOLOCK)
      WHERE NOMETAB = @param1 AND NOMECAMPO = @param2
    `;

    const result = await this.sqlServerService.executeSQL(query, [nomeTabela, nomeCampo]);

    if (result.length === 0) {
      return null;
    }

    return Campo.criar(result[0]);
  }

  async buscarCampos(termo: string, opcoes?: OpcoesPaginacao): Promise<ResultadoPaginado<Campo>> {
    const limite = opcoes?.limite ?? 10000;
    const offset = opcoes?.offset ?? 0;
    const termoBusca = `%${termo.toUpperCase()}%`;

    const query = `
      SELECT TOP (@param2)
        NUCAMPO, NOMETAB, NOMECAMPO, DESCRCAMPO, TIPCAMPO, TIPOAPRESENTACAO,
        TAMANHO, MASCARA, EXPRESSAO, PERMITEPESQUISA, CALCULADO, PERMITEPADRAO,
        APRESENTACAO, ORDEM, VISIVELGRIDPESQUISA, SISTEMA, ADICIONAL, CONTROLE
      FROM TDDCAM WITH (NOLOCK)
      WHERE NOMECAMPO LIKE @param1 OR DESCRCAMPO LIKE @param1
      ORDER BY NOMETAB, NOMECAMPO
    `;

    const result = await this.sqlServerService.executeSQL(query, [termoBusca, limite]);

    const countQuery = `
      SELECT COUNT(*) AS total FROM TDDCAM WITH (NOLOCK)
      WHERE NOMECAMPO LIKE @param1 OR DESCRCAMPO LIKE @param1
    `;
    const countResult = await this.sqlServerService.executeSQL(countQuery, [termoBusca]);

    const campos = result.map((row: any) => Campo.criar(row));

    this.logger.debug(`Busca '${termo}' retornou ${campos.length} campos`);

    return {
      dados: campos,
      paginacao: {
        limite,
        offset,
        total: countResult[0]?.total || 0,
      },
    };
  }

  async obterOpcoesCampo(numeroCampo: number): Promise<OpcaoCampo[]> {
    const query = `
      SELECT VALOR, OPCAO, PADRAO, ORDEM
      FROM TDDOPC WITH (NOLOCK)
      WHERE NUCAMPO = @param1
      ORDER BY ORDEM, VALOR
    `;

    const result = await this.sqlServerService.executeSQL(query, [numeroCampo]);

    return result.map((row: any) => ({
      valor: row.VALOR,
      opcao: row.OPCAO,
      padrao: row.PADRAO,
      ordem: row.ORDEM,
    }));
  }
}
