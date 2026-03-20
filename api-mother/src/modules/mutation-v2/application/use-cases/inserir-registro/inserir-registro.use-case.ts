import { Inject, Injectable, Logger } from '@nestjs/common';
import { OperacaoMutacao, ResultadoMutacao } from '../../../domain/entities';
import { IProvedorMutacao, IProvedorValidacao, PROVEDOR_MUTACAO, PROVEDOR_VALIDACAO } from '../../ports';

export interface EntradaInserirRegistro {
  nomeTabela: string;
  dados: Record<string, unknown>;
  validarFKs?: boolean;
  dryRun?: boolean;
}

@Injectable()
export class InserirRegistroUseCase {
  private readonly logger = new Logger(InserirRegistroUseCase.name);

  constructor(
    @Inject(PROVEDOR_MUTACAO) private readonly provedorMutacao: IProvedorMutacao,
    @Inject(PROVEDOR_VALIDACAO) private readonly provedorValidacao: IProvedorValidacao,
  ) {}

  async executar(entrada: EntradaInserirRegistro): Promise<ResultadoMutacao> {
    const { nomeTabela, dados, validarFKs = true, dryRun = false } = entrada;

    this.logger.log(`Iniciando INSERT em ${nomeTabela}`, { dryRun, campos: Object.keys(dados) });

    // 1. Verificar se tabela existe
    const tabelaExiste = await this.provedorValidacao.tabelaExiste(nomeTabela);
    if (!tabelaExiste) {
      return ResultadoMutacao.falha({
        tipo: 'INSERT',
        nomeTabela,
        mensagem: `Tabela ${nomeTabela} não encontrada`,
      });
    }

    // 2. Validar dados contra schema
    const validacaoDados = await this.provedorValidacao.validarDados(nomeTabela, dados);
    if (!validacaoDados.valido) {
      const erros = validacaoDados.erros.map((e) => `${e.campo}: ${e.mensagem}`).join('; ');
      return ResultadoMutacao.falha({
        tipo: 'INSERT',
        nomeTabela,
        mensagem: `Validação falhou: ${erros}`,
      });
    }

    // 3. Validar chaves estrangeiras
    if (validarFKs) {
      const validacaoFKs = await this.provedorValidacao.validarChavesEstrangeiras(nomeTabela, dados);
      if (!validacaoFKs.valido) {
        const erros = validacaoFKs.erros.map((e) => `${e.campo}: ${e.mensagem}`).join('; ');
        return ResultadoMutacao.falha({
          tipo: 'INSERT',
          nomeTabela,
          mensagem: `Validação de FK falhou: ${erros}`,
        });
      }
    }

    // 4. Criar operação de mutação
    const operacao = OperacaoMutacao.criar({
      tipo: 'INSERT',
      nomeTabela,
      dados,
      dryRun,
    });

    // 5. Executar inserção
    const resultado = await this.provedorMutacao.inserir(operacao);

    this.logger.log(`INSERT ${resultado.foiSucesso() ? 'concluído' : 'falhou'}: ${resultado.obterResumo()}`);

    return resultado;
  }
}
