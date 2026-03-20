/**
 * CachedPermissionGuard - Guard com suporte a cache de permissoes.
 *
 * Verifica permissoes usando cache antes de consultar o banco,
 * melhorando a performance de verificacao de acesso.
 *
 * @module M6 - Cache de Permissoes
 * @task M6-T10
 */

import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionCacheService } from '../application/services/permission-cache.service';
import { UserContextCacheService } from '../application/services/user-context-cache.service';
import { PermissaoCache } from '../domain/entities/permissao-cache.entity';

// Metadados para decorators
export const PERMISSAO_TELA = 'permissao_tela';
export const PERMISSAO_OPERACAO = 'permissao_operacao';
export const PERMISSAO_CONTROLE = 'permissao_controle';
export const BYPASS_CACHE = 'bypass_cache';

// Decorators
export const RequirePermissaoTela = (codTela: number) => SetMetadata(PERMISSAO_TELA, codTela);
export const RequireOperacao = (operacao: string) => SetMetadata(PERMISSAO_OPERACAO, operacao);
export const RequireControle = (nomeControle: string) => SetMetadata(PERMISSAO_CONTROLE, nomeControle);
export const BypassCache = () => SetMetadata(BYPASS_CACHE, true);

export interface DadosUsuarioRequest {
  codUsuario: number;
  nomeUsuario: string;
  token: string;
}

@Injectable()
export class CachedPermissionGuard implements CanActivate {
  private readonly logger = new Logger(CachedPermissionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly permissionCacheService: PermissionCacheService,
    private readonly userContextCacheService: UserContextCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const usuario = this.extrairUsuario(request);

    if (!usuario) {
      this.logger.warn('Usuario nao autenticado');
      throw new ForbiddenException('Usuario nao autenticado');
    }

    // Obter metadados de permissao
    const codTela = this.reflector.get<number>(PERMISSAO_TELA, context.getHandler());
    const operacao = this.reflector.get<string>(PERMISSAO_OPERACAO, context.getHandler());
    const nomeControle = this.reflector.get<string>(PERMISSAO_CONTROLE, context.getHandler());
    const bypassCache = this.reflector.get<boolean>(BYPASS_CACHE, context.getHandler());

    // Se nenhuma permissao especifica, permitir acesso
    if (!codTela && !operacao && !nomeControle) {
      return true;
    }

    try {
      // Verificar permissao com cache
      const permitido = await this.verificarPermissao(usuario, codTela, operacao, nomeControle, bypassCache);

      if (!permitido) {
        this.logger.warn(`Acesso negado para usuario ${usuario.codUsuario} - Tela: ${codTela}, Operacao: ${operacao}`);
        throw new ForbiddenException('Acesso negado a este recurso');
      }

      // Adicionar informacoes de permissao ao request para uso posterior
      request.permissaoCache = {
        codTela,
        operacao,
        fonte: bypassCache ? 'banco' : 'cache',
      };

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(`Erro ao verificar permissao: ${(error as Error).message}`);
      // Em caso de erro, negar acesso por seguranca
      throw new ForbiddenException('Erro ao verificar permissao');
    }
  }

  private async verificarPermissao(
    usuario: DadosUsuarioRequest,
    codTela?: number,
    operacao?: string,
    nomeControle?: string,
    bypassCache?: boolean,
  ): Promise<boolean> {
    // Se bypass de cache, ir direto ao banco (implementar integracao)
    if (bypassCache) {
      this.logger.debug('Bypass de cache solicitado');
      // Aqui deveria chamar o servico de permissoes original
      // Por hora, assumir permitido e logar
      return true;
    }

    // Verificar permissao de tela/operacao
    if (codTela && operacao) {
      const resultado = await this.permissionCacheService.buscarPermissao(usuario.codUsuario, codTela, operacao);

      if (resultado.encontrado && resultado.permissao) {
        return resultado.permissao.permitido;
      }

      // Cache miss - buscar do banco e cachear
      const permissaoBanco = await this.buscarPermissaoDoBanco(usuario, codTela, operacao);

      if (permissaoBanco) {
        await this.permissionCacheService.armazenarPermissao(permissaoBanco);
        return permissaoBanco.permitido;
      }

      return false;
    }

    // Verificar permissao de controle
    if (codTela && nomeControle) {
      const resultado = await this.permissionCacheService.buscarPermissaoControle(
        usuario.codUsuario,
        codTela,
        nomeControle,
      );

      if (resultado.encontrado && resultado.permissao) {
        return resultado.permissao.permitido;
      }

      // Cache miss - buscar do banco
      const permissaoBanco = await this.buscarPermissaoControleDoBanco(usuario, codTela, nomeControle);

      if (permissaoBanco !== null) {
        await this.permissionCacheService.armazenarPermissaoControle(
          usuario.codUsuario,
          codTela,
          nomeControle,
          permissaoBanco,
        );
        return permissaoBanco;
      }

      return false;
    }

    return true;
  }

  private extrairUsuario(request: any): DadosUsuarioRequest | null {
    // Extrair usuario do request (populado pelo JwtGuard)
    if (request.user) {
      return {
        codUsuario: request.user.sub || request.user.codUsuario,
        nomeUsuario: request.user.username || request.user.nomeUsuario,
        token: request.headers?.authorization?.replace('Bearer ', '') || '',
      };
    }

    return null;
  }

  private async buscarPermissaoDoBanco(
    usuario: DadosUsuarioRequest,
    codTela: number,
    operacao: string,
  ): Promise<PermissaoCache | null> {
    // TODO: Integrar com servico de permissoes existente
    // Por hora, criar permissao simulada
    this.logger.debug(`Buscando permissao do banco: user=${usuario.codUsuario}, tela=${codTela}, op=${operacao}`);

    // Simulacao - em producao, chamar PermissoesGuardService
    return PermissaoCache.criarPermitido({
      codUsuario: usuario.codUsuario,
      codTela,
      tipoPermissao: 'tela',
      nomeRecurso: operacao,
    });
  }

  private async buscarPermissaoControleDoBanco(
    usuario: DadosUsuarioRequest,
    codTela: number,
    nomeControle: string,
  ): Promise<boolean | null> {
    // TODO: Integrar com servico de permissoes existente
    this.logger.debug(
      `Buscando permissao controle do banco: user=${usuario.codUsuario}, tela=${codTela}, controle=${nomeControle}`,
    );

    // Simulacao - em producao, chamar VerificarAcessoControleUseCase
    return true;
  }
}
