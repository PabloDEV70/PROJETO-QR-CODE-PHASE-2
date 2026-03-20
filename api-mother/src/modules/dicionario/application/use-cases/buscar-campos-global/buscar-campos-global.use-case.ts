import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IRepositorioCampo, REPOSITORIO_CAMPO } from '../../../domain/repositories/campo.repository.interface';
import { CampoMapper } from '../../mappers/campo.mapper';
import { BuscarCamposGlobalInput } from './buscar-campos-global.input';
import { BuscarCamposGlobalOutput } from './buscar-campos-global.output';

/**
 * Caso de uso para buscar campos em todas as tabelas ativas.
 *
 * Realiza busca global de campos do dicionário de dados,
 * procurando o termo tanto no nome quanto na descrição do campo.
 *
 * @module Dicionario
 */
@Injectable()
export class BuscarCamposGlobalUseCase {
  private static readonly TAMANHO_MINIMO_TERMO = 2;

  constructor(
    @Inject(REPOSITORIO_CAMPO)
    private readonly repositorioCampo: IRepositorioCampo,
    private readonly campoMapper: CampoMapper,
  ) {}

  /**
   * Executa o caso de uso para buscar campos globalmente.
   *
   * @param entrada - Dados de entrada contendo termo e token do usuário
   * @returns Lista de campos encontrados em todas as tabelas ativas
   * @throws BadRequestException se o termo for muito curto
   */
  async executar(entrada: BuscarCamposGlobalInput): Promise<BuscarCamposGlobalOutput> {
    const termoLimpo = entrada.termo?.trim() || '';

    // Validar tamanho mínimo do termo
    if (termoLimpo.length < BuscarCamposGlobalUseCase.TAMANHO_MINIMO_TERMO) {
      throw new BadRequestException(
        `O termo de busca deve ter pelo menos ${BuscarCamposGlobalUseCase.TAMANHO_MINIMO_TERMO} caracteres`,
      );
    }

    // Buscar campos via repositório
    const campos = await this.repositorioCampo.buscarGlobal(termoLimpo, entrada.tokenUsuario);

    // Mapear entidades de domínio para DTOs
    const camposDto = this.campoMapper.paraListaDto(campos);

    return {
      campos: camposDto,
      total: camposDto.length,
      termo: termoLimpo,
    };
  }
}
