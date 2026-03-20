import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SqlServerService } from '../../../database/sqlserver.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';
import { DatabaseContextService } from '../../../database/database-context.service';

/**
 * Serviço para construir dinamicamente telas/formulários do Sankhya
 * Baseado na análise de construtor-de-telas.log (459.726 linhas)
 */
@Injectable()
export class ConstructorService {
  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly logger: StructuredLogger,
    private readonly databaseContext: DatabaseContextService,
  ) {}

  /**
   * Obter lista de telas/instâncias disponíveis (raiz)
   * Retorna instâncias onde NUINSTANCIAPAI IS NULL (telas raiz)
   */
  async obterTelasDisponiveis(): Promise<any[]> {
    try {
      const query = `
        SELECT
          NUINSTANCIA,
          NOMEINSTANCIA,
          DESCRTELA,
          NOMETAB,
          ATIVO
        FROM TDDINS
        WHERE NUINSTANCIAPAI IS NULL
          AND ATIVO = 'S'
        ORDER BY NOMEINSTANCIA ASC
      `;

      const resultado = await this.sqlServerService.executeSQL(query, []);
      this.logger.info('Telas disponíveis obtidas', { total: resultado.length });
      return resultado || [];
    } catch (erro) {
      this.logger.error('Erro ao obter telas disponíveis', erro as Error);
      throw new BadRequestException('Erro ao buscar telas disponíveis');
    }
  }

  /**
   * Obter definição completa de uma tela/instância
   * Inclui: campos, controles, sub-instâncias, permissões, relacionamentos
   */
  async obterDefinicaoTela(nomeInstancia: string, codusuario?: number): Promise<any> {
    // Validar nome da instância contra SQL injection
    this.validarNomeInstancia(nomeInstancia);

    try {
      // 1. Obter instância
      const queryInstancia = `
        SELECT
          NUINSTANCIA,
          NOMEINSTANCIA,
          DESCRTELA,
          NOMETAB,
          ATIVO
        FROM TDDINS
        WHERE NOMEINSTANCIA = @param1
      `;

      const instancia = await this.sqlServerService.executeSQL(queryInstancia, [nomeInstancia]);

      if (!instancia || instancia.length === 0) {
        throw new NotFoundException(`Tela "${nomeInstancia}" não encontrada`);
      }

      const instanciaData = instancia[0];
      const nuInstancia = instanciaData.NUINSTANCIA;
      const nomeTabela = instanciaData.NOMETAB;

      // 2. Obter campos da tabela
      const campos = await this.obterCamposTabelA(nomeTabela);

      // 3. Obter controles
      const controles = await this.obterControles();

      // 4. Obter sub-instâncias (filhos)
      const subInstancias = await this.obterSubInstancias(nuInstancia);

      // 5. Obter permissões do usuário
      const permissoes = codusuario ? await this.obterPermissoesUsuario(codusuario) : [];

      // 6. Obter relacionamentos
      const relacionamentos = await this.obterRelacionamentos();

      return {
        instancia: instanciaData,
        subInstancias,
        campos,
        controles,
        permissoes,
        relacionamentos,
      };
    } catch (erro) {
      if (erro instanceof NotFoundException) {
        throw erro;
      }
      this.logger.error(`Erro ao obter definição da tela ${nomeInstancia}`, erro as Error);
      throw new BadRequestException('Erro ao obter definição da tela');
    }
  }

  /**
   * Obter dados de exemplo da tabela associada à tela
   * Suporta paginação (limit e offset)
   */
  async obterDadosExemplo(
    nomeInstancia: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ dados: any[]; total: number; screenName: string }> {
    // Validar parâmetros
    this.validarNomeInstancia(nomeInstancia);
    limit = Math.min(Math.max(limit, 1), 1000); // Limitar entre 1-1000
    offset = Math.max(offset, 0);

    try {
      // Obter tabela associada
      const queryInstancia = `
        SELECT NOMETAB FROM TDDINS WHERE NOMEINSTANCIA = @param1
      `;

      const instancia = await this.sqlServerService.executeSQL(queryInstancia, [nomeInstancia]);

      if (!instancia || instancia.length === 0) {
        throw new NotFoundException(`Tela "${nomeInstancia}" não encontrada`);
      }

      const nomeTabela = instancia[0].NOMETAB;

      // Obter dados com paginação
      const queryDados = `
        SELECT * FROM [${nomeTabela}]
        ORDER BY 1
        OFFSET @param1 ROWS
        FETCH NEXT @param2 ROWS ONLY
      `;

      const dados = await this.sqlServerService.executeSQL(queryDados, [offset, limit]);

      // Obter total de registros
      const queryTotal = `SELECT COUNT(*) as total FROM [${nomeTabela}]`;
      const totalResult = await this.sqlServerService.executeSQL(queryTotal, []);
      const total = totalResult[0]?.total || 0;

      return {
        dados,
        total,
        screenName: nomeInstancia,
      };
    } catch (erro) {
      if (erro instanceof NotFoundException) {
        throw erro;
      }
      this.logger.error(`Erro ao obter dados de exemplo para ${nomeInstancia}`, erro as Error);
      throw new BadRequestException('Erro ao obter dados de exemplo');
    }
  }

  /**
   * Validar permissão de campo para uma operação específica
   * Usa tabela TRDCFC para validações
   */
  async validarPermissaoCampo(
    codusuario: number,
    nucontrole: number,
    nomecampo: string,
    operacao: 'read' | 'write' | 'delete',
  ): Promise<{ permitido: boolean; razao?: string }> {
    // Validar operação
    if (!['read', 'write', 'delete'].includes(operacao)) {
      throw new BadRequestException('Operação inválida. Use: read, write ou delete');
    }

    try {
      // Buscar configurações do usuário em TRDCFC
      const query = `
        SELECT NOME, VALOR FROM TRDCFC
        WHERE CODUSU = @param1
          AND NUCONTROLE = @param2
          AND NOMECAMPO = @param3
      `;

      const configs = await this.sqlServerService.executeSQL(query, [codusuario, nucontrole, nomecampo]);

      // Analisar configurações
      for (const config of configs) {
        const nome = config.NOME?.toLowerCase() || '';
        const valor = config.VALOR?.toLowerCase() || '';

        // Campo oculto?
        if (nome.includes('showmenu') && valor === 'false') {
          return { permitido: false, razao: 'Campo oculto para este usuário' };
        }

        // Read-only e tentando escrever?
        if (operacao !== 'read' && nome.includes('read_only') && valor === 'true') {
          return { permitido: false, razao: 'Campo em read-only para este usuário' };
        }

        // Deletar bloqueado?
        if (operacao === 'delete' && nome.includes('allow_delete') && valor === 'false') {
          return { permitido: false, razao: 'Deleção não permitida para este campo' };
        }
      }

      return { permitido: true };
    } catch (erro) {
      this.logger.error('Erro ao validar permissão de campo', erro as Error);
      throw new BadRequestException('Erro ao validar permissão');
    }
  }

  /**
   * Criar nova tela (registra em TDDINS e TDDTAB, opcionalmente cria tabela)
   */
  async criarTela(dto: {
    nomeInstancia: string;
    nomeTabela?: string;
    descricaoTela: string;
    descricaoTabela: string;
    criarTabela?: boolean;
    colunas?: Array<{ nome: string; tipo: string; tamanho?: number; nulo?: boolean }>;
    database?: string;
  }): Promise<{ sucesso: boolean; telaId?: number; mensagem: string }> {
    // PADRÃO SANKHYA 100%:
    // - NOMEINSTANCIA: AD_XXXX (com prefixo AD_)
    // - NOMETAB: AD_XXXX (IGUAL a NOMEINSTANCIA)
    // - Ambos devem ser uppercase

    // Normalizar e aplicar padrão
    let nomeInstancia = (dto.nomeInstancia || '').trim().toUpperCase();

    // Garantir prefixo AD_
    if (!nomeInstancia.startsWith('AD_')) {
      nomeInstancia = `AD_${nomeInstancia}`;
    }

    // NOMETAB deve ser igual a NOMEINSTANCIA (padrão Sankhya)
    const nomeTabela = nomeInstancia;

    // Validar
    this.validarNomeInstancia(nomeInstancia);

    if (!dto.descricaoTela || dto.descricaoTela.trim().length === 0) {
      throw new BadRequestException('Descrição da tela é obrigatória');
    }

    if (!dto.descricaoTabela || dto.descricaoTabela.trim().length === 0) {
      throw new BadRequestException('Descrição da tabela é obrigatória');
    }

    // Executar todas as operações no contexto do banco de dados correto
    const dbKey = (dto.database || 'TESTE') as any;

    return this.databaseContext.run(dbKey, async () => {
      try {
        // 1. Verificar se já existe
        const existente = await this.sqlServerService.executeSQL(
          `SELECT NOMEINSTANCIA FROM TDDINS WHERE NOMEINSTANCIA = @param1`,
          [nomeInstancia],
        );

        if (existente && existente.length > 0) {
          throw new BadRequestException(`Tela "${nomeInstancia}" já existe`);
        }

        // 2. Criar tabela se solicitado
        if (dto.criarTabela) {
          await this.criarTabelaDados(nomeTabela, dto.colunas || []);
        }

        // 3. Registrar em TDDTAB
        const nuCampoNumeracao = 9999990000 + Math.floor(Math.random() * 9999); // Gerar número aleatório
        await this.sqlServerService.executeSQL(
          `
          INSERT INTO TDDTAB (NOMETAB, DESCRTAB, TIPONUMERACAO, NUCAMPONUMERACAO, ADICIONAL, CONTROLE)
          VALUES (@param1, @param2, @param3, @param4, @param5, @param6)
          `,
          [nomeTabela, dto.descricaoTabela, 'A', nuCampoNumeracao, 'S', '1'],
        );

        // 4. Obter próximo NUINSTANCIA
        const maxResult = await this.sqlServerService.executeSQL(`SELECT MAX(NUINSTANCIA) as MAXIMO FROM TDDINS`, []);
        const nuInstancia = (maxResult[0]?.MAXIMO || 9999990000) + 1;

        // 5. Registrar em TDDINS
        await this.sqlServerService.executeSQL(
          `
          INSERT INTO TDDINS (
            NUINSTANCIA, NOMEINSTANCIA, NOMETAB, DESCRINSTANCIA, DESCRTELA,
            ATIVO, ADICIONAL, RAIZ, FILTRO, ISLIB, CONTROLE,
            RESOURCEID, DEFINICAOINST
          ) VALUES (
            @param1, @param2, @param3, @param4, @param5,
            @param6, @param7, @param8, @param9, @param10, @param11,
            @param12, @param13
          )
          `,
          [
            nuInstancia,
            nomeInstancia,
            nomeTabela,
            dto.descricaoTela,
            dto.descricaoTela,
            'S', // ATIVO
            'S', // ADICIONAL
            'N', // RAIZ
            'N', // FILTRO
            'S', // ISLIB
            '1', // CONTROLE
            `br.com.sankhya.menu.adicional.${nomeInstancia}`, // RESOURCEID
            'L', // DEFINICAOINST
          ],
        );

        this.logger.info('Tela criada com sucesso (padrão Sankhya 100%)', {
          nomeInstancia: nomeInstancia,
          nomeTabela: nomeTabela,
          database: dto.database || 'TESTE',
          nuInstancia,
        });

        return {
          sucesso: true,
          telaId: nuInstancia,
          mensagem: `Tela "${nomeInstancia}" criada com sucesso com padrão Sankhya 100% (AD_ + UPPERCASE). Ela deve aparecer no construtor de telas do Sankhya em alguns momentos.`,
          nomeInstancia: nomeInstancia,
          nomeTabela: nomeTabela,
        };
      } catch (erro) {
        if (erro instanceof BadRequestException) {
          throw erro;
        }
        this.logger.error('Erro ao criar tela', erro as Error);
        throw new BadRequestException(`Erro ao criar tela: ${(erro as any).message}`);
      }
    });
  }

  /**
   * Deletar tela (remove de TDDINS e TDDTAB, opcionalmente deleta tabela)
   */
  async deletarTela(
    nomeInstancia: string,
    deletarTabela?: boolean,
    database?: string,
  ): Promise<{ sucesso: boolean; mensagem: string }> {
    this.validarNomeInstancia(nomeInstancia);

    // Executar todas as operações no contexto do banco de dados correto
    const dbKey = (database || 'TESTE') as any;

    return this.databaseContext.run(dbKey, async () => {
      try {
        // 1. Buscar informações da tela
        const tela = await this.sqlServerService.executeSQL(
          `SELECT NOMETAB FROM TDDINS WHERE NOMEINSTANCIA = @param1`,
          [nomeInstancia],
        );

        if (!tela || tela.length === 0) {
          throw new NotFoundException(`Tela "${nomeInstancia}" não encontrada`);
        }

        const nomeTabela = tela[0].NOMETAB;

        // 2. Deletar de TDDINS
        await this.sqlServerService.executeSQL(`DELETE FROM TDDINS WHERE NOMEINSTANCIA = @param1`, [nomeInstancia]);

        // 3. Deletar de TDDTAB
        await this.sqlServerService.executeSQL(`DELETE FROM TDDTAB WHERE NOMETAB = @param1`, [nomeTabela]);

        // 4. Deletar tabela se solicitado
        if (deletarTabela) {
          await this.sqlServerService.executeSQL(`DROP TABLE [${nomeTabela}]`, []);
        }

        this.logger.info('Tela deletada com sucesso', {
          nomeInstancia,
          nomeTabela,
          database: database || 'TESTE',
          tabelaDeletada: deletarTabela,
        });

        return {
          sucesso: true,
          mensagem: `Tela "${nomeInstancia}" deletada com sucesso.`,
        };
      } catch (erro) {
        if (erro instanceof NotFoundException) {
          throw erro;
        }
        this.logger.error('Erro ao deletar tela', erro as Error);
        throw new BadRequestException(`Erro ao deletar tela: ${(erro as any).message}`);
      }
    });
  }

  /**
   * Criar tabela de dados com estrutura básica
   */
  private async criarTabelaDados(
    nomeTabela: string,
    colunas: Array<{ nome: string; tipo: string; tamanho?: number; nulo?: boolean }>,
  ): Promise<void> {
    try {
      // Padrão Sankhya: primeira coluna é PRIMARY KEY, sem ID auto-increment
      let sql = `CREATE TABLE [${nomeTabela}] (\n`;

      // Rastrear colunas
      const colunasAdicionadas = new Set<string>();
      let isPrimeiraColuna = true;

      // Adicionar colunas customizadas
      if (colunas && colunas.length > 0) {
        for (const col of colunas) {
          const tipo = col.tipo === 'varchar' ? `VARCHAR(${col.tamanho || 255})` : col.tipo;
          const nulo = col.nulo !== false ? 'NULL' : 'NOT NULL';

          // Primeira coluna é PRIMARY KEY (padrão Sankhya)
          const pk = isPrimeiraColuna ? 'PRIMARY KEY' : '';
          sql += `  ${col.nome} ${tipo} ${nulo} ${pk},\n`;
          colunasAdicionadas.add(col.nome.toUpperCase());
          isPrimeiraColuna = false;
        }
      } else {
        // Se nenhuma coluna foi fornecida, criar coluna padrão como PK
        sql += `  ID INT PRIMARY KEY,\n`;
        colunasAdicionadas.add('ID');
      }

      // Adicionar colunas padrão do Sankhya (se não foram fornecidas)
      if (!colunasAdicionadas.has('DESCRICAO')) {
        sql += `  DESCRICAO VARCHAR(255) NULL,\n`;
      }
      if (!colunasAdicionadas.has('CONTROLE')) {
        sql += `  CONTROLE INT DEFAULT 1,\n`;
      }
      if (!colunasAdicionadas.has('DATAULTALT')) {
        sql += `  DATAULTALT DATETIME DEFAULT GETDATE()\n`;
      } else {
        sql = sql.slice(0, -2) + '\n'; // Remove última vírgula
      }

      sql += `);`;

      await this.sqlServerService.executeSQL(sql, []);

      this.logger.info('Tabela de dados criada com padrão Sankhya', { nomeTabela });
    } catch (erro) {
      this.logger.error(`Erro ao criar tabela ${nomeTabela}`, erro as Error);
      throw new BadRequestException(`Erro ao criar tabela: ${(erro as any).message}`);
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Obter campos da tabela
   */
  private async obterCamposTabelA(nomeTabela: string): Promise<any[]> {
    try {
      const query = `
        SELECT
          COLUMN_NAME as NOMECAM,
          DATA_TYPE as TIPOCAM,
          CHARACTER_MAXIMUM_LENGTH as TAMANHO,
          IS_NULLABLE as NULVEL
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = @param1
        ORDER BY ORDINAL_POSITION
      `;

      return await this.sqlServerService.executeSQL(query, [nomeTabela]);
    } catch (erro) {
      this.logger.error(`Erro ao obter campos da tabela ${nomeTabela}`, erro as Error);
      return [];
    }
  }

  /**
   * Obter sub-instâncias (filhos via NUINSTANCIAPAI)
   */
  private async obterSubInstancias(nuInstancia: number): Promise<any[]> {
    try {
      const query = `
        SELECT
          NUINSTANCIA,
          NOMEINSTANCIA,
          DESCRTELA,
          NOMETAB,
          ATIVO
        FROM TDDINS
        WHERE NUINSTANCIAPAI = @param1
          AND ATIVO = 'S'
        ORDER BY NOMEINSTANCIA
      `;

      return await this.sqlServerService.executeSQL(query, [nuInstancia]);
    } catch (erro) {
      this.logger.error(`Erro ao obter sub-instâncias para ${nuInstancia}`, erro as Error);
      return [];
    }
  }

  /**
   * Obter controles (TRDCON)
   */
  private async obterControles(): Promise<any[]> {
    try {
      const query = `
        SELECT
          NUCONTROLE,
          TIPOCONTROLE,
          DESCRCONTROLE
        FROM TRDCON
        ORDER BY NUCONTROLE
      `;

      return await this.sqlServerService.executeSQL(query, []);
    } catch (erro) {
      this.logger.error('Erro ao obter controles', erro as Error);
      return [];
    }
  }

  /**
   * Obter permissões do usuário (TRDCFC)
   */
  private async obterPermissoesUsuario(codusuario: number): Promise<any[]> {
    try {
      const query = `
        SELECT
          NOME,
          VALOR,
          NUCONTROLE,
          NOMECAMPO
        FROM TRDCFC
        WHERE CODUSU = @param1
      `;

      return await this.sqlServerService.executeSQL(query, [codusuario]);
    } catch (erro) {
      this.logger.error(`Erro ao obter permissões do usuário ${codusuario}`, erro as Error);
      return [];
    }
  }

  /**
   * Obter relacionamentos entre tabelas (TDDLIG - opcional)
   */
  private async obterRelacionamentos(): Promise<any[]> {
    try {
      const query = `
        SELECT
          NOMELIGACAO,
          TABELAPAI,
          TABELAFILHA
        FROM TDDLIG
      `;

      return await this.sqlServerService.executeSQL(query, []);
    } catch (erro) {
      this.logger.error('Erro ao obter relacionamentos', erro as Error);
      return [];
    }
  }

  /**
   * Validar nome de instância contra SQL injection
   */
  private validarNomeInstancia(nome: string): void {
    if (!nome || !/^[A-Z0-9_]+$/i.test(nome)) {
      throw new BadRequestException('Nome de instância inválido. Use apenas letras, números e underscore.');
    }
  }
}
