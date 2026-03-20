/**
 * CrudPermissionGuard - Guard principal que verifica permissao CRUD.
 *
 * @module M3-T02
 *
 * Este guard verifica se o usuario tem permissao para executar a operacao
 * CRUD especificada no endpoint via decorator @RequirePermission.
 *
 * @example
 * @UseGuards(JwtAuthGuard, CrudPermissionGuard)
 * @RequirePermission('CREATE', 'TGFVEI')
 * @Post()
 * async criarVeiculo() { }
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
import { PERMISSION_KEY, PermissaoMetadata } from '../decorators/require-permission.decorator';
import { IPermissoesService, PERMISSOES_SERVICE } from './interfaces/permissoes-service.interface';
import { ContextoPermissao } from './types';
import { Traced } from '../../shared/instrumentation/traced.decorator';

@Injectable()
export class CrudPermissionGuard implements CanActivate {
  private readonly logger = new Logger(CrudPermissionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Optional()
    @Inject(PERMISSOES_SERVICE)
    private readonly permissoesService?: IPermissoesService,
  ) {}

  @Traced('CrudPermissionGuard.canActivate')
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obter metadata do decorator @RequirePermission
    const permissaoMetadata = this.reflector.getAllAndOverride<PermissaoMetadata>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se nao houver decorator, permitir acesso
    if (!permissaoMetadata) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const usuario = request.user;

    // Verificar se usuario esta autenticado
    if (!usuario) {
      this.logger.warn('Tentativa de acesso sem autenticacao');
      throw new ForbiddenException('Usuario nao autenticado');
    }

    // Extrair informacoes do contexto
    const codUsuario = usuario.userId || usuario.codUsuario;
    const codTela = this.obterCodTela(request, permissaoMetadata);
    const tabela = permissaoMetadata.tabela || this.inferirTabela(context);
    const tokenUsuario = this.extrairToken(request);

    // Se nao houver servico de permissoes configurado, log warning e permitir
    if (!this.permissoesService) {
      this.logger.warn(
        `PermissoesService nao configurado. Permitindo acesso para ${permissaoMetadata.operacao} em ${tabela}`,
      );
      return true;
    }

    // Construir contexto de permissao
    const contexto: ContextoPermissao = {
      codUsuario,
      codTela,
      operacao: permissaoMetadata.operacao,
      tabela,
      tokenUsuario,
    };

    this.logger.debug(
      `Verificando permissao CRUD: ${JSON.stringify({
        codUsuario,
        operacao: permissaoMetadata.operacao,
        tabela,
      })}`,
    );

    // Verificar permissao
    const resultado = await this.permissoesService.verificarPermissaoCrud(contexto);

    if (!resultado.permitido) {
      this.logger.warn(
        `Acesso negado: usuario ${codUsuario} nao tem permissao para ${permissaoMetadata.operacao} em ${tabela}. Motivo: ${resultado.motivo}`,
      );
      throw new ForbiddenException(resultado.motivo || `Voce nao tem permissao para executar esta operacao`);
    }

    // Adicionar informacoes de permissao ao request para uso posterior
    request.permissao = {
      operacao: permissaoMetadata.operacao,
      tabela,
      camposPermitidos: resultado.camposPermitidos,
      condicoesRls: resultado.condicoesRls,
      requerAprovacao: resultado.requerAprovacao,
    };

    this.logger.debug(
      `Permissao concedida: usuario ${codUsuario} pode executar ${permissaoMetadata.operacao} em ${tabela}`,
    );

    return true;
  }

  /**
   * Obtem o codigo da tela a partir do request ou metadata.
   */
  private obterCodTela(request: any, _metadata: PermissaoMetadata): number {
    // Tentar obter do header
    const codTelaHeader = request.headers['x-cod-tela'];
    if (codTelaHeader) {
      return parseInt(codTelaHeader, 10);
    }

    // Tentar obter do query
    if (request.query?.codTela) {
      return parseInt(request.query.codTela, 10);
    }

    // Tentar obter do body
    if (request.body?.codTela) {
      return request.body.codTela;
    }

    // Valor padrao (0 indica sem tela especifica)
    return 0;
  }

  /**
   * Infere o nome da tabela a partir do controller.
   */
  private inferirTabela(context: ExecutionContext): string {
    const controller = context.getClass();
    const controllerName = controller.name;

    // Remover sufixo "Controller" e converter para uppercase
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
