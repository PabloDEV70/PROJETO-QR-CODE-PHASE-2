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
import { ObterHierarquiaInstanciasInput } from './obter-hierarquia-instancias.input';
import { ObterHierarquiaInstanciasOutput, NodoHierarquia } from './obter-hierarquia-instancias.output';
import { Instancia } from '../../../domain/entities/instancia.entity';
import { Relacionamento } from '../../../domain/entities/relacionamento.entity';

/**
 * D4-T04: Use Case para obter hierarquia de instâncias relacionadas
 *
 * Constrói uma árvore de instâncias a partir de uma instância raiz,
 * seguindo os relacionamentos pai-filho até a profundidade máxima.
 */
@Injectable()
export class ObterHierarquiaInstanciasUseCase {
  private readonly PROFUNDIDADE_PADRAO = 3;
  private readonly PROFUNDIDADE_MAXIMA_PERMITIDA = 5;

  constructor(
    @Inject(REPOSITORIO_INSTANCIA)
    private readonly repositorioInstancia: IRepositorioInstancia,
    @Inject(REPOSITORIO_RELACIONAMENTO)
    private readonly repositorioRelacionamento: IRepositorioRelacionamento,
    private readonly instanciaMapper: InstanciaMapper,
  ) {}

  /**
   * Executa o caso de uso
   *
   * @param entrada - Parâmetros de entrada
   * @returns Hierarquia de instâncias
   * @throws BadRequestException se parâmetros inválidos
   */
  async executar(entrada: ObterHierarquiaInstanciasInput): Promise<ObterHierarquiaInstanciasOutput> {
    // Validar entrada
    if (!entrada.nomeInstancia || entrada.nomeInstancia.trim().length === 0) {
      throw new BadRequestException('Nome da instância é obrigatório');
    }

    if (!entrada.tokenUsuario || entrada.tokenUsuario.trim().length === 0) {
      throw new BadRequestException('Token de usuário é obrigatório');
    }

    const profundidadeMaxima = Math.min(
      entrada.profundidadeMaxima ?? this.PROFUNDIDADE_PADRAO,
      this.PROFUNDIDADE_MAXIMA_PERMITIDA,
    );

    const nomeInstancia = entrada.nomeInstancia.trim();

    // Buscar instância raiz
    const instanciaRaiz = await this.repositorioInstancia.buscarPorNome(nomeInstancia, entrada.tokenUsuario);

    if (!instanciaRaiz) {
      return {
        hierarquia: null,
        totalInstancias: 0,
        profundidade: 0,
      };
    }

    // Conjunto para evitar ciclos
    const visitados = new Set<string>();

    // Construir hierarquia recursivamente
    const hierarquia = await this.construirHierarquia(
      instanciaRaiz,
      null,
      0,
      profundidadeMaxima,
      visitados,
      entrada.tokenUsuario,
    );

    // Calcular estatísticas
    const { total, profundidade } = this.calcularEstatisticas(hierarquia);

    return {
      hierarquia,
      totalInstancias: total,
      profundidade,
    };
  }

  /**
   * Constrói a hierarquia recursivamente
   */
  private async construirHierarquia(
    instancia: Instancia,
    relacionamentoPai: Relacionamento | null,
    nivelAtual: number,
    profundidadeMaxima: number,
    visitados: Set<string>,
    tokenUsuario: string,
  ): Promise<NodoHierarquia> {
    // Marcar como visitado
    visitados.add(instancia.nomeInstancia);

    // Criar nodo
    const nodo: NodoHierarquia = {
      instancia: this.instanciaMapper.paraDto(instancia),
      tipoLigacao: relacionamentoPai?.tipoLigacao.valor,
      tipoLigacaoDescricao: relacionamentoPai?.tipoLigacao.obterDescricao(),
      nivel: nivelAtual,
      filhos: [],
    };

    // Se atingiu profundidade máxima, retorna sem filhos
    if (nivelAtual >= profundidadeMaxima) {
      return nodo;
    }

    // Buscar relacionamentos onde esta instância é pai
    const relacionamentos = await this.repositorioRelacionamento.buscarPorInstanciaPai(
      instancia.nomeInstancia,
      tokenUsuario,
    );

    // Para cada relacionamento, buscar a instância filha
    for (const rel of relacionamentos) {
      // Evitar ciclos
      if (visitados.has(rel.nomeInstanciaFilho)) {
        continue;
      }

      // Buscar instância filha
      const instanciaFilha = await this.repositorioInstancia.buscarPorNome(rel.nomeInstanciaFilho, tokenUsuario);

      if (instanciaFilha) {
        // Construir sub-hierarquia
        const nodoFilho = await this.construirHierarquia(
          instanciaFilha,
          rel,
          nivelAtual + 1,
          profundidadeMaxima,
          visitados,
          tokenUsuario,
        );

        nodo.filhos.push(nodoFilho);
      }
    }

    return nodo;
  }

  /**
   * Calcula estatísticas da hierarquia
   */
  private calcularEstatisticas(nodo: NodoHierarquia | null): { total: number; profundidade: number } {
    if (!nodo) {
      return { total: 0, profundidade: 0 };
    }

    let total = 1;
    let profundidade = nodo.nivel;

    for (const filho of nodo.filhos) {
      const stats = this.calcularEstatisticas(filho);
      total += stats.total;
      profundidade = Math.max(profundidade, stats.profundidade);
    }

    return { total, profundidade };
  }
}
