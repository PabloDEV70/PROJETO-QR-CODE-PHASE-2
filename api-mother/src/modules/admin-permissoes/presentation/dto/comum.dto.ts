import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de resposta para operacoes de remocao/desassociacao.
 */
export class OperacaoSucessoRespostaDto {
  @ApiProperty({ description: 'Se a operacao foi bem sucedida' })
  sucesso: boolean;

  @ApiProperty({ description: 'Mensagem descritiva' })
  mensagem: string;
}
