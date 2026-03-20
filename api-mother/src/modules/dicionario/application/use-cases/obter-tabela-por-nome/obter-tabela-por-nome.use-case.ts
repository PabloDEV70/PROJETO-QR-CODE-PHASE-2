import { Injectable, Inject } from '@nestjs/common';
import { IRepositorioTabela, REPOSITORIO_TABELA } from '../../../domain/repositories/tabela.repository.interface';
import { TabelaMapper } from '../../mappers/tabela.mapper';
import { ObterTabelaPorNomeInput } from './obter-tabela-por-nome.input';
import { ObterTabelaPorNomeOutput } from './obter-tabela-por-nome.output';

/**
 * Caso de uso para obter uma tabela específica do dicionário de dados pelo nome.
 *
 * Busca a tabela pelo seu nome (NOMETAB) e retorna seus metadados como
 * descrição, módulo, instância e tipo de CRUD.
 *
 * @module Dicionario
 */
@Injectable()
export class ObterTabelaPorNomeUseCase {
  constructor(
    @Inject(REPOSITORIO_TABELA)
    private readonly repositorioTabela: IRepositorioTabela,
    private readonly tabelaMapper: TabelaMapper,
  ) {}

  /**
   * Executa o caso de uso para obter tabela por nome.
   *
   * @param entrada - Dados de entrada contendo o nome da tabela e token do usuário
   * @returns Dados da tabela encontrada ou null
   */
  async executar(entrada: ObterTabelaPorNomeInput): Promise<ObterTabelaPorNomeOutput> {
    // Buscar tabela por nome via repositório
    const tabela = await this.repositorioTabela.buscarPorNome(entrada.nomeTabela, entrada.tokenUsuario);

    // Se não encontrou, retorna null
    if (!tabela) {
      return {
        tabela: null,
      };
    }

    // Mapear entidade de domínio para DTO
    const tabelaDto = this.tabelaMapper.paraDto(tabela);

    return {
      tabela: tabelaDto,
    };
  }
}
