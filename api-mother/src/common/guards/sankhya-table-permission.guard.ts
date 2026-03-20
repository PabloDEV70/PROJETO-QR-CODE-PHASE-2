import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SankhyaPermissionValidatorService } from '../../modules/permissoes/services/sankhya-permission-validator.service';
import { Traced } from '../../shared/instrumentation/traced.decorator';

export const SANKHYA_TABLE_PERMISSION_KEY = 'sankhya_table_permission';

export interface SankhyaTablePermissionMetadata {
  operacao?: 'CONSULTAR' | 'INSERIR' | 'ALTERAR' | 'EXCLUIR';
  fromParam?: boolean;
  tableName?: string;
}

export const SankhyaTablePermission = (
  operacao: 'CONSULTAR' | 'INSERIR' | 'ALTERAR' | 'EXCLUIR' = 'CONSULTAR',
  options?: { tableName?: string; fromParam?: boolean },
) => {
  const metadata: SankhyaTablePermissionMetadata = {
    operacao,
    fromParam: options?.fromParam !== undefined ? options.fromParam : true,
    tableName: options?.tableName,
  };

  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (propertyKey && descriptor) {
      Reflect.defineMetadata(SANKHYA_TABLE_PERMISSION_KEY, metadata, descriptor.value);
    } else {
      Reflect.defineMetadata(SANKHYA_TABLE_PERMISSION_KEY, metadata, target);
    }
  };
};

@Injectable()
export class SankhyaTablePermissionGuard implements CanActivate {
  private readonly logger = new Logger(SankhyaTablePermissionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly permissionValidator: SankhyaPermissionValidatorService,
  ) {}

  @Traced('SankhyaTablePermissionGuard.canActivate')
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<SankhyaTablePermissionMetadata>(SANKHYA_TABLE_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!metadata) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('Tentativa de acesso sem autenticacao');
      throw new UnauthorizedException('Usuario nao autenticado');
    }

    const codUsuario = user.userId || user.codUsuario;
    if (!codUsuario) {
      this.logger.error('Token JWT nao contem userId/codUsuario', { user });
      throw new UnauthorizedException('Token invalido: falta identificacao do usuario');
    }

    let tableName: string | undefined;

    if (metadata.tableName) {
      tableName = metadata.tableName;
    } else if (metadata.fromParam) {
      tableName = request.params?.tableName || request.params?.table;

      if (!tableName) {
        tableName = request.body?.tableName || request.body?.table;
      }

      if (!tableName) {
        tableName = request.query?.tableName || request.query?.table;
      }
    }

    if (!tableName) {
      this.logger.error('Nome da tabela nao encontrado', {
        params: request.params,
        body: request.body,
        query: request.query,
        metadata,
      });
      throw new ForbiddenException('Nome da tabela nao especificado');
    }

    const nomeTabela = tableName.toUpperCase();
    const operacao = metadata.operacao || 'CONSULTAR';

    this.logger.debug(
      `Verificando permissao Sankhya: usuario=${codUsuario}, tabela=${nomeTabela}, operacao=${operacao}`,
    );

    try {
      const temPermissao = await this.permissionValidator.verificarPermissaoTabela(codUsuario, nomeTabela, operacao);

      if (!temPermissao) {
        this.logger.warn(
          `ACESSO NEGADO: Usuario ${codUsuario} nao tem permissao ${operacao} para tabela ${nomeTabela}`,
        );

        throw new ForbiddenException(
          `Voce nao tem permissao para ${this.traduzirOperacao(operacao)} a tabela ${nomeTabela}`,
        );
      }

      this.logger.debug(`Permissao CONCEDIDA: usuario ${codUsuario} pode ${operacao} em ${nomeTabela}`);

      request.sankhyaPermission = {
        codUsuario,
        tableName: nomeTabela,
        operacao,
        timestamp: new Date(),
      };

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(
        `Erro inesperado ao verificar permissao para usuario ${codUsuario}, tabela ${nomeTabela}`,
        error.stack,
      );

      throw new ForbiddenException('Erro ao verificar permissoes');
    }
  }

  private traduzirOperacao(operacao: string): string {
    const traducoes: Record<string, string> = {
      CONSULTAR: 'consultar',
      INSERIR: 'inserir dados em',
      ALTERAR: 'alterar dados em',
      EXCLUIR: 'excluir dados de',
    };
    return traducoes[operacao] || operacao.toLowerCase();
  }
}
