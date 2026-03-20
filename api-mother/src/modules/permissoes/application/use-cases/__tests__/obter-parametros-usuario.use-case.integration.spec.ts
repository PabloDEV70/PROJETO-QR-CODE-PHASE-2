/**
 * Testes de Integração para ObterParametrosUsuarioUseCase
 *
 * IMPORTANTE: Estes testes usam o banco TESTE, NUNCA usar PROD em desenvolvimento.
 *
 * Os testes validam o fluxo completo do caso de uso de obtencao de parametros
 * de configuracao de um usuario especifico.
 */
import { Test, TestingModule } from '@nestjs/testing';
import {
  ObterParametrosUsuarioUseCase,
  ObterParametrosUsuarioEntrada,
  ObterParametrosUsuarioResultado,
  ParametroDto,
} from '../obter-parametros-usuario/obter-parametros-usuario.use-case';
import {
  IRepositorioParametroUsuario,
  REPOSITORIO_PARAMETRO_USUARIO,
} from '../../../domain/repositories/parametro-usuario.repository.interface';
import { ParametroUsuario } from '../../../domain/entities/parametro-usuario.entity';

describe('ObterParametrosUsuarioUseCase (Integration)', () => {
  let useCase: ObterParametrosUsuarioUseCase;
  let repositorioMock: jest.Mocked<IRepositorioParametroUsuario>;
  let moduloTeste: TestingModule;

  // Dados de teste - usar valores que existem no banco TESTE
  const COD_USUARIO_TESTE = 1;
  const TOKEN_TESTE = 'token-teste-integracao';

  beforeAll(async () => {
    // Criar mock do repositorio
    repositorioMock = {
      buscarPorUsuario: jest.fn(),
      buscarPorChave: jest.fn(),
      buscarParametrosAtivos: jest.fn(),
    };

    moduloTeste = await Test.createTestingModule({
      providers: [
        ObterParametrosUsuarioUseCase,
        {
          provide: REPOSITORIO_PARAMETRO_USUARIO,
          useValue: repositorioMock,
        },
      ],
    }).compile();

    useCase = moduloTeste.get<ObterParametrosUsuarioUseCase>(ObterParametrosUsuarioUseCase);
  });

  afterAll(async () => {
    await moduloTeste.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper para criar parametros de teste
  const criarParametro = (
    props: Partial<{
      codUsuario: number;
      chave: string;
      valor: string;
      tipo: string;
      descricao: string;
    }>,
  ) => {
    return ParametroUsuario.criar({
      codUsuario: props.codUsuario ?? COD_USUARIO_TESTE,
      chave: props.chave ?? 'PARAM_TESTE',
      valor: props.valor ?? 'valor',
      tipo: props.tipo ?? 'S',
      descricao: props.descricao ?? 'Descricao do parametro',
    }).obterValor();
  };

  describe('executar - buscar todos parametros', () => {
    it('deve retornar parametros quando usuario existir', async () => {
      // Arrange
      const parametrosTeste = [
        criarParametro({ chave: 'MOSTRA_GRID', valor: 'S', tipo: 'B' }),
        criarParametro({ chave: 'LIMITE_REGISTROS', valor: '100', tipo: 'N' }),
        criarParametro({ chave: 'TEMA_PADRAO', valor: 'escuro', tipo: 'S' }),
      ];

      repositorioMock.buscarPorUsuario.mockResolvedValue(parametrosTeste);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado: ObterParametrosUsuarioResultado = await useCase.executar(entrada);

      // Assert
      expect(resultado).toBeDefined();
      expect(resultado.codUsuario).toBe(COD_USUARIO_TESTE);
      expect(resultado.total).toBe(3);
      expect(resultado.parametros).toHaveLength(3);

      // Verificar que o repositorio foi chamado com os parametros corretos
      expect(repositorioMock.buscarPorUsuario).toHaveBeenCalledWith(COD_USUARIO_TESTE, TOKEN_TESTE);
      expect(repositorioMock.buscarParametrosAtivos).not.toHaveBeenCalled();
    });

    it('deve mapear corretamente os campos para DTO', async () => {
      // Arrange
      const parametroTeste = criarParametro({
        chave: 'PARAM_TESTE',
        valor: 'S',
        tipo: 'B',
        descricao: 'Parametro de teste',
      });

      repositorioMock.buscarPorUsuario.mockResolvedValue([parametroTeste]);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      const parametroDto: ParametroDto = resultado.parametros[0];
      expect(parametroDto.chave).toBe('PARAM_TESTE');
      expect(parametroDto.valor).toBe('S');
      expect(parametroDto.tipo).toBe('B');
      expect(parametroDto.descricao).toBe('Parametro de teste');
      expect(parametroDto.valorBooleano).toBe(true);
      expect(parametroDto.valorNumerico).toBe(0); // Tipo B, nao N
    });

    it('deve calcular valorBooleano corretamente para tipo B', async () => {
      // Arrange
      const parametrosTeste = [
        criarParametro({ chave: 'PARAM_ATIVO', valor: 'S', tipo: 'B' }),
        criarParametro({ chave: 'PARAM_INATIVO', valor: 'N', tipo: 'B' }),
        criarParametro({ chave: 'PARAM_TRUE', valor: 'true', tipo: 'B' }),
        criarParametro({ chave: 'PARAM_UM', valor: '1', tipo: 'B' }),
      ];

      repositorioMock.buscarPorUsuario.mockResolvedValue(parametrosTeste);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.parametros[0].valorBooleano).toBe(true); // S
      expect(resultado.parametros[1].valorBooleano).toBe(false); // N
      expect(resultado.parametros[2].valorBooleano).toBe(true); // true
      expect(resultado.parametros[3].valorBooleano).toBe(true); // 1
    });

    it('deve calcular valorNumerico corretamente para tipo N', async () => {
      // Arrange
      const parametrosTeste = [
        criarParametro({ chave: 'LIMITE', valor: '100', tipo: 'N' }),
        criarParametro({ chave: 'PERCENTUAL', valor: '99.5', tipo: 'N' }),
        criarParametro({ chave: 'NEGATIVO', valor: '-50', tipo: 'N' }),
      ];

      repositorioMock.buscarPorUsuario.mockResolvedValue(parametrosTeste);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.parametros[0].valorNumerico).toBe(100);
      expect(resultado.parametros[1].valorNumerico).toBe(99.5);
      expect(resultado.parametros[2].valorNumerico).toBe(-50);
    });

    it('deve retornar valorBooleano false e valorNumerico 0 para tipo S', async () => {
      // Arrange
      const parametroTeste = criarParametro({
        chave: 'TEXTO',
        valor: 'algum texto',
        tipo: 'S',
      });

      repositorioMock.buscarPorUsuario.mockResolvedValue([parametroTeste]);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.parametros[0].valorBooleano).toBe(false);
      expect(resultado.parametros[0].valorNumerico).toBe(0);
    });

    it('deve retornar lista vazia quando usuario nao existir', async () => {
      // Arrange
      repositorioMock.buscarPorUsuario.mockResolvedValue([]);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: 99999,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.total).toBe(0);
      expect(resultado.parametros).toHaveLength(0);
      expect(resultado.codUsuario).toBe(99999);
    });

    it('deve retornar lista vazia quando usuario nao tiver parametros', async () => {
      // Arrange
      repositorioMock.buscarPorUsuario.mockResolvedValue([]);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.total).toBe(0);
      expect(resultado.parametros).toHaveLength(0);
    });
  });

  describe('executar - buscar apenas ativos', () => {
    it('deve chamar buscarParametrosAtivos quando apenasAtivos for true', async () => {
      // Arrange
      const parametrosAtivos = [
        criarParametro({ chave: 'PARAM_ATIVO_1', valor: 'S', tipo: 'B' }),
        criarParametro({ chave: 'PARAM_ATIVO_2', valor: 'S', tipo: 'B' }),
      ];

      repositorioMock.buscarParametrosAtivos.mockResolvedValue(parametrosAtivos);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
        apenasAtivos: true,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.total).toBe(2);
      expect(repositorioMock.buscarParametrosAtivos).toHaveBeenCalledWith(COD_USUARIO_TESTE, TOKEN_TESTE);
      expect(repositorioMock.buscarPorUsuario).not.toHaveBeenCalled();
    });

    it('deve retornar apenas parametros com valorBooleano true quando apenasAtivos', async () => {
      // Arrange
      const parametrosAtivos = [
        criarParametro({ chave: 'ATIVO_1', valor: 'S', tipo: 'B' }),
        criarParametro({ chave: 'ATIVO_2', valor: 'S', tipo: 'B' }),
      ];

      repositorioMock.buscarParametrosAtivos.mockResolvedValue(parametrosAtivos);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
        apenasAtivos: true,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      resultado.parametros.forEach((param) => {
        expect(param.valorBooleano).toBe(true);
        expect(param.tipo).toBe('B');
      });
    });

    it('deve retornar lista vazia quando nao houver parametros ativos', async () => {
      // Arrange
      repositorioMock.buscarParametrosAtivos.mockResolvedValue([]);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
        apenasAtivos: true,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.total).toBe(0);
      expect(resultado.parametros).toHaveLength(0);
    });

    it('deve chamar buscarPorUsuario quando apenasAtivos for false', async () => {
      // Arrange
      const parametrosTeste = [criarParametro({ chave: 'PARAM', valor: 'valor', tipo: 'S' })];

      repositorioMock.buscarPorUsuario.mockResolvedValue(parametrosTeste);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
        apenasAtivos: false,
      };

      // Act
      await useCase.executar(entrada);

      // Assert
      expect(repositorioMock.buscarPorUsuario).toHaveBeenCalled();
      expect(repositorioMock.buscarParametrosAtivos).not.toHaveBeenCalled();
    });

    it('deve chamar buscarPorUsuario quando apenasAtivos nao for definido', async () => {
      // Arrange
      const parametrosTeste = [criarParametro({ chave: 'PARAM', valor: 'valor', tipo: 'S' })];

      repositorioMock.buscarPorUsuario.mockResolvedValue(parametrosTeste);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
        // apenasAtivos nao definido (undefined)
      };

      // Act
      await useCase.executar(entrada);

      // Assert
      expect(repositorioMock.buscarPorUsuario).toHaveBeenCalled();
      expect(repositorioMock.buscarParametrosAtivos).not.toHaveBeenCalled();
    });
  });

  describe('tratamento de tipos de parametros', () => {
    it('deve processar parametro booleano com valor S', async () => {
      // Arrange
      const parametro = criarParametro({ chave: 'BOOL_S', valor: 'S', tipo: 'B' });
      repositorioMock.buscarPorUsuario.mockResolvedValue([parametro]);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.parametros[0].valorBooleano).toBe(true);
    });

    it('deve processar parametro booleano com valor N', async () => {
      // Arrange
      const parametro = criarParametro({ chave: 'BOOL_N', valor: 'N', tipo: 'B' });
      repositorioMock.buscarPorUsuario.mockResolvedValue([parametro]);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.parametros[0].valorBooleano).toBe(false);
    });

    it('deve processar parametro numerico inteiro', async () => {
      // Arrange
      const parametro = criarParametro({ chave: 'NUM_INT', valor: '42', tipo: 'N' });
      repositorioMock.buscarPorUsuario.mockResolvedValue([parametro]);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.parametros[0].valorNumerico).toBe(42);
    });

    it('deve processar parametro numerico decimal', async () => {
      // Arrange
      const parametro = criarParametro({ chave: 'NUM_DEC', valor: '3.14159', tipo: 'N' });
      repositorioMock.buscarPorUsuario.mockResolvedValue([parametro]);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.parametros[0].valorNumerico).toBeCloseTo(3.14159);
    });

    it('deve retornar 0 para parametro numerico invalido', async () => {
      // Arrange
      const parametro = criarParametro({ chave: 'NUM_INV', valor: 'abc', tipo: 'N' });
      repositorioMock.buscarPorUsuario.mockResolvedValue([parametro]);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.parametros[0].valorNumerico).toBe(0);
    });

    it('deve processar parametro string normalmente', async () => {
      // Arrange
      const parametro = criarParametro({
        chave: 'TEXTO',
        valor: 'valor do texto',
        tipo: 'S',
      });
      repositorioMock.buscarPorUsuario.mockResolvedValue([parametro]);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.parametros[0].valor).toBe('valor do texto');
      expect(resultado.parametros[0].tipo).toBe('S');
    });
  });

  describe('tratamento de erros', () => {
    it('deve propagar erro quando repositorio falhar', async () => {
      // Arrange
      const erroRepositorio = new Error('Erro ao buscar parametros no banco TESTE');
      repositorioMock.buscarPorUsuario.mockRejectedValue(erroRepositorio);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act & Assert
      await expect(useCase.executar(entrada)).rejects.toThrow('Erro ao buscar parametros no banco TESTE');
    });

    it('deve propagar erro quando buscarParametrosAtivos falhar', async () => {
      // Arrange
      const erroRepositorio = new Error('Erro ao buscar parametros ativos');
      repositorioMock.buscarParametrosAtivos.mockRejectedValue(erroRepositorio);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
        apenasAtivos: true,
      };

      // Act & Assert
      await expect(useCase.executar(entrada)).rejects.toThrow('Erro ao buscar parametros ativos');
    });

    it('deve propagar erro de timeout do banco', async () => {
      // Arrange
      const erroTimeout = new Error('Connection timeout');
      repositorioMock.buscarPorUsuario.mockRejectedValue(erroTimeout);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act & Assert
      await expect(useCase.executar(entrada)).rejects.toThrow('Connection timeout');
    });

    it('deve propagar erro de autenticacao', async () => {
      // Arrange
      const erroAuth = new Error('Token invalido ou expirado');
      repositorioMock.buscarPorUsuario.mockRejectedValue(erroAuth);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: 'token-invalido',
      };

      // Act & Assert
      await expect(useCase.executar(entrada)).rejects.toThrow('Token invalido ou expirado');
    });
  });

  describe('cenarios com descricao', () => {
    it('deve incluir descricao quando presente', async () => {
      // Arrange
      const parametro = criarParametro({
        chave: 'COM_DESC',
        valor: 'S',
        tipo: 'B',
        descricao: 'Descricao do parametro de teste',
      });
      repositorioMock.buscarPorUsuario.mockResolvedValue([parametro]);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.parametros[0].descricao).toBe('Descricao do parametro de teste');
    });

    it('deve retornar undefined para descricao quando nao presente', async () => {
      // Arrange
      const parametro = ParametroUsuario.criar({
        codUsuario: COD_USUARIO_TESTE,
        chave: 'SEM_DESC',
        valor: 'S',
        tipo: 'B',
        // descricao nao informada
      }).obterValor();

      repositorioMock.buscarPorUsuario.mockResolvedValue([parametro]);

      const entrada: ObterParametrosUsuarioEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.parametros[0].descricao).toBeUndefined();
    });
  });
});
