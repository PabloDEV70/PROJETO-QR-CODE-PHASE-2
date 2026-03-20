import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
  IRepositorioInstancia,
  REPOSITORIO_INSTANCIA,
} from '../../../domain/repositories/instancia.repository.interface';
import {
  IRepositorioRelacionamento,
  REPOSITORIO_RELACIONAMENTO,
} from '../../../domain/repositories/relacionamento.repository.interface';
import { InstanciaMapper } from '../../mappers/instancia.mapper';
import { RelacionamentoMapper } from '../../mappers/relacionamento.mapper';
import { ObterInstanciaCompletaInput } from './obter-instancia-completa.input';
import { ObterInstanciaCompletaOutput, InstanciaCompletaDto } from './obter-instancia-completa.output';

/**
 * D4-T03: Use Case para obter uma instância com seus relacionamentos
 *
 * Busca uma instância pelo nome e inclui todos os relacionamentos
 * onde ela é pai (origem) ou filha (destino).
 */
@Injectable()
export class ObterInstanciaCompletaUseCase {
  constructor(
    @Inject(REPOSITORIO_INSTANCIA)
    private readonly repositorioInstancia: IRepositorioInstancia,
    @Inject(REPOSITORIO_RELACIONAMENTO)
    private readonly repositorioRelacionamento: IRepositorioRelacionamento,
    private readonly instanciaMapper: InstanciaMapper,
    private readonly relacionamentoMapper: RelacionamentoMapper,
  ) {}

  /**
   * Executa o caso de uso
   *
   * @param entrada - Parâmetros de entrada contendo nome da instância e token
   * @returns Instância completa com relacionamentos ou null
   * @throws BadRequestException se parâmetros inválidos
   */
  async executar(entrada: ObterInstanciaCompletaInput): Promise<ObterInstanciaCompletaOutput> {
    // Validar entrada
    if (!entrada.nomeInstancia || entrada.nomeInstancia.trim().length === 0) {
      throw new BadRequestException('Nome da instância é obrigatório');
    }

    if (!entrada.tokenUsuario || entrada.tokenUsuario.trim().length === 0) {
      throw new BadRequestException('Token de usuário é obrigatório');
    }

    const nomeInstancia = entrada.nomeInstancia.trim();

    // Buscar instância
    const instancia = await this.repositorioInstancia.buscarPorNome(nomeInstancia, entrada.tokenUsuario);

    if (!instancia) {
      return { instancia: null };
    }

    // Buscar relacionamentos onde esta instância é pai
    const relacionamentosPai = await this.repositorioRelacionamento.buscarPorInstanciaPai(
      nomeInstancia,
      entrada.tokenUsuario,
    );

    // Buscar relacionamentos onde esta instância é filha
    const relacionamentosFilho = await this.repositorioRelacionamento.buscarPorInstanciaFilho(
      nomeInstancia,
      entrada.tokenUsuario,
    );

    // Mapear para DTOs
    const instanciaDto = this.instanciaMapper.paraDto(instancia);
    const relacionamentosPaiDto = this.relacionamentoMapper.paraListaDto(relacionamentosPai);
    const relacionamentosFilhoDto = this.relacionamentoMapper.paraListaDto(relacionamentosFilho);

    // Construir resposta completa
    const instanciaCompleta: InstanciaCompletaDto = {
      ...instanciaDto,
      relacionamentosPai: relacionamentosPaiDto,
      relacionamentosFilho: relacionamentosFilhoDto,
      totalRelacionamentos: relacionamentosPai.length + relacionamentosFilho.length,
    };

    return { instancia: instanciaCompleta };
  }
}
