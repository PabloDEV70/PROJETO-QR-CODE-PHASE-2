import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
 * Valida apenas pelo codgrupo presente no JWT assinado.
 * NAO confia em claims auto-declarados como isAdmin, role, roles.
 */
@Injectable()
export class AdminOnlyGuard implements CanActivate {
  private readonly adminGroups: number[];

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    const raw = this.configService.get<string>('ADMIN_CODGRUPOS') || '1';
    this.adminGroups = raw
      .split(',')
      .map((g) => Number(g.trim()))
      .filter((n) => !Number.isNaN(n) && n > 0);
  }

  canActivate(context: ExecutionContext): boolean {
    const isAdminOnly = this.reflector.get<boolean>('isAdminOnly', context.getHandler());

    if (!isAdminOnly) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new GatewayException(
        GatewayErrorCode.ERR_UNAUTHORIZED,
        'User not authenticated',
        {},
        HttpStatus.UNAUTHORIZED,
      );
    }

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
    // Superusuario Sankhya (CODUSU=0) - hardcoded, cannot be forged via JWT
    if (user.sub === 0) {
      return true;
    }

    // Validate by codgrupo from signed JWT payload only
    const codgrupo = typeof user.codgrupo === 'number' ? user.codgrupo : Number(user.codgrupo);
    if (codgrupo && this.adminGroups.includes(codgrupo)) {
      return true;
    }

    return false;
  }
}
