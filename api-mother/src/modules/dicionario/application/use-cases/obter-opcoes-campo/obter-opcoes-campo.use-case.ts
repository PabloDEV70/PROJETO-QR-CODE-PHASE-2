import { Injectable, Inject } from '@nestjs/common';
import { IRepositorioCampo, REPOSITORIO_CAMPO } from '../../../domain/repositories/campo.repository.interface';
import { ObterOpcoesCampoInput } from './obter-opcoes-campo.input';
import { ObterOpcoesCampoOutput, OpcaoCampoDto } from './obter-opcoes-campo.output';

/**
 * Caso de uso para obter as opções de um campo (TDDOPC).
 *
 * Retorna a lista de valores possíveis para campos do tipo enum/seleção.
 *
 * @module Dicionario
 */
@Injectable()
export class ObterOpcoesCampoUseCase {
  constructor(
    @Inject(REPOSITORIO_CAMPO)
    private readonly repositorioCampo: IRepositorioCampo,
  ) {}

  /**
   * Executa o caso de uso para obter opções de um campo.
   *
   * @param entrada - Dados de entrada contendo tabela, campo e token
   * @returns Lista de opções do campo
   */
  async executar(entrada: ObterOpcoesCampoInput): Promise<ObterOpcoesCampoOutput> {
    const nomeTabela = entrada.nomeTabela.toUpperCase();
    const nomeCampo = entrada.nomeCampo.toUpperCase();

    // Buscar opções via repositório
    const opcoes = await this.repositorioCampo.buscarOpcoesCampo(nomeTabela, nomeCampo, entrada.tokenUsuario);

    // Mapear para DTOs
    const opcoesDto: OpcaoCampoDto[] = opcoes.map((opcao) => ({
      nomeTabela: opcao.nomeTabela,
      nomeCampo: opcao.nomeCampo,
      valor: opcao.valor,
      descricao: opcao.descricao,
      ordem: opcao.ordem,
    }));

    return {
      opcoes: opcoesDto,
      total: opcoesDto.length,
    };
  }
}
