import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ListarRelacionamentosUseCase } from './listar-relacionamentos.use-case';
import { REPOSITORIO_INSTANCIA } from '../../../domain/repositories/instancia.repository.interface';
import { REPOSITORIO_RELACIONAMENTO } from '../../../domain/repositories/relacionamento.repository.interface';
import { RelacionamentoMapper } from '../../mappers/relacionamento.mapper';
import { Instancia } from '../../../domain/entities/instancia.entity';
import { Relacionamento } from '../../../domain/entities/relacionamento.entity';

describe('ListarRelacionamentosUseCase', () => {
  let useCase: ListarRelacionamentosUseCase;
  let repositorioInstancia: any;
  let repositorioRelacionamento: any;

  const mockInstancias = [
    Instancia.criar({
      nomeInstancia: 'Parceiro',
      nomeTabela: 'TGFPAR',
      descricao: 'Cadastro de Parceiros',
      ordem: 1,
      ativa: 'S',
    }).obterValor(),
  ];

  const mockRelacionamentosPai = [
    Relacionamento.criar({
      nomeInstanciaPai: 'Parceiro',
      nomeInstanciaFilho: 'Contato',
      tipoLigacao: 'M',
      ordem: 1,
      ativo: 'S',
    }).obterValor(),
  ];

  const mockRelacionamentosFilho = [
    Relacionamento.criar({
      nomeInstanciaPai: 'Empresa',
      nomeInstanciaFilho: 'Parceiro',
      tipoLigacao: 'M',
      ordem: 1,
      ativo: 'S',
    }).obterValor(),
  ];

  beforeEach(async () => {
    repositorioInstancia = {
      buscarPorTabela: jest.fn().mockResolvedValue(mockInstancias),
    };

    repositorioRelacionamento = {
      buscarPorInstanciaPai: jest.fn().mockResolvedValue(mockRelacionamentosPai),
      buscarPorInstanciaFilho: jest.fn().mockResolvedValue(mockRelacionamentosFilho),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListarRelacionamentosUseCase,
        { provide: REPOSITORIO_INSTANCIA, useValue: repositorioInstancia },
        { provide: REPOSITORIO_RELACIONAMENTO, useValue: repositorioRelacionamento },
        RelacionamentoMapper,
      ],
    }).compile();

    useCase = module.get<ListarRelacionamentosUseCase>(ListarRelacionamentosUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executar', () => {
    it('deve retornar relacionamentos categorizados', async () => {
      const entrada = {
        nomeTabela: 'TGFPAR',
        tokenUsuario: 'token-valido',
      };

      const resultado = await useCase.executar(entrada);

      expect(resultado.relacionamentosPai).toHaveLength(1);
      expect(resultado.relacionamentosFilho).toHaveLength(1);
      expect(resultado.total).toBe(2);
      expect(resultado.totalComoPai).toBe(1);
      expect(resultado.totalComoFilho).toBe(1);
    });

    it('deve retornar vazio quando tabela não tem instâncias', async () => {
      repositorioInstancia.buscarPorTabela.mockResolvedValue([]);

      const entrada = {
        nomeTabela: 'TABELA_SEM_INSTANCIAS',
        tokenUsuario: 'token-valido',
      };

      const resultado = await useCase.executar(entrada);

      expect(resultado.relacionamentos).toHaveLength(0);
      expect(resultado.total).toBe(0);
    });

    it('deve filtrar relacionamentos inativos quando apenasAtivos=true', async () => {
      const relInativo = Relacionamento.criar({
        nomeInstanciaPai: 'Parceiro',
        nomeInstanciaFilho: 'Historico',
        tipoLigacao: 'M',
        ordem: 2,
        ativo: 'N',
      }).obterValor();

      repositorioRelacionamento.buscarPorInstanciaPai.mockResolvedValue([mockRelacionamentosPai[0], relInativo]);

      const entrada = {
        nomeTabela: 'TGFPAR',
        tokenUsuario: 'token-valido',
        apenasAtivos: true,
      };

      const resultado = await useCase.executar(entrada);

      expect(resultado.totalComoPai).toBe(1);
    });

    it('deve lançar BadRequestException quando nome da tabela vazio', async () => {
      const entrada = {
        nomeTabela: '',
        tokenUsuario: 'token-valido',
      };

      await expect(useCase.executar(entrada)).rejects.toThrow(BadRequestException);
    });
  });
});
