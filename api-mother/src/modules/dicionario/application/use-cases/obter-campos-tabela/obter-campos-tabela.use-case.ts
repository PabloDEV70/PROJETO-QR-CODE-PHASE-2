import { Injectable, Inject } from '@nestjs/common';
import { IRepositorioCampo, REPOSITORIO_CAMPO } from '../../../domain/repositories/campo.repository.interface';
import { CampoMapper } from '../../mappers/campo.mapper';
import { ObterCamposTabelaInput } from './obter-campos-tabela.input';
import { ObterCamposTabelaOutput } from './obter-campos-tabela.output';

/**
 * Caso de uso para obter todos os campos de uma tabela do dicionário de dados.
 *
 * Retorna a lista completa de campos da tabela especificada, incluindo
 * informações como tipo, tamanho, obrigatoriedade e se é chave.
 *
 * @module Dicionario
 */
@Injectable()
export class ObterCamposTabelaUseCase {
  constructor(
    @Inject(REPOSITORIO_CAMPO)
    private readonly repositorioCampo: IRepositorioCampo,
    private readonly campoMapper: CampoMapper,
  ) {}

  /**
   * Executa o caso de uso para obter campos de uma tabela.
   *
   * @param entrada - Dados de entrada contendo o nome da tabela e token do usuário
   * @returns Lista de campos da tabela com total
   */
  async executar(entrada: ObterCamposTabelaInput): Promise<ObterCamposTabelaOutput> {
    // Buscar campos da tabela via repositório
    const campos = await this.repositorioCampo.buscarPorTabela(entrada.nomeTabela, entrada.tokenUsuario);

    // Mapear entidades de domínio para DTOs
    const camposDto = this.campoMapper.paraListaDto(campos);

    return {
      campos: camposDto,
      total: camposDto.length,
    };
  }
}
