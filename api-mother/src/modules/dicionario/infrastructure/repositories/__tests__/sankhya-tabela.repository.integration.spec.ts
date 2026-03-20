/**
 * Testes de integracao para SankhyaTabelaRepository.
 *
 * Estes testes validam o comportamento do repositorio de tabelas
 * utilizando mocks do DatabaseService para simular respostas do banco TESTE.
 *
 * IMPORTANTE: Sempre usar banco TESTE em desenvolvimento, NUNCA PROD.
 *
 * @module Dicionario
 * @tabela TDDTAB
 */
import { Test, TestingModule } from '@nestjs/testing';
import { SankhyaTabelaRepository } from '../sankhya-tabela.repository';
import { TabelaMapper, TabelaCru } from '../../../application/mappers/tabela.mapper';
import { SqlServerService } from '../../../../../database/sqlserver.service';
import { Tabela } from '../../../domain/entities/tabela.entity';

describe('SankhyaTabelaRepository (Integration)', () => {
  let repositorio: SankhyaTabelaRepository;
  let sqlServerMock: jest.Mocked<SqlServerService>;

  // Dados de teste simulando retorno do banco TESTE
  const tabelaCruMock: TabelaCru = {
    NOMETAB: 'TGFPRO',
    DESCRICAO: 'Produtos',
    NOMEINSTANCIA: 'Produto',
    MODULO: 'COM',
    ATIVA: 'S',
    TIPOCRUD: 'CRUD',
  };

  const listaTabelasCruMock: TabelaCru[] = [
    {
      NOMETAB: 'TGFPRO',
      DESCRICAO: 'Produtos',
      NOMEINSTANCIA: 'Produto',
      MODULO: 'COM',
      ATIVA: 'S',
      TIPOCRUD: 'CRUD',
    },
    {
      NOMETAB: 'TGFPAR',
      DESCRICAO: 'Parceiros',
      NOMEINSTANCIA: 'Parceiro',
      MODULO: 'COM',
      ATIVA: 'S',
      TIPOCRUD: 'CRUD',
    },
    {
      NOMETAB: 'TGFEST',
      DESCRICAO: 'Estoque',
      NOMEINSTANCIA: 'Estoque',
      MODULO: 'EST',
      ATIVA: 'N',
      TIPOCRUD: 'CONSULTA',
    },
  ];

  const tokenUsuarioTeste = 'token-teste-123';

  beforeEach(async () => {
    // Criar mock do SqlServerService
    sqlServerMock = {
      executeSQL: jest.fn(),
    } as unknown as jest.Mocked<SqlServerService>;

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        SankhyaTabelaRepository,
        TabelaMapper,
        {
          provide: SqlServerService,
          useValue: sqlServerMock,
        },
      ],
    }).compile();

    repositorio = modulo.get<SankhyaTabelaRepository>(SankhyaTabelaRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buscarPorNome', () => {
    it('deve retornar tabela quando existir no banco TESTE', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([tabelaCruMock]);

      // Act
      const resultado = await repositorio.buscarPorNome('TGFPRO', tokenUsuarioTeste);

      // Assert
      expect(resultado).not.toBeNull();
      expect(resultado).toBeInstanceOf(Tabela);
      expect(resultado?.nomeTabela).toBe('TGFPRO');
      expect(resultado?.descricao).toBe('Produtos');
      expect(resultado?.ativa).toBe(true);
      expect(sqlServerMock.executeSQL).toHaveBeenCalledTimes(1);
      expect(sqlServerMock.executeSQL).toHaveBeenCalledWith(expect.stringContaining('SELECT'), ['TGFPRO']);
    });

    it('deve retornar null quando tabela nao existir', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([]);

      // Act
      const resultado = await repositorio.buscarPorNome('TABELA_INEXISTENTE', tokenUsuarioTeste);

      // Assert
      expect(resultado).toBeNull();
      expect(sqlServerMock.executeSQL).toHaveBeenCalledTimes(1);
    });

    it('deve retornar null quando resultado for undefined', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue(undefined as any);

      // Act
      const resultado = await repositorio.buscarPorNome('TGFPRO', tokenUsuarioTeste);

      // Assert
      expect(resultado).toBeNull();
    });

    it('deve passar o nome da tabela como parametro da query', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([tabelaCruMock]);

      // Act
      await repositorio.buscarPorNome('TGFVEI', tokenUsuarioTeste);

      // Assert
      expect(sqlServerMock.executeSQL).toHaveBeenCalledWith(expect.any(String), ['TGFVEI']);
    });

    it('deve mapear corretamente todos os campos da tabela', async () => {
      // Arrange
      const tabelaCompletaMock: TabelaCru = {
        NOMETAB: 'TCFOSCAB',
        DESCRICAO: 'Ordens de Servico',
        NOMEINSTANCIA: 'OrdemServico',
        MODULO: 'MNT',
        ATIVA: 'S',
        TIPOCRUD: 'CRUD',
      };
      sqlServerMock.executeSQL.mockResolvedValue([tabelaCompletaMock]);

      // Act
      const resultado = await repositorio.buscarPorNome('TCFOSCAB', tokenUsuarioTeste);

      // Assert
      expect(resultado?.nomeTabela).toBe('TCFOSCAB');
      expect(resultado?.descricao).toBe('Ordens de Servico');
      expect(resultado?.nomeInstancia).toBe('OrdemServico');
      expect(resultado?.modulo).toBe('MNT');
      expect(resultado?.ativa).toBe(true);
      expect(resultado?.tipoCrud).toBe('CRUD');
    });
  });

  describe('buscarTodas', () => {
    it('deve retornar lista de todas as tabelas', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue(listaTabelasCruMock);

      // Act
      const resultado = await repositorio.buscarTodas(tokenUsuarioTeste);

      // Assert
      expect(resultado).toHaveLength(3);
      expect(resultado[0].nomeTabela).toBe('TGFPRO');
      expect(resultado[1].nomeTabela).toBe('TGFPAR');
      expect(resultado[2].nomeTabela).toBe('TGFEST');
      expect(sqlServerMock.executeSQL).toHaveBeenCalledWith(expect.stringContaining('ORDER BY NOMETAB'), []);
    });

    it('deve retornar array vazio quando nenhuma tabela existir', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([]);

      // Act
      const resultado = await repositorio.buscarTodas(tokenUsuarioTeste);

      // Assert
      expect(resultado).toEqual([]);
      expect(resultado).toHaveLength(0);
    });

    it('deve mapear todas as tabelas para entidades de dominio', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue(listaTabelasCruMock);

      // Act
      const resultado = await repositorio.buscarTodas(tokenUsuarioTeste);

      // Assert
      resultado.forEach((tabela) => {
        expect(tabela).toBeInstanceOf(Tabela);
      });
    });
  });

  describe('buscarAtivas', () => {
    it('deve retornar apenas tabelas ativas', async () => {
      // Arrange
      const tabelasAtivasMock = listaTabelasCruMock.filter((t) => t.ATIVA === 'S');
      sqlServerMock.executeSQL.mockResolvedValue(tabelasAtivasMock);

      // Act
      const resultado = await repositorio.buscarAtivas(tokenUsuarioTeste);

      // Assert
      expect(resultado).toHaveLength(2);
      resultado.forEach((tabela) => {
        expect(tabela.ativa).toBe(true);
        expect(tabela.estaAtiva()).toBe(true);
      });
    });

    it('deve incluir clausula WHERE ATIVA = S na query', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([]);

      // Act
      await repositorio.buscarAtivas(tokenUsuarioTeste);

      // Assert
      expect(sqlServerMock.executeSQL).toHaveBeenCalledWith(expect.stringContaining("ATIVA = 'S'"), []);
    });

    it('deve retornar array vazio quando nenhuma tabela ativa existir', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([]);

      // Act
      const resultado = await repositorio.buscarAtivas(tokenUsuarioTeste);

      // Assert
      expect(resultado).toEqual([]);
    });

    it('deve ordenar tabelas por nome', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([]);

      // Act
      await repositorio.buscarAtivas(tokenUsuarioTeste);

      // Assert
      expect(sqlServerMock.executeSQL).toHaveBeenCalledWith(expect.stringContaining('ORDER BY NOMETAB'), []);
    });
  });

  describe('buscarPorModulo', () => {
    it('deve retornar tabelas do modulo especificado', async () => {
      // Arrange
      const tabelasModuloCom = listaTabelasCruMock.filter((t) => t.MODULO === 'COM');
      sqlServerMock.executeSQL.mockResolvedValue(tabelasModuloCom);

      // Act
      const resultado = await repositorio.buscarPorModulo('COM', tokenUsuarioTeste);

      // Assert
      expect(resultado).toHaveLength(2);
      resultado.forEach((tabela) => {
        expect(tabela.modulo).toBe('COM');
      });
    });

    it('deve passar o modulo como parametro da query', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([]);

      // Act
      await repositorio.buscarPorModulo('MNT', tokenUsuarioTeste);

      // Assert
      expect(sqlServerMock.executeSQL).toHaveBeenCalledWith(expect.stringContaining('MODULO = @param1'), ['MNT']);
    });

    it('deve retornar array vazio quando modulo nao tiver tabelas', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([]);

      // Act
      const resultado = await repositorio.buscarPorModulo('MODULO_INEXISTENTE', tokenUsuarioTeste);

      // Assert
      expect(resultado).toEqual([]);
    });
  });

  describe('existeTabela', () => {
    it('deve retornar true quando tabela existir', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([{ total: 1 }]);

      // Act
      const resultado = await repositorio.existeTabela('TGFPRO', tokenUsuarioTeste);

      // Assert
      expect(resultado).toBe(true);
    });

    it('deve retornar false quando tabela nao existir', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([{ total: 0 }]);

      // Act
      const resultado = await repositorio.existeTabela('TABELA_INEXISTENTE', tokenUsuarioTeste);

      // Assert
      expect(resultado).toBe(false);
    });

    it('deve usar COUNT na query', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([{ total: 1 }]);

      // Act
      await repositorio.existeTabela('TGFPRO', tokenUsuarioTeste);

      // Assert
      expect(sqlServerMock.executeSQL).toHaveBeenCalledWith(expect.stringContaining('COUNT(*)'), ['TGFPRO']);
    });

    it('deve passar o nome da tabela como parametro', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([{ total: 0 }]);

      // Act
      await repositorio.existeTabela('TGFVEI', tokenUsuarioTeste);

      // Assert
      expect(sqlServerMock.executeSQL).toHaveBeenCalledWith(expect.any(String), ['TGFVEI']);
    });
  });

  describe('tratamento de erros', () => {
    it('deve propagar erro quando SqlServerService falhar', async () => {
      // Arrange
      const erroMock = new Error('Erro de conexao com banco TESTE');
      sqlServerMock.executeSQL.mockRejectedValue(erroMock);

      // Act & Assert
      await expect(repositorio.buscarPorNome('TGFPRO', tokenUsuarioTeste)).rejects.toThrow(
        'Erro de conexao com banco TESTE',
      );
    });

    it('deve propagar erro ao buscar todas as tabelas', async () => {
      // Arrange
      const erroMock = new Error('Timeout na query');
      sqlServerMock.executeSQL.mockRejectedValue(erroMock);

      // Act & Assert
      await expect(repositorio.buscarTodas(tokenUsuarioTeste)).rejects.toThrow('Timeout na query');
    });
  });

  describe('mapeamento de dados', () => {
    it('deve mapear tabela inativa corretamente', async () => {
      // Arrange
      const tabelaInativaMock: TabelaCru = {
        NOMETAB: 'TGFEST',
        DESCRICAO: 'Estoque',
        NOMEINSTANCIA: 'Estoque',
        MODULO: 'EST',
        ATIVA: 'N',
        TIPOCRUD: 'CONSULTA',
      };
      sqlServerMock.executeSQL.mockResolvedValue([tabelaInativaMock]);

      // Act
      const resultado = await repositorio.buscarPorNome('TGFEST', tokenUsuarioTeste);

      // Assert
      expect(resultado?.ativa).toBe(false);
      expect(resultado?.estaAtiva()).toBe(false);
    });

    it('deve tratar campos opcionais como undefined', async () => {
      // Arrange
      const tabelaMinimasMock: TabelaCru = {
        NOMETAB: 'TESTE',
      };
      sqlServerMock.executeSQL.mockResolvedValue([tabelaMinimasMock]);

      // Act
      const resultado = await repositorio.buscarPorNome('TESTE', tokenUsuarioTeste);

      // Assert
      expect(resultado).not.toBeNull();
      expect(resultado?.nomeTabela).toBe('TESTE');
      // Campos opcionais devem ter valores padrao
      expect(resultado?.descricao).toBeDefined();
      expect(resultado?.nomeInstancia).toBeDefined();
    });

    it('deve identificar tabela de sistema corretamente', async () => {
      // Arrange
      const tabelaSistemaMock: TabelaCru = {
        NOMETAB: 'TSIUSU',
        DESCRICAO: 'Usuarios do Sistema',
        NOMEINSTANCIA: 'Usuario',
        MODULO: 'SIS',
        ATIVA: 'S',
        TIPOCRUD: 'CRUD',
      };
      sqlServerMock.executeSQL.mockResolvedValue([tabelaSistemaMock]);

      // Act
      const resultado = await repositorio.buscarPorNome('TSIUSU', tokenUsuarioTeste);

      // Assert
      expect(resultado?.ehSistema()).toBe(true);
    });

    it('deve identificar tabela de negocio (nao sistema)', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([tabelaCruMock]);

      // Act
      const resultado = await repositorio.buscarPorNome('TGFPRO', tokenUsuarioTeste);

      // Assert
      expect(resultado?.ehSistema()).toBe(false);
    });
  });
});
