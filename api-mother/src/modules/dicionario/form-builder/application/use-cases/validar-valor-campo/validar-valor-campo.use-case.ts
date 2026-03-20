import { Injectable, Inject } from '@nestjs/common';
import { IRepositorioCampo, REPOSITORIO_CAMPO } from '../../../../domain/repositories/campo.repository.interface';
import { VALIDADOR_CAMPO_SERVICE, IValidadorCampoService } from '../../../domain/services';

export interface ValidarValorCampoInput {
  tokenUsuario: string;
  nomeTabela: string;
  nomeCampo: string;
  valor: any;
}

export interface ValidarValorCampoOutput {
  valido: boolean;
  erro?: string;
}

@Injectable()
export class ValidarValorCampoUseCase {
  constructor(
    @Inject(REPOSITORIO_CAMPO) private readonly repositorioCampo: IRepositorioCampo,
    @Inject(VALIDADOR_CAMPO_SERVICE) private readonly validador: IValidadorCampoService,
  ) {}

  async executar(entrada: ValidarValorCampoInput): Promise<ValidarValorCampoOutput> {
    const campo = await this.repositorioCampo.buscarPorNome(
      entrada.nomeTabela.toUpperCase(),
      entrada.nomeCampo.toUpperCase(),
      entrada.tokenUsuario,
    );

    if (!campo) {
      throw new Error(`Campo ${entrada.nomeCampo} não encontrado na tabela ${entrada.nomeTabela}`);
    }

    const resultado = this.validador.validarValor(campo, entrada.valor);

    return {
      valido: resultado.sucesso,
      erro: resultado.erro,
    };
  }
}
