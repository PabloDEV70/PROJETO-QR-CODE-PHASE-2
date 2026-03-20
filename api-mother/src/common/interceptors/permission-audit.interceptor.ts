/**
 * PermissionAuditInterceptor - Registra operacoes para auditoria.
 *
 * @module M3-T06
 *
 * Este interceptor registra todas as operacoes que passaram pelos guards
 * de permissao, criando um log de auditoria completo para compliance.
 *
 * @example
 * @UseInterceptors(PermissionAuditInterceptor)
 * @UseGuards(JwtAuthGuard, CrudPermissionGuard)
 * @RequirePermission('UPDATE', 'TGFVEI')
 * @Put(':id')
 * async atualizarVeiculo() { }
 */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY, PermissaoMetadata } from '../decorators/require-permission.decorator';
import { APPROVAL_KEY, AprovacaoMetadata } from '../decorators/require-approval.decorator';

export interface RegistroAuditoria {
  timestamp: string;
  codUsuario: number;
  nomeUsuario?: string;
  operacao: string;
  tabela: string;
  endpoint: string;
  metodo: string;
  ip: string;
  userAgent?: string;
  sucesso: boolean;
  duracao?: number;
  erro?: string;
  dadosRequisicao?: Record<string, any>;
  dadosResposta?: Record<string, any>;
  requeriaAprovacao?: boolean;
  aprovacaoId?: string;
  camposAcessados?: string[];
  condicoesRls?: string;
}

@Injectable()
export class PermissionAuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PermissionAuditInterceptor.name);

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const inicio = Date.now();

    // Obter metadados dos decorators
    const permissaoMetadata = this.reflector.getAllAndOverride<PermissaoMetadata>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const aprovacaoMetadata = this.reflector.getAllAndOverride<AprovacaoMetadata>(APPROVAL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Construir registro base de auditoria
    const registroBase: Partial<RegistroAuditoria> = {
      timestamp: new Date().toISOString(),
      codUsuario: request.user?.userId || request.user?.codUsuario || 0,
      nomeUsuario: request.user?.username,
      operacao: permissaoMetadata?.operacao || this.inferirOperacao(request.method),
      tabela: permissaoMetadata?.tabela || this.inferirTabela(context),
      endpoint: request.url,
      metodo: request.method,
      ip: this.extrairIp(request),
      userAgent: request.headers['user-agent'],
      requeriaAprovacao: !!aprovacaoMetadata,
      aprovacaoId: request.headers['x-aprovacao-id'] || request.body?.aprovacaoId,
      camposAcessados: request.camposPermitidos,
      condicoesRls: request.rls?.condicoes,
    };

    // Adicionar dados da requisicao (sanitizados)
    if (request.body && Object.keys(request.body).length > 0) {
      registroBase.dadosRequisicao = this.sanitizarDados(request.body);
    }

    return next.handle().pipe(
      tap((resposta) => {
        const duracao = Date.now() - inicio;

        const registroCompleto: RegistroAuditoria = {
          ...registroBase,
          sucesso: true,
          duracao,
          dadosResposta: this.sanitizarResposta(resposta),
        } as RegistroAuditoria;

        this.registrarAuditoria(registroCompleto);
      }),
      catchError((erro) => {
        const duracao = Date.now() - inicio;

        const registroCompleto: RegistroAuditoria = {
          ...registroBase,
          sucesso: false,
          duracao,
          erro: erro.message || 'Erro desconhecido',
        } as RegistroAuditoria;

        this.registrarAuditoria(registroCompleto);

        throw erro;
      }),
    );
  }

  /**
   * Registra a auditoria no log.
   * TODO: Implementar persistencia em banco de dados.
   */
  private registrarAuditoria(registro: RegistroAuditoria): void {
    const logMessage = `[AUDITORIA] ${registro.operacao} ${registro.tabela} | Usuario: ${registro.codUsuario} | Sucesso: ${registro.sucesso} | Duracao: ${registro.duracao}ms`;

    if (registro.sucesso) {
      this.logger.log(logMessage);
    } else {
      this.logger.warn(`${logMessage} | Erro: ${registro.erro}`);
    }

    // Log detalhado em debug
    this.logger.debug(`Registro completo: ${JSON.stringify(registro)}`);
  }

  /**
   * Infere a operacao a partir do metodo HTTP.
   */
  private inferirOperacao(metodo: string): string {
    const mapeamento: Record<string, string> = {
      GET: 'READ',
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };
    return mapeamento[metodo.toUpperCase()] || 'UNKNOWN';
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
   * Extrai o IP do request.
   */
  private extrairIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }

  /**
   * Sanitiza dados para remover informacoes sensiveis.
   */
  private sanitizarDados(dados: Record<string, any>): Record<string, any> {
    const camposSensiveis = [
      'senha',
      'password',
      'token',
      'secret',
      'apiKey',
      'api_key',
      'authorization',
      'creditCard',
      'cartao',
      'cvv',
    ];

    const resultado: Record<string, any> = {};

    for (const [chave, valor] of Object.entries(dados)) {
      const chaveLower = chave.toLowerCase();

      if (camposSensiveis.some((campo) => chaveLower.includes(campo))) {
        resultado[chave] = '[REDACTED]';
      } else if (typeof valor === 'object' && valor !== null) {
        resultado[chave] = this.sanitizarDados(valor);
      } else {
        resultado[chave] = valor;
      }
    }

    return resultado;
  }

  /**
   * Sanitiza resposta para log (limita tamanho e remove dados sensiveis).
   */
  private sanitizarResposta(resposta: any): Record<string, any> | undefined {
    if (!resposta) {
      return undefined;
    }

    // Limitar tamanho da resposta no log
    const respostaString = JSON.stringify(resposta);
    if (respostaString.length > 1000) {
      return {
        _truncado: true,
        _tamanhoOriginal: respostaString.length,
        _preview: respostaString.substring(0, 500) + '...',
      };
    }

    if (typeof resposta === 'object') {
      return this.sanitizarDados(resposta);
    }

    return { valor: resposta };
  }
}
