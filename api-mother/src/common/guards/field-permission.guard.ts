/**
 * FieldPermissionGuard - Guard que verifica permissao por campos.
 *
 * @module M3-T03
 *
 * Este guard verifica se o usuario tem permissao para acessar os campos
 * especificados na requisicao, baseado na configuracao do sistema.
 *
 * @example
 * @UseGuards(JwtAuthGuard, FieldPermissionGuard)
 * @AllowedFields(['CODVEICULO', 'PLACA', 'MARCAMODELO'])
 * @Get()
 * async obterVeiculos() { }
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
import { ALLOWED_FIELDS_KEY, CamposPermitidosMetadata } from '../decorators/allowed-fields.decorator';
import { PERMISSION_KEY, PermissaoMetadata } from '../decorators/require-permission.decorator';
import { IPermissoesService, PERMISSOES_SERVICE } from './interfaces/permissoes-service.interface';

@Injectable()
export class FieldPermissionGuard implements CanActivate {
  private readonly logger = new Logger(FieldPermissionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Optional()
    @Inject(PERMISSOES_SERVICE)
    private readonly permissoesService?: IPermissoesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obter metadata do decorator @AllowedFields
    const camposMetadata = this.reflector.getAllAndOverride<CamposPermitidosMetadata>(ALLOWED_FIELDS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se nao houver decorator ou permitir todos, continuar
    if (!camposMetadata || camposMetadata.permitirTodos) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const usuario = request.user;

    // Verificar se usuario esta autenticado
    if (!usuario) {
      this.logger.warn('Tentativa de acesso sem autenticacao');
      throw new ForbiddenException('Usuario nao autenticado');
    }

    // Se nao houver servico de permissoes configurado, usar apenas decorator
    if (!this.permissoesService) {
      request.camposPermitidos = camposMetadata.campos;
      return true;
    }

    // Obter operacao do metadata de permissao
    const permissaoMetadata = this.reflector.getAllAndOverride<PermissaoMetadata>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const operacao = permissaoMetadata?.operacao || 'READ';
    const tabela = permissaoMetadata?.tabela || this.inferirTabela(context);

    const codUsuario = usuario.userId || usuario.codUsuario;
    const tokenUsuario = this.extrairToken(request);

    // Obter campos permitidos do servico
    const camposPermitidosServico = await this.permissoesService.obterCamposPermitidos(
      codUsuario,
      tabela,
      operacao,
      tokenUsuario,
    );

    // Calcular intersecao entre campos do decorator e campos do servico
    const camposPermitidosFinal = this.calcularCamposPermitidos(camposMetadata.campos, camposPermitidosServico);

    // Verificar se ha campos solicitados nao permitidos
    const camposSolicitados = this.extrairCamposSolicitados(request);

    if (camposSolicitados.length > 0) {
      const camposNaoPermitidos = camposSolicitados.filter(
        (campo) => !camposPermitidosFinal.includes(campo.toUpperCase()),
      );

      if (camposNaoPermitidos.length > 0) {
        this.logger.warn(
          `Usuario ${codUsuario} tentou acessar campos nao permitidos: ${camposNaoPermitidos.join(', ')}`,
        );
        throw new ForbiddenException(
          `Voce nao tem permissao para acessar os campos: ${camposNaoPermitidos.join(', ')}`,
        );
      }
    }

    // Adicionar campos permitidos ao request para uso posterior
    request.camposPermitidos = camposPermitidosFinal;

    this.logger.debug(`Campos permitidos para usuario ${codUsuario}: ${camposPermitidosFinal.join(', ')}`);

    return true;
  }

  /**
   * Calcula a intersecao entre campos do decorator e campos do servico.
   */
  private calcularCamposPermitidos(camposDecorator: string[], camposServico: string[]): string[] {
    // Se servico retornar vazio, usar apenas decorator
    if (camposServico.length === 0) {
      return camposDecorator.map((c) => c.toUpperCase());
    }

    // Normalizar para uppercase
    const decoratorUpper = camposDecorator.map((c) => c.toUpperCase());
    const servicoUpper = camposServico.map((c) => c.toUpperCase());

    // Retornar intersecao
    return decoratorUpper.filter((campo) => servicoUpper.includes(campo));
  }

  /**
   * Extrai campos solicitados do request.
   */
  private extrairCamposSolicitados(request: any): string[] {
    // Tentar obter do query parameter 'fields'
    if (request.query?.fields) {
      return request.query.fields.split(',').map((f: string) => f.trim());
    }

    // Tentar obter do header 'X-Fields'
    if (request.headers['x-fields']) {
      return request.headers['x-fields'].split(',').map((f: string) => f.trim());
    }

    // Tentar obter do body 'campos'
    if (request.body?.campos && Array.isArray(request.body.campos)) {
      return request.body.campos;
    }

    return [];
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
