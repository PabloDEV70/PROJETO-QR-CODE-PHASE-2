import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import { SqlServerService } from '../../../../database/sqlserver.service';
import { AuditService } from '../../../../security/audit.service';
import { DatabaseContextService } from '../../../../database/database-context.service';
import { IProvedorMutacao, IProvedorValidacao, PROVEDOR_VALIDACAO } from '../../application/ports';
import { OperacaoMutacao, ResultadoMutacao } from '../../domain/entities';
import { safeBracket } from '../../../../common/utils/sql-identifier-validator';

@Injectable()
export class MutacaoAdapter implements IProvedorMutacao {
  private readonly logger = new Logger(MutacaoAdapter.name);

  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly auditService: AuditService,
    private readonly databaseContext: DatabaseContextService,
    @Inject(PROVEDOR_VALIDACAO) private readonly provedorValidacao: IProvedorValidacao,
  ) {}

  async inserir(operacao: OperacaoMutacao): Promise<ResultadoMutacao> {
    const inicio = Date.now();
    const database = this.databaseContext.getCurrentDatabase() || 'TESTE';

    try {
      if (!operacao.dados) {
        throw new BadRequestException('Dados para inserção não fornecidos');
      }

      // Preparar dados - obter colunas da tabela para validação
      const dados = { ...operacao.dados };
      const colunas = await this.provedorValidacao.obterColunas(operacao.nomeTabela);
      const colunasMap = new Map(colunas.map((c) => [c.nome.toUpperCase(), c]));

      // Verificar se há coluna PK não fornecida que precisa de ID automático
      const chavesPrimarias = await this.provedorValidacao.obterChavesPrimarias(operacao.nomeTabela);

      // Track which PKs need auto-ID so we can generate atomically
      const autoIdPKs: string[] = [];
      for (const chavePK of chavesPrimarias) {
        const chavePKUpper = chavePK.toUpperCase();
        const colunaPK = colunasMap.get(chavePKUpper);

        if (!Object.keys(dados).some((k) => k.toUpperCase() === chavePKUpper)) {
          if (colunaPK && ['int', 'numeric', 'decimal', 'bigint', 'smallint'].includes(colunaPK.tipo)) {
            autoIdPKs.push(chavePK);
            dados[chavePK] = 0; // placeholder - replaced by atomic query
          }
        }
      }

      // Construir query parametrizada
      const campos = Object.keys(dados);
      const valores = Object.values(dados);
      const placeholders = campos.map((_, i) => `@param${i + 1}`).join(', ');

      const quotedCampos = campos.map((c) => safeBracket(c, 'column')).join(', ');
      const tabelaSegura = safeBracket(operacao.nomeTabela, 'table');

      // Se dry-run, apenas retornar preview
      if (operacao.dryRun) {
        return ResultadoMutacao.sucesso({
          tipo: 'INSERT',
          nomeTabela: operacao.nomeTabela,
          registrosAfetados: 1,
          mensagem: '[DRY-RUN] INSERT seria executado com sucesso',
          dadosInseridos: dados,
          dryRun: true,
        });
      }

      let insertQuery: string;

      if (autoIdPKs.length > 0) {
        // Atomic auto-ID: SELECT MAX + INSERT with UPDLOCK, SERIALIZABLE hints
        const pkCol = safeBracket(autoIdPKs[0], 'column');
        const pkIdx = campos.findIndex((c) => c.toUpperCase() === autoIdPKs[0].toUpperCase());

        // Re-index params to be sequential (skip the PK slot which uses @newId)
        const reindexedPlaceholders = campos
          .map((_, i) => i === pkIdx ? '@newId' : `@param${i < pkIdx ? i + 1 : i}`)
          .join(', ');
        const atomicParams = valores.filter((_, i) => i !== pkIdx);

        insertQuery = `DECLARE @newId INT; SELECT @newId = COALESCE(MAX(${pkCol}), 0) + 1 FROM ${tabelaSegura} WITH (UPDLOCK, SERIALIZABLE); INSERT INTO ${tabelaSegura} (${quotedCampos}) VALUES (${reindexedPlaceholders}); SELECT @newId AS novoId;`;
        const result = await this.sqlServerService.executeSQL(insertQuery, atomicParams);
        const novoId = result?.[0]?.novoId ?? result?.[0]?.NOVOID;
        if (novoId) dados[autoIdPKs[0]] = novoId;
        this.logger.log(`ID automatico atomico gerado: ${autoIdPKs[0]} = ${novoId}`);
      } else {
        insertQuery = `INSERT INTO ${tabelaSegura} (${quotedCampos}) VALUES (${placeholders})`;
        await this.sqlServerService.executeSQL(insertQuery, valores);
      }

      const duracao = Date.now() - inicio;

      // Audit log
      await this.auditService.logOperation({
        timestamp: new Date().toISOString(),
        user: operacao.usuario,
        ip: 'internal',
        database,
        operation: `INSERT:${operacao.nomeTabela}`,
        sql: insertQuery,
        success: true,
        duration: duracao,
      });

      // INSERT of 1 record always affects 1 row if successful
      return ResultadoMutacao.sucesso({
        tipo: 'INSERT',
        nomeTabela: operacao.nomeTabela,
        registrosAfetados: 1,
        dadosInseridos: dados,
        tempoExecucao: duracao,
        dryRun: false,
      });
    } catch (error) {
      const duracao = Date.now() - inicio;
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';

      // Audit log de falha
      await this.auditService.logOperation({
        timestamp: new Date().toISOString(),
        user: operacao.usuario,
        ip: 'internal',
        database,
        operation: `INSERT:${operacao.nomeTabela}`,
        sql: 'ERROR',
        success: false,
        error: mensagem,
        duration: duracao,
      });

      this.logger.error(`INSERT falhou em ${operacao.nomeTabela}: ${mensagem}`);

      return ResultadoMutacao.falha({
        tipo: 'INSERT',
        nomeTabela: operacao.nomeTabela,
        mensagem: `Erro ao inserir: ${mensagem}`,
      });
    }
  }

  async atualizar(operacao: OperacaoMutacao): Promise<ResultadoMutacao> {
    const inicio = Date.now();
    const database = this.databaseContext.getCurrentDatabase() || 'TESTE';

    try {
      if (!operacao.dadosNovos || !operacao.condicao) {
        throw new BadRequestException('Dados novos e condição são obrigatórios para UPDATE');
      }

      // Construir SET clause
      const camposSet = Object.keys(operacao.dadosNovos);
      const valoresSet = Object.values(operacao.dadosNovos);
      const setClause = camposSet.map((c, i) => `${safeBracket(c, 'column')} = @param${i + 1}`).join(', ');

      // Construir WHERE clause (para UPDATE query, params começam após SET)
      const camposWhere = Object.keys(operacao.condicao);
      const valoresWhere = Object.values(operacao.condicao);
      const whereClauseForUpdate = camposWhere.map((c, i) => `${safeBracket(c, 'column')} = @param${camposSet.length + i + 1}`).join(' AND ');

      const limiteSeguro = Math.min(Math.max(1, Number(operacao.limiteRegistros) || 1), 10000);
      const query = `UPDATE TOP(${limiteSeguro}) ${safeBracket(operacao.nomeTabela, 'table')} SET ${setClause} WHERE ${whereClauseForUpdate}`;
      const params = [...valoresSet, ...valoresWhere];

      // Se dry-run, apenas retornar preview
      if (operacao.dryRun) {
        return ResultadoMutacao.sucesso({
          tipo: 'UPDATE',
          nomeTabela: operacao.nomeTabela,
          registrosAfetados: 0,
          mensagem: '[DRY-RUN] UPDATE seria executado',
          dryRun: true,
        });
      }

      // Execute UPDATE and get actual affected rows atomically via @@ROWCOUNT
      const queryWithRowCount = `${query}; SELECT @@ROWCOUNT AS affectedRows;`;
      const updateResult = await this.sqlServerService.executeSQL(queryWithRowCount, params);
      const affectedRows = updateResult?.[0]?.affectedRows ?? updateResult?.[0]?.AFFECTEDROWS ?? 0;

      const duracao = Date.now() - inicio;

      // Audit log
      await this.auditService.logOperation({
        timestamp: new Date().toISOString(),
        user: operacao.usuario,
        ip: 'internal',
        database,
        operation: `UPDATE:${operacao.nomeTabela}`,
        sql: query,
        success: true,
        duration: duracao,
      });

      return ResultadoMutacao.sucesso({
        tipo: 'UPDATE',
        nomeTabela: operacao.nomeTabela,
        registrosAfetados: affectedRows,
        tempoExecucao: duracao,
        dryRun: false,
      });
    } catch (error) {
      const duracao = Date.now() - inicio;
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';

      await this.auditService.logOperation({
        timestamp: new Date().toISOString(),
        user: operacao.usuario,
        ip: 'internal',
        database,
        operation: `UPDATE:${operacao.nomeTabela}`,
        sql: 'ERROR',
        success: false,
        error: mensagem,
        duration: duracao,
      });

      this.logger.error(`UPDATE falhou em ${operacao.nomeTabela}: ${mensagem}`);

      return ResultadoMutacao.falha({
        tipo: 'UPDATE',
        nomeTabela: operacao.nomeTabela,
        mensagem: `Erro ao atualizar: ${mensagem}`,
      });
    }
  }

  async excluir(operacao: OperacaoMutacao): Promise<ResultadoMutacao> {
    const inicio = Date.now();
    const database = this.databaseContext.getCurrentDatabase() || 'TESTE';

    try {
      if (!operacao.condicao) {
        throw new BadRequestException('Condição é obrigatória para DELETE');
      }

      // Construir WHERE clause
      const camposWhere = Object.keys(operacao.condicao);
      const valoresWhere = Object.values(operacao.condicao);
      const whereClause = camposWhere.map((c, i) => `${safeBracket(c, 'column')} = @param${i + 1}`).join(' AND ');

      let query: string;
      let usarSoftDelete = operacao.softDelete;
      const limiteSeguro = Math.min(Math.max(1, Number(operacao.limiteRegistros) || 1), 10000);
      const tabelaSegura = safeBracket(operacao.nomeTabela, 'table');

      if (operacao.softDelete) {
        // Verificar se a tabela tem coluna ATIVO para soft delete
        const temColunaAtivo = await this.provedorValidacao.colunaExiste(operacao.nomeTabela, 'ATIVO');
        if (!temColunaAtivo) {
          this.logger.warn(`Tabela ${operacao.nomeTabela} não possui coluna ATIVO. Usando hard delete.`);
          usarSoftDelete = false;
        }
      }

      if (usarSoftDelete) {
        // Soft delete: UPDATE SET ATIVO='N'
        query = `UPDATE TOP(${limiteSeguro}) ${tabelaSegura} SET ATIVO = 'N' WHERE ${whereClause}`;
      } else {
        // Hard delete
        query = `DELETE TOP(${limiteSeguro}) FROM ${tabelaSegura} WHERE ${whereClause}`;
      }

      // Se dry-run, apenas retornar preview
      if (operacao.dryRun) {
        return ResultadoMutacao.sucesso({
          tipo: 'DELETE',
          nomeTabela: operacao.nomeTabela,
          registrosAfetados: 0,
          mensagem: `[DRY-RUN] ${usarSoftDelete ? 'Soft' : 'Hard'} DELETE seria executado`,
          dryRun: true,
        });
      }

      // Execute DELETE and get actual affected rows atomically via @@ROWCOUNT
      const queryWithRowCount = `${query}; SELECT @@ROWCOUNT AS affectedRows;`;
      const deleteResult = await this.sqlServerService.executeSQL(queryWithRowCount, valoresWhere);
      const affectedRows = deleteResult?.[0]?.affectedRows ?? deleteResult?.[0]?.AFFECTEDROWS ?? 0;

      const duracao = Date.now() - inicio;

      // Audit log
      await this.auditService.logOperation({
        timestamp: new Date().toISOString(),
        user: operacao.usuario,
        ip: 'internal',
        database,
        operation: `${usarSoftDelete ? 'SOFT_DELETE' : 'HARD_DELETE'}:${operacao.nomeTabela}`,
        sql: query,
        success: true,
        duration: duracao,
      });

      return ResultadoMutacao.sucesso({
        tipo: 'DELETE',
        nomeTabela: operacao.nomeTabela,
        registrosAfetados: affectedRows,
        mensagem: usarSoftDelete ? 'Registros marcados como inativos' : 'Registros removidos permanentemente',
        tempoExecucao: duracao,
        dryRun: false,
      });
    } catch (error) {
      const duracao = Date.now() - inicio;
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';

      await this.auditService.logOperation({
        timestamp: new Date().toISOString(),
        user: operacao.usuario,
        ip: 'internal',
        database,
        operation: `DELETE:${operacao.nomeTabela}`,
        sql: 'ERROR',
        success: false,
        error: mensagem,
        duration: duracao,
      });

      this.logger.error(`DELETE falhou em ${operacao.nomeTabela}: ${mensagem}`);

      return ResultadoMutacao.falha({
        tipo: 'DELETE',
        nomeTabela: operacao.nomeTabela,
        mensagem: `Erro ao excluir: ${mensagem}`,
      });
    }
  }

  async buscarRegistrosAfetados(operacao: OperacaoMutacao): Promise<Record<string, unknown>[]> {
    if (!operacao.condicao) {
      return [];
    }

    const camposWhere = Object.keys(operacao.condicao);
    const valoresWhere = Object.values(operacao.condicao);
    const whereClause = camposWhere.map((c, i) => `${safeBracket(c, 'column')} = @param${i + 1}`).join(' AND ');

    const limiteSeguro = Math.min(Math.max(1, Number(operacao.limiteRegistros) || 1), 10000);
    const query = `SELECT TOP(${limiteSeguro + 1}) * FROM ${safeBracket(operacao.nomeTabela, 'table')} WHERE ${whereClause}`;

    try {
      // executeSQL returns recordset directly (array)
      const recordset = await this.sqlServerService.executeSQL(query, valoresWhere);
      return recordset || [];
    } catch (error) {
      this.logger.warn(`Erro ao buscar registros afetados: ${error}`);
      return [];
    }
  }
}
