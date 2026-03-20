/**
 * PermissoesGuardService - Implementacao do servico de permissoes para guards.
 *
 * @module M3
 *
 * Este servico implementa a interface IPermissoesService para uso pelos
 * guards de permissao. Utiliza os use cases existentes do modulo de permissoes.
 */
import { Injectable, Logger } from '@nestjs/common';
import { IPermissoesService } from '../../../common/guards/interfaces/permissoes-service.interface';
import { ContextoPermissao, ResultadoPermissao, OperacaoCrud } from '../../../common/guards/types';
import { VerificarAcessoControleUseCase } from '../application/use-cases/verificar-acesso-controle';
import { ObterPermissoesTelaUseCase } from '../application/use-cases/obter-permissoes-tela';
import { ObterParametrosUsuarioUseCase } from '../application/use-cases/obter-parametros-usuario';

@Injectable()
export class PermissoesGuardService implements IPermissoesService {
  private readonly logger = new Logger(PermissoesGuardService.name);

  constructor(
    private readonly verificarAcessoControle: VerificarAcessoControleUseCase,
    private readonly obterPermissoesTela: ObterPermissoesTelaUseCase,
    private readonly obterParametrosUsuario: ObterParametrosUsuarioUseCase,
  ) {}

  /**
   * Verifica se o usuario tem permissao para executar a operacao CRUD.
   */
  async verificarPermissaoCrud(contexto: ContextoPermissao): Promise<ResultadoPermissao> {
    try {
      // Mapear operacao CRUD para nome de controle Sankhya
      const nomeControle = this.mapearOperacaoParaControle(contexto.operacao, contexto.tabela);

      // Verificar acesso via use case existente
      const resultado = await this.verificarAcessoControle.executar({
        codUsuario: contexto.codUsuario,
        codTela: contexto.codTela,
        nomeControle,
        tokenUsuario: contexto.tokenUsuario,
      });

      // Se tiver acesso, obter campos e RLS
      if (resultado.temAcesso) {
        const camposPermitidos = await this.obterCamposPermitidos(
          contexto.codUsuario,
          contexto.tabela || '',
          contexto.operacao,
          contexto.tokenUsuario,
        );

        const condicoesRls = await this.obterCondicoesRls(
          contexto.codUsuario,
          contexto.tabela || '',
          contexto.tokenUsuario,
        );

        const requerAprovacao = await this.verificarRequerAprovacao(
          contexto.codUsuario,
          contexto.tabela || '',
          contexto.operacao,
          contexto.tokenUsuario,
        );

        return {
          permitido: true,
          camposPermitidos,
          condicoesRls: condicoesRls || undefined,
          requerAprovacao,
        };
      }

      return {
        permitido: false,
        motivo: `Usuario ${contexto.codUsuario} nao tem permissao para ${contexto.operacao} na tela ${contexto.codTela}`,
      };
    } catch (erro) {
      this.logger.error(`Erro ao verificar permissao CRUD: ${erro instanceof Error ? erro.message : erro}`);

      // Em caso de erro, negar acesso por seguranca
      return {
        permitido: false,
        motivo: 'Erro ao verificar permissao',
      };
    }
  }

  /**
   * Verifica quais campos o usuario pode acessar.
   */
  async obterCamposPermitidos(
    codUsuario: number,
    tabela: string,
    operacao: OperacaoCrud,
    tokenUsuario: string,
  ): Promise<string[]> {
    try {
      // Buscar parametros do usuario que definem campos permitidos
      const parametros = await this.obterParametrosUsuario.executar({
        codUsuario,
        tokenUsuario,
      });

      // Procurar parametro de campos permitidos para a tabela
      const parametroCampos = parametros.parametros.find(
        (p) => p.chave.toUpperCase() === `CAMPOS_${tabela}_${operacao}` || p.chave.toUpperCase() === `CAMPOS_${tabela}`,
      );

      if (parametroCampos?.valor) {
        return parametroCampos.valor.split(',').map((c) => c.trim().toUpperCase());
      }

      // Se nao houver restricao especifica, retornar array vazio (significa todos permitidos)
      return [];
    } catch (erro) {
      this.logger.error(`Erro ao obter campos permitidos: ${erro instanceof Error ? erro.message : erro}`);
      return [];
    }
  }

