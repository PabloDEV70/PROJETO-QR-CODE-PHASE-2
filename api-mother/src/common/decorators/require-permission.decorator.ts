/**
 * Decorator @RequirePermission para marcar endpoints que requerem verificacao de permissao CRUD.
 *
 * @module M3-T09
 *
 * @example
 * @RequirePermission('READ')
 * @Get('ativos')
 * async obterVeiculosAtivos() { }
 *
 * @example
 * @RequirePermission('CREATE', 'TGFVEI')
 * @Post()
 * async criarVeiculo() { }
 */
import { SetMetadata } from '@nestjs/common';

export type OperacaoCrud = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LIST';

export const PERMISSION_KEY = 'permissao_requerida';

export interface PermissaoMetadata {
  operacao: OperacaoCrud;
  tabela?: string;
}

/**
 * Decorator que marca o endpoint como requerendo verificacao de permissao.
 *
 * @param operacao - Tipo de operacao CRUD (CREATE, READ, UPDATE, DELETE, LIST)
 * @param tabela - Nome da tabela Sankhya (opcional, pode ser inferido do controller)
 */
export const RequirePermission = (operacao: OperacaoCrud, tabela?: string) =>
  SetMetadata<string, PermissaoMetadata>(PERMISSION_KEY, { operacao, tabela });
