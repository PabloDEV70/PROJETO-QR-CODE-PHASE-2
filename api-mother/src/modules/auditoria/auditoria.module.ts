/**
 * Module: Auditoria (M4)
 *
 * Modulo de auditoria de permissoes e aprovacoes.
 *
 * Funcionalidades:
 * - Registro de operacoes (INSERT, UPDATE, DELETE, SELECT)
 * - Consulta de historico de auditoria
 * - Exportacao de historico (JSON, CSV)
 * - Solicitacao de aprovacoes
 * - Processamento de aprovacoes (aprovar/rejeitar)
 * - Listagem de aprovacoes pendentes
 * - Expiracao automatica de aprovacoes
 *
 * Endpoints:
 * - POST /auditoria/registrar - Registrar operacao
 * - GET /auditoria/historico - Consultar historico
 * - GET /auditoria/historico/:id - Buscar registro por ID
 * - GET /auditoria/historico/registro/:tabela/:chave - Historico de registro especifico
 * - GET /auditoria/estatisticas - Estatisticas de auditoria
 * - GET /auditoria/exportar - Exportar historico
 * - POST /auditoria/aprovacoes/solicitar - Solicitar aprovacao
 * - GET /auditoria/aprovacoes - Listar aprovacoes
 * - GET /auditoria/aprovacoes/pendentes - Listar pendentes
 * - GET /auditoria/aprovacoes/proximas-expirar - Proximas de expirar
 * - GET /auditoria/aprovacoes/contagem - Contar pendentes
 * - GET /auditoria/aprovacoes/estatisticas - Estatisticas de aprovacoes
 * - GET /auditoria/aprovacoes/:id - Buscar aprovacao por ID
 * - POST /auditoria/aprovacoes/:id/aprovar - Aprovar
 * - POST /auditoria/aprovacoes/:id/rejeitar - Rejeitar
 * - POST /auditoria/aprovacoes/expirar - Expirar aprovacoes
 */

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';

// Domain - Repositories
import { REPOSITORIO_AUDITORIA, REPOSITORIO_APROVACAO } from './domain/repositories';

// Application - Use Cases
import { RegistrarOperacaoUseCase } from './application/use-cases/registrar-operacao';
import { ConsultarHistoricoUseCase } from './application/use-cases/consultar-historico';
import { ExportarHistoricoUseCase } from './application/use-cases/exportar-historico';
import { SolicitarAprovacaoUseCase } from './application/use-cases/solicitar-aprovacao';
import { ProcessarAprovacaoUseCase } from './application/use-cases/processar-aprovacao';
import { ListarAprovacoesPendentesUseCase } from './application/use-cases/listar-aprovacoes-pendentes';
import { ExpirarAprovacoesUseCase } from './application/use-cases/expirar-aprovacoes';

// Application - Services
import { SanitizadorSQLService } from './application/services';

// Infrastructure - Repositories
import { SqlAuditoriaRepository } from './infrastructure/repositories/sql-auditoria.repository';
import { SqlAprovacaoRepository } from './infrastructure/repositories/sql-aprovacao.repository';

// Presentation - Controllers
import { AuditoriaController } from './presentation/controllers';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AuditoriaController],
  providers: [
    // Services
    SanitizadorSQLService,

    // Use Cases
    RegistrarOperacaoUseCase,
    ConsultarHistoricoUseCase,
    ExportarHistoricoUseCase,
    SolicitarAprovacaoUseCase,
    ProcessarAprovacaoUseCase,
    ListarAprovacoesPendentesUseCase,
    ExpirarAprovacoesUseCase,

    // Repository Bindings
    {
      provide: REPOSITORIO_AUDITORIA,
      useClass: SqlAuditoriaRepository,
    },
    {
      provide: REPOSITORIO_APROVACAO,
      useClass: SqlAprovacaoRepository,
    },
  ],
  exports: [
    // Services
    SanitizadorSQLService,

    // Use Cases (para uso em outros modulos)
    RegistrarOperacaoUseCase,
    ConsultarHistoricoUseCase,
    SolicitarAprovacaoUseCase,
    ProcessarAprovacaoUseCase,
    ListarAprovacoesPendentesUseCase,
    ExpirarAprovacoesUseCase,
  ],
})
export class AuditoriaModule {}
