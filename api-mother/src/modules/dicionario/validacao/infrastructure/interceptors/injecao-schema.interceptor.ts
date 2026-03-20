import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ProvedorSchemaTabelaService } from '../../application/services/provedor-schema-tabela.service';
import { INJETAR_SCHEMA_KEY } from '../decorators/validar-via-dicionario.decorator';

/**
 * Interceptor para injetar schema da tabela no request.
 *
 * Carrega metadados do dicionário e disponibiliza no objeto request
 * para uso nos controllers/use cases.
 */
@Injectable()
export class InjecaoSchemaInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly provedorSchema: ProvedorSchemaTabelaService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    // 1. Verificar se endpoint requer injeção de schema
    const nomeTabela = this.reflector.get<string>(INJETAR_SCHEMA_KEY, context.getHandler());

    if (!nomeTabela) {
      // Sem decorador, seguir normalmente
      return next.handle();
    }

    // 2. Obter schema da tabela
    const schema = await this.provedorSchema.obterSchema(nomeTabela);

    // 3. Injetar schema no request
    const request = context.switchToHttp().getRequest();
    request.schemaTabela = schema;

    // 4. Continuar execução
    return next.handle();
  }
}
