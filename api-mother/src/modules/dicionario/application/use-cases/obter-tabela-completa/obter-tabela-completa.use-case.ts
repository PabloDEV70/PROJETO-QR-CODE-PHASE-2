import { Injectable, Inject } from '@nestjs/common';
import { IRepositorioTabela, REPOSITORIO_TABELA } from '../../../domain/repositories/tabela.repository.interface';
import { IRepositorioCampo, REPOSITORIO_CAMPO } from '../../../domain/repositories/campo.repository.interface';
import {
  IRepositorioInstancia,
  REPOSITORIO_INSTANCIA,
} from '../../../domain/repositories/instancia.repository.interface';
import { TabelaMapper } from '../../mappers/tabela.mapper';
import { ObterTabelaCompletaInput } from './obter-tabela-completa.input';
import { ObterTabelaCompletaOutput, TabelaCompletaDto } from './obter-tabela-completa.output';

/**
 * Caso de uso para obter informações completas de uma tabela.
 *
 * Retorna os dados da tabela incluindo contagem de campos e instâncias.
 *
 * @module Dicionario
 */
@Injectable()
export class ObterTabelaCompletaUseCase {
  constructor(
    @Inject(REPOSITORIO_TABELA)
    private readonly repositorioTabela: IRepositorioTabela,
    @Inject(REPOSITORIO_CAMPO)
    private readonly repositorioCampo: IRepositorioCampo,
    @Inject(REPOSITORIO_INSTANCIA)
    private readonly repositorioInstancia: IRepositorioInstancia,
    private readonly tabelaMapper: TabelaMapper,
  ) {}

  /**
   * Executa o caso de uso para obter tabela completa.
   *
   * @param entrada - Dados de entrada contendo nome da tabela e token
   * @returns Tabela com informações completas ou null se não encontrada
   */
  async executar(entrada: ObterTabelaCompletaInput): Promise<ObterTabelaCompletaOutput> {
    const nomeTabela = entrada.nomeTabela.toUpperCase();

    // Buscar tabela
    const tabela = await this.repositorioTabela.buscarPorNome(nomeTabela, entrada.tokenUsuario);

    if (!tabela) {
      return { tabela: null };
    }

    // Buscar contagens em paralelo
    const [quantidadeCampos, instancias] = await Promise.all([
      this.repositorioCampo.contarCamposPorTabela(nomeTabela, entrada.tokenUsuario),
      this.repositorioInstancia.buscarPorTabela(nomeTabela, entrada.tokenUsuario),
    ]);

    // Mapear para DTO completo
    const tabelaDto = this.tabelaMapper.paraDto(tabela);
    const tabelaCompleta: TabelaCompletaDto = {
      ...tabelaDto,
      quantidadeCampos,
      quantidadeInstancias: instancias.length,
    };

    return { tabela: tabelaCompleta };
  }
}
