/**
 * Entity: ResultadoMutacao
 *
 * Representa o resultado de uma operação de mutação.
 */

import { TipoOperacao } from './operacao-mutacao.entity';

export interface DadosResultadoMutacao {
  tipo: TipoOperacao;
  nomeTabela: string;
  sucesso: boolean;
  registrosAfetados: number;
  mensagem?: string;
  dadosInseridos?: Record<string, unknown>;
  dadosAntigos?: Record<string, unknown>[];
  dadosNovos?: Record<string, unknown>[];
  tempoExecucao?: number;
  dryRun?: boolean;
}

export class ResultadoMutacao {
  private constructor(
    public readonly tipo: TipoOperacao,
    public readonly nomeTabela: string,
    public readonly sucesso: boolean,
    public readonly registrosAfetados: number,
    public readonly mensagem: string,
    public readonly dadosInseridos: Record<string, unknown> | null,
    public readonly dadosAntigos: Record<string, unknown>[] | null,
    public readonly dadosNovos: Record<string, unknown>[] | null,
    public readonly tempoExecucao: number | null,
    public readonly dryRun: boolean,
  ) {}

  static criar(dados: DadosResultadoMutacao): ResultadoMutacao {
    return new ResultadoMutacao(
      dados.tipo,
      dados.nomeTabela,
      dados.sucesso,
      dados.registrosAfetados,
      dados.mensagem || (dados.sucesso ? 'Operação realizada com sucesso' : 'Operação falhou'),
      dados.dadosInseridos || null,
      dados.dadosAntigos || null,
      dados.dadosNovos || null,
      dados.tempoExecucao || null,
      dados.dryRun || false,
    );
  }

  static sucesso(dados: Omit<DadosResultadoMutacao, 'sucesso'>): ResultadoMutacao {
    return ResultadoMutacao.criar({ ...dados, sucesso: true });
  }

  static falha(dados: Omit<DadosResultadoMutacao, 'sucesso' | 'registrosAfetados'>): ResultadoMutacao {
    return ResultadoMutacao.criar({ ...dados, sucesso: false, registrosAfetados: 0 });
  }

  /**
   * Verifica se a operação foi bem sucedida
   */
  foiSucesso(): boolean {
    return this.sucesso;
  }

  /**
   * Verifica se foi apenas simulação
   */
  foiSimulacao(): boolean {
    return this.dryRun;
  }

  /**
   * Verifica se afetou registros
   */
  afetouRegistros(): boolean {
    return this.registrosAfetados > 0;
  }

  /**
   * Retorna resumo da operação
   */
  obterResumo(): string {
    const modo = this.dryRun ? '[SIMULAÇÃO] ' : '';
    const status = this.sucesso ? '✓' : '✗';
    return `${modo}${status} ${this.tipo} ${this.nomeTabela}: ${this.registrosAfetados} registro(s)`;
  }
}
