/**
 * Decorator @RequireApproval para marcar endpoints que requerem aprovacao.
 *
 * @module M3-T10
 *
 * @example
 * @RequireApproval()
 * @Post('solicitar-manutencao')
 * async solicitarManutencao() { }
 *
 * @example
 * @RequireApproval('FINANCEIRO')
 * @Post('aprovar-pagamento')
 * async aprovarPagamento() { }
 */
import { SetMetadata } from '@nestjs/common';

export const APPROVAL_KEY = 'aprovacao_requerida';

export interface AprovacaoMetadata {
  tipo?: string;
  nivelAprovacao?: number;
  mensagem?: string;
}

/**
 * Decorator que marca o endpoint como requerendo aprovacao.
 *
 * @param tipo - Tipo de aprovacao (ex: 'FINANCEIRO', 'GERENCIAL', 'OPERACIONAL')
 * @param nivelAprovacao - Nivel minimo de aprovacao necessario (1-5)
 */
export const RequireApproval = (tipo?: string, nivelAprovacao?: number) =>
  SetMetadata<string, AprovacaoMetadata>(APPROVAL_KEY, {
    tipo,
    nivelAprovacao,
    mensagem: tipo ? `Requer aprovacao do tipo: ${tipo}` : 'Requer aprovacao',
  });
