/**
 * RlsInjectInterceptor - Injeta condicoes RLS nas queries.
 *
 * @module M3-T08
 *
 * Este interceptor modifica o request para incluir as condicoes RLS
 * que devem ser aplicadas nas queries SQL executadas pelo endpoint.
 *
 * @example
 * @UseInterceptors(RlsInjectInterceptor)
 * @UseGuards(JwtAuthGuard, RlsConditionGuard)
 * @RequirePermission('READ', 'TGFVEI')
 * @Get()
 * async obterVeiculos(@Query() query, @Req() request) {
 *   // request.rls.condicoes contem as condicoes RLS
 * }
 */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RlsContext } from '../guards/rls-condition.guard';

export interface QueryComRls {
  queryOriginal: string;
  queryComRls: string;
  condicoesAplicadas: string | null;
}

@Injectable()
export class RlsInjectInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RlsInjectInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Obter contexto RLS do request (definido pelo RlsConditionGuard)
    const rlsContext: RlsContext | undefined = request.rls;

    // Adicionar helper de RLS ao request para uso nos controllers/services
    request.rlsHelper = {
      /**
       * Aplica condicoes RLS a uma query SQL.
       */
      aplicarRls: (query: string, alias: string = 't'): QueryComRls => {
        if (!rlsContext || !rlsContext.condicoes) {
          return {
            queryOriginal: query,
            queryComRls: query,
            condicoesAplicadas: null,
          };
        }

        const queryModificada = this.aplicarCondicoesRls(query, rlsContext.condicoes, alias);

        return {
          queryOriginal: query,
          queryComRls: queryModificada,
          condicoesAplicadas: rlsContext.condicoes,
        };
      },

      /**
       * Obtem as condicoes RLS brutas.
       */
      obterCondicoes: (): string | null => {
        return rlsContext?.condicoes || null;
      },

      /**
       * Verifica se ha restricoes RLS ativas.
       */
      temRestricoes: (): boolean => {
        return !!rlsContext?.condicoes;
      },

      /**
       * Obtem informacoes do contexto RLS.
       */
      obterContexto: (): RlsContext | null => {
        return rlsContext || null;
      },
    };

    // Log de debug
    if (rlsContext?.condicoes) {
      this.logger.debug(`RLS Helper configurado para usuario ${rlsContext.codUsuario}: ${rlsContext.condicoes}`);
    }

    return next.handle().pipe(
      tap(() => {
        // Log de queries com RLS aplicado (para auditoria)
        if (request.rlsQueriesExecutadas) {
          this.logger.debug(`Queries com RLS executadas: ${request.rlsQueriesExecutadas.length}`);
        }
      }),
    );
  }

  /**
   * Aplica condicoes RLS a uma query SQL.
   */
  private aplicarCondicoesRls(query: string, condicoes: string, alias: string): string {
    // Substituir placeholder de alias nas condicoes
    const condicoesComAlias = condicoes.replace(/\{alias\}/g, alias);

    // Verificar se a query ja tem WHERE
    const queryUpper = query.toUpperCase().trim();
    const temWhere = this.temClausulaWhere(queryUpper);

    if (temWhere) {
      // Encontrar posicao do WHERE e adicionar condicao
      return this.adicionarCondicaoAoWhere(query, condicoesComAlias);
    } else {
      // Adicionar clausula WHERE antes de ORDER BY, GROUP BY, HAVING, ou no final
      return this.adicionarClausulaWhere(query, condicoesComAlias);
    }
  }

  /**
   * Verifica se a query tem clausula WHERE.
   */
  private temClausulaWhere(queryUpper: string): boolean {
    // Verificar se tem WHERE que nao esta dentro de subquery
    const whereIndex = queryUpper.indexOf('WHERE');
    if (whereIndex === -1) {
      return false;
    }

    // Contar parenteses antes do WHERE para detectar subqueries
    const antesDoWhere = queryUpper.substring(0, whereIndex);
    const parentesesAbertos = (antesDoWhere.match(/\(/g) || []).length;
    const parentesesFechados = (antesDoWhere.match(/\)/g) || []).length;

    // Se parenteses estao balanceados, o WHERE e da query principal
    return parentesesAbertos === parentesesFechados;
  }

  /**
   * Adiciona condicao a uma clausula WHERE existente.
   */
  private adicionarCondicaoAoWhere(query: string, condicao: string): string {
    // Usar regex para encontrar o WHERE e adicionar condicao
    const regex = /(WHERE\s+)/i;
    return query.replace(regex, `$1(${condicao}) AND `);
  }

  /**
   * Adiciona clausula WHERE a uma query sem WHERE.
   */
  private adicionarClausulaWhere(query: string, condicao: string): string {
    const queryUpper = query.toUpperCase();

    // Encontrar posicao para inserir WHERE
    const posicoes = [
      queryUpper.indexOf('ORDER BY'),
      queryUpper.indexOf('GROUP BY'),
      queryUpper.indexOf('HAVING'),
      queryUpper.indexOf('LIMIT'),
      queryUpper.indexOf('OFFSET'),
      queryUpper.indexOf('UNION'),
      queryUpper.indexOf('INTERSECT'),
      queryUpper.indexOf('EXCEPT'),
    ].filter((pos) => pos > -1);

    const posicaoInsercao = posicoes.length > 0 ? Math.min(...posicoes) : query.length;

    return query.substring(0, posicaoInsercao).trim() + ` WHERE ${condicao} ` + query.substring(posicaoInsercao);
  }
}

/**
 * Decorator para indicar que um metodo de repositorio suporta RLS.
 */
export function SuportaRls(): MethodDecorator {
  return (_target: object, _propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const metodoOriginal = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Adicionar flag indicando que o metodo suporta RLS
      const contexto = { suportaRls: true };
      return metodoOriginal.apply(this, [...args, contexto]);
    };

    return descriptor;
  };
}
