/**
 * Service: SanitizadorSQL
 *
 * Responsavel por sanitizar dados antes de salvar na auditoria.
 * Remove caracteres perigosos e valida estrutura de dados.
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class SanitizadorSQLService {
  // Padroes perigosos que devem ser removidos ou escapados
  private readonly padroesPerigosos = [
    /--/g, // Comentarios SQL
    /;/g, // Separador de comandos
    /'/g, // Aspas simples (escapar para '')
    /\\/g, // Barras invertidas
    /\/\*/g, // Inicio de comentario de bloco
    /\*\//g, // Fim de comentario de bloco
    /xp_/gi, // Extended stored procedures
    /sp_/gi, // System stored procedures (cuidado com falsos positivos)
    /exec\s+/gi, // EXEC command
    /execute\s+/gi, // EXECUTE command
    /drop\s+/gi, // DROP command
    /truncate\s+/gi, // TRUNCATE command
    /alter\s+/gi, // ALTER command
    /create\s+/gi, // CREATE command
    /grant\s+/gi, // GRANT command
    /revoke\s+/gi, // REVOKE command
  ];

  // Palavras reservadas que devem ser verificadas
  private readonly palavrasReservadas = [
    'DROP',
    'DELETE',
    'TRUNCATE',
    'ALTER',
    'CREATE',
    'GRANT',
    'REVOKE',
    'EXEC',
    'EXECUTE',
    'XP_',
    'SP_EXECUTESQL',
    'OPENROWSET',
    'OPENDATASOURCE',
    'BULK INSERT',
  ];

  /**
   * Sanitiza uma string para uso seguro em SQL
   */
  sanitizarString(valor: string | null | undefined): string | null {
    if (valor === null || valor === undefined) {
      return null;
    }

    let resultado = String(valor);

    // Escapar aspas simples (mais seguro que remover)
    resultado = resultado.replace(/'/g, "''");

    // Remover caracteres de controle
    resultado = resultado.replace(/[\x00-\x1F\x7F]/g, '');

    // Limitar tamanho para evitar overflow
    if (resultado.length > 8000) {
      resultado = resultado.substring(0, 8000);
    }

    return resultado;
  }

  /**
   * Sanitiza um objeto JSON para armazenamento
   */
  sanitizarJSON(obj: unknown): string {
    if (obj === null || obj === undefined) {
      return '{}';
    }

    try {
      // Se ja for string, parsear primeiro
      const objeto = typeof obj === 'string' ? JSON.parse(obj) : obj;

      // Sanitizar recursivamente
      const sanitizado = this.sanitizarObjetoRecursivo(objeto);

      // Converter para string JSON
      const jsonString = JSON.stringify(sanitizado);

      // Limitar tamanho
      if (jsonString.length > 50000) {
        return JSON.stringify({
          erro: 'Dados muito grandes para auditoria',
          tamanhoOriginal: jsonString.length,
        });
      }

      return jsonString;
    } catch {
      return JSON.stringify({ erro: 'Falha ao serializar dados' });
    }
  }

  /**
   * Sanitiza objeto recursivamente
   */
  private sanitizarObjetoRecursivo(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (typeof obj === 'string') {
      return this.sanitizarValorSensivel(obj);
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizarObjetoRecursivo(item));
    }

    if (typeof obj === 'object') {
      const resultado: Record<string, unknown> = {};
      for (const [chave, valor] of Object.entries(obj)) {
        // Remover campos sensiveis
        if (this.ehCampoSensivel(chave)) {
          resultado[chave] = '[REMOVIDO]';
        } else {
          resultado[chave] = this.sanitizarObjetoRecursivo(valor);
        }
      }
      return resultado;
    }

    return String(obj);
  }

  /**
   * Sanitiza valor removendo dados sensiveis
   */
  private sanitizarValorSensivel(valor: string): string {
    let resultado = valor;

    // Mascarar possiveis tokens JWT
    resultado = resultado.replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[TOKEN_REMOVIDO]');

    // Mascarar possiveis senhas em formato base64
    resultado = resultado.replace(
      /(?:password|senha|pwd|secret)[\s:=]+["']?[A-Za-z0-9+/=]{8,}["']?/gi,
      '[SENHA_REMOVIDA]',
    );

    // Limitar tamanho de strings longas
    if (resultado.length > 4000) {
      resultado = resultado.substring(0, 4000) + '...[TRUNCADO]';
    }

    return resultado;
  }

  /**
   * Verifica se o campo deve ser mascarado
   */
  private ehCampoSensivel(nomeCampo: string): boolean {
    const campoLower = nomeCampo.toLowerCase();
    const camposSensiveis = [
      'password',
      'senha',
      'pwd',
      'secret',
      'token',
      'apikey',
      'api_key',
      'accesstoken',
      'access_token',
      'refreshtoken',
      'refresh_token',
      'authorization',
      'auth',
      'credential',
      'private_key',
      'privatekey',
    ];

    return camposSensiveis.some((sensivel) => campoLower.includes(sensivel));
  }

  /**
   * Valida se uma string contem padroes SQL perigosos
   */
  contemPadroesPerigosos(valor: string): boolean {
    if (!valor) return false;

    const valorUpper = valor.toUpperCase();

    return this.palavrasReservadas.some((palavra) => valorUpper.includes(palavra));
  }

  /**
   * Sanitiza nome de tabela
   */
  sanitizarNomeTabela(tabela: string): string {
    if (!tabela) return '';

    // Remover caracteres que nao sao alfanumericos ou underscore
    let resultado = tabela.replace(/[^A-Za-z0-9_]/g, '');

    // Converter para maiusculas (padrao Sankhya)
    resultado = resultado.toUpperCase();

    // Limitar tamanho
    if (resultado.length > 100) {
      resultado = resultado.substring(0, 100);
    }

    return resultado;
  }

  /**
   * Sanitiza endereco IP
   */
  sanitizarIP(ip: string | null | undefined): string | null {
    if (!ip) return null;

    // Validar formato IPv4 ou IPv6
    const regexIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
    const regexIPv6 = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

    // Aceitar localhost e formatos comuns
    if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost' || regexIPv4.test(ip) || regexIPv6.test(ip)) {
      return ip.substring(0, 45); // Limite do campo
    }

    // Para IPs com proxy (x-forwarded-for), pegar o primeiro
    if (ip.includes(',')) {
      const primeiroIP = ip.split(',')[0].trim();
      return this.sanitizarIP(primeiroIP);
    }

    // Remover caracteres nao permitidos
    return ip.replace(/[^0-9a-fA-F.:]/g, '').substring(0, 45);
  }

  /**
   * Sanitiza User Agent
   */
  sanitizarUserAgent(userAgent: string | null | undefined): string | null {
    if (!userAgent) return null;

    // Limitar tamanho e remover caracteres de controle
    let resultado = userAgent.replace(/[\x00-\x1F\x7F]/g, '');

    if (resultado.length > 500) {
      resultado = resultado.substring(0, 500);
    }

    return resultado;
  }

  /**
   * Sanitiza chave de registro
   */
  sanitizarChaveRegistro(chave: string | null | undefined): string | null {
    if (!chave) return null;

    // Formato esperado: "CAMPO=valor" ou "CAMPO1=valor1,CAMPO2=valor2"
    let resultado = chave.replace(/[;'"]/g, '');

    if (resultado.length > 500) {
      resultado = resultado.substring(0, 500);
    }

    return resultado;
  }
}
