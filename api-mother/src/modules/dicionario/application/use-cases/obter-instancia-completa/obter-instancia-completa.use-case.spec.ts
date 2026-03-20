import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ObterInstanciaCompletaUseCase } from './obter-instancia-completa.use-case';
import { REPOSITORIO_INSTANCIA } from '../../../domain/repositories/instancia.repository.interface';
import { REPOSITORIO_RELACIONAMENTO } from '../../../domain/repositories/relacionamento.repository.interface';
import { InstanciaMapper } from '../../mappers/instancia.mapper';
import { RelacionamentoMapper } from '../../mappers/relacionamento.mapper';
import { Instancia } from '../../../domain/entities/instancia.entity';
import { Relacionamento } from '../../../domain/entities/relacionamento.entity';

describe('ObterInstanciaCompletaUseCase', () => {
  let useCase: ObterInstanciaCompletaUseCase;
  let repositorioInstancia: any;
  let repositorioRelacionamento: any;

  const mockInstancia = Instancia.criar({
    nomeInstancia: 'Parceiro',
    nomeTabela: 'TGFPAR',
    descricao: 'Cadastro de Parceiros',
    ordem: 1,
    ativa: 'S',
  }).obterValor();

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
      buscarPorNome: jest.fn().mockResolvedValue(mockInstancia),
    };

    repositorioRelacionamento = {
      buscarPorInstanciaPai: jest.fn().mockResolvedValue(mockRelacionamentosPai),
      buscarPorInstanciaFilho: jest.fn().mockResolvedValue(mockRelacionamentosFilho),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObterInstanciaCompletaUseCase,
        { provide: REPOSITORIO_INSTANCIA, useValue: repositorioInstancia },
        { provide: REPOSITORIO_RELACIONAMENTO, useValue: repositorioRelacionamento },
        InstanciaMapper,
        RelacionamentoMapper,
      ],
    }).compile();

    useCase = module.get<ObterInstanciaCompletaUseCase>(ObterInstanciaCompletaUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executar', () => {
    it('deve retornar instância completa com relacionamentos', async () => {
      const entrada = {
        nomeInstancia: 'Parceiro',
        tokenUsuario: 'token-valido',
      };

      const resultado = await useCase.executar(entrada);

      expect(resultado.instancia).not.toBeNull();
      expect(resultado.instancia?.nomeInstancia).toBe('Parceiro');
      expect(resultado.instancia?.relacionamentosPai).toHaveLength(1);
      expect(resultado.instancia?.relacionamentosFilho).toHaveLength(1);
      expect(resultado.instancia?.totalRelacionamentos).toBe(2);
    });

    it('deve retornar null quando instância não encontrada', async () => {
      repositorioInstancia.buscarPorNome.mockResolvedValue(null);

      const entrada = {
        nomeInstancia: 'InstanciaInexistente',
        tokenUsuario: 'token-valido',
      };

      const resultado = await useCase.executar(entrada);

      expect(resultado.instancia).toBeNull();
    });

    it('deve retornar instância sem relacionamentos quando não há relacionamentos', async () => {
      repositorioRelacionamento.buscarPorInstanciaPai.mockResolvedValue([]);
      repositorioRelacionamento.buscarPorInstanciaFilho.mockResolvedValue([]);

      const entrada = {
        nomeInstancia: 'Parceiro',
        tokenUsuario: 'token-valido',
      };

      const resultado = await useCase.executar(entrada);

      expect(resultado.instancia?.relacionamentosPai).toHaveLength(0);
      expect(resultado.instancia?.relacionamentosFilho).toHaveLength(0);
      expect(resultado.instancia?.totalRelacionamentos).toBe(0);
    });

    it('deve lançar BadRequestException quando nome vazio', async () => {
      const entrada = {
        nomeInstancia: '',
        tokenUsuario: 'token-valido',
      };

      await expect(useCase.executar(entrada)).rejects.toThrow(BadRequestException);
    });
  });
});
