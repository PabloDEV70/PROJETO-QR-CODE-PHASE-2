import { SetMetadata } from '@nestjs/common';

/**
 * Chave de metadata para campos obrigatórios.
 */
export const CAMPOS_OBRIGATORIOS_KEY = 'camposObrigatorios';

/**
 * Decorator para marcar campos obrigatórios em endpoints.
 *
 * Usado em conjunto com ValidarViaDicionario para validação extra
 * de campos específicos além das regras do dicionário.
 *
 * @param campos - Lista de nomes de campos obrigatórios
 *
 * @example
 * ```typescript
 * @Post()
 * @ValidarViaDicionario('TGFPRO')
 * @CamposObrigatorios(['CODPROD', 'DESCRPROD', 'CODVOL'])
 * async criarProduto(@Body() dados: any) {
 *   // Validado contra dicionário + campos obrigatórios extras
 * }
 * ```
 */
export function CamposObrigatorios(...campos: string[]) {
  return SetMetadata(CAMPOS_OBRIGATORIOS_KEY, campos);
}
