/**
 * Decorator @AllowedFields para especificar campos permitidos no endpoint.
 *
 * @module M3-T11
 *
 * @example
 * @AllowedFields(['CODVEICULO', 'PLACA', 'MARCAMODELO'])
 * @Get('resumo')
 * async obterResumo() { }
 *
 * @example
 * @AllowedFields(['*']) // Todos os campos
 * @Get(':id')
 * async obterDetalhes() { }
 */
import { SetMetadata } from '@nestjs/common';

export const ALLOWED_FIELDS_KEY = 'campos_permitidos';

export interface CamposPermitidosMetadata {
  campos: string[];
  permitirTodos: boolean;
}

/**
 * Decorator que especifica os campos permitidos para o endpoint.
 *
 * @param campos - Lista de campos permitidos. Use ['*'] para permitir todos.
 */
export const AllowedFields = (campos: string[]) =>
  SetMetadata<string, CamposPermitidosMetadata>(ALLOWED_FIELDS_KEY, {
    campos,
    permitirTodos: campos.includes('*'),
  });

/**
 * Decorator que permite todos os campos no endpoint.
 */
export const AllowAllFields = () => AllowedFields(['*']);
