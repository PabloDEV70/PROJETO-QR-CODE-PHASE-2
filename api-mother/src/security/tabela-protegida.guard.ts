import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';

/**
 * Guard que bloqueia operações em tabelas protegidas do sistema.
 *
 * Tabelas protegidas:
 * - TSI* (Sistema)
 * - AD_* (Auditoria)
 * - TDD* (Dicionário de dados)
 * - TSICTA (Configurações)
 */
@Injectable()
export class TabelaProtegidaGuard implements CanActivate {
  private readonly logger = new Logger(TabelaProtegidaGuard.name);

  /**
   * Padrões de tabelas protegidas (regex)
   */
  private readonly PADROES_PROTEGIDOS: RegExp[] = [
    /^TSI.*/i, // Tabelas de sistema
    /^AD_.*/i, // Auditoria
    /^TDD.*/i, // Dicionário de dados
  ];

  /**
   * Tabelas específicas protegidas
   */
  private readonly TABELAS_PROTEGIDAS: string[] = [
    'TSICTA', // Configurações
    'TSIUSU', // Usuários (crítico)
    'TSIEMP', // Empresas (crítico)
    'TSICUS', // Customizações
  ];

  /**
   * Tabelas PERMITIDAS para mutations (excepções à regra de proteção)
   * Usadas para testes e desenvolvimento
   */
  private readonly TABELAS_PERMITIDAS: string[] = [
    'AD_TELAEXEMPLO01', // Tabela de teste para CRUD operations
    'AD_COMADM', // Chamados - header
    'AD_COMADM1', // Chamados - ocorrencias/timeline
    'AD_HSTVEI', // Painel Veiculos - historico situacoes
    'AD_RDOAPONTAMENTOS', // RDO Master
    'AD_RDOAPONDETALHES', // RDO Detalhes
    'AD_RDOMOTIVOS', // RDO Motivos
    'AD_TCFEXEC', // Executores OS
    'AD_APONTSOL', // Apontamento solicitacoes
    // OS Manutencao
    'TCFOSCAB', // Ordem de Servico - cabecalho
    'TCFOSITE', // Ordem de Servico - itens
    'TCFSERVOS', // Servicos da OS
    'TCSOSE', // OS servicos executados
    'TCSOSI', // OS servicos itens
  ];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const body = request.body || {};

    // Extrair nome da tabela do body
    const nomeTabela = (body.nomeTabela || '').toUpperCase();

    if (!nomeTabela) {
      // Se não há tabela especificada, deixar passar (validação de DTO cuidará disso)
      return true;
    }

    if (this.ehTabelaProtegida(nomeTabela)) {
      this.logger.warn(`Blocked mutation on protected table: ${nomeTabela}`, {
        method: request.method,
        path: request.path,
        user: request.user?.username || 'unknown',
        ip: request.ip,
      });

      throw new ForbiddenException({
        message: `A tabela ${nomeTabela} é protegida e não permite operações de escrita via API`,
        code: 'PROTECTED_TABLE',
        table: nomeTabela,
        hint: 'Tabelas de sistema, auditoria e configuração são protegidas',
      });
    }

    return true;
  }

  private ehTabelaProtegida(nomeTabela: string): boolean {
    // Verificar whitelist de tabelas PERMITIDAS primeiro
    if (this.TABELAS_PERMITIDAS.includes(nomeTabela)) {
      return false; // Tabela está na whitelist, não é protegida
    }

    // Verificar tabelas específicas bloqueadas
    if (this.TABELAS_PROTEGIDAS.includes(nomeTabela)) {
      return true;
    }

    // Verificar padrões regex
    for (const padrao of this.PADROES_PROTEGIDOS) {
      if (padrao.test(nomeTabela)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Método público para verificar se tabela é protegida (útil para testes)
   */
  verificarTabelaProtegida(nomeTabela: string): boolean {
    return this.ehTabelaProtegida(nomeTabela.toUpperCase());
  }
}
