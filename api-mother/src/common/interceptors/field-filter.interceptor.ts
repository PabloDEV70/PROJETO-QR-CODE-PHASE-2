/**
 * FieldFilterInterceptor - Filtra campos baseado em permissao.
 *
 * @module M3-T07
 *
 * Este interceptor filtra os campos da resposta baseado nas permissoes
 * do usuario, removendo campos que o usuario nao tem acesso.
 *
 * @example
 * @UseInterceptors(FieldFilterInterceptor)
 * @UseGuards(JwtAuthGuard, FieldPermissionGuard)
 * @AllowedFields(['CODVEICULO', 'PLACA', 'MARCAMODELO'])
 * @Get()
 * async obterVeiculos() { }
 */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { ALLOWED_FIELDS_KEY, CamposPermitidosMetadata } from '../decorators/allowed-fields.decorator';

@Injectable()
export class FieldFilterInterceptor implements NestInterceptor {
  private readonly logger = new Logger(FieldFilterInterceptor.name);

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Obter metadata do decorator
    const camposMetadata = this.reflector.getAllAndOverride<CamposPermitidosMetadata>(ALLOWED_FIELDS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se nao houver restricao de campos ou permitir todos, retornar sem filtro
    if (!camposMetadata || camposMetadata.permitirTodos) {
      return next.handle();
    }

    // Obter campos permitidos (do request ou do decorator)
    const camposPermitidos = request.camposPermitidos || camposMetadata.campos;

    if (!camposPermitidos || camposPermitidos.length === 0) {
      return next.handle();
    }

    // Normalizar campos para uppercase
    const camposPermitidosUpper = camposPermitidos.map((c: string) => c.toUpperCase());

    return next.handle().pipe(
      map((resposta) => {
        if (!resposta) {
          return resposta;
        }

        // Se for array, filtrar cada item
        if (Array.isArray(resposta)) {
          return resposta.map((item) => this.filtrarCampos(item, camposPermitidosUpper));
        }

        // Se for objeto com propriedade 'data' que e array
        if (resposta.data && Array.isArray(resposta.data)) {
          return {
            ...resposta,
            data: resposta.data.map((item: any) => this.filtrarCampos(item, camposPermitidosUpper)),
          };
        }

        // Se for objeto simples
        if (typeof resposta === 'object') {
          return this.filtrarCampos(resposta, camposPermitidosUpper);
        }

        return resposta;
      }),
    );
  }

  /**
   * Filtra campos de um objeto mantendo apenas os permitidos.
   */
  private filtrarCampos(objeto: Record<string, any>, camposPermitidos: string[]): Record<string, any> {
    if (!objeto || typeof objeto !== 'object') {
      return objeto;
    }

    const resultado: Record<string, any> = {};
    let camposFiltrados = 0;

    for (const [chave, valor] of Object.entries(objeto)) {
      const chaveUpper = chave.toUpperCase();

      // Verificar se o campo e permitido (considerando variacoes de case)
      const permitido = camposPermitidos.some(
        (campo) =>
          campo === chaveUpper || campo === chave || this.normalizarCampo(campo) === this.normalizarCampo(chave),
      );

      if (permitido) {
        resultado[chave] = valor;
      } else {
        camposFiltrados++;
      }
    }

    if (camposFiltrados > 0) {
      this.logger.debug(`Filtrados ${camposFiltrados} campos nao permitidos do objeto`);
    }

    return resultado;
  }

  /**
   * Normaliza nome de campo para comparacao.
   * Remove underscores, converte para lowercase.
   */
  private normalizarCampo(campo: string): string {
    return campo.toLowerCase().replace(/_/g, '');
  }
}

/**
 * Interceptor que adiciona campos calculados/derivados a resposta.
 */
@Injectable()
export class FieldEnricherInterceptor implements NestInterceptor {
  private readonly logger = new Logger(FieldEnricherInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((resposta) => {
        if (!resposta) {
          return resposta;
        }

        // Adicionar metadados de permissao se houver
        const permissaoInfo = request.permissao;
        const rlsInfo = request.rls;

        if (permissaoInfo || rlsInfo) {
          const metadados = {
            _permissoes: {
              operacao: permissaoInfo?.operacao,
              tabela: permissaoInfo?.tabela,
              camposPermitidos: permissaoInfo?.camposPermitidos?.length || 0,
              temRls: !!rlsInfo?.condicoes,
            },
          };

          if (typeof resposta === 'object' && !Array.isArray(resposta)) {
            return { ...resposta, ...metadados };
          }
        }

        return resposta;
      }),
    );
  }
}
