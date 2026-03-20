/**
 * ApprovalRequiredGuard - Guard que verifica se operacao precisa aprovacao.
 *
 * @module M3-T05
 *
 * Este guard verifica se a operacao requer aprovacao antes de ser executada,
 * baseado nas configuracoes do sistema e no decorator @RequireApproval.
 *
 * @example
 * @UseGuards(JwtAuthGuard, ApprovalRequiredGuard)
 * @RequireApproval('FINANCEIRO')
 * @Post('aprovar-pagamento')
 * async aprovarPagamento() { }
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  Inject,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { APPROVAL_KEY, AprovacaoMetadata } from '../decorators/require-approval.decorator';
import { PERMISSION_KEY, PermissaoMetadata } from '../decorators/require-permission.decorator';
import { IPermissoesService, PERMISSOES_SERVICE } from './interfaces/permissoes-service.interface';
import { Traced } from '../../shared/instrumentation/traced.decorator';

export interface AprovacaoContext {
  requerAprovacao: boolean;
  tipoAprovacao?: string;
  nivelAprovacao?: number;
  mensagem?: string;
  aprovadorId?: number;
}

@Injectable()
export class ApprovalRequiredGuard implements CanActivate {
  private readonly logger = new Logger(ApprovalRequiredGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Optional()
    @Inject(PERMISSOES_SERVICE)
    private readonly permissoesService?: IPermissoesService,
  ) {}

  @Traced('ApprovalRequiredGuard.canActivate')
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obter metadata do decorator @RequireApproval
    const aprovacaoMetadata = this.reflector.getAllAndOverride<AprovacaoMetadata>(APPROVAL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se nao houver decorator, continuar
    if (!aprovacaoMetadata) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const usuario = request.user;

    // Verificar se usuario esta autenticado
    if (!usuario) {
      this.logger.warn('Tentativa de acesso sem autenticacao');
      throw new ForbiddenException('Usuario nao autenticado');
    }

    const codUsuario = usuario.userId || usuario.codUsuario;
    const tokenUsuario = this.extrairToken(request);

    // Verificar se a requisicao ja foi aprovada (header ou body)
    const jaAprovada = this.verificarSeJaAprovada(request);

    if (jaAprovada) {
      // Validar a aprovacao
      const aprovacaoValida = await this.validarAprovacao(request, aprovacaoMetadata);

      if (aprovacaoValida) {
        this.logger.debug(`Operacao aprovada para usuario ${codUsuario}`);
        return true;
      }
    }

    // Verificar no servico se a operacao requer aprovacao
    let requerAprovacaoServico = true; // Padrao: requer

    if (this.permissoesService) {
      const permissaoMetadata = this.reflector.getAllAndOverride<PermissaoMetadata>(PERMISSION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      const tabela = permissaoMetadata?.tabela || this.inferirTabela(context);
      const operacao = permissaoMetadata?.operacao || 'CREATE';

      requerAprovacaoServico = await this.permissoesService.verificarRequerAprovacao(
        codUsuario,
        tabela,
        operacao,
        tokenUsuario,
      );
    }

    // Construir contexto de aprovacao
    const aprovacaoContext: AprovacaoContext = {
      requerAprovacao: requerAprovacaoServico,
      tipoAprovacao: aprovacaoMetadata.tipo,
      nivelAprovacao: aprovacaoMetadata.nivelAprovacao,
      mensagem: aprovacaoMetadata.mensagem,
    };

    // Adicionar contexto de aprovacao ao request
    request.aprovacao = aprovacaoContext;

    // Se a operacao requer aprovacao e nao foi aprovada, bloquear
    if (requerAprovacaoServico && !jaAprovada) {
      this.logger.warn(
        `Operacao bloqueada: usuario ${codUsuario} precisa de aprovacao. Tipo: ${aprovacaoMetadata.tipo}`,
      );

      throw new ForbiddenException({
        statusCode: 403,
        error: 'Aprovacao Necessaria',
        message: aprovacaoMetadata.mensagem || 'Esta operacao requer aprovacao',
        aprovacao: {
          tipo: aprovacaoMetadata.tipo,
          nivelMinimo: aprovacaoMetadata.nivelAprovacao,
        },
      });
    }

    return true;
  }

  /**
   * Verifica se a requisicao ja foi aprovada.
   */
  private verificarSeJaAprovada(request: any): boolean {
    // Verificar header de aprovacao
    const headerAprovacao = request.headers['x-aprovacao-id'];
    if (headerAprovacao) {
      return true;
    }

    // Verificar body de aprovacao
    if (request.body?.aprovacaoId) {
      return true;
    }

    // Verificar token de aprovacao
    if (request.body?.tokenAprovacao) {
      return true;
    }

    return false;
  }

  /**
   * Valida se a aprovacao fornecida e valida.
   */
  private async validarAprovacao(request: any, _metadata: AprovacaoMetadata): Promise<boolean> {
    const aprovacaoId = request.headers['x-aprovacao-id'] || request.body?.aprovacaoId;
    const tokenAprovacao = request.body?.tokenAprovacao;

    // Se houver token de aprovacao, validar
    if (tokenAprovacao) {
      // TODO: Implementar validacao de token de aprovacao
      // Por enquanto, aceitar qualquer token
      this.logger.debug(`Validando token de aprovacao: ${tokenAprovacao.substring(0, 10)}...`);
      return true;
    }

    // Se houver ID de aprovacao, validar
    if (aprovacaoId) {
      // TODO: Implementar validacao de ID de aprovacao no banco
      this.logger.debug(`Validando aprovacao ID: ${aprovacaoId}`);
      return true;
    }

    return false;
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
