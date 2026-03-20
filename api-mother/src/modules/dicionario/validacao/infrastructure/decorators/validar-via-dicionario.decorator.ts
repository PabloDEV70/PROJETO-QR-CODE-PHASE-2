import { SetMetadata, applyDecorators, UseGuards, UseInterceptors } from '@nestjs/common';
import { ValidacaoDicionarioGuard } from '../guards/validacao-dicionario.guard';
import { InjecaoSchemaInterceptor } from '../interceptors/injecao-schema.interceptor';

/**
 * Chaves de metadata para decorators.
 */
export const VALIDAR_VIA_DICIONARIO_KEY = 'validarViaDicionario:nomeTabela';
export const INJETAR_SCHEMA_KEY = 'injetarSchema:nomeTabela';

/**
 * Decorator para validar requisição via dicionário.
 *
 * Aplica guard e interceptor para validar body contra schema da tabela.
 *
 * @param nomeTabela - Nome da tabela no dicionário Sankhya
 *
 * @example
 * ```typescript
 * @Post()
 * @ValidarViaDicionario('TGFPRO')
 * async criarProduto(@Body() dados: any) {
 *   // Dados já validados contra TGFPRO
 * }
 * ```
 */
export function ValidarViaDicionario(nomeTabela: string) {
  return applyDecorators(
    SetMetadata(VALIDAR_VIA_DICIONARIO_KEY, nomeTabela),
    SetMetadata(INJETAR_SCHEMA_KEY, nomeTabela),
    UseGuards(ValidacaoDicionarioGuard),
    UseInterceptors(InjecaoSchemaInterceptor),
  );
}
