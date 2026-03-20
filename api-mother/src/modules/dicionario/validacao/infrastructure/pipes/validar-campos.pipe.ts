import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ValidacaoService } from '../../application/services/validacao.service';

/**
 * Opções do pipe de validação.
 */
export interface ValidarCamposOpcoes {
  nomeTabela: string;
  camposObrigatorios?: string[];
  permitirCamposExtras?: boolean;
}

/**
 * Pipe NestJS para validação de campos via dicionário.
 *
 * Pode ser usado em parâmetros de métodos para validar dados
 * contra o schema da tabela.
 */
@Injectable()
export class ValidarCamposPipe implements PipeTransform {
  constructor(
    private readonly opcoes: ValidarCamposOpcoes,
    private readonly validacaoService: ValidacaoService,
  ) {}

  async transform(value: any, _metadata: ArgumentMetadata) {
    if (!value || typeof value !== 'object') {
      throw new BadRequestException('Dados inválidos para validação');
    }

    // Validar via service
    const resultado = await this.validacaoService.validarDados(this.opcoes.nomeTabela, value);

    if (resultado.falhou) {
      throw new BadRequestException({
        mensagem: 'Validação de campos falhou',
        erros: resultado.erro,
        tabela: this.opcoes.nomeTabela,
      });
    }

    // Retornar valor validado
    return value;
  }
}
