// Module
export * from './permissoes-escrita.module';

// Domain
export * from './domain';

// Application - exportar seletivamente para evitar conflitos
export {
  VerificarPermissaoEscritaUseCase,
  VerificarPermissaoEscritaEntrada,
  VerificarPermissaoEscritaSaida,
} from './application/use-cases/verificar-permissao-escrita';

export {
  ObterPermissoesUsuarioUseCase,
  ObterPermissoesUsuarioEntrada,
  ObterPermissoesUsuarioSaida,
  PermissaoDto,
  RoleDto,
} from './application/use-cases/obter-permissoes-usuario';

// Infrastructure
export * from './infrastructure';

// Presentation
export * from './presentation';

// Shared
export * from './shared';
