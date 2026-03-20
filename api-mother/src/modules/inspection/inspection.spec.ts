/**
 * Tests: Inspection Module
 *
 * Testes unitários para todas as camadas do módulo de inspeção.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

// Domain Entities
import { Tabela, ColunaTabela, RelacaoTabela, ChavePrimaria, ResultadoQuery } from './domain/entities';

// Application Ports
import {
  IProvedorTabelas,
  IProvedorRelacoes,
  IProvedorQuery,
  PROVEDOR_TABELAS,
  PROVEDOR_RELACOES,
  PROVEDOR_QUERY,
  ResultadoListaTabelas,
  ResultadoRelacoes,
  ResultadoChavesPrimarias,
} from './application/ports';

// Application Use Cases
import {
  ListarTabelasUseCase,
  ObterSchemaTabelaUseCase,
  ObterRelacoesTabelaUseCase,
  ObterChavesPrimariasUseCase,
  ExecutarQueryUseCase,
} from './application/use-cases';

// Presentation
import { InspectionController } from './presentation/controllers';

// Mocks
import { AppLogger } from '../../common/logging/app-logger.service';

// ============================================
// TESTS: DOMAIN ENTITIES
// ============================================

describe('Inspection - Domain Entities', () => {
  describe('Tabela', () => {
    it('deve criar tabela com dados válidos', () => {
      const tabela = Tabela.criar({ TABLE_NAME: 'TGFVEI', TABLE_TYPE: 'BASE TABLE' });
      expect(tabela.nome).toBe('TGFVEI');
      expect(tabela.tipo).toBe('BASE TABLE');
    });

    it('deve detectar tabela Sankhya (prefixo TGF)', () => {
      const tabela = Tabela.criar({ TABLE_NAME: 'TGFVEI', TABLE_TYPE: 'BASE TABLE' });
      expect(tabela.ehTabelaSankhya()).toBe(true);
    });

    it('deve detectar tabela Sankhya (prefixo TDD)', () => {
      const tabela = Tabela.criar({ TABLE_NAME: 'TDDCAM', TABLE_TYPE: 'BASE TABLE' });
      expect(tabela.ehTabelaSankhya()).toBe(true);
    });

    it('deve detectar tabela Sankhya (prefixo TSI)', () => {
      const tabela = Tabela.criar({ TABLE_NAME: 'TSIUSU', TABLE_TYPE: 'BASE TABLE' });
      expect(tabela.ehTabelaSankhya()).toBe(true);
    });

    it('deve detectar tabela Sankhya (prefixo AD_)', () => {
      const tabela = Tabela.criar({ TABLE_NAME: 'AD_VEICULOS', TABLE_TYPE: 'BASE TABLE' });
      expect(tabela.ehTabelaSankhya()).toBe(true);
    });

    it('deve detectar tabela não-Sankhya', () => {
      const tabela = Tabela.criar({ TABLE_NAME: 'CUSTOM_TABLE', TABLE_TYPE: 'BASE TABLE' });
      expect(tabela.ehTabelaSankhya()).toBe(false);
    });

    it('deve detectar tabela de sistema', () => {
      const tabela = Tabela.criar({ TABLE_NAME: 'sysdiagrams', TABLE_TYPE: 'BASE TABLE' });
      expect(tabela.ehTabelaSistema()).toBe(true);
    });

    it('deve detectar tabela customizada (AD_)', () => {
      const tabela = Tabela.criar({ TABLE_NAME: 'AD_VEICULOS', TABLE_TYPE: 'BASE TABLE' });
      expect(tabela.ehTabelaCustomizada()).toBe(true);
    });

    it('deve detectar tabela não customizada', () => {
      const tabela = Tabela.criar({ TABLE_NAME: 'TGFVEI', TABLE_TYPE: 'BASE TABLE' });
      expect(tabela.ehTabelaCustomizada()).toBe(false);
    });
  });

  describe('ColunaTabela', () => {
    it('deve criar coluna com dados básicos', () => {
      const coluna = ColunaTabela.criar({
        COLUMN_NAME: 'CODVEI',
        DATA_TYPE: 'int',
        IS_NULLABLE: 'NO',
        ORDINAL_POSITION: 1,
      });
      expect(coluna.nome).toBe('CODVEI');
      expect(coluna.tipo).toBe('int');
      expect(coluna.nulo).toBe(false);
      expect(coluna.posicao).toBe(1);
    });

    it('deve criar coluna varchar com tamanho máximo', () => {
      const coluna = ColunaTabela.criar({
        COLUMN_NAME: 'PLACA',
        DATA_TYPE: 'varchar',
        IS_NULLABLE: 'YES',
        ORDINAL_POSITION: 2,
        CHARACTER_MAXIMUM_LENGTH: 10,
      });
      expect(coluna.tamanhoMaximo).toBe(10);
      expect(coluna.obterTipoFormatado()).toBe('varchar(10)');
    });

    it('deve criar coluna numeric com precisão e escala', () => {
      const coluna = ColunaTabela.criar({
        COLUMN_NAME: 'VALOR',
        DATA_TYPE: 'numeric',
        IS_NULLABLE: 'YES',
        ORDINAL_POSITION: 3,
        NUMERIC_PRECISION: 18,
        NUMERIC_SCALE: 2,
      });
      expect(coluna.precisao).toBe(18);
      expect(coluna.escala).toBe(2);
      expect(coluna.obterTipoFormatado()).toBe('numeric(18,2)');
    });

    it('deve formatar tipo int sem modificadores', () => {
      const coluna = ColunaTabela.criar({
        COLUMN_NAME: 'ID',
        DATA_TYPE: 'int',
        IS_NULLABLE: 'NO',
        ORDINAL_POSITION: 1,
      });
      expect(coluna.obterTipoFormatado()).toBe('int');
    });

    it('deve detectar coluna numérica', () => {
      const colunaInt = ColunaTabela.criar({
        COLUMN_NAME: 'ID',
        DATA_TYPE: 'int',
        IS_NULLABLE: 'NO',
        ORDINAL_POSITION: 1,
      });
      const colunaDecimal = ColunaTabela.criar({
        COLUMN_NAME: 'VALOR',
        DATA_TYPE: 'decimal',
        IS_NULLABLE: 'YES',
        ORDINAL_POSITION: 2,
      });
      const colunaVarchar = ColunaTabela.criar({
        COLUMN_NAME: 'NOME',
        DATA_TYPE: 'varchar',
        IS_NULLABLE: 'YES',
        ORDINAL_POSITION: 3,
      });

      expect(colunaInt.ehNumerico()).toBe(true);
      expect(colunaDecimal.ehNumerico()).toBe(true);
      expect(colunaVarchar.ehNumerico()).toBe(false);
    });

    it('deve detectar coluna de texto', () => {
      const colunaVarchar = ColunaTabela.criar({
        COLUMN_NAME: 'NOME',
        DATA_TYPE: 'varchar',
        IS_NULLABLE: 'YES',
        ORDINAL_POSITION: 1,
      });
      const colunaText = ColunaTabela.criar({
        COLUMN_NAME: 'OBS',
        DATA_TYPE: 'text',
        IS_NULLABLE: 'YES',
        ORDINAL_POSITION: 2,
      });
      const colunaInt = ColunaTabela.criar({
        COLUMN_NAME: 'ID',
        DATA_TYPE: 'int',
        IS_NULLABLE: 'NO',
        ORDINAL_POSITION: 3,
      });

      expect(colunaVarchar.ehTexto()).toBe(true);
      expect(colunaText.ehTexto()).toBe(true);
      expect(colunaInt.ehTexto()).toBe(false);
    });

    it('deve detectar coluna de data/hora', () => {
      const colunaDate = ColunaTabela.criar({
        COLUMN_NAME: 'DTNEG',
        DATA_TYPE: 'date',
        IS_NULLABLE: 'YES',
        ORDINAL_POSITION: 1,
      });
      const colunaDateTime = ColunaTabela.criar({
        COLUMN_NAME: 'DTHRCAD',
        DATA_TYPE: 'datetime',
        IS_NULLABLE: 'YES',
        ORDINAL_POSITION: 2,
      });
      const colunaInt = ColunaTabela.criar({
        COLUMN_NAME: 'ID',
        DATA_TYPE: 'int',
        IS_NULLABLE: 'NO',
        ORDINAL_POSITION: 3,
      });

      expect(colunaDate.ehDataHora()).toBe(true);
      expect(colunaDateTime.ehDataHora()).toBe(true);
      expect(colunaInt.ehDataHora()).toBe(false);
    });

    it('deve detectar coluna obrigatória', () => {
      const colunaObrigatoria = ColunaTabela.criar({
        COLUMN_NAME: 'CODVEI',
        DATA_TYPE: 'int',
        IS_NULLABLE: 'NO',
        ORDINAL_POSITION: 1,
      });
      const colunaOpcional = ColunaTabela.criar({
        COLUMN_NAME: 'OBS',
        DATA_TYPE: 'varchar',
        IS_NULLABLE: 'YES',
        ORDINAL_POSITION: 2,
      });

      expect(colunaObrigatoria.ehObrigatoria()).toBe(true);
      expect(colunaOpcional.ehObrigatoria()).toBe(false);
    });
  });

  describe('RelacaoTabela', () => {
    it('deve criar relação com dados válidos', () => {
      const relacao = RelacaoTabela.criar({
        ForeignKeyName: 'FK_VEI_PAR',
        ParentTable: 'TGFVEI',
        ParentColumn: 'CODPARC',
        ReferencedTable: 'TGFPAR',
        ReferencedColumn: 'CODPARC',
        DeleteAction: 'NO_ACTION',
        UpdateAction: 'NO_ACTION',
      });

      expect(relacao.nomeForeignKey).toBe('FK_VEI_PAR');
      expect(relacao.tabelaPai).toBe('TGFVEI');
      expect(relacao.colunaPai).toBe('CODPARC');
      expect(relacao.tabelaReferenciada).toBe('TGFPAR');
      expect(relacao.colunaReferenciada).toBe('CODPARC');
    });

    it('deve detectar relação com cascade delete', () => {
      const relacaoCascade = RelacaoTabela.criar({
        ForeignKeyName: 'FK_TEST',
        ParentTable: 'T1',
        ParentColumn: 'C1',
        ReferencedTable: 'T2',
        ReferencedColumn: 'C2',
        DeleteAction: 'CASCADE',
        UpdateAction: 'NO_ACTION',
      });

      const relacaoNoAction = RelacaoTabela.criar({
        ForeignKeyName: 'FK_TEST2',
        ParentTable: 'T1',
        ParentColumn: 'C1',
        ReferencedTable: 'T2',
        ReferencedColumn: 'C2',
        DeleteAction: 'NO_ACTION',
        UpdateAction: 'NO_ACTION',
      });

      expect(relacaoCascade.temCascadeDelete()).toBe(true);
      expect(relacaoNoAction.temCascadeDelete()).toBe(false);
    });

    it('deve detectar relação com cascade update', () => {
      const relacaoCascade = RelacaoTabela.criar({
        ForeignKeyName: 'FK_TEST',
        ParentTable: 'T1',
        ParentColumn: 'C1',
        ReferencedTable: 'T2',
        ReferencedColumn: 'C2',
        DeleteAction: 'NO_ACTION',
        UpdateAction: 'CASCADE',
      });

      expect(relacaoCascade.temCascadeUpdate()).toBe(true);
    });

    it('deve obter descrição formatada', () => {
      const relacao = RelacaoTabela.criar({
        ForeignKeyName: 'FK_VEI_PAR',
        ParentTable: 'TGFVEI',
        ParentColumn: 'CODPARC',
        ReferencedTable: 'TGFPAR',
        ReferencedColumn: 'CODPARC',
        DeleteAction: 'NO_ACTION',
        UpdateAction: 'NO_ACTION',
      });

      expect(relacao.obterDescricao()).toBe('TGFVEI.CODPARC -> TGFPAR.CODPARC');
    });

    it('deve detectar relação auto-referenciada', () => {
      const autoRef = RelacaoTabela.criar({
        ForeignKeyName: 'FK_PAR_RESPONS',
        ParentTable: 'TGFPAR',
        ParentColumn: 'CODRESPONS',
        ReferencedTable: 'TGFPAR',
        ReferencedColumn: 'CODPARC',
        DeleteAction: 'NO_ACTION',
        UpdateAction: 'NO_ACTION',
      });

      expect(autoRef.ehAutoReferenciado()).toBe(true);
    });
  });

  describe('ChavePrimaria', () => {
    it('deve criar chave primária com dados válidos', () => {
      const chave = ChavePrimaria.criar({
        TABLE_NAME: 'TGFVEI',
        COLUMN_NAME: 'CODVEI',
        CONSTRAINT_NAME: 'PK_TGFVEI',
      });

      expect(chave.tabela).toBe('TGFVEI');
      expect(chave.coluna).toBe('CODVEI');
      expect(chave.nomeConstraint).toBe('PK_TGFVEI');
    });

    it('deve detectar chave primária padrão Sankhya', () => {
      const chavePadrao = ChavePrimaria.criar({
        TABLE_NAME: 'TGFVEI',
        COLUMN_NAME: 'CODVEI',
        CONSTRAINT_NAME: 'PK_TGFVEI',
      });

      const chaveCustom = ChavePrimaria.criar({
        TABLE_NAME: 'CUSTOM',
        COLUMN_NAME: 'ID',
        CONSTRAINT_NAME: 'CUSTOM_PK',
      });

      expect(chavePadrao.ehPadraoSankhya()).toBe(true);
      expect(chaveCustom.ehPadraoSankhya()).toBe(false);
    });

    it('deve obter descrição da chave', () => {
      const chave = ChavePrimaria.criar({
        TABLE_NAME: 'TGFVEI',
        COLUMN_NAME: 'CODVEI',
        CONSTRAINT_NAME: 'PK_TGFVEI',
      });

      expect(chave.obterDescricao()).toBe('TGFVEI.CODVEI (PK_TGFVEI)');
    });
  });

  describe('ResultadoQuery', () => {
    it('deve criar resultado de query com dados', () => {
      const resultado = ResultadoQuery.criar({
        query: 'SELECT * FROM TGFVEI',
        params: [],
        data: [{ CODVEI: 1, PLACA: 'ABC-1234' }],
        rowCount: 1,
        executionTime: 45,
      });

      expect(resultado.query).toBe('SELECT * FROM TGFVEI');
      expect(resultado.parametros).toEqual([]);
      expect(resultado.dados).toHaveLength(1);
      expect(resultado.quantidadeLinhas).toBe(1);
      expect(resultado.tempoExecucao).toBe(45);
    });

    it('deve criar resultado vazio', () => {
      const resultado = ResultadoQuery.criar({
        query: 'SELECT * FROM TGFVEI WHERE 1=0',
        params: [],
        data: [],
        rowCount: 0,
      });

      expect(resultado.estaVazia()).toBe(true);
    });

    it('deve criar resultado não vazio', () => {
      const resultado = ResultadoQuery.criar({
        query: 'SELECT * FROM TGFVEI',
        params: [],
        data: [{ CODVEI: 1 }],
        rowCount: 1,
      });

      expect(resultado.estaVazia()).toBe(false);
    });

    it('deve detectar se tem dados', () => {
      const resultado = ResultadoQuery.criar({
        query: 'SELECT * FROM TGFVEI',
        params: [],
        data: [{ CODVEI: 1 }],
        rowCount: 1,
      });

      expect(resultado.temDados()).toBe(true);
    });

    it('deve detectar muitos resultados', () => {
      const resultado = ResultadoQuery.criar({
        query: 'SELECT * FROM TGFVEI',
        params: [],
        data: [],
        rowCount: 1500,
      });

      expect(resultado.temMuitosResultados()).toBe(true);
    });

    it('deve obter resumo da execução', () => {
      const resultado = ResultadoQuery.criar({
        query: 'SELECT * FROM TGFVEI',
        params: [],
        data: [{ CODVEI: 1 }],
        rowCount: 100,
        executionTime: 50,
      });

      expect(resultado.obterResumo()).toBe('100 registros em 50ms');
    });
  });
});

// ============================================
// TESTS: APPLICATION USE CASES
// ============================================

describe('Inspection - Use Cases', () => {
  describe('ListarTabelasUseCase', () => {
    let useCase: ListarTabelasUseCase;
    let mockProvedor: jest.Mocked<IProvedorTabelas>;

    beforeEach(async () => {
      mockProvedor = {
        listarTabelas: jest.fn(),
        obterSchemaTabela: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [ListarTabelasUseCase, { provide: PROVEDOR_TABELAS, useValue: mockProvedor }],
      }).compile();

      useCase = module.get<ListarTabelasUseCase>(ListarTabelasUseCase);
    });

    it('deve listar tabelas com sucesso', async () => {
      const tabelas: ResultadoListaTabelas = {
        tabelas: [
          Tabela.criar({ TABLE_NAME: 'TGFVEI', TABLE_TYPE: 'BASE TABLE' }),
          Tabela.criar({ TABLE_NAME: 'TGFPAR', TABLE_TYPE: 'BASE TABLE' }),
        ],
        total: 2,
      };

      mockProvedor.listarTabelas.mockResolvedValue(tabelas);

      const resultado = await useCase.executar();

      expect(resultado.tabelas).toHaveLength(2);
      expect(resultado.total).toBe(2);
      expect(mockProvedor.listarTabelas).toHaveBeenCalled();
    });

    it('deve retornar lista vazia quando não há tabelas', async () => {
      mockProvedor.listarTabelas.mockResolvedValue({ tabelas: [], total: 0 });

      const resultado = await useCase.executar();

      expect(resultado.tabelas).toHaveLength(0);
      expect(resultado.total).toBe(0);
    });
  });

  describe('ObterSchemaTabelaUseCase', () => {
    let useCase: ObterSchemaTabelaUseCase;
    let mockProvedor: jest.Mocked<IProvedorTabelas>;

    beforeEach(async () => {
      mockProvedor = {
        listarTabelas: jest.fn(),
        obterSchemaTabela: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [ObterSchemaTabelaUseCase, { provide: PROVEDOR_TABELAS, useValue: mockProvedor }],
      }).compile();

      useCase = module.get<ObterSchemaTabelaUseCase>(ObterSchemaTabelaUseCase);
    });

    it('deve obter schema da tabela com sucesso', async () => {
      const colunas: ColunaTabela[] = [
        ColunaTabela.criar({ COLUMN_NAME: 'CODVEI', DATA_TYPE: 'int', IS_NULLABLE: 'NO', ORDINAL_POSITION: 1 }),
        ColunaTabela.criar({
          COLUMN_NAME: 'PLACA',
          DATA_TYPE: 'varchar',
          IS_NULLABLE: 'YES',
          ORDINAL_POSITION: 2,
          CHARACTER_MAXIMUM_LENGTH: 10,
        }),
      ];

      mockProvedor.obterSchemaTabela.mockResolvedValue(colunas);

      const resultado = await useCase.executar('TGFVEI');

      expect(resultado).toHaveLength(2);
      expect(resultado[0].nome).toBe('CODVEI');
      expect(mockProvedor.obterSchemaTabela).toHaveBeenCalledWith('TGFVEI');
    });

    it('deve retornar array vazio para tabela sem colunas', async () => {
      mockProvedor.obterSchemaTabela.mockResolvedValue([]);

      const resultado = await useCase.executar('TABELA_VAZIA');

      expect(resultado).toHaveLength(0);
    });
  });

  describe('ObterRelacoesTabelaUseCase', () => {
    let useCase: ObterRelacoesTabelaUseCase;
    let mockProvedor: jest.Mocked<IProvedorRelacoes>;

    beforeEach(async () => {
      mockProvedor = {
        obterRelacoes: jest.fn(),
        obterChavesPrimarias: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [ObterRelacoesTabelaUseCase, { provide: PROVEDOR_RELACOES, useValue: mockProvedor }],
      }).compile();

      useCase = module.get<ObterRelacoesTabelaUseCase>(ObterRelacoesTabelaUseCase);
    });

    it('deve obter relações da tabela com sucesso', async () => {
      const resultado: ResultadoRelacoes = {
        nomeTabela: 'TGFVEI',
        relacoes: [
          RelacaoTabela.criar({
            ForeignKeyName: 'FK_VEI_PAR',
            ParentTable: 'TGFVEI',
            ParentColumn: 'CODPARC',
            ReferencedTable: 'TGFPAR',
            ReferencedColumn: 'CODPARC',
            DeleteAction: 'NO_ACTION',
            UpdateAction: 'NO_ACTION',
          }),
        ],
        total: 1,
      };

      mockProvedor.obterRelacoes.mockResolvedValue(resultado);

      const res = await useCase.executar('TGFVEI');

      expect(res.nomeTabela).toBe('TGFVEI');
      expect(res.relacoes).toHaveLength(1);
      expect(res.total).toBe(1);
    });

    it('deve retornar lista vazia para tabela sem relações', async () => {
      mockProvedor.obterRelacoes.mockResolvedValue({
        nomeTabela: 'TABELA_ISOLADA',
        relacoes: [],
        total: 0,
      });

      const res = await useCase.executar('TABELA_ISOLADA');

      expect(res.relacoes).toHaveLength(0);
      expect(res.total).toBe(0);
    });
  });

  describe('ObterChavesPrimariasUseCase', () => {
    let useCase: ObterChavesPrimariasUseCase;
    let mockProvedor: jest.Mocked<IProvedorRelacoes>;

    beforeEach(async () => {
      mockProvedor = {
        obterRelacoes: jest.fn(),
        obterChavesPrimarias: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [ObterChavesPrimariasUseCase, { provide: PROVEDOR_RELACOES, useValue: mockProvedor }],
      }).compile();

      useCase = module.get<ObterChavesPrimariasUseCase>(ObterChavesPrimariasUseCase);
    });

    it('deve obter chaves primárias com sucesso', async () => {
      const resultado: ResultadoChavesPrimarias = {
        nomeTabela: 'TGFVEI',
        chaves: [ChavePrimaria.criar({ TABLE_NAME: 'TGFVEI', COLUMN_NAME: 'CODVEI', CONSTRAINT_NAME: 'PK_TGFVEI' })],
        total: 1,
      };

      mockProvedor.obterChavesPrimarias.mockResolvedValue(resultado);

      const res = await useCase.executar('TGFVEI');

      expect(res.nomeTabela).toBe('TGFVEI');
      expect(res.chaves).toHaveLength(1);
      expect(res.chaves[0].coluna).toBe('CODVEI');
    });

    it('deve retornar chave composta', async () => {
      const resultado: ResultadoChavesPrimarias = {
        nomeTabela: 'TGFITE',
        chaves: [
          ChavePrimaria.criar({ TABLE_NAME: 'TGFITE', COLUMN_NAME: 'NUNOTA', CONSTRAINT_NAME: 'PK_TGFITE' }),
          ChavePrimaria.criar({ TABLE_NAME: 'TGFITE', COLUMN_NAME: 'SEQUENCIA', CONSTRAINT_NAME: 'PK_TGFITE' }),
        ],
        total: 2,
      };

      mockProvedor.obterChavesPrimarias.mockResolvedValue(resultado);

      const res = await useCase.executar('TGFITE');

      expect(res.chaves).toHaveLength(2);
      expect(res.total).toBe(2);
    });
  });

  describe('ExecutarQueryUseCase', () => {
    let useCase: ExecutarQueryUseCase;
    let mockProvedor: jest.Mocked<IProvedorQuery>;

    beforeEach(async () => {
      mockProvedor = {
        executarQuery: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [ExecutarQueryUseCase, { provide: PROVEDOR_QUERY, useValue: mockProvedor }],
      }).compile();

      useCase = module.get<ExecutarQueryUseCase>(ExecutarQueryUseCase);
    });

    it('deve executar query SELECT com sucesso', async () => {
      const resultado = ResultadoQuery.criar({
        query: 'SELECT * FROM TGFVEI WHERE CODVEI = @p0',
        params: [1],
        data: [{ CODVEI: 1, PLACA: 'ABC-1234' }],
        rowCount: 1,
        executionTime: 30,
      });

      mockProvedor.executarQuery.mockResolvedValue(resultado);

      const res = await useCase.executar({
        query: 'SELECT * FROM TGFVEI WHERE CODVEI = @p0',
        params: [1],
      });

      expect(res.dados).toHaveLength(1);
      expect(res.quantidadeLinhas).toBe(1);
    });

    it('deve retornar resultado vazio para query sem dados', async () => {
      const resultado = ResultadoQuery.criar({
        query: 'SELECT * FROM TGFVEI WHERE 1=0',
        params: [],
        data: [],
        rowCount: 0,
      });

      mockProvedor.executarQuery.mockResolvedValue(resultado);

      const res = await useCase.executar({
        query: 'SELECT * FROM TGFVEI WHERE 1=0',
        params: [],
      });

      expect(res.dados).toHaveLength(0);
      expect(res.estaVazia()).toBe(true);
    });
  });
});

// ============================================
// TESTS: PRESENTATION CONTROLLER
// ============================================

import { DatabaseWriteGuard } from '../../security/database-write.guard';
import { AuthGuard } from '@nestjs/passport';

// Mock Guard that always allows
const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('Inspection - Controller', () => {
  let controller: InspectionController;
  let mockListarTabelas: jest.Mocked<ListarTabelasUseCase>;
  let mockObterSchema: jest.Mocked<ObterSchemaTabelaUseCase>;
  let mockObterRelacoes: jest.Mocked<ObterRelacoesTabelaUseCase>;
  let mockObterChaves: jest.Mocked<ObterChavesPrimariasUseCase>;
  let mockExecutarQuery: jest.Mocked<ExecutarQueryUseCase>;
  let mockLogger: jest.Mocked<AppLogger>;

  beforeEach(async () => {
    mockListarTabelas = {
      executar: jest.fn(),
    } as any;

    mockObterSchema = {
      executar: jest.fn(),
    } as any;

    mockObterRelacoes = {
      executar: jest.fn(),
    } as any;

    mockObterChaves = {
      executar: jest.fn(),
    } as any;

    mockExecutarQuery = {
      executar: jest.fn(),
    } as any;

    mockLogger = {
      logInfo: jest.fn(),
      logWarning: jest.fn(),
      logError: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InspectionController],
      providers: [
        { provide: ListarTabelasUseCase, useValue: mockListarTabelas },
        { provide: ObterSchemaTabelaUseCase, useValue: mockObterSchema },
        { provide: ObterRelacoesTabelaUseCase, useValue: mockObterRelacoes },
        { provide: ObterChavesPrimariasUseCase, useValue: mockObterChaves },
        { provide: ExecutarQueryUseCase, useValue: mockExecutarQuery },
        { provide: AppLogger, useValue: mockLogger },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockGuard)
      .overrideGuard(DatabaseWriteGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<InspectionController>(InspectionController);
  });

  describe('listarTabelas', () => {
    it('deve retornar lista de tabelas com sucesso', async () => {
      mockListarTabelas.executar.mockResolvedValue({
        tabelas: [
          Tabela.criar({ TABLE_NAME: 'TGFVEI', TABLE_TYPE: 'BASE TABLE' }),
          Tabela.criar({ TABLE_NAME: 'TGFPAR', TABLE_TYPE: 'BASE TABLE' }),
        ],
        total: 2,
      });

      const resultado = await controller.listarTabelas();

      expect(resultado.sucesso).toBe(true);
      expect(resultado.dados.tabelas).toHaveLength(2);
      expect(resultado.dados.total).toBe(2);
      expect(resultado.tempoExecucao).toBeDefined();
    });

    it('deve lançar BadRequestException em caso de erro', async () => {
      mockListarTabelas.executar.mockRejectedValue(new Error('Database error'));

      await expect(controller.listarTabelas()).rejects.toThrow(BadRequestException);
      expect(mockLogger.logError).toHaveBeenCalled();
    });
  });

  describe('obterSchemaTabela', () => {
    it('deve retornar schema da tabela com sucesso', async () => {
      mockObterSchema.executar.mockResolvedValue([
        ColunaTabela.criar({ COLUMN_NAME: 'CODVEI', DATA_TYPE: 'int', IS_NULLABLE: 'NO', ORDINAL_POSITION: 1 }),
        ColunaTabela.criar({
          COLUMN_NAME: 'PLACA',
          DATA_TYPE: 'varchar',
          IS_NULLABLE: 'YES',
          ORDINAL_POSITION: 2,
          CHARACTER_MAXIMUM_LENGTH: 10,
        }),
      ]);

      const resultado = await controller.obterSchemaTabela('TGFVEI');

      expect(resultado.sucesso).toBe(true);
      expect(resultado.dados).toHaveLength(2);
      expect(resultado.dados[0].nome).toBe('CODVEI');
      expect(resultado.dados[1].tipoFormatado).toBe('varchar(10)');
    });

    it('deve lançar BadRequestException em caso de erro', async () => {
      mockObterSchema.executar.mockRejectedValue(new Error('Table not found'));

      await expect(controller.obterSchemaTabela('TABELA_INEXISTENTE')).rejects.toThrow(BadRequestException);
    });
  });

  describe('obterRelacoes', () => {
    it('deve retornar relações da tabela com sucesso', async () => {
      mockObterRelacoes.executar.mockResolvedValue({
        nomeTabela: 'TGFVEI',
        relacoes: [
          RelacaoTabela.criar({
            ForeignKeyName: 'FK_VEI_PAR',
            ParentTable: 'TGFVEI',
            ParentColumn: 'CODPARC',
            ReferencedTable: 'TGFPAR',
            ReferencedColumn: 'CODPARC',
            DeleteAction: 'NO_ACTION',
            UpdateAction: 'NO_ACTION',
          }),
        ],
        total: 1,
      });

      const resultado = await controller.obterRelacoes('TGFVEI');

      expect(resultado.sucesso).toBe(true);
      expect(resultado.dados.nomeTabela).toBe('TGFVEI');
      expect(resultado.dados.relacoes).toHaveLength(1);
      expect(resultado.dados.total).toBe(1);
    });

    it('deve lançar BadRequestException em caso de erro', async () => {
      mockObterRelacoes.executar.mockRejectedValue(new Error('Error'));

      await expect(controller.obterRelacoes('TABELA')).rejects.toThrow(BadRequestException);
    });
  });

  describe('obterChavesPrimarias', () => {
    it('deve retornar chaves primárias com sucesso', async () => {
      mockObterChaves.executar.mockResolvedValue({
        nomeTabela: 'TGFVEI',
        chaves: [ChavePrimaria.criar({ TABLE_NAME: 'TGFVEI', COLUMN_NAME: 'CODVEI', CONSTRAINT_NAME: 'PK_TGFVEI' })],
        total: 1,
      });

      const resultado = await controller.obterChavesPrimarias('TGFVEI');

      expect(resultado.sucesso).toBe(true);
      expect(resultado.dados.nomeTabela).toBe('TGFVEI');
      expect(resultado.dados.chaves).toHaveLength(1);
    });

    it('deve lançar BadRequestException em caso de erro', async () => {
      mockObterChaves.executar.mockRejectedValue(new Error('Error'));

      await expect(controller.obterChavesPrimarias('TABELA')).rejects.toThrow(BadRequestException);
    });
  });

  describe('executarQuery', () => {
    it('deve executar query com sucesso', async () => {
      mockExecutarQuery.executar.mockResolvedValue(
        ResultadoQuery.criar({
          query: 'SELECT * FROM TGFVEI',
          params: [],
          data: [{ CODVEI: 1 }],
          rowCount: 1,
          executionTime: 25,
        }),
      );

      const resultado = await controller.executarQuery({ query: 'SELECT * FROM TGFVEI' });

      expect(resultado.sucesso).toBe(true);
      expect(resultado.dados.dados).toHaveLength(1);
      expect(resultado.dados.quantidadeLinhas).toBe(1);
    });

    it('deve lançar BadRequestException para query vazia', async () => {
      await expect(controller.executarQuery({ query: '' })).rejects.toThrow(BadRequestException);
      expect(mockLogger.logWarning).toHaveBeenCalled();
    });

    it('deve lançar BadRequestException para query apenas com espaços', async () => {
      await expect(controller.executarQuery({ query: '   ' })).rejects.toThrow(BadRequestException);
    });

    it('deve re-lançar HttpException do use case', async () => {
      const forbidden = new ForbiddenException('Query bloqueada');
      mockExecutarQuery.executar.mockRejectedValue(forbidden);

      await expect(controller.executarQuery({ query: 'DELETE FROM TGFVEI' })).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar BadRequestException para outros erros', async () => {
      mockExecutarQuery.executar.mockRejectedValue(new Error('SQL error'));

      await expect(controller.executarQuery({ query: 'SELECT INVALID' })).rejects.toThrow(BadRequestException);
    });
  });
});
