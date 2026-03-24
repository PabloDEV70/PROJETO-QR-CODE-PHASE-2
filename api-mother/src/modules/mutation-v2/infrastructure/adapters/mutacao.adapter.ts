import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import { SqlServerService } from '../../../../database/sqlserver.service';
import { AuditService } from '../../../../security/audit.service';
import { DatabaseContextService } from '../../../../database/database-context.service';
import { IProvedorMutacao, IProvedorValidacao, PROVEDOR_VALIDACAO } from '../../application/ports';
import { OperacaoMutacao, ResultadoMutacao } from '../../domain/entities';

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

      for (const chavePK of chavesPrimarias) {
        const chavePKUpper = chavePK.toUpperCase();
        const colunaPK = colunasMap.get(chavePKUpper);

        // Se coluna PK não foi fornecida e é numérica, gerar próximo ID
        if (!Object.keys(dados).some((k) => k.toUpperCase() === chavePKUpper)) {
          if (colunaPK && ['int', 'numeric', 'decimal', 'bigint', 'smallint'].includes(colunaPK.tipo)) {
            this.logger.log(`Gerando ID automático para coluna PK: ${chavePK}`);

            // Buscar MAX ID + 1
            const maxIdQuery = `SELECT COALESCE(MAX([${chavePK}]), 0) + 1 as novoId FROM [${operacao.nomeTabela}]`;
            const resultMaxId = await this.sqlServerService.executeSQL(maxIdQuery, []);
            const proximoId = resultMaxId?.[0]?.novoId ?? resultMaxId?.[0]?.NOVOID ?? 1;

            dados[chavePK] = proximoId;
            this.logger.log(`ID automático gerado: ${chavePK} = ${proximoId}`);
          }
        }
      }

      // Construir query parametrizada
      const campos = Object.keys(dados);
      const valores = Object.values(dados);
      const placeholders = campos.map((_, i) => `@param${i + 1}`).join(', ');

      const quotedCampos = campos.map((c) => `[${c}]`).join(', ');
      const query = `INSERT INTO [${operacao.nomeTabela}] (${quotedCampos}) VALUES (${placeholders})`;

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

      // Executar INSERT - executeSQL returns recordset (empty for INSERT)
      await this.sqlServerService.executeSQL(query, valores);

      const duracao = Date.now() - inicio;

      // Audit log
      await this.auditService.logOperation({
        timestamp: new Date().toISOString(),
        user: operacao.usuario,
        ip: 'internal',
        database,
        operation: `INSERT:${operacao.nomeTabela}`,
        sql: query,
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
      const setClause = camposSet.map((c, i) => `[${c}] = @param${i + 1}`).join(', ');

      // Construir WHERE clause (para UPDATE query, params começam após SET)
      const camposWhere = Object.keys(operacao.condicao);
      const valoresWhere = Object.values(operacao.condicao);
      const whereClauseForUpdate = camposWhere.map((c, i) => `[${c}] = @param${camposSet.length + i + 1}`).join(' AND ');
      // WHERE clause para COUNT query (params começam em @param1)
      const whereClauseForCount = camposWhere.map((c, i) => `[${c}] = @param${i + 1}`).join(' AND ');

      const query = `UPDATE TOP(${operacao.limiteRegistros}) [${operacao.nomeTabela}] SET ${setClause} WHERE ${whereClauseForUpdate}`;
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

      // Count matching records before update
      const countQuery = `SELECT COUNT(*) as total FROM [${operacao.nomeTabela}] WHERE ${whereClauseForCount}`;
      const countResult = await this.sqlServerService.executeSQL(countQuery, valoresWhere);
      const matchingCount = Math.min(countResult?.[0]?.total ?? countResult?.[0]?.TOTAL ?? 0, operacao.limiteRegistros);

      // Executar UPDATE - executeSQL returns recordset (empty for UPDATE)
      await this.sqlServerService.executeSQL(query, params);

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
        registrosAfetados: matchingCount,
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
      const whereClause = camposWhere.map((c, i) => `[${c}] = @param${i + 1}`).join(' AND ');

      let query: string;
      let usarSoftDelete = operacao.softDelete;

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
        query = `UPDATE TOP(${operacao.limiteRegistros}) [${operacao.nomeTabela}] SET ATIVO = 'N' WHERE ${whereClause}`;
      } else {
        // Hard delete
        query = `DELETE TOP(${operacao.limiteRegistros}) FROM [${operacao.nomeTabela}] WHERE ${whereClause}`;
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

      // Count matching records before delete
      const countQuery = `SELECT COUNT(*) as total FROM [${operacao.nomeTabela}] WHERE ${whereClause}`;
      const countResult = await this.sqlServerService.executeSQL(countQuery, valoresWhere);
      const matchingCount = Math.min(countResult?.[0]?.total ?? countResult?.[0]?.TOTAL ?? 0, operacao.limiteRegistros);

      // Executar DELETE - executeSQL returns recordset (empty for DELETE/UPDATE)
      await this.sqlServerService.executeSQL(query, valoresWhere);

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
        registrosAfetados: matchingCount,
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
    const whereClause = camposWhere.map((c, i) => `[${c}] = @param${i + 1}`).join(' AND ');

    const query = `SELECT TOP(${operacao.limiteRegistros + 1}) * FROM [${operacao.nomeTabela}] WHERE ${whereClause}`;

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
