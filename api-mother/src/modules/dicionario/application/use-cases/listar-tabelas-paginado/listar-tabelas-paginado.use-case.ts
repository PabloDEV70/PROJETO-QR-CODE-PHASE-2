import { Injectable, Inject } from '@nestjs/common';
import { IRepositorioTabela, REPOSITORIO_TABELA } from '../../../domain/repositories/tabela.repository.interface';
import { TabelaMapper } from '../../mappers/tabela.mapper';
import { ListarTabelasPaginadoInput } from './listar-tabelas-paginado.input';
import { ListarTabelasPaginadoOutput } from './listar-tabelas-paginado.output';

/**
 * Caso de uso para listar tabelas ativas do dicionário de dados com paginação.
 *
 * Retorna uma lista paginada de tabelas ativas, incluindo informações
 * como nome, descrição, módulo e tipo de CRUD.
 *
 * @module Dicionario
 */
@Injectable()
export class ListarTabelasPaginadoUseCase {
  private static readonly PAGE_PADRAO = 1;
  private static readonly LIMIT_PADRAO = 20;
  private static readonly LIMIT_MAXIMO = 100;

  constructor(
    @Inject(REPOSITORIO_TABELA)
    private readonly repositorioTabela: IRepositorioTabela,
    private readonly tabelaMapper: TabelaMapper,
  ) {}

  /**
   * Executa o caso de uso para listar tabelas com paginação.
   *
   * @param entrada - Dados de entrada contendo token e parâmetros de paginação
   * @returns Lista paginada de tabelas ativas
   */
  async executar(entrada: ListarTabelasPaginadoInput): Promise<ListarTabelasPaginadoOutput> {
    // Validar e normalizar parâmetros de paginação
    const page = Math.max(1, entrada.page || ListarTabelasPaginadoUseCase.PAGE_PADRAO);
    const limit = Math.min(
      ListarTabelasPaginadoUseCase.LIMIT_MAXIMO,
      Math.max(1, entrada.limit || ListarTabelasPaginadoUseCase.LIMIT_PADRAO),
    );

    // Buscar tabelas paginadas via repositório
    const resultado = await this.repositorioTabela.buscarAtivasPaginado({ page, limit }, entrada.tokenUsuario);

    // Mapear entidades de domínio para DTOs
    const tabelasDto = this.tabelaMapper.paraListaDto(resultado.dados);

    return {
      tabelas: tabelasDto,
      total: resultado.total,
      page: resultado.page,
      limit: resultado.limit,
      totalPages: resultado.totalPages,
    };
  }
}
