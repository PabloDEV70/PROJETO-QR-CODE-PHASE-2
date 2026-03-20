import { Injectable, Inject } from '@nestjs/common';
import { IRepositorioCampo, REPOSITORIO_CAMPO } from '../../../domain/repositories/campo.repository.interface';
import { ObterPropriedadesCampoInput } from './obter-propriedades-campo.input';
import { ObterPropriedadesCampoOutput, PropriedadeCampoDto } from './obter-propriedades-campo.output';

/**
 * Caso de uso para obter as propriedades de um campo (TDDPCO).
 *
 * Retorna a lista de propriedades customizadas associadas a um campo.
 *
 * @module Dicionario
 */
@Injectable()
export class ObterPropriedadesCampoUseCase {
  constructor(
    @Inject(REPOSITORIO_CAMPO)
    private readonly repositorioCampo: IRepositorioCampo,
  ) {}

  /**
   * Executa o caso de uso para obter propriedades de um campo.
   *
   * @param entrada - Dados de entrada contendo tabela, campo e token
   * @returns Lista de propriedades do campo
   */
  async executar(entrada: ObterPropriedadesCampoInput): Promise<ObterPropriedadesCampoOutput> {
    const nomeTabela = entrada.nomeTabela.toUpperCase();
    const nomeCampo = entrada.nomeCampo.toUpperCase();

    // Buscar propriedades via repositório
    const propriedades = await this.repositorioCampo.buscarPropriedadesCampo(
      nomeTabela,
      nomeCampo,
      entrada.tokenUsuario,
    );

    // Mapear para DTOs
    const propriedadesDto: PropriedadeCampoDto[] = propriedades.map((prop) => ({
      nomeTabela: prop.nomeTabela,
      nomeCampo: prop.nomeCampo,
      nomePropriedade: prop.nomePropriedade,
      valorPropriedade: prop.valorPropriedade,
      valorBooleano: prop.obterValorBooleano(),
    }));

    return {
      propriedades: propriedadesDto,
      total: propriedadesDto.length,
    };
  }
}
