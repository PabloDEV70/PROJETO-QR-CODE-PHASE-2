/**
 * RlsConditionGuard - Guard que aplica Row Level Security.
 *
 * @module M3-T04
 *
 * Este guard obtem e aplica condicoes de RLS (Row Level Security) baseadas
 * nas permissoes do usuario, garantindo que queries retornem apenas dados
 * que o usuario tem permissao para acessar.
 *
 * @example
 * @UseGuards(JwtAuthGuard, RlsConditionGuard)
 * @RequirePermission('READ', 'TGFVEI')
 * @Get()
 * async obterVeiculos() { }
 */
import { Injectable, CanActivate, ExecutionContext, Logger, Inject, Optional } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY, PermissaoMetadata } from '../decorators/require-permission.decorator';
import { IPermissoesService, PERMISSOES_SERVICE } from './interfaces/permissoes-service.interface';

export interface RlsContext {
  condicoes: string | null;
  tabela: string;
  codUsuario: number;
}

@Injectable()
export class RlsConditionGuard implements CanActivate {
  private readonly logger = new Logger(RlsConditionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Optional()
    @Inject(PERMISSOES_SERVICE)
    private readonly permissoesService?: IPermissoesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const usuario = request.user;

    // Se nao houver usuario autenticado, continuar (outros guards validarao)
    if (!usuario) {
      return true;
    }

    // Se nao houver servico de permissoes, continuar sem RLS
    if (!this.permissoesService) {
      this.logger.debug('PermissoesService nao configurado. RLS desabilitado.');
      return true;
    }

    // Obter metadata do decorator @RequirePermission
    const permissaoMetadata = this.reflector.getAllAndOverride<PermissaoMetadata>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const tabela = permissaoMetadata?.tabela || this.inferirTabela(context);
    const codUsuario = usuario.userId || usuario.codUsuario;
    const tokenUsuario = this.extrairToken(request);

    // Obter condicoes RLS para o usuario e tabela
    const condicoesRls = await this.permissoesService.obterCondicoesRls(codUsuario, tabela, tokenUsuario);

    // Construir contexto RLS
    const rlsContext: RlsContext = {
      condicoes: condicoesRls,
      tabela,
      codUsuario,
    };

    // Adicionar contexto RLS ao request
    request.rls = rlsContext;

    if (condicoesRls) {
      this.logger.debug(`RLS aplicado para usuario ${codUsuario} em ${tabela}: ${condicoesRls}`);
    } else {
      this.logger.debug(`Nenhuma restricao RLS para usuario ${codUsuario} em ${tabela}`);
    }

    return true;
  }

  /**
   * Infere o nome da tabela a partir do controller.
   */
  private inferirTabela(context: ExecutionContext): string {
    const controller = context.getClass();
    const controllerName = controller.name;
    return controllerName.replace(/Controller$/i, '').toUpperCase();
  }

  /**
   * Extrai o token do request.
   */
  private extrairToken(request: any): string {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return '';
    }
    return authHeader.replace('Bearer ', '');
  }
}

/**
 * Helper para construir query com condicoes RLS.
 */
export class RlsQueryHelper {
  /**
   * Aplica condicoes RLS a uma query SQL.
   *
   * @param queryBase - Query SQL base
   * @param rlsContext - Contexto RLS do request
   * @param alias - Alias da tabela na query (padrao: 't')
   * @returns Query com condicoes RLS aplicadas
   */
  static aplicarCondicoesRls(queryBase: string, rlsContext: RlsContext | null, alias: string = 't'): string {
    if (!rlsContext || !rlsContext.condicoes) {
      return queryBase;
    }

    // Substituir placeholder de alias nas condicoes
    const condicoesComAlias = rlsContext.condicoes.replace(/\{alias\}/g, alias);

    // Verificar se a query ja tem WHERE
    const queryUpper = queryBase.toUpperCase();
    const temWhere = queryUpper.includes('WHERE');

    if (temWhere) {
      // Adicionar condicao com AND
      return queryBase.replace(/WHERE\s+/i, `WHERE (${condicoesComAlias}) AND `);
    } else {
      // Adicionar clausula WHERE antes de ORDER BY, GROUP BY, ou no final
      const orderByIndex = queryUpper.indexOf('ORDER BY');
      const groupByIndex = queryUpper.indexOf('GROUP BY');
      const insertIndex = Math.min(
        orderByIndex > -1 ? orderByIndex : queryBase.length,
        groupByIndex > -1 ? groupByIndex : queryBase.length,
      );

      return queryBase.substring(0, insertIndex) + ` WHERE ${condicoesComAlias} ` + queryBase.substring(insertIndex);
    }
  }
}
