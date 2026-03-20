import { Injectable, Inject } from '@nestjs/common';
import { IRepositorioCampo, REPOSITORIO_CAMPO } from '../../../domain/repositories/campo.repository.interface';
import { CampoMapper } from '../../mappers/campo.mapper';
import { ObterCampoInput } from './obter-campo.input';
import { ObterCampoOutput } from './obter-campo.output';

/**
 * Caso de uso para obter um campo específico pelo nome.
 *
 * Busca um campo específico de uma tabela do dicionário de dados,
 * retornando todas as informações do campo.
 *
 * @module Dicionario
 */
@Injectable()
export class ObterCampoUseCase {
  constructor(
    @Inject(REPOSITORIO_CAMPO)
    private readonly repositorioCampo: IRepositorioCampo,
    private readonly campoMapper: CampoMapper,
  ) {}

  /**
   * Executa o caso de uso para obter um campo.
   *
   * @param entrada - Dados de entrada contendo nome da tabela, campo e token
   * @returns Campo encontrado ou null
   */
  async executar(entrada: ObterCampoInput): Promise<ObterCampoOutput> {
    const nomeTabela = entrada.nomeTabela.toUpperCase();
    const nomeCampo = entrada.nomeCampo.toUpperCase();

    // Buscar campo via repositório
    const campo = await this.repositorioCampo.buscarPorNome(nomeTabela, nomeCampo, entrada.tokenUsuario);

    if (!campo) {
      return { campo: null };
    }

    // Mapear entidade de domínio para DTO
    const campoDto = this.campoMapper.paraDto(campo);

    return { campo: campoDto };
  }
}
