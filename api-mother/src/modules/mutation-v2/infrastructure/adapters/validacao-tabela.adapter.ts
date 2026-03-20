import { Injectable, Logger } from '@nestjs/common';
import { SqlServerService } from '../../../../database/sqlserver.service';
import { IProvedorValidacao, MetadadosColuna, ResultadoValidacao, ErroValidacao } from '../../application/ports';

@Injectable()
export class ValidacaoTabelaAdapter implements IProvedorValidacao {
  private readonly logger = new Logger(ValidacaoTabelaAdapter.name);

  // Cache simples de metadados
  private cacheMetadados: Map<string, { colunas: MetadadosColuna[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  constructor(private readonly sqlServerService: SqlServerService) {}

  async tabelaExiste(nomeTabela: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as existe
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_NAME = @param1
    `;

    try {
      // executeSQL returns recordset directly (array), not the full result object
      const recordset = await this.sqlServerService.executeSQL(query, [nomeTabela.toUpperCase()]);
      const row = recordset?.[0];
      // Handle both lowercase and uppercase column names (SQL Server can return either)
      const count = row?.existe ?? row?.EXISTE ?? 0;
      this.logger.debug(`Verificação de tabela ${nomeTabela}: count=${count}, row=${JSON.stringify(row)}`);
      return count > 0;
    } catch (error) {
      this.logger.error(`Erro ao verificar existência da tabela ${nomeTabela}: ${error}`);
      return false;
    }
  }

  async obterColunas(nomeTabela: string): Promise<MetadadosColuna[]> {
    // Verificar cache
    const cached = this.cacheMetadados.get(nomeTabela);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.colunas;
    }

    const query = `
      SELECT
        c.COLUMN_NAME as nome,
        c.DATA_TYPE as tipo,
        c.CHARACTER_MAXIMUM_LENGTH as tamanho,
        CASE WHEN c.IS_NULLABLE = 'NO' THEN 1 ELSE 0 END as obrigatorio,
        CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END as chavePrimaria,
        CASE WHEN fk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END as chaveEstrangeira,
        c.COLUMN_DEFAULT as valorPadrao
      FROM INFORMATION_SCHEMA.COLUMNS c
      LEFT JOIN (
        SELECT ku.COLUMN_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
        WHERE tc.TABLE_NAME = @param1 AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
      ) pk ON pk.COLUMN_NAME = c.COLUMN_NAME
      LEFT JOIN (
        SELECT ku.COLUMN_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
        WHERE tc.TABLE_NAME = @param1 AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
      ) fk ON fk.COLUMN_NAME = c.COLUMN_NAME
      WHERE c.TABLE_NAME = @param1
      ORDER BY c.ORDINAL_POSITION
    `;

    try {
      // executeSQL returns recordset directly (array), not the full result object
      const recordset = await this.sqlServerService.executeSQL(query, [nomeTabela.toUpperCase()]);
      const colunas: MetadadosColuna[] = (recordset || []).map((row: Record<string, unknown>) => {
        // Handle both lowercase and uppercase column names
        const getValue = (lowerKey: string, upperKey: string) => row[lowerKey] ?? row[upperKey];
        return {
          nome: String(getValue('nome', 'NOME') ?? getValue('COLUMN_NAME', 'column_name') ?? ''),
          tipo: String(getValue('tipo', 'TIPO') ?? getValue('DATA_TYPE', 'data_type') ?? ''),
          tamanho: (getValue('tamanho', 'TAMANHO') ??
            getValue('CHARACTER_MAXIMUM_LENGTH', 'character_maximum_length')) as number | null,
          obrigatorio: getValue('obrigatorio', 'OBRIGATORIO') === 1,
          chavePrimaria: getValue('chavePrimaria', 'CHAVEPRIMARIA') === 1,
          chaveEstrangeira: getValue('chaveEstrangeira', 'CHAVEESTRANGEIRA') === 1,
          valorPadrao: getValue('valorPadrao', 'VALORPADRAO') ?? getValue('COLUMN_DEFAULT', 'column_default'),
        };
      });

      // Atualizar cache
      this.cacheMetadados.set(nomeTabela, { colunas, timestamp: Date.now() });

      return colunas;
    } catch (error) {
      this.logger.error(`Erro ao obter colunas de ${nomeTabela}: ${error}`);
      return [];
    }
  }

  async validarDados(
    nomeTabela: string,
    dados: Record<string, unknown>,
    opcoes?: { ignorarObrigatorios?: boolean },
  ): Promise<ResultadoValidacao> {
    const erros: ErroValidacao[] = [];
    const colunas = await this.obterColunas(nomeTabela);

    if (colunas.length === 0) {
      return {
        valido: false,
        erros: [
          {
            campo: 'tabela',
            mensagem: `Tabela ${nomeTabela} não encontrada ou sem colunas`,
            codigo: 'TABLE_NOT_FOUND',
          },
        ],
      };
    }

    const camposFornecidos = Object.keys(dados).map((c) => c.toUpperCase());
    const colunasMap = new Map(colunas.map((c) => [c.nome.toUpperCase(), c]));

    // Verificar campos obrigatórios não fornecidos (skip for UPDATE operations)
    if (!opcoes?.ignorarObrigatorios) {
      for (const coluna of colunas) {
        if (coluna.obrigatorio && !coluna.valorPadrao && !coluna.chavePrimaria) {
          if (!camposFornecidos.includes(coluna.nome.toUpperCase())) {
            erros.push({
              campo: coluna.nome,
              mensagem: `Campo obrigatório não fornecido`,
              codigo: 'REQUIRED_FIELD',
            });
          }
        }
      }
    }

    // Verificar campos fornecidos que não existem
    for (const campo of camposFornecidos) {
      if (!colunasMap.has(campo)) {
        erros.push({
          campo,
          mensagem: `Campo não existe na tabela ${nomeTabela}`,
          codigo: 'UNKNOWN_FIELD',
        });
      }
    }

    // Verificar tipos e tamanhos
    for (const [campo, valor] of Object.entries(dados)) {
      const coluna = colunasMap.get(campo.toUpperCase());
      if (!coluna) continue;

      // Verificar tamanho de strings
      if (typeof valor === 'string' && coluna.tamanho && valor.length > coluna.tamanho) {
        erros.push({
          campo,
          mensagem: `Valor excede tamanho máximo (${coluna.tamanho} caracteres)`,
          codigo: 'MAX_LENGTH_EXCEEDED',
        });
      }

      // Verificar tipo numérico
      if (['int', 'numeric', 'decimal', 'float', 'bigint', 'smallint'].includes(coluna.tipo)) {
        if (valor !== null && typeof valor !== 'number' && isNaN(Number(valor))) {
          erros.push({
            campo,
            mensagem: `Esperado valor numérico`,
            codigo: 'INVALID_TYPE',
          });
        }
      }
    }

    return {
      valido: erros.length === 0,
      erros,
    };
  }

  async obterChavesPrimarias(nomeTabela: string): Promise<string[]> {
    const colunas = await this.obterColunas(nomeTabela);
    return colunas.filter((c) => c.chavePrimaria).map((c) => c.nome);
  }

  async validarChavesEstrangeiras(nomeTabela: string, dados: Record<string, unknown>): Promise<ResultadoValidacao> {
    // Simplificado: apenas verifica se os campos de FK têm valores válidos nas tabelas referenciadas
    // Implementação completa exigiria consultar sys.foreign_keys para obter as referências

    const erros: ErroValidacao[] = [];
    const colunas = await this.obterColunas(nomeTabela);

    for (const coluna of colunas.filter((c) => c.chaveEstrangeira)) {
      const valor = dados[coluna.nome] || dados[coluna.nome.toLowerCase()];
      if (valor !== undefined && valor !== null) {
        // Para uma implementação completa, verificaríamos se o valor existe na tabela referenciada
        // Por agora, apenas logamos que há uma FK
        this.logger.debug(`FK ${coluna.nome} = ${valor} (validação simplificada)`);
      }
    }

    return {
      valido: erros.length === 0,
      erros,
    };
  }

  async colunaExiste(nomeTabela: string, nomeColuna: string): Promise<boolean> {
    const colunas = await this.obterColunas(nomeTabela);
    return colunas.some((c) => c.nome.toUpperCase() === nomeColuna.toUpperCase());
  }
}
