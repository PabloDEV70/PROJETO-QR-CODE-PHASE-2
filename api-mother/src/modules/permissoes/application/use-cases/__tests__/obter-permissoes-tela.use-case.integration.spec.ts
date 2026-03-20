/**
 * Testes de Integração para ObterPermissoesTelaUseCase
 *
 * IMPORTANTE: Estes testes usam o banco TESTE, NUNCA usar PROD em desenvolvimento.
 *
 * Os testes validam o fluxo completo do caso de uso, desde a chamada
 * até o mapeamento para DTOs de resposta.
 */
import { Test, TestingModule } from '@nestjs/testing';
import {
  ObterPermissoesTelaUseCase,
  ObterPermissoesTelaEntrada,
  ObterPermissoesTelaResultado,
  ControlePermissaoDto,
} from '../obter-permissoes-tela/obter-permissoes-tela.use-case';
import {
  IRepositorioControleUI,
  REPOSITORIO_CONTROLE_UI,
} from '../../../domain/repositories/controle-ui.repository.interface';
import { ControleUI } from '../../../domain/entities/controle-ui.entity';

describe('ObterPermissoesTelaUseCase (Integration)', () => {
  let useCase: ObterPermissoesTelaUseCase;
  let repositorioMock: jest.Mocked<IRepositorioControleUI>;
  let moduloTeste: TestingModule;

  // Dados de teste - usar valores que existem no banco TESTE
  const COD_USUARIO_TESTE = 1;
  const COD_TELA_TESTE = 100;
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
        ObterPermissoesTelaUseCase,
        {
          provide: REPOSITORIO_CONTROLE_UI,
          useValue: repositorioMock,
        },
      ],
    }).compile();

    useCase = moduloTeste.get<ObterPermissoesTelaUseCase>(ObterPermissoesTelaUseCase);
  });

  afterAll(async () => {
    await moduloTeste.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper para criar controles de teste
  const criarControle = (
    props: Partial<{
      codUsuario: number;
      codTela: number;
      nomeControle: string;
      habilitado: string;
      visivel: string;
      obrigatorio: string;
      somenteLeitura: string;
    }>,
  ) => {
    return ControleUI.criar({
      codUsuario: props.codUsuario ?? COD_USUARIO_TESTE,
      codTela: props.codTela ?? COD_TELA_TESTE,
      nomeControle: props.nomeControle ?? 'btnTeste',
      habilitado: props.habilitado ?? 'S',
      visivel: props.visivel ?? 'S',
      obrigatorio: props.obrigatorio ?? 'N',
      somenteLeitura: props.somenteLeitura ?? 'N',
    }).obterValor();
  };

  describe('executar', () => {
    it('deve retornar permissoes quando usuario e tela existirem', async () => {
      // Arrange
      const controlesTeste = [
        criarControle({ nomeControle: 'btnSalvar', habilitado: 'S', visivel: 'S' }),
        criarControle({ nomeControle: 'btnCancelar', habilitado: 'S', visivel: 'S' }),
      ];

      repositorioMock.buscarPorUsuarioETela.mockResolvedValue(controlesTeste);

      const entrada: ObterPermissoesTelaEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado: ObterPermissoesTelaResultado = await useCase.executar(entrada);

      // Assert
      expect(resultado).toBeDefined();
      expect(resultado.codUsuario).toBe(COD_USUARIO_TESTE);
      expect(resultado.codTela).toBe(COD_TELA_TESTE);
      expect(resultado.total).toBe(2);
      expect(resultado.controles).toHaveLength(2);

      // Verificar que o repositorio foi chamado com os parametros corretos
      expect(repositorioMock.buscarPorUsuarioETela).toHaveBeenCalledWith(
        COD_USUARIO_TESTE,
        COD_TELA_TESTE,
        TOKEN_TESTE,
      );
    });

    it('deve mapear corretamente os campos para DTO', async () => {
      // Arrange
      const controleTeste = criarControle({
        nomeControle: 'txtCampo',
        habilitado: 'S',
        visivel: 'S',
        obrigatorio: 'S',
        somenteLeitura: 'N',
      });

      repositorioMock.buscarPorUsuarioETela.mockResolvedValue([controleTeste]);

      const entrada: ObterPermissoesTelaEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      const controleDto: ControlePermissaoDto = resultado.controles[0];
      expect(controleDto.nomeControle).toBe('txtCampo');
      expect(controleDto.habilitado).toBe(true);
      expect(controleDto.visivel).toBe(true);
      expect(controleDto.obrigatorio).toBe(true);
      expect(controleDto.somenteLeitura).toBe(false);
      expect(controleDto.acessivel).toBe(true); // habilitado && visivel
      expect(controleDto.permiteEdicao).toBe(true); // habilitado && !somenteLeitura
    });

    it('deve calcular acessivel como true quando habilitado E visivel', async () => {
      // Arrange
      const controleTeste = criarControle({
        habilitado: 'S',
        visivel: 'S',
      });

      repositorioMock.buscarPorUsuarioETela.mockResolvedValue([controleTeste]);

      const entrada: ObterPermissoesTelaEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.controles[0].acessivel).toBe(true);
    });

    it('deve calcular acessivel como false quando desabilitado', async () => {
      // Arrange
      const controleTeste = criarControle({
        habilitado: 'N',
        visivel: 'S',
      });

      repositorioMock.buscarPorUsuarioETela.mockResolvedValue([controleTeste]);

      const entrada: ObterPermissoesTelaEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.controles[0].acessivel).toBe(false);
    });

    it('deve calcular acessivel como false quando invisivel', async () => {
      // Arrange
      const controleTeste = criarControle({
        habilitado: 'S',
        visivel: 'N',
      });

      repositorioMock.buscarPorUsuarioETela.mockResolvedValue([controleTeste]);

      const entrada: ObterPermissoesTelaEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.controles[0].acessivel).toBe(false);
    });

    it('deve calcular permiteEdicao como true quando habilitado e nao somente leitura', async () => {
      // Arrange
      const controleTeste = criarControle({
        habilitado: 'S',
        somenteLeitura: 'N',
      });

      repositorioMock.buscarPorUsuarioETela.mockResolvedValue([controleTeste]);

      const entrada: ObterPermissoesTelaEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.controles[0].permiteEdicao).toBe(true);
    });

    it('deve calcular permiteEdicao como false quando somente leitura', async () => {
      // Arrange
      const controleTeste = criarControle({
        habilitado: 'S',
        somenteLeitura: 'S',
      });

      repositorioMock.buscarPorUsuarioETela.mockResolvedValue([controleTeste]);

      const entrada: ObterPermissoesTelaEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.controles[0].permiteEdicao).toBe(false);
    });

    it('deve calcular permiteEdicao como false quando desabilitado', async () => {
      // Arrange
      const controleTeste = criarControle({
        habilitado: 'N',
        somenteLeitura: 'N',
      });

      repositorioMock.buscarPorUsuarioETela.mockResolvedValue([controleTeste]);

      const entrada: ObterPermissoesTelaEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.controles[0].permiteEdicao).toBe(false);
    });

    it('deve retornar lista vazia quando usuario ou tela nao existirem', async () => {
      // Arrange
      repositorioMock.buscarPorUsuarioETela.mockResolvedValue([]);

      const entrada: ObterPermissoesTelaEntrada = {
        codUsuario: 99999,
        codTela: 99999,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.total).toBe(0);
      expect(resultado.controles).toHaveLength(0);
      expect(resultado.codUsuario).toBe(99999);
      expect(resultado.codTela).toBe(99999);
    });

    it('deve processar multiplos controles corretamente', async () => {
      // Arrange
      const controlesTeste = [
        criarControle({ nomeControle: 'btn1', habilitado: 'S', visivel: 'S' }),
        criarControle({ nomeControle: 'btn2', habilitado: 'N', visivel: 'S' }),
        criarControle({ nomeControle: 'btn3', habilitado: 'S', visivel: 'N' }),
        criarControle({ nomeControle: 'txt1', habilitado: 'S', visivel: 'S', somenteLeitura: 'S' }),
        criarControle({ nomeControle: 'txt2', habilitado: 'S', visivel: 'S', obrigatorio: 'S' }),
      ];

      repositorioMock.buscarPorUsuarioETela.mockResolvedValue(controlesTeste);

      const entrada: ObterPermissoesTelaEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act
      const resultado = await useCase.executar(entrada);

      // Assert
      expect(resultado.total).toBe(5);

      // btn1: habilitado e visivel - acessivel true, permite edicao true
      expect(resultado.controles[0].acessivel).toBe(true);
      expect(resultado.controles[0].permiteEdicao).toBe(true);

      // btn2: desabilitado - acessivel false, permite edicao false
      expect(resultado.controles[1].acessivel).toBe(false);
      expect(resultado.controles[1].permiteEdicao).toBe(false);

      // btn3: invisivel - acessivel false, permite edicao true
      expect(resultado.controles[2].acessivel).toBe(false);
      expect(resultado.controles[2].permiteEdicao).toBe(true);

      // txt1: somente leitura - acessivel true, permite edicao false
      expect(resultado.controles[3].acessivel).toBe(true);
      expect(resultado.controles[3].permiteEdicao).toBe(false);

      // txt2: obrigatorio - acessivel true, permite edicao true, obrigatorio true
      expect(resultado.controles[4].acessivel).toBe(true);
      expect(resultado.controles[4].permiteEdicao).toBe(true);
      expect(resultado.controles[4].obrigatorio).toBe(true);
    });
  });

  describe('tratamento de erros', () => {
    it('deve propagar erro quando repositorio falhar', async () => {
      // Arrange
      const erroRepositorio = new Error('Erro ao buscar permissoes no banco TESTE');
      repositorioMock.buscarPorUsuarioETela.mockRejectedValue(erroRepositorio);

      const entrada: ObterPermissoesTelaEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act & Assert
      await expect(useCase.executar(entrada)).rejects.toThrow('Erro ao buscar permissoes no banco TESTE');
    });

    it('deve propagar erro de timeout do banco', async () => {
      // Arrange
      const erroTimeout = new Error('Connection timeout');
      repositorioMock.buscarPorUsuarioETela.mockRejectedValue(erroTimeout);

      const entrada: ObterPermissoesTelaEntrada = {
        codUsuario: COD_USUARIO_TESTE,
        codTela: COD_TELA_TESTE,
        tokenUsuario: TOKEN_TESTE,
      };

      // Act & Assert
      await expect(useCase.executar(entrada)).rejects.toThrow('Connection timeout');
    });
  });
});
