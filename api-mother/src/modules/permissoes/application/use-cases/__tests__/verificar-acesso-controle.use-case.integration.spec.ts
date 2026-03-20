/**
 * Testes de Integração para VerificarAcessoControleUseCase
 *
 * IMPORTANTE: Estes testes usam o banco TESTE, NUNCA usar PROD em desenvolvimento.
 *
 * Os testes validam o fluxo completo do caso de uso de verificacao de acesso
 * a um controle especifico da interface.
 */
import { Test, TestingModule } from '@nestjs/testing';
import {
  VerificarAcessoControleUseCase,
  VerificarAcessoControleEntrada,
  VerificarAcessoControleResultado,
} from '../verificar-acesso-controle/verificar-acesso-controle.use-case';
import {
  IRepositorioControleUI,
  REPOSITORIO_CONTROLE_UI,
} from '../../../domain/repositories/controle-ui.repository.interface';

describe('VerificarAcessoControleUseCase (Integration)', () => {
  let useCase: VerificarAcessoControleUseCase;
  let repositorioMock: jest.Mocked<IRepositorioControleUI>;
  let moduloTeste: TestingModule;

  // Dados de teste - usar valores que existem no banco TESTE
  const COD_USUARIO_TESTE = 1;
  const COD_TELA_TESTE = 100;
  const NOME_CONTROLE_TESTE = 'btnSalvar';
  const TOKEN_TESTE = 'token-teste-integracao';

  beforeAll(async () => {
    // Criar mock do repositorio
    repositorioMock = {
      buscarPorUsuarioETela: jest.fn(),
      buscarPorUsuario: jest.fn(),
      verificarAcesso: jest.fn(),
    };

    moduloTeste = await Test.createTestingModule({
      providers: [
        VerificarAcessoControleUseCase,
        {
          provide: REPOSITORIO_CONTROLE_UI,
          useValue: repositorioMock,
        },
      ],
    }).compile();

    useCase = moduloTeste.get<VerificarAcessoControleUseCase>(VerificarAcessoControleUseCase);
  });

  afterAll(async () => {
    await moduloTeste.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executar', () => {
    it('deve retornar temAcesso true quando usuario tem permissao', async () => {
      // Arrange
      repositorioMock.verificarAcesso.mockResolvedValue(true);

      const entrada: VerificarAcessoControleEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        nomeControle: NOME_CONTROLE_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado: VerificarAcessoControleResultado = await useCase.executar(entrada);

      // Assert
      expect(resultado).toBeDefined();
      expect(resultado.codUsuario).toBe(COD_USUARIO_TESTE);
      expect(resultado.codTela).toBe(COD_TELA_TESTE);
      expect(resultado.nomeControle).toBe(NOME_CONTROLE_TESTE);
      expect(resultado.temAcesso).toBe(true);

      // Verificar que o repositorio foi chamado com os parametros corretos
      expect(repositorioMock.verificarAcesso).toHaveBeenCalledWith(
        COD_USUARIO_TESTE,
        COD_TELA_TESTE,
        NOME_CONTROLE_TESTE,
        TOKEN_TESTE,
      );
    });

    it('deve retornar temAcesso false quando usuario nao tem permissao', async () => {
      // Arrange
      repositorioMock.verificarAcesso.mockResolvedValue(false);

      const entrada: VerificarAcessoControleEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        nomeControle: 'btnProibido',
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.temAcesso).toBe(false);
      expect(resultado.nomeControle).toBe('btnProibido');
    });

    it('deve retornar temAcesso false quando controle nao existe', async () => {
      // Arrange
      repositorioMock.verificarAcesso.mockResolvedValue(false);

      const entrada: VerificarAcessoControleEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        nomeControle: 'controleInexistente',
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.temAcesso).toBe(false);
    });

    it('deve retornar temAcesso false quando usuario nao existe', async () => {
      // Arrange
      const codUsuarioInexistente = 99999;
      repositorioMock.verificarAcesso.mockResolvedValue(false);

      const entrada: VerificarAcessoControleEntrada = {
        codUsuario: codUsuarioInexistente,
        codTela: COD_TELA_TESTE,
        nomeControle: NOME_CONTROLE_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.temAcesso).toBe(false);
      expect(resultado.codUsuario).toBe(codUsuarioInexistente);
    });

    it('deve retornar temAcesso false quando tela nao existe', async () => {
      // Arrange
      const codTelaInexistente = 99999;
      repositorioMock.verificarAcesso.mockResolvedValue(false);

      const entrada: VerificarAcessoControleEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: codTelaInexistente,
        nomeControle: NOME_CONTROLE_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.temAcesso).toBe(false);
      expect(resultado.codTela).toBe(codTelaInexistente);
    });

    it('deve retornar temAcesso false quando controle esta desabilitado', async () => {
      // Arrange
      // O repositorio retorna false porque o controle existe mas HABILITADO = 'N'
      repositorioMock.verificarAcesso.mockResolvedValue(false);

      const entrada: VerificarAcessoControleEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        nomeControle: 'btnDesabilitado',
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.temAcesso).toBe(false);
    });

    it('deve retornar temAcesso false quando controle esta invisivel', async () => {
      // Arrange
      // O repositorio retorna false porque o controle existe mas VISIVEL = 'N'
      repositorioMock.verificarAcesso.mockResolvedValue(false);

      const entrada: VerificarAcessoControleEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        nomeControle: 'btnInvisivel',
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.temAcesso).toBe(false);
    });

    it('deve verificar multiplos controles em sequencia', async () => {
      // Arrange
      repositorioMock.verificarAcesso
        .mockResolvedValueOnce(true) // Primeiro controle - tem acesso
        .mockResolvedValueOnce(false) // Segundo controle - sem acesso
        .mockResolvedValueOnce(true); // Terceiro controle - tem acesso

      const controles = ['btnSalvar', 'btnExcluir', 'btnEditar'];

      // Act
      const resultados = [];
      for (const nomeControle of controles) {
        const entrada: VerificarAcessoControleEntrada = {
          codUsuario: COD_USUARIO_TESTE,
          codTela: COD_TELA_TESTE,
          nomeControle,
          tokenUsuario: TOKEN_TESTE,
        };
        resultados.push(await useCase.executar(entrada));
      }

      // Assert
      expect(resultados[0].temAcesso).toBe(true);
      expect(resultados[0].nomeControle).toBe('btnSalvar');

      expect(resultados[1].temAcesso).toBe(false);
      expect(resultados[1].nomeControle).toBe('btnExcluir');

      expect(resultados[2].temAcesso).toBe(true);
      expect(resultados[2].nomeControle).toBe('btnEditar');

      expect(repositorioMock.verificarAcesso).toHaveBeenCalledTimes(3);
    });

    it('deve manter dados de entrada no resultado', async () => {
      // Arrange
      repositorioMock.verificarAcesso.mockResolvedValue(true);

      const entrada: VerificarAcessoControleEntrada = {
        codUsuario: 42,
        codTela: 200,
        nomeControle: 'meuControle',
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.codUsuario).toBe(42);
      expect(resultado.codTela).toBe(200);
      expect(resultado.nomeControle).toBe('meuControle');
    });
  });

  describe('tratamento de erros', () => {
    it('deve propagar erro quando repositorio falhar', async () => {
      // Arrange
      const erroRepositorio = new Error('Erro ao verificar acesso no banco TESTE');
      repositorioMock.verificarAcesso.mockRejectedValue(erroRepositorio);

      const entrada: VerificarAcessoControleEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        nomeControle: NOME_CONTROLE_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act & Assert
      await expect(useCase.executar(entrada)).rejects.toThrow('Erro ao verificar acesso no banco TESTE');
    });

    it('deve propagar erro de timeout do banco', async () => {
      // Arrange
      const erroTimeout = new Error('Connection timeout');
      repositorioMock.verificarAcesso.mockRejectedValue(erroTimeout);

      const entrada: VerificarAcessoControleEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        nomeControle: NOME_CONTROLE_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act & Assert
      await expect(useCase.executar(entrada)).rejects.toThrow('Connection timeout');
    });

    it('deve propagar erro de autenticacao', async () => {
      // Arrange
      const erroAuth = new Error('Token invalido ou expirado');
      repositorioMock.verificarAcesso.mockRejectedValue(erroAuth);

      const entrada: VerificarAcessoControleEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        nomeControle: NOME_CONTROLE_TESTE,
        tokenUsuario: 'token-invalido',
      };

      // Act & Assert
      await expect(useCase.executar(entrada)).rejects.toThrow('Token invalido ou expirado');
    });
  });

  describe('cenarios de borda', () => {
    it('deve lidar com nome de controle com espacos', async () => {
      // Arrange
      repositorioMock.verificarAcesso.mockResolvedValue(true);

      const entrada: VerificarAcessoControleEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        nomeControle: 'btn Com Espacos',
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.nomeControle).toBe('btn Com Espacos');
      expect(repositorioMock.verificarAcesso).toHaveBeenCalledWith(
        COD_USUARIO_TESTE,
        COD_TELA_TESTE,
        'btn Com Espacos',
        TOKEN_TESTE,
      );
    });

    it('deve lidar com nome de controle com caracteres especiais', async () => {
      // Arrange
      repositorioMock.verificarAcesso.mockResolvedValue(true);

      const entrada: VerificarAcessoControleEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        nomeControle: 'btn_Teste-123',
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.nomeControle).toBe('btn_Teste-123');
    });

    it('deve verificar acesso para codigo de usuario zero', async () => {
      // Arrange
      repositorioMock.verificarAcesso.mockResolvedValue(false);

      const entrada: VerificarAcessoControleEntrada = {
        codUsuario: 0,
        codTela: COD_TELA_TESTE,
        nomeControle: NOME_CONTROLE_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.temAcesso).toBe(false);
      expect(resultado.codUsuario).toBe(0);
    });

    it('deve verificar acesso para codigo de tela zero', async () => {
      // Arrange
      repositorioMock.verificarAcesso.mockResolvedValue(false);

      const entrada: VerificarAcessoControleEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: 0,
        nomeControle: NOME_CONTROLE_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.temAcesso).toBe(false);
      expect(resultado.codTela).toBe(0);
    });
  });
});
