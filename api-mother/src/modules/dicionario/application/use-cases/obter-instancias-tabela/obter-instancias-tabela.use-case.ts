import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
  IRepositorioInstancia,
  REPOSITORIO_INSTANCIA,
} from '../../../domain/repositories/instancia.repository.interface';
import { InstanciaMapper } from '../../mappers/instancia.mapper';
import { ObterInstanciasTabelaInput } from './obter-instancias-tabela.input';
import { ObterInstanciasTabelaOutput } from './obter-instancias-tabela.output';

/**
 * Use Case: ObterInstanciasTabelaUseCase
 *
 * Obtém todas as instâncias associadas a uma tabela específica.
 * Instâncias representam diferentes "visões" ou "formas" de uma tabela
 * no dicionário de dados Sankhya.
 */
@Injectable()
export class ObterInstanciasTabelaUseCase {
  constructor(
    @Inject(REPOSITORIO_INSTANCIA)
    private readonly repositorioInstancia: IRepositorioInstancia,
    private readonly mapper: InstanciaMapper,
  ) {}

  /**
   * Executa o caso de uso
   *
   * @param entrada - Parâmetros de entrada contendo nome da tabela e token
   * @returns Lista de instâncias da tabela com total
   * @throws BadRequestException se o nome da tabela for inválido
   */
  async executar(entrada: ObterInstanciasTabelaInput): Promise<ObterInstanciasTabelaOutput> {
    // Validar entrada
    if (!entrada.nomeTabela || entrada.nomeTabela.trim().length === 0) {
      throw new BadRequestException('Nome da tabela é obrigatório');
    }

    if (!entrada.tokenUsuario || entrada.tokenUsuario.trim().length === 0) {
      throw new BadRequestException('Token de usuário é obrigatório');
    }

    // Normalizar nome da tabela para maiúsculas
    const nomeTabela = entrada.nomeTabela.toUpperCase().trim();

    // Buscar instâncias via repositório
    const instancias = await this.repositorioInstancia.buscarPorTabela(nomeTabela, entrada.tokenUsuario);

    // Mapear para DTOs
    const instanciasDto = this.mapper.paraListaDto(instancias);

    return {
      instancias: instanciasDto,
      total: instanciasDto.length,
    };
  }
}
