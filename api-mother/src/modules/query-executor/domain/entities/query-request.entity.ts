import { HttpStatus } from '@nestjs/common';
import { GatewayException } from '../../../../common/exceptions/gateway.exception';
import { GatewayErrorCode } from '../../../../common/enums/gateway-error-code.enum';

/**
 * Entidade de domínio para requisição de query
 */
export class RequisicaoQuery {
  constructor(
    public readonly query: string,
    public readonly database?: string,
  ) {
    this.validar();
  }

  private validar(): void {
    if (!this.query || this.query.trim().length === 0) {
      throw new GatewayException(
        GatewayErrorCode.ERR_QUERY_EMPTY,
        'Query cannot be empty',
        {},
        HttpStatus.BAD_REQUEST,
      );
    }

    const queryNormalizada = this.query.trim().toUpperCase();

    if (!queryNormalizada.startsWith('SELECT')) {
      throw new GatewayException(
        GatewayErrorCode.ERR_QUERY_NOT_SELECT,
        'Only SELECT queries are permitted',
        {},
        HttpStatus.BAD_REQUEST,
      );
    }

    const comandosProibidos = [
      'INSERT',
      'UPDATE',
      'DELETE',
      'DROP',
      'ALTER',
      'CREATE',
      'EXEC',
      'EXECUTE',
      'TRUNCATE',
      'GRANT',
      'REVOKE',
      'MERGE',
      'REPLACE',
      'CALL',
      'DECLARE',
    ];

    for (const comando of comandosProibidos) {
      const regex = new RegExp(`\\b${comando}\\b`, 'i');
      if (regex.test(this.query)) {
        throw new GatewayException(
          GatewayErrorCode.ERR_QUERY_FORBIDDEN_COMMAND,
          `Command "${comando}" is not allowed`,
          { command: comando },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const padroesSuspeitos = [
      /;[\s]*DROP/i,
      /;[\s]*DELETE/i,
      /;[\s]*UPDATE/i,
      /UNION[\s]+SELECT/i,
      /--[\s]*$/,
      /\/\*/,
      /xp_/i,
      /sp_executesql/i,
    ];

    for (const padrao of padroesSuspeitos) {
      if (padrao.test(this.query)) {
        throw new GatewayException(
          GatewayErrorCode.ERR_QUERY_INJECTION_PATTERN,
          'Query contains suspicious SQL injection pattern',
          {},
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  public obterQueryLimpo(): string {
    return this.query.trim();
  }

  public obterDatabase(): string | undefined {
    return this.database;
  }
}
