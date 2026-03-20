/**
 * D4-T07: Nodo do grafo de tabelas
 */
export interface NodoTabelaGrafo {
  /**
   * Nome da tabela
   */
  nomeTabela: string;

  /**
   * Descrição da tabela
   */
  descricao: string;

  /**
   * Nível de distância da tabela central (0 = central)
   */
  nivel: number;
}

/**
 * D4-T07: Aresta do grafo (relacionamento entre tabelas)
 */
export interface ArestaRelacionamento {
  /**
   * Tabela de origem
   */
  tabelaOrigem: string;

  /**
   * Tabela de destino
   */
  tabelaDestino: string;

  /**
   * Nome da instância pai (origem)
   */
  nomeInstanciaPai: string;

  /**
   * Nome da instância filha (destino)
   */
  nomeInstanciaFilho: string;

  /**
   * Tipo de ligação
   */
  tipoLigacao: string;

  /**
   * Descrição do tipo de ligação
   */
  tipoLigacaoDescricao: string;

  /**
   * Se é um relacionamento master-detail
   */
  ehMasterDetail: boolean;
}

/**
 * D4-T07: Output para ObterTabelasRelacionadasUseCase
 */
export interface ObterTabelasRelacionadasOutput {
  /**
   * Tabela central do grafo
   */
  tabelaCentral: string;

  /**
   * Nodos do grafo (tabelas)
   */
  nodos: NodoTabelaGrafo[];

  /**
   * Arestas do grafo (relacionamentos)
   */
  arestas: ArestaRelacionamento[];

  /**
   * Total de tabelas no grafo
   */
  totalTabelas: number;

  /**
   * Total de relacionamentos
   */
  totalRelacionamentos: number;

  /**
   * Profundidade máxima alcançada
   */
  profundidade: number;
}
