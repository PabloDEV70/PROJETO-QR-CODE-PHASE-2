import { Injectable, Logger } from '@nestjs/common';
import { SqlServerService } from '../../../../database/sqlserver.service';
import { Tabela } from '../../domain/entities';
import { IProvedorTabelas, OpcoesPaginacao, ResultadoPaginado } from '../../application/ports';

/**
 * Infrastructure Adapter: TabelasAdapter
 *
 * Implementa IProvedorTabelas consultando TDDTAB no SQL Server.
 */
@Injectable()
export class TabelasAdapter implements IProvedorTabelas {
  private readonly logger = new Logger(TabelasAdapter.name);

  constructor(private readonly sqlServerService: SqlServerService) {}

  async listarTabelas(opcoes?: OpcoesPaginacao): Promise<ResultadoPaginado<Tabela>> {
    const limite = opcoes?.limite ?? 10000;
    const offset = opcoes?.offset ?? 0;

    const query = `
      SELECT TOP (@param1)
        NOMETAB, DESCRTAB, TIPONUMERACAO, NUCAMPONUMERACAO, ADICIONAL
      FROM TDDTAB WITH (NOLOCK)
      ORDER BY NOMETAB
    `;

    const result = await this.sqlServerService.executeSQL(query, [limite]);

    const countResult = await this.sqlServerService.executeSQL(
      'SELECT COUNT(*) AS total FROM TDDTAB WITH (NOLOCK)',
      [],
    );

    const tabelas = result.map((row: any) => Tabela.criar(row));

    this.logger.debug(`Listadas ${tabelas.length} tabelas`);

    return {
      dados: tabelas,
      paginacao: {
        limite,
        offset,
        total: countResult[0]?.total || 0,
      },
    };
  }

  async obterTabelaPorNome(nome: string): Promise<Tabela | null> {
    const query = `
      SELECT NOMETAB, DESCRTAB, TIPONUMERACAO, NUCAMPONUMERACAO, ADICIONAL
      FROM TDDTAB WITH (NOLOCK)
      WHERE NOMETAB = @param1
    `;

    const result = await this.sqlServerService.executeSQL(query, [nome]);

    if (result.length === 0) {
      return null;
    }

    return Tabela.criar(result[0]);
  }

  async buscarTabelas(termo: string, opcoes?: OpcoesPaginacao): Promise<ResultadoPaginado<Tabela>> {
    const limite = opcoes?.limite ?? 10000;
    const offset = opcoes?.offset ?? 0;
    const termoBusca = `%${termo.toUpperCase()}%`;

    const query = `
      SELECT TOP (@param2)
        NOMETAB, DESCRTAB, TIPONUMERACAO, NUCAMPONUMERACAO, ADICIONAL
      FROM TDDTAB WITH (NOLOCK)
      WHERE NOMETAB LIKE @param1 OR DESCRTAB LIKE @param1
      ORDER BY NOMETAB
    `;

    const result = await this.sqlServerService.executeSQL(query, [termoBusca, limite]);

    const countQuery = `
      SELECT COUNT(*) AS total FROM TDDTAB WITH (NOLOCK)
      WHERE NOMETAB LIKE @param1 OR DESCRTAB LIKE @param1
    `;
    const countResult = await this.sqlServerService.executeSQL(countQuery, [termoBusca]);

    const tabelas = result.map((row: any) => Tabela.criar(row));

    this.logger.debug(`Busca '${termo}' retornou ${tabelas.length} tabelas`);

    return {
      dados: tabelas,
      paginacao: {
        limite,
        offset,
        total: countResult[0]?.total || 0,
      },
    };
  }
}
