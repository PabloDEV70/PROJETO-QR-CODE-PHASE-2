/**
 * Interface: IAprovacaoRepository
 *
 * Define o contrato para operacoes de persistencia de aprovacoes.
 */

import { AprovacaoPendente, StatusAprovacao, TipoOperacaoAprovacao, PrioridadeAprovacao } from '../entities';

export interface FiltrosAprovacao {
  codUsuario?: number;
  codAprovador?: number;
  tabela?: string;
  operacao?: TipoOperacaoAprovacao;
  status?: StatusAprovacao;
  prioridade?: PrioridadeAprovacao;
  dataInicio?: Date;
  dataFim?: Date;
  limite?: number;
  offset?: number;
}

export interface ResultadoPaginadoAprovacao<T> {
  dados: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface DadosProcessamento {
  aprovacaoId: number;
  codAprovador: number;
  novoStatus: 'A' | 'R';
  motivoRejeicao?: string;
  observacao?: string;
}

export interface IAprovacaoRepository {
  /**
   * Insere uma nova solicitacao de aprovacao
   */
  inserir(aprovacao: AprovacaoPendente): Promise<number>;

  /**
   * Busca aprovacoes por filtros
   */
  buscarPorFiltros(filtros: FiltrosAprovacao): Promise<ResultadoPaginadoAprovacao<AprovacaoPendente>>;

  /**
   * Busca uma aprovacao por ID
   */
  buscarPorId(aprovacaoId: number): Promise<AprovacaoPendente | null>;

  /**
   * Lista aprovacoes pendentes
   */
  listarPendentes(codAprovador?: number): Promise<AprovacaoPendente[]>;

  /**
   * Processa uma aprovacao (aprovar ou rejeitar)
   */
  processar(dados: DadosProcessamento): Promise<boolean>;

  /**
   * Cancela uma aprovacao pendente
   */
  cancelar(aprovacaoId: number, codUsuario: number): Promise<boolean>;

  /**
   * Marca aprovacoes expiradas
   */
  expirar(): Promise<number>;

  /**
   * Busca aprovacoes proximas de expirar
   */
  buscarProximasDeExpirar(horasRestantes: number): Promise<AprovacaoPendente[]>;

  /**
   * Conta aprovacoes pendentes por aprovador
   */
  contarPendentesPorAprovador(codAprovador: number): Promise<number>;

  /**
   * Busca estatisticas de aprovacoes
   */
  buscarEstatisticas(filtros: FiltrosAprovacao): Promise<{
    totalPendentes: number;
    totalAprovadas: number;
    totalRejeitadas: number;
    totalExpiradas: number;
    totalCanceladas: number;
  }>;
}

export const REPOSITORIO_APROVACAO = Symbol('IAprovacaoRepository');
