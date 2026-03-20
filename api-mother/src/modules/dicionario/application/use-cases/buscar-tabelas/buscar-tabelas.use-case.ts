import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IRepositorioTabela, REPOSITORIO_TABELA } from '../../../domain/repositories/tabela.repository.interface';
import { TabelaMapper } from '../../mappers/tabela.mapper';
import { BuscarTabelasInput } from './buscar-tabelas.input';
import { BuscarTabelasOutput } from './buscar-tabelas.output';

/**
 * Caso de uso para buscar tabelas por termo no nome ou descrição.
 *
 * Realiza busca em tabelas ativas do dicionário de dados,
 * procurando o termo tanto no nome quanto na descrição.
 *
 * @module Dicionario
 */
@Injectable()
export class BuscarTabelasUseCase {
  private static readonly TAMANHO_MINIMO_TERMO = 2;

  constructor(
    @Inject(REPOSITORIO_TABELA)
    private readonly repositorioTabela: IRepositorioTabela,
    private readonly tabelaMapper: TabelaMapper,
  ) {}

  /**
   * Executa o caso de uso para buscar tabelas.
   *
   * @param entrada - Dados de entrada contendo termo e token do usuário
   * @returns Lista de tabelas encontradas
   * @throws BadRequestException se o termo for muito curto
   */
  async executar(entrada: BuscarTabelasInput): Promise<BuscarTabelasOutput> {
    const termoLimpo = entrada.termo?.trim() || '';

    // Validar tamanho mínimo do termo
    if (termoLimpo.length < BuscarTabelasUseCase.TAMANHO_MINIMO_TERMO) {
      throw new BadRequestException(
        `O termo de busca deve ter pelo menos ${BuscarTabelasUseCase.TAMANHO_MINIMO_TERMO} caracteres`,
      );
    }

    // Buscar tabelas via repositório
    const tabelas = await this.repositorioTabela.buscarPorTermo(termoLimpo, entrada.tokenUsuario);

    // Mapear entidades de domínio para DTOs
    const tabelasDto = this.tabelaMapper.paraListaDto(tabelas);

    return {
      tabelas: tabelasDto,
      total: tabelasDto.length,
      termo: termoLimpo,
    };
  }
}
