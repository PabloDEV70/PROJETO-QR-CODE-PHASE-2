import { Injectable, Logger } from '@nestjs/common';
import { SqlServerService } from '../../../database/sqlserver.service';
import { DatabaseContextService } from '../../../database/database-context.service';

/**
 * Interface para detalhes completos de permissão
 */
export interface PermissaoDetalhada {
  nomeTabela: string;
  consultar: boolean;
  inserir: boolean;
  alterar: boolean;
  excluir: boolean;
  codTab?: number;
  nomeTab?: string;
}

/**
 * Tipos de operação permitidos
 */
export type TipoOperacao = 'CONSULTAR' | 'INSERIR' | 'ALTERAR' | 'EXCLUIR';

/**
 * Cache entry para permissões
 */
interface CacheEntry {
  permissoes: Map<string, PermissaoDetalhada>;
  timestamp: number;
}

/**
 * Serviço responsável por validar permissões de tabelas Sankhya
 * baseado nas tabelas TSIUAC e TSITAB
 */
@Injectable()
export class SankhyaPermissionValidatorService {
  private readonly logger = new Logger(SankhyaPermissionValidatorService.name);

  // Cache de permissões por usuário (TTL: 5 minutos)
  private readonly cache = new Map<number, CacheEntry>();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly databaseContext: DatabaseContextService,
  ) {}

  /**
   * Verifica se o usuário tem permissão para executar uma operação em uma tabela
   *
   * @param codUsuario - Código do usuário
   * @param nomeTabela - Nome da tabela (será convertido para uppercase)
   * @param operacao - Tipo de operação (CONSULTAR, INSERIR, ALTERAR, EXCLUIR)
   * @returns Promise<boolean> - true se tem permissão, false caso contrário
   */
  async verificarPermissaoTabela(codUsuario: number, nomeTabela: string, operacao: TipoOperacao): Promise<boolean> {
    const startTime = Date.now();
    const nomeTabNormalizado = nomeTabela.toUpperCase();

    this.logger.debug(
      `Verificando permissão: usuário=${codUsuario}, tabela=${nomeTabNormalizado}, operação=${operacao}`,
    );

    try {
      // Tentar obter do cache
      const permissoes = await this.obterPermissoesUsuario(codUsuario);
      const permissao = permissoes.get(nomeTabNormalizado);

      if (!permissao) {
        this.logger.warn(`Permissão NEGADA: usuário ${codUsuario} não tem acesso à tabela ${nomeTabNormalizado}`);
        return false;
      }

      // Verificar a flag específica da operação
      let temPermissao = false;
      switch (operacao) {
        case 'CONSULTAR':
          temPermissao = permissao.consultar;
          break;
        case 'INSERIR':
          temPermissao = permissao.inserir;
          break;
        case 'ALTERAR':
          temPermissao = permissao.alterar;
          break;
        case 'EXCLUIR':
          temPermissao = permissao.excluir;
          break;
      }

      const executionTime = Date.now() - startTime;

      if (temPermissao) {
        this.logger.debug(
          `Permissão CONCEDIDA: usuário ${codUsuario} pode ${operacao} em ${nomeTabNormalizado} (${executionTime}ms)`,
        );
      } else {
        this.logger.warn(`Permissão NEGADA: usuário ${codUsuario} não pode ${operacao} em ${nomeTabNormalizado}`);
      }

      return temPermissao;
    } catch (error) {
      this.logger.error(
        `Erro ao verificar permissão para usuário ${codUsuario}, tabela ${nomeTabNormalizado}`,
        error.stack,
      );
      // Em caso de erro, negar acesso por segurança
      return false;
    }
  }

  /**
   * Obtém lista de todas as tabelas que o usuário tem permissão de acesso
   *
   * @param codUsuario - Código do usuário
   * @returns Promise<string[]> - Array com nomes das tabelas permitidas
   */
  async obterTabelasPermitidas(codUsuario: number): Promise<string[]> {
    this.logger.debug(`Obtendo tabelas permitidas para usuário ${codUsuario}`);

    try {
      const permissoes = await this.obterPermissoesUsuario(codUsuario);
      const tabelas = Array.from(permissoes.keys());

      this.logger.debug(`Usuário ${codUsuario} tem acesso a ${tabelas.length} tabelas`);

      return tabelas;
    } catch (error) {
      this.logger.error(`Erro ao obter tabelas permitidas para usuário ${codUsuario}`, error.stack);
      return [];
    }
  }

  /**
   * Obtém detalhes completos de permissão para uma tabela específica
   *
   * @param codUsuario - Código do usuário
   * @param nomeTabela - Nome da tabela
   * @returns Promise<PermissaoDetalhada | null> - Detalhes da permissão ou null se não houver
   */
  async obterDetalhesPermissao(codUsuario: number, nomeTabela: string): Promise<PermissaoDetalhada | null> {
    const nomeTabNormalizado = nomeTabela.toUpperCase();

    try {
      const permissoes = await this.obterPermissoesUsuario(codUsuario);
      return permissoes.get(nomeTabNormalizado) || null;
    } catch (error) {
      this.logger.error(
        `Erro ao obter detalhes de permissão para usuário ${codUsuario}, tabela ${nomeTabNormalizado}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Limpa o cache de permissões de um usuário específico ou de todos
   *
   * @param codUsuario - Código do usuário (opcional, limpa todos se não informado)
   */
  limparCache(codUsuario?: number): void {
    if (codUsuario !== undefined) {
      this.cache.delete(codUsuario);
      this.logger.debug(`Cache limpo para usuário ${codUsuario}`);
    } else {
      this.cache.clear();
      this.logger.debug('Cache de permissões limpo completamente');
    }
  }

  /**
   * Obtém permissões do usuário do cache ou do banco de dados
   *
   * @private
   * @param codUsuario - Código do usuário
   * @returns Promise<Map<string, PermissaoDetalhada>> - Mapa de permissões por tabela
   */
  private async obterPermissoesUsuario(codUsuario: number): Promise<Map<string, PermissaoDetalhada>> {
    // Verificar cache
    const cacheEntry = this.cache.get(codUsuario);
    const now = Date.now();

    if (cacheEntry && now - cacheEntry.timestamp < this.CACHE_TTL_MS) {
      this.logger.debug(`Usando cache para usuário ${codUsuario}`);
      return cacheEntry.permissoes;
    }

    // Cache expirado ou não existe, buscar do banco
    this.logger.debug(`Cache miss ou expirado para usuário ${codUsuario}, consultando banco`);
    const permissoes = await this.buscarPermissoesDoBanco(codUsuario);

    // Atualizar cache
    this.cache.set(codUsuario, {
      permissoes,
      timestamp: now,
    });

    return permissoes;
  }

  /**
   * Busca permissões do banco de dados
   *
   * @private
   * @param codUsuario - Código do usuário
   * @returns Promise<Map<string, PermissaoDetalhada>> - Mapa de permissões por tabela
   */
  private async buscarPermissoesDoBanco(codUsuario: number): Promise<Map<string, PermissaoDetalhada>> {
    const query = `
      SELECT 
        t.NOMETAB,
        ISNULL(uac.CONSULTAR, 'N') AS CONSULTAR,
        ISNULL(uac.INSERIR, 'N') AS INSERIR,
        ISNULL(uac.ALTERAR, 'N') AS ALTERAR,
        ISNULL(uac.EXCLUIR, 'N') AS EXCLUIR,
        t.CODTAB,
        t.NOMEADT
      FROM TSITAB t
      LEFT JOIN TSIUAC uac ON uac.CODTAB = t.CODTAB AND uac.CODUSU = @param1
      WHERE uac.CODUSU IS NOT NULL
        AND (
          uac.CONSULTAR = 'S' 
          OR uac.INSERIR = 'S' 
          OR uac.ALTERAR = 'S' 
          OR uac.EXCLUIR = 'S'
        )
      ORDER BY t.NOMETAB
    `;

    const params = [codUsuario];

    try {
      const resultados = await this.sqlServerService.executeSQL(query, params);
      const permissoes = new Map<string, PermissaoDetalhada>();

      for (const row of resultados) {
        const detalhes: PermissaoDetalhada = {
          nomeTabela: row.NOMETAB,
          consultar: row.CONSULTAR === 'S',
          inserir: row.INSERIR === 'S',
          alterar: row.ALTERAR === 'S',
          excluir: row.EXCLUIR === 'S',
          codTab: row.CODTAB,
          nomeTab: row.NOMEADT,
        };

        permissoes.set(row.NOMETAB, detalhes);
      }

      this.logger.log(`Carregadas ${permissoes.size} permissões de tabela para usuário ${codUsuario}`);

      return permissoes;
    } catch (error) {
      this.logger.error(`Erro ao buscar permissões do banco para usuário ${codUsuario}`, error.stack);
      throw error;
    }
  }

  /**
   * Estatísticas do cache (útil para debugging e monitoramento)
   */
  obterEstatisticasCache(): {
    tamanho: number;
    usuarios: number[];
  } {
    return {
      tamanho: this.cache.size,
      usuarios: Array.from(this.cache.keys()),
    };
  }
}
