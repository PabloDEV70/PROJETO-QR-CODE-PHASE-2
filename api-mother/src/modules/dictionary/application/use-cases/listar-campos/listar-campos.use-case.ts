import { Inject, Injectable } from '@nestjs/common';
import { Campo } from '../../../domain/entities';
import { IProvedorCampos, PROVEDOR_CAMPOS, OpcoesPaginacao, ResultadoPaginado } from '../../ports';

/**
 * Use Case: ListarCamposUseCase
 *
 * Lista todos os campos de uma tabela do dicionário de dados.
 */
@Injectable()
export class ListarCamposUseCase {
  constructor(
    @Inject(PROVEDOR_CAMPOS)
    private readonly provedorCampos: IProvedorCampos,
  ) {}

  async executar(nomeTabela: string, opcoes?: OpcoesPaginacao): Promise<ResultadoPaginado<Campo>> {
    return this.provedorCampos.listarCamposDaTabela(nomeTabela.toUpperCase(), opcoes);
  }
}
