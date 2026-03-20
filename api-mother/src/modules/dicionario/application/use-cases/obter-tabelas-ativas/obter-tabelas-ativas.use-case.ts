import { Injectable, Inject } from '@nestjs/common';
import { IRepositorioTabela, REPOSITORIO_TABELA } from '../../../domain/repositories/tabela.repository.interface';
import { TabelaMapper } from '../../mappers/tabela.mapper';
import { ObterTabelasAtivasInput } from './obter-tabelas-ativas.input';
import { ObterTabelasAtivasOutput } from './obter-tabelas-ativas.output';

/**
 * Caso de uso para obter todas as tabelas ativas do dicionário de dados Sankhya.
 *
 * Retorna a lista de tabelas com ATIVA='S' do sistema, incluindo informações
 * como nome, descrição, módulo e tipo de CRUD.
 *
 * @module Dicionario
 */
@Injectable()
export class ObterTabelasAtivasUseCase {
  constructor(
    @Inject(REPOSITORIO_TABELA)
    private readonly repositorioTabela: IRepositorioTabela,
    private readonly tabelaMapper: TabelaMapper,
  ) {}

  /**
   * Executa o caso de uso para obter tabelas ativas.
   *
   * @param entrada - Dados de entrada contendo o token do usuário
   * @returns Lista de tabelas ativas com total
   */
  async executar(entrada: ObterTabelasAtivasInput): Promise<ObterTabelasAtivasOutput> {
    // Buscar tabelas ativas via repositório
    const tabelas = await this.repositorioTabela.buscarAtivas(entrada.tokenUsuario);

    // Mapear entidades de domínio para DTOs
    const tabelasDto = this.tabelaMapper.paraListaDto(tabelas);

    return {
      tabelas: tabelasDto,
      total: tabelasDto.length,
    };
  }
}
