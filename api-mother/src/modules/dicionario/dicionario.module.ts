import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';

// Domain - Repository Interfaces
import { REPOSITORIO_TABELA } from './domain/repositories/tabela.repository.interface';
import { REPOSITORIO_CAMPO } from './domain/repositories/campo.repository.interface';
import { REPOSITORIO_INSTANCIA } from './domain/repositories/instancia.repository.interface';
import { REPOSITORIO_RELACIONAMENTO } from './domain/repositories/relacionamento.repository.interface';

// Infrastructure - Repository Implementations
import { SankhyaTabelaRepository } from './infrastructure/repositories/sankhya-tabela.repository';
import { SankhyaCampoRepository } from './infrastructure/repositories/sankhya-campo.repository';
import { SankhyaInstanciaRepository } from './infrastructure/repositories/sankhya-instancia.repository';
import { SankhyaRelacionamentoRepository } from './infrastructure/repositories/sankhya-relacionamento.repository';

// Application - Mappers
import { TabelaMapper } from './application/mappers/tabela.mapper';
import { CampoMapper } from './application/mappers/campo.mapper';
import { InstanciaMapper } from './application/mappers/instancia.mapper';
import { RelacionamentoMapper } from './application/mappers/relacionamento.mapper';

// Application - Use Cases (existentes)
import { ObterTabelasAtivasUseCase } from './application/use-cases/obter-tabelas-ativas';
import { ObterTabelaPorNomeUseCase } from './application/use-cases/obter-tabela-por-nome';
import { ObterCamposTabelaUseCase } from './application/use-cases/obter-campos-tabela';
import { ObterInstanciasTabelaUseCase } from './application/use-cases/obter-instancias-tabela';
import { ObterRelacionamentosTabelaUseCase } from './application/use-cases/obter-relacionamentos-tabela';
import { PesquisarDicionarioUseCase } from './application/use-cases/pesquisar-dicionario';

// Application - Use Cases (novos D3)
import { ListarTabelasPaginadoUseCase } from './application/use-cases/listar-tabelas-paginado';
import { BuscarTabelasUseCase } from './application/use-cases/buscar-tabelas';
import { ObterTabelaCompletaUseCase } from './application/use-cases/obter-tabela-completa';
import { ObterCampoUseCase } from './application/use-cases/obter-campo';
import { ObterOpcoesCampoUseCase } from './application/use-cases/obter-opcoes-campo';
import { ObterPropriedadesCampoUseCase } from './application/use-cases/obter-propriedades-campo';
import { BuscarCamposGlobalUseCase } from './application/use-cases/buscar-campos-global';
import { ObterCampoCompletoUseCase } from './application/use-cases/obter-campo-completo';

// Application - Use Cases (novos D4 - Instâncias e Relacionamentos)
import { ListarInstanciasTabelaUseCase } from './application/use-cases/listar-instancias-tabela';
import { ObterInstanciaUseCase } from './application/use-cases/obter-instancia';
import { ObterInstanciaCompletaUseCase } from './application/use-cases/obter-instancia-completa';
import { ObterHierarquiaInstanciasUseCase } from './application/use-cases/obter-hierarquia-instancias';
import { ListarRelacionamentosUseCase } from './application/use-cases/listar-relacionamentos';
import { ObterCamposRelacionamentoUseCase } from './application/use-cases/obter-campos-relacionamento';
import { ObterTabelasRelacionadasUseCase } from './application/use-cases/obter-tabelas-relacionadas';

// Application - Use Cases (novos D5 - Form Builder)
import { GerarSchemaFormularioUseCase } from './form-builder/application/use-cases/gerar-schema-formulario';
import { GerarSchemaGridUseCase } from './form-builder/application/use-cases/gerar-schema-grid';

// Form Builder - Domain Services
import { ConstrutorFormService, CONSTRUTOR_FORM_SERVICE } from './form-builder/domain/services/construtor-form.service';
import { ValidadorCampoService, VALIDADOR_CAMPO_SERVICE } from './form-builder/domain/services/validador-campo.service';

