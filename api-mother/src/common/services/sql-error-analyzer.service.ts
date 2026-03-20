import { Injectable } from '@nestjs/common';

/**
 * Análise detalhada de erros SQL para ajudar desenvolvedores
 */
export interface SqlErrorAnalysis {
  /** Tipo do erro identificado */
  tipo: string;
  /** Mensagem amigável para o desenvolvedor */
  mensagem: string;
  /** Sugestões de correção */
  sugestoes: string[];
  /** Exemplo de código correto */
  exemploCorreto?: string;
  /** Categoria do erro */
  categoria: 'SINTAXE' | 'COLUNA' | 'TABELA' | 'PERMISSAO' | 'TIPO_DADO' | 'REFERENCIA' | 'DESCONHECIDO';
}

@Injectable()
export class SqlErrorAnalyzerService {
  /**
   * Analisa um erro SQL e retorna informações detalhadas
   */
  analyzeError(error: any, query?: string): SqlErrorAnalysis {
    const errorMessage = this.extractErrorMessage(error);
    const errorCode = this.extractErrorCode(error);

    // Análise baseada no código de erro ou mensagem
    if (this.isSyntaxError(errorMessage, errorCode)) {
      return this.analyzeSyntaxError(errorMessage, query);
    }

    if (this.isColumnError(errorMessage)) {
      return this.analyzeColumnError(errorMessage, query);
    }

    if (this.isTableError(errorMessage)) {
      return this.analyzeTableError(errorMessage, query);
    }

    if (this.isPermissionError(errorMessage)) {
      return this.analyzePermissionError(errorMessage);
    }

    if (this.isDataTypeError(errorMessage)) {
      return this.analyzeDataTypeError(errorMessage, query);
    }

    if (this.isReferenceError(errorMessage)) {
      return this.analyzeReferenceError(errorMessage, query);
    }

    // Erro desconhecido
    return {
      tipo: 'Erro Desconhecido',
      mensagem: `Erro no banco de dados: ${errorMessage}`,
      sugestoes: [
        'Verifique se a query está sintaticamente correta',
        'Confirme se todas as tabelas e colunas existem',
        'Verifique se há permissões de acesso às tabelas',
        'Consulte a documentação do Sankhya DB para sintaxe correta',
      ],
      categoria: 'DESCONHECIDO',
    };
  }

  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.originalError?.message) return error.originalError.message;
    if (error?.sqlError) return error.sqlError;
    return 'Erro desconhecido';
  }

  private extractErrorCode(error: any): string | null {
    if (error?.code) return error.code;
    if (error?.number) return String(error.number);
    if (error?.originalError?.code) return error.originalError.code;
    return null;
  }

  private isSyntaxError(message: string, code: string | null): boolean {
    const syntaxPatterns = [
      /incorrect syntax/i,
      /syntax error/i,
      /near/i,
      /unexpected/i,
      /invalid/i,
      /malformed/i,
      /missing/i,
      /expected/i,
    ];

    return (
      syntaxPatterns.some((pattern) => pattern.test(message)) || (code && ['102', '156', '170', '207'].includes(code))
    );
  }

  private isColumnError(message: string): boolean {
    const columnPatterns = [
      /invalid column name/i,
      /column.*does not exist/i,
      /column.*not found/i,
      /unknown column/i,
      /field.*not found/i,
    ];

    return columnPatterns.some((pattern) => pattern.test(message));
  }

  private isTableError(message: string): boolean {
    const tablePatterns = [
      /invalid object name/i,
      /table.*does not exist/i,
      /table.*not found/i,
      /unknown table/i,
      /object.*not found/i,
    ];

    return tablePatterns.some((pattern) => pattern.test(message));
  }

  private isPermissionError(message: string): boolean {
    const permissionPatterns = [/permission denied/i, /access denied/i, /unauthorized/i, /privilege/i];

    return permissionPatterns.some((pattern) => pattern.test(message));
  }

  private isDataTypeError(message: string): boolean {
    const dataTypePatterns = [
      /conversion failed/i,
      /data type/i,
      /invalid.*date/i,
      /cannot convert/i,
      /type mismatch/i,
    ];

    return dataTypePatterns.some((pattern) => pattern.test(message));
  }

  private isReferenceError(message: string): boolean {
    const referencePatterns = [/foreign key/i, /reference/i, /constraint/i, /integrity/i];

    return referencePatterns.some((pattern) => pattern.test(message));
  }

  private analyzeSyntaxError(message: string, query?: string): SqlErrorAnalysis {
    const sugestoes: string[] = [
      'Verifique se todas as palavras-chave SQL estão escritas corretamente',
      'Confirme se há vírgulas entre as colunas no SELECT',
      'Verifique se os parênteses estão balanceados',
    ];

    let exemploCorreto: string | undefined;

    // Análise específica baseada na mensagem
    if (message.includes('near') || message.includes('unexpected')) {
      const match = message.match(/near ['"](.+?)['"]/i);
      if (match) {
        sugestoes.push(`Erro próximo a "${match[1]}" - verifique a sintaxe antes deste ponto`);
      }
    }

    // Verificar problemas comuns de data
    if (query && /\d{4}-\d{2}-\d{2}/.test(query) && !query.includes('TO_DATE')) {
      sugestoes.push('⚠️ DATAS: Use TO_DATE() para datas no formato Oracle/Sankhya');
      sugestoes.push("   Exemplo: WHERE DTREF >= TO_DATE('2025-11-04', 'YYYY-MM-DD')");

      exemploCorreto = `SELECT * FROM AD_RDOAPONTAMENTOS 
WHERE DTREF >= TO_DATE('2025-11-04', 'YYYY-MM-DD') 
  AND DTREF <= TO_DATE('2026-02-02', 'YYYY-MM-DD')`;
    }

    // Verificar aliases inconsistentes
    if (query) {
      const aliases = query.match(/\bFROM\s+(\w+)\s+(\w+)/i);
      if (aliases) {
        const tableAlias = aliases[2];
        const aliasPattern = new RegExp(`\\b${tableAlias}\\.`, 'g');
        const aliasCount = (query.match(aliasPattern) || []).length;

        if (aliasCount === 0) {
          sugestoes.push(`⚠️ ALIAS: Você definiu alias "${tableAlias}" mas não está usando nas colunas`);
        }
      }
    }

    return {
      tipo: 'Erro de Sintaxe SQL',
      mensagem: `Sintaxe SQL inválida: ${message}`,
      sugestoes,
      exemploCorreto,
      categoria: 'SINTAXE',
    };
  }

  private analyzeColumnError(message: string, query?: string): SqlErrorAnalysis {
    const colunaMatch = message.match(/['"](\w+)['"]/);
    const coluna = colunaMatch ? colunaMatch[1] : 'desconhecida';

    const sugestoes: string[] = [
      `Verifique se a coluna "${coluna}" existe na tabela`,
      'Confirme se o nome da coluna está escrito corretamente (case-sensitive em alguns bancos)',
      'Verifique se a tabela possui esta coluna usando o dicionário de dados',
    ];

    if (query) {
      const tabelaMatch = query.match(/FROM\s+(\w+)/i);
      if (tabelaMatch) {
        const tabela = tabelaMatch[1];
        sugestoes.push(`💡 DICA: Execute "DESC ${tabela}" ou consulte o dicionário para ver as colunas disponíveis`);
      }
    }

    return {
      tipo: 'Coluna Não Encontrada',
      mensagem: `A coluna "${coluna}" não existe ou está incorreta`,
      sugestoes,
      categoria: 'COLUNA',
    };
  }

  private analyzeTableError(message: string, _query?: string): SqlErrorAnalysis {
    const tabelaMatch = message.match(/['"](\w+)['"]/);
    const tabela = tabelaMatch ? tabelaMatch[1] : 'desconhecida';

    return {
      tipo: 'Tabela Não Encontrada',
      mensagem: `A tabela "${tabela}" não existe ou você não tem acesso`,
      sugestoes: [
        `Verifique se a tabela "${tabela}" existe no banco de dados`,
        'Confirme se o nome da tabela está escrito corretamente',
        'Verifique se você tem permissão para acessar esta tabela',
        'Para tabelas personalizadas (AD_*), confirme se foram criadas corretamente',
      ],
      categoria: 'TABELA',
    };
  }

  private analyzePermissionError(_message: string): SqlErrorAnalysis {
    return {
      tipo: 'Permissão Negada',
      mensagem: 'Você não tem permissão para executar esta operação',
      sugestoes: [
        'Verifique se seu usuário tem permissões para acessar as tabelas envolvidas',
        'Para ambiente PROD, confirme se possui aprovação necessária (x-boss-approval)',
        'Entre em contato com o administrador do banco de dados',
        'Verifique se a tabela está na whitelist de permissões de escrita',
      ],
      categoria: 'PERMISSAO',
    };
  }

  private analyzeDataTypeError(message: string, _query?: string): SqlErrorAnalysis {
    const sugestoes: string[] = [
      'Verifique se os tipos de dados são compatíveis na operação',
      'Confirme se as datas estão no formato correto (use TO_DATE para Oracle)',
      'Verifique se números não estão sendo comparados com texto',
    ];

    let exemploCorreto: string | undefined;

    if (message.includes('date') || message.includes('Date')) {
      sugestoes.push('⚠️ DATAS: No Oracle/Sankhya, use TO_DATE() para converter strings em datas');
      exemploCorreto = `WHERE DTREF >= TO_DATE('2025-11-04', 'YYYY-MM-DD')`;
    }

    return {
      tipo: 'Erro de Tipo de Dado',
      mensagem: `Conversão de tipo de dado falhou: ${message}`,
      sugestoes,
      exemploCorreto,
      categoria: 'TIPO_DADO',
    };
  }

  private analyzeReferenceError(message: string, _query?: string): SqlErrorAnalysis {
    return {
      tipo: 'Erro de Integridade Referencial',
      mensagem: `Violação de constraint: ${message}`,
      sugestoes: [
        'Verifique se os valores de chave estrangeira existem na tabela referenciada',
        'Confirme se não há violação de unicidade (unique constraint)',
        'Verifique se não está violando alguma constraint de check',
        'Para DELETE, verifique se não há registros filhos vinculados',
      ],
      categoria: 'REFERENCIA',
    };
  }

  /**
   * Gera uma mensagem de erro completa e amigável
   */
  generateFriendlyErrorResponse(analysis: SqlErrorAnalysis, query?: string): any {
    const response: any = {
      success: false,
      error: {
        tipo: analysis.tipo,
        mensagem: analysis.mensagem,
        categoria: analysis.categoria,
        sugestoes: analysis.sugestoes,
      },
    };

    if (analysis.exemploCorreto) {
      response.error.exemploCorreto = analysis.exemploCorreto;
    }

    if (query) {
      response.error.queryRecebida = query;
    }

    return response;
  }
}
