import { Inject, Injectable, Logger } from '@nestjs/common';
import { OperacaoMutacao, ResultadoMutacao } from '../../../domain/entities';
import { IProvedorMutacao, IProvedorValidacao, PROVEDOR_MUTACAO, PROVEDOR_VALIDACAO } from '../../ports';

export interface EntradaExcluirRegistro {
  nomeTabela: string;
  condicao: Record<string, unknown>;
  limiteRegistros?: number;
  hardDelete?: boolean;
  dryRun?: boolean;
  usuario?: string;
}

@Injectable()
export class ExcluirRegistroUseCase {
  private readonly logger = new Logger(ExcluirRegistroUseCase.name);

  private readonly LIMITE_MAXIMO = 10;

  constructor(
    @Inject(PROVEDOR_MUTACAO) private readonly provedorMutacao: IProvedorMutacao,
    @Inject(PROVEDOR_VALIDACAO) private readonly provedorValidacao: IProvedorValidacao,
  ) {}

  async executar(entrada: EntradaExcluirRegistro): Promise<ResultadoMutacao> {
    const { nomeTabela, condicao, limiteRegistros = 1, hardDelete = false, dryRun = false } = entrada;

    // Validar limite (mais conservador para DELETE)
    const limite = Math.min(limiteRegistros, this.LIMITE_MAXIMO);

    this.logger.log(`Iniciando DELETE em ${nomeTabela}`, {
      dryRun,
      hardDelete,
      condicao: Object.keys(condicao),
      limite,
    });

    // 1. Verificar se tabela existe
    const tabelaExiste = await this.provedorValidacao.tabelaExiste(nomeTabela);
    if (!tabelaExiste) {
      return ResultadoMutacao.falha({
        tipo: 'DELETE',
        nomeTabela,
        mensagem: `Tabela ${nomeTabela} não encontrada`,
      });
    }

    // 2. Verificar se condição foi fornecida (OBRIGATÓRIA para DELETE)
    if (!condicao || Object.keys(condicao).length === 0) {
      return ResultadoMutacao.falha({
        tipo: 'DELETE',
        nomeTabela,
        mensagem: 'Condição WHERE é OBRIGATÓRIA para DELETE',
      });
    }

    // 3. Criar operação de mutação
    const operacao = OperacaoMutacao.criar({
      tipo: 'DELETE',
      nomeTabela,
      condicao,
      limiteRegistros: limite,
      dryRun,
      softDelete: !hardDelete,
      usuario: entrada.usuario,
    });

    // 4. Buscar registros que serão afetados (para audit trail e confirmação)
    const registrosAfetados = await this.provedorMutacao.buscarRegistrosAfetados(operacao);

    if (registrosAfetados.length === 0) {
      return ResultadoMutacao.falha({
        tipo: 'DELETE',
        nomeTabela,
        mensagem: 'Nenhum registro encontrado com a condição especificada',
      });
    }

    if (registrosAfetados.length > limite) {
      return ResultadoMutacao.falha({
        tipo: 'DELETE',
        nomeTabela,
        mensagem: `DELETE afetaria ${registrosAfetados.length} registros, mas limite é ${limite}. Aumente o limite ou refine a condição.`,
      });
    }

    // 5. Executar exclusão (soft ou hard)
    const resultado = await this.provedorMutacao.excluir(operacao);

    // Adicionar dados excluídos ao resultado para audit
    if (resultado.foiSucesso()) {
      return ResultadoMutacao.criar({
        ...resultado,
        tipo: 'DELETE',
        nomeTabela,
        sucesso: true,
        registrosAfetados: resultado.registrosAfetados,
        dadosAntigos: registrosAfetados,
        mensagem: hardDelete ? 'Registros removidos permanentemente' : 'Registros marcados como inativos (soft delete)',
        dryRun,
      });
    }

    this.logger.log(`DELETE ${resultado.foiSucesso() ? 'concluído' : 'falhou'}: ${resultado.obterResumo()}`);

    return resultado;
  }
}
