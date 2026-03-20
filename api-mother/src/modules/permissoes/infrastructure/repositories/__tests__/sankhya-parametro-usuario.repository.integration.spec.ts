/**
 * Testes de Integração para SankhyaParametroUsuarioRepository
 *
 * IMPORTANTE: Estes testes usam o banco TESTE, NUNCA usar PROD em desenvolvimento.
 *
 * Os testes validam a integração real com o banco de dados Sankhya,
 * verificando a comunicação e o mapeamento de dados da tabela TSIPAR.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { SankhyaParametroUsuarioRepository } from '../sankhya-parametro-usuario.repository';
import { SqlServerService } from '../../../../../database/sqlserver.service';
import { ParametroUsuario } from '../../../domain/entities/parametro-usuario.entity';

describe('SankhyaParametroUsuarioRepository (Integration)', () => {
  let repositorio: SankhyaParametroUsuarioRepository;
  let sqlServerService: SqlServerService;
  let moduloTeste: TestingModule;

  // Dados de teste - usar valores que existem no banco TESTE
  const COD_USUARIO_TESTE = 1; // Usuário administrador padrão
  const CHAVE_PARAMETRO_TESTE = 'MOSTRA_GRID';
  const TOKEN_TESTE = 'token-teste-integracao';

  beforeAll(async () => {
    // Mock do SqlServerService para testes de integração
    const sqlServerServiceMock = {
      executeSQL: jest.fn(),
    };

    moduloTeste = await Test.createTestingModule({
      providers: [
        SankhyaParametroUsuarioRepository,
        {
          provide: SqlServerService,
          useValue: sqlServerServiceMock,
        },
      ],
    }).compile();

    repositorio = moduloTeste.get<SankhyaParametroUsuarioRepository>(SankhyaParametroUsuarioRepository);
    sqlServerService = moduloTeste.get<SqlServerService>(SqlServerService);
  });

  afterAll(async () => {
    await moduloTeste.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buscarPorUsuario', () => {
    it('deve retornar lista de parametros quando usuario existir', async () => {
      // Arrange
      const dadosRetornadosBanco = [
        {
          codUsuario: COD_USUARIO_TESTE,
          chave: 'MOSTRA_GRID',
          valor: 'S',
          tipo: 'B',
          descricao: 'Exibir grid na tela principal',
        },
        {
          codUsuario: COD_USUARIO_TESTE,
          chave: 'LIMITE_REGISTROS',
          valor: '100',
          tipo: 'N',
          descricao: 'Limite de registros por pagina',
        },
        {
          codUsuario: COD_USUARIO_TESTE,
          chave: 'TEMA_PADRAO',
          valor: 'escuro',
          tipo: 'S',
          descricao: 'Tema visual padrao',
        },
      ];

      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosRetornadosBanco);

      // Act
      const resultado = await repositorio.buscarPorUsuario(COD_USUARIO_TESTE, TOKEN_TESTE);

      // Assert
      expect(resultado).toHaveLength(3);
      expect(resultado[0]).toBeInstanceOf(ParametroUsuario);
      expect(resultado[0].codUsuario).toBe(COD_USUARIO_TESTE);
      expect(resultado[0].chave).toBe('MOSTRA_GRID');
      expect(resultado[0].valor).toBe('S');
      expect(resultado[0].tipo).toBe('B');

      // Verificar a query
      const [queryChamada, parametros] = (sqlServerService.executeSQL as jest.Mock).mock.calls[0];
      expect(queryChamada).toContain('TSIPAR');
      expect(queryChamada).toContain('CODUSU = @param1');
      expect(queryChamada).toContain('ORDER BY CHAVE');
      expect(parametros).toEqual([COD_USUARIO_TESTE]);
    });

    it('deve retornar lista vazia quando usuario nao existir', async () => {
      // Arrange
      const codUsuarioInexistente = 99999;
      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue([]);

      // Act
      const resultado = await repositorio.buscarPorUsuario(codUsuarioInexistente, TOKEN_TESTE);

      // Assert
      expect(resultado).toHaveLength(0);
      expect(resultado).toEqual([]);
    });

    it('deve mapear corretamente os diferentes tipos de parametros', async () => {
      // Arrange
      const dadosRetornadosBanco = [
        {
          codUsuario: COD_USUARIO_TESTE,
          chave: 'PARAM_BOOLEANO',
          valor: 'S',
          tipo: 'B',
          descricao: 'Parametro booleano',
        },
        {
          codUsuario: COD_USUARIO_TESTE,
          chave: 'PARAM_NUMERICO',
          valor: '42',
          tipo: 'N',
          descricao: 'Parametro numerico',
        },
        {
          codUsuario: COD_USUARIO_TESTE,
          chave: 'PARAM_STRING',
          valor: 'texto',
          tipo: 'S',
          descricao: 'Parametro string',
        },
      ];

      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosRetornadosBanco);

      // Act
      const resultado = await repositorio.buscarPorUsuario(COD_USUARIO_TESTE, TOKEN_TESTE);

      // Assert
      expect(resultado).toHaveLength(3);

      // Verificar parametro booleano
      const paramBooleano = resultado.find((p) => p.chave === 'PARAM_BOOLEANO');
      expect(paramBooleano?.tipo).toBe('B');
      expect(paramBooleano?.obterValorBooleano()).toBe(true);

      // Verificar parametro numerico
      const paramNumerico = resultado.find((p) => p.chave === 'PARAM_NUMERICO');
      expect(paramNumerico?.tipo).toBe('N');
      expect(paramNumerico?.obterValorNumerico()).toBe(42);

      // Verificar parametro string
      const paramString = resultado.find((p) => p.chave === 'PARAM_STRING');
      expect(paramString?.tipo).toBe('S');
      expect(paramString?.valor).toBe('texto');
    });
  });

  describe('buscarPorChave', () => {
    it('deve retornar parametro quando usuario e chave existirem', async () => {
      // Arrange
      const dadosRetornadosBanco = [
        {
          codUsuario: COD_USUARIO_TESTE,
          chave: CHAVE_PARAMETRO_TESTE,
          valor: 'S',
          tipo: 'B',
          descricao: 'Exibir grid na tela principal',
        },
      ];

      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosRetornadosBanco);

      // Act
      const resultado = await repositorio.buscarPorChave(COD_USUARIO_TESTE, CHAVE_PARAMETRO_TESTE, TOKEN_TESTE);

      // Assert
      expect(resultado).not.toBeNull();
      expect(resultado).toBeInstanceOf(ParametroUsuario);
      expect(resultado?.codUsuario).toBe(COD_USUARIO_TESTE);
      expect(resultado?.chave).toBe(CHAVE_PARAMETRO_TESTE);

      // Verificar a query
      const [queryChamada, parametros] = (sqlServerService.executeSQL as jest.Mock).mock.calls[0];
      expect(queryChamada).toContain('TSIPAR');
      expect(queryChamada).toContain('CODUSU = @param1');
      expect(queryChamada).toContain('CHAVE = @param2');
      expect(parametros).toEqual([COD_USUARIO_TESTE, CHAVE_PARAMETRO_TESTE]);
    });

    it('deve retornar null quando chave nao existir', async () => {
      // Arrange
      const chaveInexistente = 'CHAVE_INEXISTENTE';
      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue([]);

      // Act
      const resultado = await repositorio.buscarPorChave(COD_USUARIO_TESTE, chaveInexistente, TOKEN_TESTE);

      // Assert
      expect(resultado).toBeNull();
    });

    it('deve retornar null quando usuario nao existir', async () => {
      // Arrange
      const codUsuarioInexistente = 99999;
      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue([]);

      // Act
      const resultado = await repositorio.buscarPorChave(codUsuarioInexistente, CHAVE_PARAMETRO_TESTE, TOKEN_TESTE);

      // Assert
      expect(resultado).toBeNull();
    });

    it('deve retornar null quando resultado estiver vazio', async () => {
      // Arrange
      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(null);

      // Act
      const resultado = await repositorio.buscarPorChave(COD_USUARIO_TESTE, CHAVE_PARAMETRO_TESTE, TOKEN_TESTE);

      // Assert
      expect(resultado).toBeNull();
    });
  });

  describe('buscarParametrosAtivos', () => {
    it('deve retornar apenas parametros booleanos ativos (valor S)', async () => {
      // Arrange
      const dadosRetornadosBanco = [
        {
          codUsuario: COD_USUARIO_TESTE,
          chave: 'MOSTRA_GRID',
          valor: 'S',
          tipo: 'B',
          descricao: 'Exibir grid',
        },
        {
          codUsuario: COD_USUARIO_TESTE,
          chave: 'PERMITE_EDICAO',
          valor: 'S',
          tipo: 'B',
          descricao: 'Permitir edicao',
        },
      ];

      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosRetornadosBanco);

      // Act
      const resultado = await repositorio.buscarParametrosAtivos(COD_USUARIO_TESTE, TOKEN_TESTE);

      // Assert
      expect(resultado).toHaveLength(2);
      resultado.forEach((param) => {
        expect(param.tipo).toBe('B');
        expect(param.valor).toBe('S');
        expect(param.obterValorBooleano()).toBe(true);
      });

      // Verificar a query
      const [queryChamada, parametros] = (sqlServerService.executeSQL as jest.Mock).mock.calls[0];
      expect(queryChamada).toContain('TSIPAR');
      expect(queryChamada).toContain("TIPO = 'B'");
      expect(queryChamada).toContain("VALOR = 'S'");
      expect(parametros).toEqual([COD_USUARIO_TESTE]);
    });

    it('deve retornar lista vazia quando usuario nao tiver parametros ativos', async () => {
      // Arrange
      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue([]);

      // Act
      const resultado = await repositorio.buscarParametrosAtivos(COD_USUARIO_TESTE, TOKEN_TESTE);

      // Assert
      expect(resultado).toHaveLength(0);
    });

    it('deve retornar parametros ordenados por chave', async () => {
      // Arrange
      const dadosRetornadosBanco = [
        {
          codUsuario: COD_USUARIO_TESTE,
          chave: 'ACESSAR_MODULO_A',
          valor: 'S',
          tipo: 'B',
          descricao: 'Modulo A',
        },
        {
          codUsuario: COD_USUARIO_TESTE,
          chave: 'ACESSAR_MODULO_B',
          valor: 'S',
          tipo: 'B',
          descricao: 'Modulo B',
        },
      ];

      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosRetornadosBanco);

      // Act
      await repositorio.buscarParametrosAtivos(COD_USUARIO_TESTE, TOKEN_TESTE);

      // Assert
      const [queryChamada] = (sqlServerService.executeSQL as jest.Mock).mock.calls[0];
      expect(queryChamada).toContain('ORDER BY CHAVE');
    });
  });

  describe('tratamento de erros', () => {
    it('deve lancar erro quando falhar ao mapear dados invalidos', async () => {
      // Arrange - Dados com codUsuario invalido
      const dadosInvalidos = [
        {
          codUsuario: 0, // Invalido
          chave: 'PARAM',
          valor: 'S',
          tipo: 'B',
          descricao: 'Descricao',
        },
      ];

      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosInvalidos);

      // Act & Assert
      await expect(repositorio.buscarPorUsuario(COD_USUARIO_TESTE, TOKEN_TESTE)).rejects.toThrow(
        'Erro ao mapear parametro',
      );
    });

    it('deve lancar erro quando falhar ao mapear dados com chave vazia', async () => {
      // Arrange - Dados com chave vazia
      const dadosInvalidos = [
        {
          codUsuario: COD_USUARIO_TESTE,
          chave: '', // Invalido
          valor: 'S',
          tipo: 'B',
          descricao: 'Descricao',
        },
      ];

      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosInvalidos);

      // Act & Assert
      await expect(repositorio.buscarPorUsuario(COD_USUARIO_TESTE, TOKEN_TESTE)).rejects.toThrow(
        'Erro ao mapear parametro',
      );
    });

    it('deve lancar erro quando banco de dados falhar', async () => {
      // Arrange
      const erroBanco = new Error('Falha na conexao com banco TESTE');
      (sqlServerService.executeSQL as jest.Mock).mockRejectedValue(erroBanco);

      // Act & Assert
      await expect(repositorio.buscarPorUsuario(COD_USUARIO_TESTE, TOKEN_TESTE)).rejects.toThrow(
        'Falha na conexao com banco TESTE',
      );
    });

    it('deve lancar erro quando timeout na conexao', async () => {
      // Arrange
      const erroTimeout = new Error('Connection timeout');
      (sqlServerService.executeSQL as jest.Mock).mockRejectedValue(erroTimeout);

      // Act & Assert
      await expect(repositorio.buscarPorChave(COD_USUARIO_TESTE, CHAVE_PARAMETRO_TESTE, TOKEN_TESTE)).rejects.toThrow(
        'Connection timeout',
      );
    });
  });

  describe('validacao de campos', () => {
    it('deve converter chave para maiusculo ao mapear', async () => {
      // Arrange
      const dadosRetornadosBanco = [
        {
          codUsuario: COD_USUARIO_TESTE,
          chave: 'parametro_minusculo',
          valor: 'S',
          tipo: 'B',
          descricao: 'Descricao',
        },
      ];

      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosRetornadosBanco);

      // Act
      const resultado = await repositorio.buscarPorUsuario(COD_USUARIO_TESTE, TOKEN_TESTE);

      // Assert
      expect(resultado[0].chave).toBe('PARAMETRO_MINUSCULO');
    });

    it('deve fazer trim na descricao ao mapear', async () => {
      // Arrange
      const dadosRetornadosBanco = [
        {
          codUsuario: COD_USUARIO_TESTE,
          chave: 'PARAM',
          valor: 'S',
          tipo: 'B',
          descricao: '  Descricao com espacos  ',
        },
      ];

      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosRetornadosBanco);

      // Act
      const resultado = await repositorio.buscarPorUsuario(COD_USUARIO_TESTE, TOKEN_TESTE);

      // Assert
      expect(resultado[0].descricao).toBe('Descricao com espacos');
    });
  });
});