  /**
   * Obtem as condicoes RLS (Row Level Security) para o usuario.
   */
  async obterCondicoesRls(codUsuario: number, tabela: string, tokenUsuario: string): Promise<string | null> {
    try {
      // Buscar parametros do usuario que definem RLS
      const parametros = await this.obterParametrosUsuario.executar({
        codUsuario,
        tokenUsuario,
      });

      // Procurar parametro de RLS para a tabela
      const parametroRls = parametros.parametros.find(
        (p) => p.chave.toUpperCase() === `RLS_${tabela}` || p.chave.toUpperCase() === `FILTRO_${tabela}`,
      );

      if (parametroRls?.valor) {
        // Sanitizar condicao RLS para prevenir SQL injection
        return this.sanitizarCondicaoRls(parametroRls.valor);
      }

      // Verificar se ha RLS global baseado em empresa/filial
      const parametroEmpresa = parametros.parametros.find((p) => p.chave.toUpperCase() === 'CODEMP');

      if (parametroEmpresa?.valorNumerico) {
        return `{alias}.CODEMP = ${parametroEmpresa.valorNumerico}`;
      }

      return null;
    } catch (erro) {
      this.logger.error(`Erro ao obter condicoes RLS: ${erro instanceof Error ? erro.message : erro}`);
      return null;
    }
  }

  /**
   * Verifica se a operacao requer aprovacao.
   */
  async verificarRequerAprovacao(
    codUsuario: number,
    tabela: string,
    operacao: OperacaoCrud,
    tokenUsuario: string,
  ): Promise<boolean> {
    try {
      // Operacoes que tipicamente requerem aprovacao
      const operacoesComAprovacao: OperacaoCrud[] = ['DELETE', 'UPDATE'];

      if (!operacoesComAprovacao.includes(operacao)) {
        return false;
      }

      // Buscar parametros do usuario
      const parametros = await this.obterParametrosUsuario.executar({
        codUsuario,
        tokenUsuario,
      });

      // Verificar se usuario tem parametro de bypass de aprovacao
      const parametroBypass = parametros.parametros.find(
        (p) => p.chave.toUpperCase() === `BYPASS_APROVACAO_${tabela}` || p.chave.toUpperCase() === 'BYPASS_APROVACAO',
      );

      if (parametroBypass?.valor?.toUpperCase() === 'S') {
        return false;
      }

      // Verificar se tabela requer aprovacao
      const parametroAprovacao = parametros.parametros.find(
        (p) => p.chave.toUpperCase() === `REQUER_APROVACAO_${tabela}`,
      );

      return parametroAprovacao?.valor?.toUpperCase() === 'S';
    } catch (erro) {
      this.logger.error(`Erro ao verificar requisito de aprovacao: ${erro instanceof Error ? erro.message : erro}`);
      // Por seguranca, assumir que requer aprovacao em caso de erro
      return true;
    }
  }

  /**
   * Mapeia operacao CRUD para nome de controle Sankhya.
   */
  private mapearOperacaoParaControle(operacao: OperacaoCrud, tabela?: string): string {
    const mapeamento: Record<OperacaoCrud, string> = {
      CREATE: 'BTN_INSERIR',
      READ: 'BTN_CONSULTAR',
      UPDATE: 'BTN_ALTERAR',
      DELETE: 'BTN_EXCLUIR',
      LIST: 'BTN_CONSULTAR',
    };

    const controleBase = mapeamento[operacao] || 'BTN_CONSULTAR';

    // Se houver tabela, adicionar como sufixo
    return tabela ? `${controleBase}_${tabela}` : controleBase;
  }

  /**
   * Sanitiza condicao RLS para prevenir SQL injection.
   */
  private sanitizarCondicaoRls(condicao: string): string {
    // Remover caracteres perigosos
    const sanitizada = condicao
      .replace(/;/g, '') // Ponto e virgula
      .replace(/--/g, '') // Comentarios SQL
      .replace(/\/\*/g, '') // Comentarios multi-linha
      .replace(/\*\//g, '')
      .replace(/xp_/gi, '') // Procedures de sistema
      .replace(/exec\s+/gi, '') // EXEC
      .replace(/execute\s+/gi, '') // EXECUTE
      .replace(/drop\s+/gi, '') // DROP
      .replace(/truncate\s+/gi, '') // TRUNCATE
      .replace(/alter\s+/gi, '') // ALTER
      .replace(/create\s+/gi, ''); // CREATE

    // Log de warning se condicao foi modificada
    if (sanitizada !== condicao) {
      this.logger.warn(`Condicao RLS sanitizada: "${condicao}" -> "${sanitizada}"`);
    }

    return sanitizada;
  }
}
