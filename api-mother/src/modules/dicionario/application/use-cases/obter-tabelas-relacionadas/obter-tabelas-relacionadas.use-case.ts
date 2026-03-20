import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { IRepositorioTabela, REPOSITORIO_TABELA } from '../../../domain/repositories/tabela.repository.interface';
import {
  IRepositorioInstancia,
  REPOSITORIO_INSTANCIA,
} from '../../../domain/repositories/instancia.repository.interface';
import {
  IRepositorioRelacionamento,
  REPOSITORIO_RELACIONAMENTO,
} from '../../../domain/repositories/relacionamento.repository.interface';
import { ObterTabelasRelacionadasInput } from './obter-tabelas-relacionadas.input';
import {
  ObterTabelasRelacionadasOutput,
  NodoTabelaGrafo,
  ArestaRelacionamento,
} from './obter-tabelas-relacionadas.output';

/**
 * D4-T07: Use Case para obter grafo de tabelas relacionadas
 *
 * Constrói um grafo mostrando as tabelas conectadas a partir de uma tabela central,
 * seguindo os relacionamentos através das instâncias.
 */
@Injectable()
export class ObterTabelasRelacionadasUseCase {
  private readonly PROFUNDIDADE_PADRAO = 2;
  private readonly PROFUNDIDADE_MAXIMA_PERMITIDA = 3;

  constructor(
    @Inject(REPOSITORIO_TABELA)
    private readonly repositorioTabela: IRepositorioTabela,
    @Inject(REPOSITORIO_INSTANCIA)
    private readonly repositorioInstancia: IRepositorioInstancia,
    @Inject(REPOSITORIO_RELACIONAMENTO)
    private readonly repositorioRelacionamento: IRepositorioRelacionamento,
  ) {}

  /**
   * Executa o caso de uso
   *
   * @param entrada - Parâmetros de entrada
   * @returns Grafo de tabelas relacionadas
   * @throws BadRequestException se parâmetros inválidos
   */
  async executar(entrada: ObterTabelasRelacionadasInput): Promise<ObterTabelasRelacionadasOutput> {
    // Validar entrada
    if (!entrada.nomeTabela || entrada.nomeTabela.trim().length === 0) {
      throw new BadRequestException('Nome da tabela é obrigatório');
    }

    if (!entrada.tokenUsuario || entrada.tokenUsuario.trim().length === 0) {
      throw new BadRequestException('Token de usuário é obrigatório');
    }

    const nomeTabela = entrada.nomeTabela.toUpperCase().trim();
    const profundidadeMaxima = Math.min(
      entrada.profundidadeMaxima ?? this.PROFUNDIDADE_PADRAO,
      this.PROFUNDIDADE_MAXIMA_PERMITIDA,
    );

    // Verificar se a tabela existe
    const tabelaCentral = await this.repositorioTabela.buscarPorNome(nomeTabela, entrada.tokenUsuario);

    if (!tabelaCentral) {
      throw new BadRequestException(`Tabela '${nomeTabela}' não encontrada`);
    }

    // Mapa de tabelas visitadas
    const tabelasVisitadas = new Map<string, NodoTabelaGrafo>();
    const arestas: ArestaRelacionamento[] = [];

    // Cache de tabela por instância
    const cacheTabelaInstancia = new Map<string, string>();

    // Adicionar tabela central
    tabelasVisitadas.set(nomeTabela, {
      nomeTabela,
      descricao: tabelaCentral.descricao,
      nivel: 0,
    });

    // Fila para BFS
    const fila: { tabela: string; nivel: number }[] = [{ tabela: nomeTabela, nivel: 0 }];

    // BFS para construir grafo
    while (fila.length > 0) {
      const atual = fila.shift()!;

      if (atual.nivel >= profundidadeMaxima) {
        continue;
      }

      // Buscar instâncias da tabela
      const instancias = await this.repositorioInstancia.buscarPorTabela(atual.tabela, entrada.tokenUsuario);

      for (const instancia of instancias) {
        // Cachear mapeamento instância -> tabela
        cacheTabelaInstancia.set(instancia.nomeInstancia, atual.tabela);

        // Buscar relacionamentos onde é pai
        const relsPai = await this.repositorioRelacionamento.buscarPorInstanciaPai(
          instancia.nomeInstancia,
          entrada.tokenUsuario,
        );

        for (const rel of relsPai) {
          await this.processarRelacionamento(
            rel.nomeInstanciaPai,
            rel.nomeInstanciaFilho,
            rel.tipoLigacao.valor,
            rel.tipoLigacao.obterDescricao(),
            rel.ehMasterDetail(),
            atual.nivel,
            tabelasVisitadas,
            arestas,
            fila,
            cacheTabelaInstancia,
            entrada.tokenUsuario,
          );
        }

        // Buscar relacionamentos onde é filho
        const relsFilho = await this.repositorioRelacionamento.buscarPorInstanciaFilho(
          instancia.nomeInstancia,
          entrada.tokenUsuario,
        );

        for (const rel of relsFilho) {
          await this.processarRelacionamento(
            rel.nomeInstanciaPai,
            rel.nomeInstanciaFilho,
            rel.tipoLigacao.valor,
            rel.tipoLigacao.obterDescricao(),
            rel.ehMasterDetail(),
            atual.nivel,
            tabelasVisitadas,
            arestas,
            fila,
            cacheTabelaInstancia,
            entrada.tokenUsuario,
          );
        }
      }
    }

    // Calcular profundidade máxima alcançada
    const profundidadeAlcancada = Math.max(...Array.from(tabelasVisitadas.values()).map((n) => n.nivel));

    return {
      tabelaCentral: nomeTabela,
      nodos: Array.from(tabelasVisitadas.values()),
      arestas,
      totalTabelas: tabelasVisitadas.size,
      totalRelacionamentos: arestas.length,
      profundidade: profundidadeAlcancada,
    };
  }

