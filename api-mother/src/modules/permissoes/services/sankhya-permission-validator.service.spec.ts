import { Test, TestingModule } from '@nestjs/testing';
import { SankhyaPermissionValidatorService } from './sankhya-permission-validator.service';
import { SqlServerService } from '../../../database/sqlserver.service';
import { DatabaseContextService } from '../../../database/database-context.service';

describe('SankhyaPermissionValidatorService', () => {
  let service: SankhyaPermissionValidatorService;
  let sqlServerService: jest.Mocked<SqlServerService>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let databaseContext: jest.Mocked<DatabaseContextService>;

  beforeEach(async () => {
    // Mock SqlServerService
    const mockSqlServerService = {
      executeSQL: jest.fn(),
    };

    // Mock DatabaseContextService
    const mockDatabaseContext = {
      getCurrentDatabase: jest.fn().mockReturnValue('TESTE'),
      run: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SankhyaPermissionValidatorService,
        {
          provide: SqlServerService,
          useValue: mockSqlServerService,
        },
        {
          provide: DatabaseContextService,
          useValue: mockDatabaseContext,
        },
      ],
    }).compile();

    service = module.get<SankhyaPermissionValidatorService>(SankhyaPermissionValidatorService);
    sqlServerService = module.get(SqlServerService);
    databaseContext = module.get(DatabaseContextService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    service.limparCache();
  });

  describe('verificarPermissaoTabela', () => {
    it('deve permitir acesso quando usuário tem permissão CONSULTAR', async () => {
      // Arrange
      const mockPermissoes = [
        {
          NOMETAB: 'TGFPRO',
          CONSULTAR: 'S',
          INSERIR: 'N',
          ALTERAR: 'N',
          EXCLUIR: 'N',
          CODTAB: 100,
          NOMEADT: 'Produtos',
        },
      ];
      sqlServerService.executeSQL.mockResolvedValue(mockPermissoes);

      // Act
      const result = await service.verificarPermissaoTabela(311, 'TGFPRO', 'CONSULTAR');

      // Assert
      expect(result).toBe(true);
      expect(sqlServerService.executeSQL).toHaveBeenCalledWith(expect.stringContaining('SELECT'), [311]);
    });

    it('deve negar acesso quando usuário não tem permissão CONSULTAR', async () => {
      // Arrange
      const mockPermissoes = [
        {
          NOMETAB: 'TGFPRO',
          CONSULTAR: 'N',
          INSERIR: 'S',
          ALTERAR: 'N',
          EXCLUIR: 'N',
          CODTAB: 100,
          NOMEADT: 'Produtos',
        },
      ];
      sqlServerService.executeSQL.mockResolvedValue(mockPermissoes);

      // Act
      const result = await service.verificarPermissaoTabela(311, 'TGFPRO', 'CONSULTAR');

      // Assert
      expect(result).toBe(false);
    });

    it('deve negar acesso quando usuário não tem permissão para a tabela', async () => {
      // Arrange
      sqlServerService.executeSQL.mockResolvedValue([]);

      // Act
      const result = await service.verificarPermissaoTabela(311, 'TGFPRO', 'CONSULTAR');

      // Assert
      expect(result).toBe(false);
    });

    it('deve verificar permissão INSERIR corretamente', async () => {
      // Arrange
      const mockPermissoes = [
        {
          NOMETAB: 'TGFPRO',
          CONSULTAR: 'S',
          INSERIR: 'S',
          ALTERAR: 'N',
          EXCLUIR: 'N',
          CODTAB: 100,
          NOMEADT: 'Produtos',
        },
      ];
      sqlServerService.executeSQL.mockResolvedValue(mockPermissoes);

      // Act
      const result = await service.verificarPermissaoTabela(311, 'TGFPRO', 'INSERIR');

      // Assert
      expect(result).toBe(true);
    });

    it('deve normalizar nome da tabela para uppercase', async () => {
      // Arrange
      const mockPermissoes = [
        {
          NOMETAB: 'TGFPRO',
          CONSULTAR: 'S',
          INSERIR: 'N',
          ALTERAR: 'N',
          EXCLUIR: 'N',
          CODTAB: 100,
          NOMEADT: 'Produtos',
        },
      ];
      sqlServerService.executeSQL.mockResolvedValue(mockPermissoes);

      // Act
      const result = await service.verificarPermissaoTabela(311, 'tgfpro', 'CONSULTAR');

      // Assert
      expect(result).toBe(true);
    });

    it('deve usar cache em chamadas subsequentes', async () => {
      // Arrange
      const mockPermissoes = [
        {
          NOMETAB: 'TGFPRO',
          CONSULTAR: 'S',
          INSERIR: 'N',
          ALTERAR: 'N',
          EXCLUIR: 'N',
          CODTAB: 100,
          NOMEADT: 'Produtos',
        },
      ];
      sqlServerService.executeSQL.mockResolvedValue(mockPermissoes);

      // Act
      await service.verificarPermissaoTabela(311, 'TGFPRO', 'CONSULTAR');
      await service.verificarPermissaoTabela(311, 'TGFPRO', 'CONSULTAR');

      // Assert
      expect(sqlServerService.executeSQL).toHaveBeenCalledTimes(1);
    });

    it('deve retornar false em caso de erro no banco', async () => {
      // Arrange
      sqlServerService.executeSQL.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await service.verificarPermissaoTabela(311, 'TGFPRO', 'CONSULTAR');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('obterTabelasPermitidas', () => {
    it('deve retornar lista de tabelas permitidas', async () => {
      // Arrange
      const mockPermissoes = [
        {
          NOMETAB: 'TGFPRO',
          CONSULTAR: 'S',
          INSERIR: 'N',
          ALTERAR: 'N',
          EXCLUIR: 'N',
          CODTAB: 100,
          NOMEADT: 'Produtos',
        },
        {
          NOMETAB: 'TGFPAR',
          CONSULTAR: 'S',
          INSERIR: 'S',
          ALTERAR: 'N',
          EXCLUIR: 'N',
          CODTAB: 101,
          NOMEADT: 'Parceiros',
        },
      ];
      sqlServerService.executeSQL.mockResolvedValue(mockPermissoes);

      // Act
      const result = await service.obterTabelasPermitidas(311);

      // Assert
      expect(result).toEqual(['TGFPRO', 'TGFPAR']);
    });

    it('deve retornar array vazio quando usuário sem permissões', async () => {
      // Arrange
      sqlServerService.executeSQL.mockResolvedValue([]);

      // Act
      const result = await service.obterTabelasPermitidas(311);

      // Assert
      expect(result).toEqual([]);
    });

    it('deve retornar array vazio em caso de erro', async () => {
      // Arrange
      sqlServerService.executeSQL.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await service.obterTabelasPermitidas(311);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('obterDetalhesPermissao', () => {
    it('deve retornar detalhes completos de permissão', async () => {
      // Arrange
      const mockPermissoes = [
        {
          NOMETAB: 'TGFPRO',
          CONSULTAR: 'S',
          INSERIR: 'S',
          ALTERAR: 'N',
          EXCLUIR: 'N',
          CODTAB: 100,
          NOMEADT: 'Produtos',
        },
      ];
      sqlServerService.executeSQL.mockResolvedValue(mockPermissoes);

      // Act
      const result = await service.obterDetalhesPermissao(311, 'TGFPRO');

      // Assert
      expect(result).toEqual({
        nomeTabela: 'TGFPRO',
        consultar: true,
        inserir: true,
        alterar: false,
        excluir: false,
        codTab: 100,
        nomeTab: 'Produtos',
      });
    });

    it('deve retornar null quando tabela não encontrada', async () => {
      // Arrange
      sqlServerService.executeSQL.mockResolvedValue([]);

      // Act
      const result = await service.obterDetalhesPermissao(311, 'TGFXXX');

      // Assert
      expect(result).toBeNull();
    });

    it('deve retornar null em caso de erro', async () => {
      // Arrange
      sqlServerService.executeSQL.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await service.obterDetalhesPermissao(311, 'TGFPRO');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('limparCache', () => {
    it('deve limpar cache de usuário específico', async () => {
      // Arrange
      const mockPermissoes = [
        {
          NOMETAB: 'TGFPRO',
          CONSULTAR: 'S',
          INSERIR: 'N',
          ALTERAR: 'N',
          EXCLUIR: 'N',
          CODTAB: 100,
          NOMEADT: 'Produtos',
        },
      ];
      sqlServerService.executeSQL.mockResolvedValue(mockPermissoes);

      // Act
      await service.verificarPermissaoTabela(311, 'TGFPRO', 'CONSULTAR');
      service.limparCache(311);
      await service.verificarPermissaoTabela(311, 'TGFPRO', 'CONSULTAR');

      // Assert
      expect(sqlServerService.executeSQL).toHaveBeenCalledTimes(2);
    });

    it('deve limpar todo o cache', async () => {
      // Arrange
      const mockPermissoes = [
        {
          NOMETAB: 'TGFPRO',
          CONSULTAR: 'S',
          INSERIR: 'N',
          ALTERAR: 'N',
          EXCLUIR: 'N',
          CODTAB: 100,
          NOMEADT: 'Produtos',
        },
      ];
      sqlServerService.executeSQL.mockResolvedValue(mockPermissoes);

      // Act
      await service.verificarPermissaoTabela(311, 'TGFPRO', 'CONSULTAR');
      await service.verificarPermissaoTabela(312, 'TGFPRO', 'CONSULTAR');
      service.limparCache();
      await service.verificarPermissaoTabela(311, 'TGFPRO', 'CONSULTAR');

      // Assert
      expect(sqlServerService.executeSQL).toHaveBeenCalledTimes(3);
    });
  });

  describe('obterEstatisticasCache', () => {
    it('deve retornar estatísticas corretas do cache', async () => {
      // Arrange
      const mockPermissoes = [
        {
          NOMETAB: 'TGFPRO',
          CONSULTAR: 'S',
          INSERIR: 'N',
          ALTERAR: 'N',
          EXCLUIR: 'N',
          CODTAB: 100,
          NOMEADT: 'Produtos',
        },
      ];
      sqlServerService.executeSQL.mockResolvedValue(mockPermissoes);

      // Act
      await service.verificarPermissaoTabela(311, 'TGFPRO', 'CONSULTAR');
      await service.verificarPermissaoTabela(312, 'TGFPRO', 'CONSULTAR');
      const stats = service.obterEstatisticasCache();

      // Assert
      expect(stats.tamanho).toBe(2);
      expect(stats.usuarios).toContain(311);
      expect(stats.usuarios).toContain(312);
    });
  });

  describe('Performance', () => {
    it('deve completar verificação em menos de 50ms com cache', async () => {
      // Arrange
      const mockPermissoes = [
        {
          NOMETAB: 'TGFPRO',
          CONSULTAR: 'S',
          INSERIR: 'N',
          ALTERAR: 'N',
          EXCLUIR: 'N',
          CODTAB: 100,
          NOMEADT: 'Produtos',
        },
      ];
      sqlServerService.executeSQL.mockResolvedValue(mockPermissoes);

      // Primeira chamada para popular cache
      await service.verificarPermissaoTabela(311, 'TGFPRO', 'CONSULTAR');

      // Act - medir tempo da segunda chamada (com cache)
      const start = Date.now();
      await service.verificarPermissaoTabela(311, 'TGFPRO', 'CONSULTAR');
      const duration = Date.now() - start;

      // Assert
      expect(duration).toBeLessThan(50);
    });
  });
});
