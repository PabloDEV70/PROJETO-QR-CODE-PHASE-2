import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
  IRepositorioInstancia,
  REPOSITORIO_INSTANCIA,
} from '../../../domain/repositories/instancia.repository.interface';
import {
  IRepositorioRelacionamento,
  REPOSITORIO_RELACIONAMENTO,
} from '../../../domain/repositories/relacionamento.repository.interface';
import { RelacionamentoMapper } from '../../mappers/relacionamento.mapper';
import { Relacionamento } from '../../../domain/entities/relacionamento.entity';
import { ObterRelacionamentosTabelaInput } from './obter-relacionamentos-tabela.input';
import { ObterRelacionamentosTabelaOutput } from './obter-relacionamentos-tabela.output';

/**
 * Use Case: ObterRelacionamentosTabelaUseCase
 *
 * Obtém todos os relacionamentos (pai e filho) associados a uma tabela específica.
 * Busca primeiro as instâncias da tabela e depois os relacionamentos de cada instância.
 */
@Injectable()
export class ObterRelacionamentosTabelaUseCase {
  constructor(
    @Inject(REPOSITORIO_INSTANCIA)
    private readonly repositorioInstancia: IRepositorioInstancia,
    @Inject(REPOSITORIO_RELACIONAMENTO)
    private readonly repositorioRelacionamento: IRepositorioRelacionamento,
    private readonly mapper: RelacionamentoMapper,
  ) {}

  /**
   * Executa o caso de uso
   *
   * @param entrada - Parâmetros de entrada contendo nome da tabela e token
   * @returns Lista de relacionamentos da tabela com total
   * @throws BadRequestException se o nome da tabela for inválido
   */
  async executar(entrada: ObterRelacionamentosTabelaInput): Promise<ObterRelacionamentosTabelaOutput> {
    // Validar entrada
    if (!entrada.nomeTabela || entrada.nomeTabela.trim().length === 0) {
      throw new BadRequestException('Nome da tabela é obrigatório');
    }

    if (!entrada.tokenUsuario || entrada.tokenUsuario.trim().length === 0) {
      throw new BadRequestException('Token de usuário é obrigatório');
    }

    // Normalizar nome da tabela para maiúsculas
    const nomeTabela = entrada.nomeTabela.toUpperCase().trim();

    // Buscar instâncias da tabela
    const instancias = await this.repositorioInstancia.buscarPorTabela(nomeTabela, entrada.tokenUsuario);

    // Se não há instâncias, retorna vazio
    if (instancias.length === 0) {
      return {
        relacionamentos: [],
        total: 0,
      };
    }

    // Coletar todos os relacionamentos (pai e filho) de cada instância
    const relacionamentosMap = new Map<string, Relacionamento>();

    for (const instancia of instancias) {
      // Buscar relacionamentos onde esta instância é pai
      const relacionamentosPai = await this.repositorioRelacionamento.buscarPorInstanciaPai(
        instancia.nomeInstancia,
        entrada.tokenUsuario,
      );

      // Buscar relacionamentos onde esta instância é filha
      const relacionamentosFilho = await this.repositorioRelacionamento.buscarPorInstanciaFilho(
        instancia.nomeInstancia,
        entrada.tokenUsuario,
      );

      // Adicionar ao mapa (evita duplicatas)
      for (const rel of [...relacionamentosPai, ...relacionamentosFilho]) {
        const chave = `${rel.nomeInstanciaPai}|${rel.nomeInstanciaFilho}`;
        if (!relacionamentosMap.has(chave)) {
          relacionamentosMap.set(chave, rel);
        }
      }
    }

    // Converter para array e ordenar
    const relacionamentos = Array.from(relacionamentosMap.values()).sort((a, b) => a.ordem - b.ordem);

    // Mapear para DTOs
    const relacionamentosDto = this.mapper.paraListaDto(relacionamentos);

    return {
      relacionamentos: relacionamentosDto,
      total: relacionamentosDto.length,
    };
  }
}
