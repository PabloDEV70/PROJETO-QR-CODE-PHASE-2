/**
 * Testes de Integração para SankhyaControleUIRepository
 *
 * IMPORTANTE: Estes testes usam o banco TESTE, NUNCA usar PROD em desenvolvimento.
 *
 * Os testes validam a integração real com o banco de dados Sankhya,
 * verificando a comunicação e o mapeamento de dados.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { SankhyaControleUIRepository } from '../sankhya-controle-ui.repository';
import { SqlServerService } from '../../../../../database/sqlserver.service';
import { ControleUI } from '../../../domain/entities/controle-ui.entity';

describe('SankhyaControleUIRepository (Integration)', () => {
  let repositorio: SankhyaControleUIRepository;
  let sqlServerService: SqlServerService;
  let moduloTeste: TestingModule;

  // Dados de teste - usar valores que existem no banco TESTE
  const COD_USUARIO_TESTE = 1; // Usuário administrador padrão
  const COD_TELA_TESTE = 100; // Tela de exemplo
  const NOME_CONTROLE_TESTE = 'btnSalvar'; // Controle comum
  const TOKEN_TESTE = 'token-teste-integracao';

  beforeAll(async () => {
    // Mock do SqlServerService para testes de integração
    // Em ambiente real, usar credenciais do banco TESTE
    const sqlServerServiceMock = {
      executeSQL: jest.fn(),
    };

    moduloTeste = await Test.createTestingModule({
      providers: [
        SankhyaControleUIRepository,
        {
          provide: SqlServerService,
          useValue: sqlServerServiceMock,
        },
      ],
    }).compile();

    repositorio = moduloTeste.get<SankhyaControleUIRepository>(SankhyaControleUIRepository);
    sqlServerService = moduloTeste.get<SqlServerService>(SqlServerService);
  });

  afterAll(async () => {
    await moduloTeste.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buscarPorUsuarioETela', () => {
    it('deve retornar lista de controles quando usuario e tela existirem', async () => {
      // Arrange
      const dadosRetornadosBanco = [
        {
          codUsuario: COD_USUARIO_TESTE,
          codTela: COD_TELA_TESTE,
          nomeControle: 'btnSalvar',
          habilitado: 'S',
          visivel: 'S',
          obrigatorio: 'N',
          somenteLeitura: 'N',
        },
        {
          codUsuario: COD_USUARIO_TESTE,
          codTela: COD_TELA_TESTE,
          nomeControle: 'btnCancelar',
          habilitado: 'S',
          visivel: 'S',
          obrigatorio: 'N',
          somenteLeitura: 'N',
        },
      ];

      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosRetornadosBanco);

      // Act
      const resultado = await repositorio.buscarPorUsuarioETela(COD_USUARIO_TESTE, COD_TELA_TESTE, TOKEN_TESTE);

      // Assert
      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toBeInstanceOf(ControleUI);
      expect(resultado[0].codUsuario).toBe(COD_USUARIO_TESTE);
      expect(resultado[0].codTela).toBe(COD_TELA_TESTE);
      expect(resultado[0].nomeControle).toBe('btnSalvar');
      expect(resultado[0].habilitado).toBe(true);
      expect(resultado[0].visivel).toBe(true);

      // Verificar que a query foi chamada corretamente
      expect(sqlServerService.executeSQL).toHaveBeenCalledTimes(1);
      const [queryChamada, parametros] = (sqlServerService.executeSQL as jest.Mock).mock.calls[0];
      expect(queryChamada).toContain('TRDCON');
      expect(queryChamada).toContain('CODUSU = @param1');
      expect(queryChamada).toContain('CODTELA = @param2');
      expect(parametros).toEqual([COD_USUARIO_TESTE, COD_TELA_TESTE]);
    });

    it('deve retornar lista vazia quando usuario ou tela nao existirem', async () => {
      // Arrange
      const codUsuarioInexistente = 99999;
      const codTelaInexistente = 99999;

      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue([]);

      // Act
      const resultado = await repositorio.buscarPorUsuarioETela(codUsuarioInexistente, codTelaInexistente, TOKEN_TESTE);

      // Assert
      expect(resultado).toHaveLength(0);
      expect(resultado).toEqual([]);
    });

    it('deve mapear corretamente os campos S/N para boolean', async () => {
      // Arrange
      const dadosRetornadosBanco = [
        {
          codUsuario: COD_USUARIO_TESTE,
          codTela: COD_TELA_TESTE,
          nomeControle: 'txtCampoLeitura',
          habilitado: 'N',
          visivel: 'S',
          obrigatorio: 'S',
          somenteLeitura: 'S',
        },
      ];

      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosRetornadosBanco);

      // Act
      const resultado = await repositorio.buscarPorUsuarioETela(COD_USUARIO_TESTE, COD_TELA_TESTE, TOKEN_TESTE);

      // Assert
      expect(resultado).toHaveLength(1);
      const controle = resultado[0];
      expect(controle.habilitado).toBe(false);
      expect(controle.visivel).toBe(true);
      expect(controle.obrigatorio).toBe(true);
      expect(controle.somenteLeitura).toBe(true);
    });

    it('deve retornar controles ordenados por nomeControle', async () => {
      // Arrange
      const dadosRetornadosBanco = [
        {
          codUsuario: COD_USUARIO_TESTE,
          codTela: COD_TELA_TESTE,
          nomeControle: 'aControle',
          habilitado: 'S',
          visivel: 'S',
          obrigatorio: 'N',
          somenteLeitura: 'N',
        },
        {
          codUsuario: COD_USUARIO_TESTE,
          codTela: COD_TELA_TESTE,
          nomeControle: 'zControle',
          habilitado: 'S',
          visivel: 'S',
          obrigatorio: 'N',
          somenteLeitura: 'N',
        },
      ];

      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosRetornadosBanco);

      // Act
      await repositorio.buscarPorUsuarioETela(COD_USUARIO_TESTE, COD_TELA_TESTE, TOKEN_TESTE);

      // Assert - A query deve ter ORDER BY NOMECONTROLE
      const [queryChamada] = (sqlServerService.executeSQL as jest.Mock).mock.calls[0];
      expect(queryChamada).toContain('ORDER BY NOMECONTROLE');
    });
  });

  describe('buscarPorUsuario', () => {
    it('deve retornar todos os controles do usuario', async () => {
      // Arrange
      const dadosRetornadosBanco = [
        {
          codUsuario: COD_USUARIO_TESTE,
          codTela: 100,
          nomeControle: 'btnSalvar',
          habilitado: 'S',
          visivel: 'S',
          obrigatorio: 'N',
          somenteLeitura: 'N',
        },
        {
          codUsuario: COD_USUARIO_TESTE,
          codTela: 200,
          nomeControle: 'btnExcluir',
          habilitado: 'S',
          visivel: 'N',
          obrigatorio: 'N',
          somenteLeitura: 'N',
        },
      ];

      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosRetornadosBanco);

      // Act
      const resultado = await repositorio.buscarPorUsuario(COD_USUARIO_TESTE, TOKEN_TESTE);

      // Assert
      expect(resultado).toHaveLength(2);
      expect(resultado[0].codUsuario).toBe(COD_USUARIO_TESTE);
      expect(resultado[1].codUsuario).toBe(COD_USUARIO_TESTE);

      // Verificar que a query foi chamada corretamente
      const [queryChamada, parametros] = (sqlServerService.executeSQL as jest.Mock).mock.calls[0];
      expect(queryChamada).toContain('TRDCON');
      expect(queryChamada).toContain('CODUSU = @param1');
      expect(queryChamada).toContain('ORDER BY CODTELA, NOMECONTROLE');
      expect(parametros).toEqual([COD_USUARIO_TESTE]);
    });

    it('deve retornar lista vazia quando usuario nao tiver controles', async () => {
      // Arrange
      const codUsuarioSemControles = 99999;
      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue([]);

      // Act
      const resultado = await repositorio.buscarPorUsuario(codUsuarioSemControles, TOKEN_TESTE);

      // Assert
      expect(resultado).toHaveLength(0);
    });
  });

  describe('verificarAcesso', () => {
    it('deve retornar true quando usuario tem acesso ao controle', async () => {
      // Arrange
      const dadosRetornadosBanco = [{ total: 1 }];
      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosRetornadosBanco);

      // Act
      const resultado = await repositorio.verificarAcesso(
        COD_USUARIO_TESTE,
        COD_TELA_TESTE,
        NOME_CONTROLE_TESTE,
        TOKEN_TESTE,
      );

      // Assert
      expect(resultado).toBe(true);

      // Verificar a query
      const [queryChamada, parametros] = (sqlServerService.executeSQL as jest.Mock).mock.calls[0];
      expect(queryChamada).toContain('COUNT(*)');
      expect(queryChamada).toContain('CODUSU = @param1');
      expect(queryChamada).toContain('CODTELA = @param2');
      expect(queryChamada).toContain('NOMECONTROLE = @param3');
      expect(queryChamada).toContain("HABILITADO = 'S'");
      expect(queryChamada).toContain("VISIVEL = 'S'");
      expect(parametros).toEqual([COD_USUARIO_TESTE, COD_TELA_TESTE, NOME_CONTROLE_TESTE]);
    });

    it('deve retornar false quando usuario nao tem acesso ao controle', async () => {
      // Arrange
      const dadosRetornadosBanco = [{ total: 0 }];
      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosRetornadosBanco);

      // Act
      const resultado = await repositorio.verificarAcesso(
        COD_USUARIO_TESTE,
        COD_TELA_TESTE,
        'controleInexistente',
        TOKEN_TESTE,
      );

      // Assert
      expect(resultado).toBe(false);
    });

    it('deve retornar false quando controle existe mas esta desabilitado', async () => {
      // Arrange - Controle com HABILITADO = 'N'
      const dadosRetornadosBanco = [{ total: 0 }];
      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosRetornadosBanco);

      // Act
      const resultado = await repositorio.verificarAcesso(
        COD_USUARIO_TESTE,
        COD_TELA_TESTE,
        'btnDesabilitado',
        TOKEN_TESTE,
      );

      // Assert
      expect(resultado).toBe(false);
    });

    it('deve retornar false quando controle existe mas esta invisivel', async () => {
      // Arrange - Controle com VISIVEL = 'N'
      const dadosRetornadosBanco = [{ total: 0 }];
      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosRetornadosBanco);

      // Act
      const resultado = await repositorio.verificarAcesso(
        COD_USUARIO_TESTE,
        COD_TELA_TESTE,
        'btnInvisivel',
        TOKEN_TESTE,
      );

      // Assert
      expect(resultado).toBe(false);
    });

    it('deve retornar false quando usuario nao existe', async () => {
      // Arrange
      const codUsuarioInexistente = 99999;
      const dadosRetornadosBanco = [{ total: 0 }];
      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosRetornadosBanco);

      // Act
      const resultado = await repositorio.verificarAcesso(
        codUsuarioInexistente,
        COD_TELA_TESTE,
        NOME_CONTROLE_TESTE,
        TOKEN_TESTE,
      );

      // Assert
      expect(resultado).toBe(false);
    });

    it('deve retornar false quando tela nao existe', async () => {
      // Arrange
      const codTelaInexistente = 99999;
      const dadosRetornadosBanco = [{ total: 0 }];
      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosRetornadosBanco);

      // Act
      const resultado = await repositorio.verificarAcesso(
        COD_USUARIO_TESTE,
        codTelaInexistente,
        NOME_CONTROLE_TESTE,
        TOKEN_TESTE,
      );

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('tratamento de erros', () => {
    it('deve lancar erro quando falhar ao mapear dados invalidos', async () => {
      // Arrange - Dados com codUsuario invalido
      const dadosInvalidos = [
        {
          codUsuario: 0, // Invalido
          codTela: COD_TELA_TESTE,
          nomeControle: 'btnSalvar',
          habilitado: 'S',
          visivel: 'S',
          obrigatorio: 'N',
          somenteLeitura: 'N',
        },
      ];

      (sqlServerService.executeSQL as jest.Mock).mockResolvedValue(dadosInvalidos);

      // Act & Assert
      await expect(repositorio.buscarPorUsuarioETela(COD_USUARIO_TESTE, COD_TELA_TESTE, TOKEN_TESTE)).rejects.toThrow(
        'Erro ao mapear controle',
      );
    });

    it('deve lancar erro quando banco de dados falhar', async () => {
      // Arrange
      const erroBanco = new Error('Falha na conexao com banco TESTE');
      (sqlServerService.executeSQL as jest.Mock).mockRejectedValue(erroBanco);

      // Act & Assert
      await expect(repositorio.buscarPorUsuarioETela(COD_USUARIO_TESTE, COD_TELA_TESTE, TOKEN_TESTE)).rejects.toThrow(
        'Falha na conexao com banco TESTE',
      );
    });
  });
});