// Form Builder - Converters
import { TipoCampoZodConverter } from './form-builder/application/converters/tipo-campo-zod.converter';
import { TipoCampoJSONSchemaConverter } from './form-builder/application/converters/tipo-campo-json-schema.converter';
import { TipoCampoTypeScriptConverter } from './form-builder/application/converters/tipo-campo-typescript.converter';

// D6 - Validação via Dicionário
import { VALIDADOR_CAMPO } from './validacao/domain/interfaces/validador-campo.interface';
import { PROVEDOR_SCHEMA_TABELA } from './validacao/domain/interfaces/schema-tabela.interface';
import { ValidacaoService } from './validacao/application/services/validacao.service';
import { ValidadorCampoService as ValidadorCampoValidacaoService } from './validacao/application/services/validador-campo.service';
import { ProvedorSchemaTabelaService } from './validacao/application/services/provedor-schema-tabela.service';
import { ValidacaoMutationAdapter } from './validacao/application/integracao/validacao-mutation.adapter';
import { ValidacaoQueryExecutorAdapter } from './validacao/application/integracao/validacao-query-executor.adapter';
import { MensagensErroService } from './validacao/application/mensagens/mensagens-erro.service';
import { TraduzirErroService } from './validacao/application/mensagens/traduzir-erro.service';
import { ValidacaoDicionarioGuard } from './validacao/infrastructure/guards/validacao-dicionario.guard';
import { InjecaoSchemaInterceptor } from './validacao/infrastructure/interceptors/injecao-schema.interceptor';

// D7 - Cache
import { CACHE_METADADOS } from './cache/interfaces';
import { MemoryCacheProvider } from './cache/providers';
import { DictionaryCacheService } from './cache/services';
import { InvalidarCacheUseCase } from './application/use-cases/invalidar-cache';

// D8 - Export/Documentação
import { GerarDocTabelaUseCase } from './application/use-cases/gerar-doc-tabela';
import { ExportarJSONUseCase } from './application/use-cases/exportar-json';

// D9 - i18n
import { TraducaoService } from './i18n/services';
import { ObterTraducaoTabelaUseCase } from './application/use-cases/obter-traducao-tabela';
import { ObterTraducaoCampoUseCase } from './application/use-cases/obter-traducao-campo';

