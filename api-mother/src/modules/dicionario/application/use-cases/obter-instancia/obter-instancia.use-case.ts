import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
  IRepositorioInstancia,
  REPOSITORIO_INSTANCIA,
} from '../../../domain/repositories/instancia.repository.interface';
import { InstanciaMapper } from '../../mappers/instancia.mapper';
import { ObterInstanciaInput } from './obter-instancia.input';
import { ObterInstanciaOutput } from './obter-instancia.output';

/**
 * D4-T02: Use Case para obter uma instância específica
 *
 * Busca uma instância pelo seu nome no dicionário de dados Sankhya (TDDINS).
 */
@Injectable()
export class ObterInstanciaUseCase {
  constructor(
    @Inject(REPOSITORIO_INSTANCIA)
    private readonly repositorioInstancia: IRepositorioInstancia,
    private readonly mapper: InstanciaMapper,
  ) {}

  /**
   * Executa o caso de uso
   *
   * @param entrada - Parâmetros de entrada contendo nome da instância e token
   * @returns Instância encontrada ou null
   * @throws BadRequestException se parâmetros inválidos
   */
  async executar(entrada: ObterInstanciaInput): Promise<ObterInstanciaOutput> {
    // Validar entrada
    if (!entrada.nomeInstancia || entrada.nomeInstancia.trim().length === 0) {
      throw new BadRequestException('Nome da instância é obrigatório');
    }

    if (!entrada.tokenUsuario || entrada.tokenUsuario.trim().length === 0) {
      throw new BadRequestException('Token de usuário é obrigatório');
    }

    // Buscar instância via repositório
    const instancia = await this.repositorioInstancia.buscarPorNome(entrada.nomeInstancia.trim(), entrada.tokenUsuario);

    // Mapear para DTO se encontrada
    const instanciaDto = instancia ? this.mapper.paraDto(instancia) : null;

    return {
      instancia: instanciaDto,
    };
  }
}
