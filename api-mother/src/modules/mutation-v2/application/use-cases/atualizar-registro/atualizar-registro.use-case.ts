import { Inject, Injectable, Logger } from '@nestjs/common';
import { OperacaoMutacao, ResultadoMutacao } from '../../../domain/entities';
import { IProvedorMutacao, IProvedorValidacao, PROVEDOR_MUTACAO, PROVEDOR_VALIDACAO } from '../../ports';

export interface EntradaAtualizarRegistro {
  nomeTabela: string;
  condicao: Record<string, unknown>;
  dadosNovos: Record<string, unknown>;
  limiteRegistros?: number;
  dryRun?: boolean;
  usuario?: string;
}

@Injectable()
export class AtualizarRegistroUseCase {
  private readonly logger = new Logger(AtualizarRegistroUseCase.name);

  private readonly LIMITE_MAXIMO = 50;

  constructor(
    @Inject(PROVEDOR_MUTACAO) private readonly provedorMutacao: IProvedorMutacao,
    @Inject(PROVEDOR_VALIDACAO) private readonly provedorValidacao: IProvedorValidacao,
  ) {}

  async executar(entrada: EntradaAtualizarRegistro): Promise<ResultadoMutacao> {
    const { nomeTabela, condicao, dadosNovos, limiteRegistros = 10, dryRun = false } = entrada;

    // Validar limite
    const limite = Math.min(limiteRegistros, this.LIMITE_MAXIMO);

    this.logger.log(`Iniciando UPDATE em ${nomeTabela}`, {
      dryRun,
      campos: Object.keys(dadosNovos),
      condicao: Object.keys(condicao),
      limite,
    });

    // 1. Verificar se tabela existe
    const tabelaExiste = await this.provedorValidacao.tabelaExiste(nomeTabela);
    if (!tabelaExiste) {
      return ResultadoMutacao.falha({
        tipo: 'UPDATE',
        nomeTabela,
        mensagem: `Tabela ${nomeTabela} não encontrada`,
      });
    }

    // 2. Verificar se condição foi fornecida (obrigatória para segurança)
    if (!condicao || Object.keys(condicao).length === 0) {
      return ResultadoMutacao.falha({
        tipo: 'UPDATE',
        nomeTabela,
        mensagem: 'Condição WHERE é obrigatória para UPDATE',
      });
    }

    // 3. Validar dados novos contra schema (skip required field check for UPDATE)
    const validacaoDados = await this.provedorValidacao.validarDados(nomeTabela, dadosNovos, {
      ignorarObrigatorios: true,
    });
    if (!validacaoDados.valido) {
      const erros = validacaoDados.erros.map((e) => `${e.campo}: ${e.mensagem}`).join('; ');
      return ResultadoMutacao.falha({
        tipo: 'UPDATE',
        nomeTabela,
        mensagem: `Validação falhou: ${erros}`,
      });
    }

    // 4. Criar operação de mutação
    const operacao = OperacaoMutacao.criar({
      tipo: 'UPDATE',
      nomeTabela,
      condicao,
      dadosNovos,
      limiteRegistros: limite,
      dryRun,
      usuario: entrada.usuario,
    });

    // 5. Buscar registros que serão afetados (para audit trail)
    const registrosAntigos = await this.provedorMutacao.buscarRegistrosAfetados(operacao);

    if (registrosAntigos.length === 0) {
      return ResultadoMutacao.falha({
        tipo: 'UPDATE',
        nomeTabela,
        mensagem: 'Nenhum registro encontrado com a condição especificada',
      });
    }

    if (registrosAntigos.length > limite) {
      return ResultadoMutacao.falha({
        tipo: 'UPDATE',
        nomeTabela,
        mensagem: `UPDATE afetaria ${registrosAntigos.length} registros, mas limite é ${limite}`,
      });
    }

    // 6. Executar atualização
    const resultado = await this.provedorMutacao.atualizar(operacao);

    // Adicionar dados antigos ao resultado para audit
    if (resultado.foiSucesso()) {
      return ResultadoMutacao.criar({
        ...resultado,
        tipo: 'UPDATE',
        nomeTabela,
        sucesso: true,
        registrosAfetados: resultado.registrosAfetados,
        dadosAntigos: registrosAntigos,
        dryRun,
      });
    }

    this.logger.log(`UPDATE ${resultado.foiSucesso() ? 'concluído' : 'falhou'}: ${resultado.obterResumo()}`);

    return resultado;
  }
}