  /**
   * Processa um relacionamento e adiciona ao grafo
   */
  private async processarRelacionamento(
    nomeInstanciaPai: string,
    nomeInstanciaFilho: string,
    tipoLigacao: string,
    tipoLigacaoDescricao: string,
    ehMasterDetail: boolean,
    nivelAtual: number,
    tabelasVisitadas: Map<string, NodoTabelaGrafo>,
    arestas: ArestaRelacionamento[],
    fila: { tabela: string; nivel: number }[],
    cacheTabelaInstancia: Map<string, string>,
    tokenUsuario: string,
  ): Promise<void> {
    // Obter tabela da instância pai (do cache ou buscar)
    let tabelaPai = cacheTabelaInstancia.get(nomeInstanciaPai);
    if (!tabelaPai) {
      const instPai = await this.repositorioInstancia.buscarPorNome(nomeInstanciaPai, tokenUsuario);
      if (instPai) {
        tabelaPai = instPai.nomeTabela;
        cacheTabelaInstancia.set(nomeInstanciaPai, tabelaPai);
      }
    }

    // Obter tabela da instância filha
    let tabelaFilho = cacheTabelaInstancia.get(nomeInstanciaFilho);
    if (!tabelaFilho) {
      const instFilho = await this.repositorioInstancia.buscarPorNome(nomeInstanciaFilho, tokenUsuario);
      if (instFilho) {
        tabelaFilho = instFilho.nomeTabela;
        cacheTabelaInstancia.set(nomeInstanciaFilho, tabelaFilho);
      }
    }

    if (!tabelaPai || !tabelaFilho) {
      return;
    }

    // Verificar se já existe essa aresta
    const arestaExiste = arestas.some(
      (a) =>
        a.tabelaOrigem === tabelaPai &&
        a.tabelaDestino === tabelaFilho &&
        a.nomeInstanciaPai === nomeInstanciaPai &&
        a.nomeInstanciaFilho === nomeInstanciaFilho,
    );

    if (!arestaExiste) {
      arestas.push({
        tabelaOrigem: tabelaPai,
        tabelaDestino: tabelaFilho,
        nomeInstanciaPai,
        nomeInstanciaFilho,
        tipoLigacao,
        tipoLigacaoDescricao,
        ehMasterDetail,
      });
    }

    // Adicionar tabelas não visitadas
    for (const tabela of [tabelaPai, tabelaFilho]) {
      if (!tabelasVisitadas.has(tabela)) {
        // Buscar descrição da tabela
        const tabelaEntity = await this.repositorioTabela.buscarPorNome(tabela, tokenUsuario);
        tabelasVisitadas.set(tabela, {
          nomeTabela: tabela,
          descricao: tabelaEntity?.descricao || '',
          nivel: nivelAtual + 1,
        });

        // Adicionar à fila para continuar explorando
        fila.push({ tabela, nivel: nivelAtual + 1 });
      }
    }
  }
}
