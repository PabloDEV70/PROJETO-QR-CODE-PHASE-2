import { Injectable, Inject } from '@nestjs/common';
import { IRepositorioCampo, REPOSITORIO_CAMPO } from '../../../../domain/repositories/campo.repository.interface';
import { VALIDADOR_CAMPO_SERVICE, IValidadorCampoService } from '../../../domain/services';

export interface ValidarObjetoInput {
  tokenUsuario: string;
  nomeTabela: string;
  objeto: Record<string, any>;
}

export interface ValidarObjetoOutput {
  valido: boolean;
  erros: Record<string, string>;
}

@Injectable()
export class ValidarObjetoUseCase {
  constructor(
    @Inject(REPOSITORIO_CAMPO) private readonly repositorioCampo: IRepositorioCampo,
    @Inject(VALIDADOR_CAMPO_SERVICE) private readonly validador: IValidadorCampoService,
  ) {}

  async executar(entrada: ValidarObjetoInput): Promise<ValidarObjetoOutput> {
    const campos = await this.repositorioCampo.buscarPorTabela(entrada.nomeTabela.toUpperCase(), entrada.tokenUsuario);

    if (!campos || campos.length === 0) {
      throw new Error(`Nenhum campo encontrado para a tabela ${entrada.nomeTabela}`);
    }

    const resultado = this.validador.validarObjeto(campos, entrada.objeto);

    const erros = resultado.sucesso ? {} : JSON.parse(resultado.erro!);

    return {
      valido: resultado.sucesso,
      erros,
    };
  }
}