// Presentation - Controllers
import { DicionarioController } from './presentation/controllers/dicionario.controller';
import { InstanciasController } from './presentation/controllers/instancias.controller';
import { RelacionamentosController } from './presentation/controllers/relacionamentos.controller';
import { FormBuilderController } from './form-builder/presentation/controllers/form-builder.controller';
import { CacheAdminController } from './presentation/controllers/cache-admin.controller';
import { ExportController } from './presentation/controllers/export.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [
    DicionarioController,
    InstanciasController,
    RelacionamentosController,
    FormBuilderController,
    CacheAdminController,
    ExportController,
  ],
  providers: [
    // Mappers
    TabelaMapper,
    CampoMapper,
    InstanciaMapper,
    RelacionamentoMapper,
    // Use Cases (existentes)
    ObterTabelasAtivasUseCase,
    ObterTabelaPorNomeUseCase,
    ObterCamposTabelaUseCase,
    ObterInstanciasTabelaUseCase,
    ObterRelacionamentosTabelaUseCase,
    PesquisarDicionarioUseCase,
    // Use Cases (novos D3)
    ListarTabelasPaginadoUseCase,
    BuscarTabelasUseCase,
    ObterTabelaCompletaUseCase,
    ObterCampoUseCase,
    ObterOpcoesCampoUseCase,
    ObterPropriedadesCampoUseCase,
    BuscarCamposGlobalUseCase,
    ObterCampoCompletoUseCase,
    // Use Cases (novos D4 - Instâncias e Relacionamentos)
    ListarInstanciasTabelaUseCase,
    ObterInstanciaUseCase,
    ObterInstanciaCompletaUseCase,
    ObterHierarquiaInstanciasUseCase,
    ListarRelacionamentosUseCase,
    ObterCamposRelacionamentoUseCase,
    ObterTabelasRelacionadasUseCase,
    // Use Cases (novos D5 - Form Builder)
    GerarSchemaFormularioUseCase,
    GerarSchemaGridUseCase,
    // Form Builder Services
    { provide: CONSTRUTOR_FORM_SERVICE, useClass: ConstrutorFormService },
    { provide: VALIDADOR_CAMPO_SERVICE, useClass: ValidadorCampoService },
    // Form Builder Converters
    TipoCampoZodConverter,
    TipoCampoJSONSchemaConverter,
    TipoCampoTypeScriptConverter,
    // Repositories with DI bindings
    { provide: REPOSITORIO_TABELA, useClass: SankhyaTabelaRepository },
    { provide: REPOSITORIO_CAMPO, useClass: SankhyaCampoRepository },
    { provide: REPOSITORIO_INSTANCIA, useClass: SankhyaInstanciaRepository },
    { provide: REPOSITORIO_RELACIONAMENTO, useClass: SankhyaRelacionamentoRepository },
    // D6 - Validação via Dicionário
    ValidacaoService,
    ValidadorCampoValidacaoService,
    ProvedorSchemaTabelaService,
    MensagensErroService,
    TraduzirErroService,
    ValidacaoMutationAdapter,
    ValidacaoQueryExecutorAdapter,
    ValidacaoDicionarioGuard,
    InjecaoSchemaInterceptor,
    { provide: VALIDADOR_CAMPO, useClass: ValidadorCampoValidacaoService },
    { provide: PROVEDOR_SCHEMA_TABELA, useClass: ProvedorSchemaTabelaService },
    // D7 - Cache
    { provide: CACHE_METADADOS, useClass: MemoryCacheProvider },
    DictionaryCacheService,
    InvalidarCacheUseCase,
    // D8 - Export
    GerarDocTabelaUseCase,
    ExportarJSONUseCase,
    // D9 - i18n
    TraducaoService,
    ObterTraducaoTabelaUseCase,
    ObterTraducaoCampoUseCase,
  ],
  exports: [
    REPOSITORIO_TABELA,
    REPOSITORIO_CAMPO,
    REPOSITORIO_INSTANCIA,
    REPOSITORIO_RELACIONAMENTO,
    TabelaMapper,
    CampoMapper,
    InstanciaMapper,
    RelacionamentoMapper,
    // Use Cases (existentes)
    ObterTabelasAtivasUseCase,
    ObterTabelaPorNomeUseCase,
    ObterCamposTabelaUseCase,
    ObterInstanciasTabelaUseCase,
    ObterRelacionamentosTabelaUseCase,
    PesquisarDicionarioUseCase,
    // Use Cases (novos D3)
    ListarTabelasPaginadoUseCase,
    BuscarTabelasUseCase,
    ObterTabelaCompletaUseCase,
    ObterCampoUseCase,
    ObterOpcoesCampoUseCase,
    ObterPropriedadesCampoUseCase,
    BuscarCamposGlobalUseCase,
    ObterCampoCompletoUseCase,
    // Use Cases (novos D4 - Instâncias e Relacionamentos)
    ListarInstanciasTabelaUseCase,
    ObterInstanciaUseCase,
    ObterInstanciaCompletaUseCase,
    ObterHierarquiaInstanciasUseCase,
    ListarRelacionamentosUseCase,
    ObterCamposRelacionamentoUseCase,
    ObterTabelasRelacionadasUseCase,
    // Use Cases (novos D5 - Form Builder)
    GerarSchemaFormularioUseCase,
    GerarSchemaGridUseCase,
    // D6 - Validação via Dicionário
    ValidacaoService,
    ValidacaoMutationAdapter,
    ValidacaoQueryExecutorAdapter,
    ValidacaoDicionarioGuard,
    InjecaoSchemaInterceptor,
    // D7 - Cache
    DictionaryCacheService,
    InvalidarCacheUseCase,
    // D8 - Export
    GerarDocTabelaUseCase,
    ExportarJSONUseCase,
    // D9 - i18n
    TraducaoService,
    ObterTraducaoTabelaUseCase,
    ObterTraducaoCampoUseCase,
  ],
})
export class DicionarioModule {}
