import { Injectable, Logger } from '@nestjs/common';
import { SqlServerService } from '../../../../database/sqlserver.service';

/**
 * Serviço de tradução do dicionário.
 *
 * Gerencia traduções de tabelas e campos usando as tabelas TDDTABI18N e TDDCAMI18N.
 *
 * @module Dicionario/I18n
 */
@Injectable()
export class TraducaoService {
  private readonly logger = new Logger(TraducaoService.name);

  // Idiomas suportados
  private readonly IDIOMAS_SUPORTADOS = ['pt-BR', 'en-US', 'es-ES'];
  private readonly IDIOMA_PADRAO = 'pt-BR';

  constructor(private readonly sqlServerService: SqlServerService) {}

  /**
   * Obtém tradução de tabela.
   *
   * @param nomeTabela - Nome da tabela
   * @param idioma - Idioma desejado (padrão: pt-BR)
   * @param _tokenUsuario - Token JWT (não utilizado, contexto gerenciado externamente)
   * @returns Tradução ou null se não encontrada
   */
  async obterTraducaoTabela(nomeTabela: string, idioma: string, _tokenUsuario: string): Promise<TraducaoTabela | null> {
    const idiomaResolvido = this.resolverIdioma(idioma);

    try {
      const sql = `
        SELECT
          t.NOMETAB,
          t.IDIOMA,
          t.DESCRICAO as DESCRICAO_TRADUZIDA
        FROM TDDTABI18N t
        WHERE t.NOMETAB = @param1
          AND t.IDIOMA = @param2
      `;

      const result = await this.sqlServerService.executeSQL(sql, [nomeTabela.toUpperCase(), idiomaResolvido]);

      if (!result || result.length === 0) {
        this.logger.debug(`Tradução não encontrada: ${nomeTabela} (${idiomaResolvido})`);
        return null;
      }

      return {
        nomeTabela: result[0].NOMETAB,
        idioma: result[0].IDIOMA,
        descricaoTraduzida: result[0].DESCRICAO_TRADUZIDA,
      };
    } catch (error) {
      this.logger.error(`Erro ao buscar tradução de tabela: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Obtém tradução de campo.
   *
   * @param nomeTabela - Nome da tabela
   * @param nomeCampo - Nome do campo
   * @param idioma - Idioma desejado (padrão: pt-BR)
   * @param _tokenUsuario - Token JWT (não utilizado)
   * @returns Tradução ou null se não encontrada
   */
  async obterTraducaoCampo(
    nomeTabela: string,
    nomeCampo: string,
    idioma: string,
    _tokenUsuario: string,
  ): Promise<TraducaoCampo | null> {
    const idiomaResolvido = this.resolverIdioma(idioma);

    try {
      const sql = `
        SELECT
          c.NOMETAB,
          c.NOMECAM,
          c.IDIOMA,
          c.DESCRICAO as DESCRICAO_TRADUZIDA,
          c.DESCRRESUMIDA as DESCRICAO_RESUMIDA_TRADUZIDA
        FROM TDDCAMI18N c
        WHERE c.NOMETAB = @param1
          AND c.NOMECAM = @param2
          AND c.IDIOMA = @param3
      `;

      const result = await this.sqlServerService.executeSQL(sql, [
        nomeTabela.toUpperCase(),
        nomeCampo.toUpperCase(),
        idiomaResolvido,
      ]);

      if (!result || result.length === 0) {
        this.logger.debug(`Tradução não encontrada: ${nomeTabela}.${nomeCampo} (${idiomaResolvido})`);
        return null;
      }

      return {
        nomeTabela: result[0].NOMETAB,
        nomeCampo: result[0].NOMECAM,
        idioma: result[0].IDIOMA,
        descricaoTraduzida: result[0].DESCRICAO_TRADUZIDA,
        descricaoResumidaTraduzida: result[0].DESCRICAO_RESUMIDA_TRADUZIDA,
      };
    } catch (error) {
      this.logger.error(`Erro ao buscar tradução de campo: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Obtém traduções de todos os campos de uma tabela.
   *
   * @param nomeTabela - Nome da tabela
   * @param idioma - Idioma desejado
   * @param _tokenUsuario - Token JWT (não utilizado)
   * @returns Lista de traduções
   */
  async obterTraducoesCamposTabela(
    nomeTabela: string,
    idioma: string,
    _tokenUsuario: string,
  ): Promise<TraducaoCampo[]> {
    const idiomaResolvido = this.resolverIdioma(idioma);

    try {
      const sql = `
        SELECT
          c.NOMETAB,
          c.NOMECAM,
          c.IDIOMA,
          c.DESCRICAO as DESCRICAO_TRADUZIDA,
          c.DESCRRESUMIDA as DESCRICAO_RESUMIDA_TRADUZIDA
        FROM TDDCAMI18N c
        WHERE c.NOMETAB = @param1
          AND c.IDIOMA = @param2
        ORDER BY c.NOMECAM
      `;

      const result = await this.sqlServerService.executeSQL(sql, [nomeTabela.toUpperCase(), idiomaResolvido]);

      if (!result) {
        return [];
      }

      return result.map((row: any) => ({
        nomeTabela: row.NOMETAB,
        nomeCampo: row.NOMECAM,
        idioma: row.IDIOMA,
        descricaoTraduzida: row.DESCRICAO_TRADUZIDA,
        descricaoResumidaTraduzida: row.DESCRICAO_RESUMIDA_TRADUZIDA,
      }));
    } catch (error) {
      this.logger.error(`Erro ao buscar traduções de campos: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * Obtém idiomas disponíveis para uma tabela.
   *
   * @param nomeTabela - Nome da tabela
   * @param _tokenUsuario - Token JWT (não utilizado)
   * @returns Lista de idiomas disponíveis
   */
  async obterIdiomasDisponiveis(nomeTabela: string, _tokenUsuario: string): Promise<string[]> {
    try {
      const sql = `
        SELECT DISTINCT
          t.IDIOMA
        FROM TDDTABI18N t
        WHERE t.NOMETAB = @param1
        ORDER BY t.IDIOMA
      `;

      const result = await this.sqlServerService.executeSQL(sql, [nomeTabela.toUpperCase()]);

      if (!result) {
        return [];
      }

      return result.map((row: any) => row.IDIOMA);
    } catch (error) {
      this.logger.error(`Erro ao buscar idiomas disponíveis: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * Resolve idioma para código suportado.
   *
   * @param idioma - Idioma solicitado
   * @returns Idioma resolvido ou padrão
   */
  private resolverIdioma(idioma?: string): string {
    if (!idioma) {
      return this.IDIOMA_PADRAO;
    }

    const idiomaLower = idioma.toLowerCase();

    // Mapear variações comuns
    const mapeamento: Record<string, string> = {
      pt: 'pt-BR',
      'pt-br': 'pt-BR',
      en: 'en-US',
      'en-us': 'en-US',
      es: 'es-ES',
      'es-es': 'es-ES',
    };

    const resolvido = mapeamento[idiomaLower];

    if (resolvido && this.IDIOMAS_SUPORTADOS.includes(resolvido)) {
      return resolvido;
    }

    this.logger.warn(`Idioma não suportado: ${idioma}, usando padrão: ${this.IDIOMA_PADRAO}`);
    return this.IDIOMA_PADRAO;
  }

  /**
   * Verifica se idioma é suportado.
   */
  idiomaSuportado(idioma: string): boolean {
    return this.IDIOMAS_SUPORTADOS.includes(this.resolverIdioma(idioma));
  }

  /**
   * Obtém lista de idiomas suportados.
   */
  obterIdiomasSuportados(): string[] {
    return [...this.IDIOMAS_SUPORTADOS];
  }
}

/**
 * Interface para tradução de tabela.
 */
export interface TraducaoTabela {
  nomeTabela: string;
  idioma: string;
  descricaoTraduzida: string;
}

/**
 * Interface para tradução de campo.
 */
export interface TraducaoCampo {
  nomeTabela: string;
  nomeCampo: string;
  idioma: string;
  descricaoTraduzida: string;
  descricaoResumidaTraduzida?: string;
}
