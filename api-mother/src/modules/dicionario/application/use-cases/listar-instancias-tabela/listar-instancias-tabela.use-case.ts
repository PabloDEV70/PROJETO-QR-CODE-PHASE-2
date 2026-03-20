import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
  IRepositorioInstancia,
  REPOSITORIO_INSTANCIA,
} from '../../../domain/repositories/instancia.repository.interface';
import { InstanciaMapper } from '../../mappers/instancia.mapper';
import { ListarInstanciasTabelaInput } from './listar-instancias-tabela.input';
import { ListarInstanciasTabelaOutput } from './listar-instancias-tabela.output';

/**
 * D4-T01: Use Case para listar instâncias de uma tabela
 *
 * Busca todas as instâncias associadas a uma tabela específica
 * no dicionário de dados Sankhya (TDDINS).
 */
@Injectable()
export class ListarInstanciasTabelaUseCase {
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
   * @throws BadRequestException se parâmetros inválidos
   */
  async executar(entrada: ListarInstanciasTabelaInput): Promise<ListarInstanciasTabelaOutput> {
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
