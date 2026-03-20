import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GatewayException } from '../../../../common/exceptions/gateway.exception';
import { GatewayErrorCode } from '../../../../common/enums/gateway-error-code.enum';

/**
 * Decorator para marcar endpoints que requerem acesso administrativo.
 */
export const AdminOnly = () => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('isAdminOnly', true, descriptor.value);
    return descriptor;
  };
};

/**
 * Guard que verifica se o usuario tem permissao administrativa.
 *
 * Este guard deve ser usado em conjunto com o JwtAuthGuard.
 * Verifica se o usuario autenticado possui a role de administrador.
 */
@Injectable()
export class AdminOnlyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Verificar se o endpoint requer admin
    const isAdminOnly = this.reflector.get<boolean>('isAdminOnly', context.getHandler());

    // Se nao requer admin, permitir acesso
    if (!isAdminOnly) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Verificar se usuario esta autenticado
    if (!user) {
      throw new GatewayException(
        GatewayErrorCode.ERR_UNAUTHORIZED,
        'User not authenticated',
        {},
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Verificar se usuario e administrador
    // Por padrao, considera admin se:
    // 1. Usuario tem role 'admin' ou 'ADMIN'
    // 2. Usuario tem codUsuario = 0 (superusuario Sankhya)
    // 3. Usuario tem flag isAdmin = true
    const isAdmin = this.verificarAdmin(user);

    if (!isAdmin) {
      throw new GatewayException(
        GatewayErrorCode.ERR_ADMIN_REQUIRED,
        'Access restricted to administrators',
        {},
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }

  private verificarAdmin(user: any): boolean {
    // Verificar por codigo de usuario (superusuario Sankhya = 0)
    if (user.sub === 0 || user.codUsuario === 0) {
      return true;
    }

    // Verificar por flag isAdmin
    if (user.isAdmin === true) {
      return true;
    }

    // Verificar por role
    if (user.role) {
      const role = String(user.role).toUpperCase();
      if (role === 'ADMIN' || role === 'ADMINISTRADOR' || role === 'SUPERUSER') {
        return true;
      }
    }

    // Verificar por array de roles
    if (user.roles && Array.isArray(user.roles)) {
      const rolesUpperCase = user.roles.map((r: string) => String(r).toUpperCase());
      if (
        rolesUpperCase.includes('ADMIN') ||
        rolesUpperCase.includes('ADMINISTRADOR') ||
        rolesUpperCase.includes('SUPERUSER')
      ) {
        return true;
      }
    }

    return false;
  }
}
