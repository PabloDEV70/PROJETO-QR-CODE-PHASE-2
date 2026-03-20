import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Campo } from '../../../domain/entities';
import { IProvedorCampos, PROVEDOR_CAMPOS } from '../../ports';

/**
 * Use Case: ObterCampoUseCase
 *
 * Obtém detalhes de um campo específico com suas opções.
 */
@Injectable()
export class ObterCampoUseCase {
  constructor(
    @Inject(PROVEDOR_CAMPOS)
    private readonly provedorCampos: IProvedorCampos,
  ) {}

  async executar(nomeTabela: string, nomeCampo: string): Promise<Campo> {
    const campo = await this.provedorCampos.obterCampo(nomeTabela.toUpperCase(), nomeCampo.toUpperCase());

    if (!campo) {
      throw new NotFoundException(`Campo '${nomeCampo}' não encontrado na tabela '${nomeTabela}'`);
    }

    // Buscar opções do campo
    const opcoes = await this.provedorCampos.obterOpcoesCampo(campo.numeroCampo);

    return campo.comOpcoes(opcoes);
  }
}
