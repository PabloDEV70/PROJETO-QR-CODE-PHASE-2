import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ListarInstanciasTabelaUseCase } from './listar-instancias-tabela.use-case';
import { REPOSITORIO_INSTANCIA } from '../../../domain/repositories/instancia.repository.interface';
import { InstanciaMapper } from '../../mappers/instancia.mapper';
import { Instancia } from '../../../domain/entities/instancia.entity';

describe('ListarInstanciasTabelaUseCase', () => {
  let useCase: ListarInstanciasTabelaUseCase;
  let repositorioInstancia: any;
  let _mapper: InstanciaMapper;

  const mockInstancias = [
    Instancia.criar({
      nomeInstancia: 'Parceiro',
      nomeTabela: 'TGFPAR',
      descricao: 'Cadastro de Parceiros',
      ordem: 1,
      ativa: 'S',
    }).obterValor(),
    Instancia.criar({
      nomeInstancia: 'ParceiroContato',
      nomeTabela: 'TGFPAR',
      descricao: 'Contatos do Parceiro',
      ordem: 2,
      ativa: 'S',
    }).obterValor(),
  ];

  beforeEach(async () => {
    repositorioInstancia = {
      buscarPorTabela: jest.fn().mockResolvedValue(mockInstancias),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListarInstanciasTabelaUseCase,
        { provide: REPOSITORIO_INSTANCIA, useValue: repositorioInstancia },
        InstanciaMapper,
      ],
    }).compile();

    useCase = module.get<ListarInstanciasTabelaUseCase>(ListarInstanciasTabelaUseCase);
    _mapper = module.get<InstanciaMapper>(InstanciaMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executar', () => {
    it('deve retornar lista de instâncias da tabela', async () => {
      const entrada = {
        nomeTabela: 'TGFPAR',
        tokenUsuario: 'token-valido',
      };

      const resultado = await useCase.executar(entrada);

      expect(resultado.instancias).toHaveLength(2);
      expect(resultado.total).toBe(2);
      expect(resultado.instancias[0].nomeInstancia).toBe('Parceiro');
      expect(repositorioInstancia.buscarPorTabela).toHaveBeenCalledWith('TGFPAR', 'token-valido');
    });

    it('deve normalizar nome da tabela para maiúsculas', async () => {
      const entrada = {
        nomeTabela: 'tgfpar',
        tokenUsuario: 'token-valido',
      };

      await useCase.executar(entrada);

      expect(repositorioInstancia.buscarPorTabela).toHaveBeenCalledWith('TGFPAR', 'token-valido');
    });

    it('deve retornar lista vazia quando tabela não tem instâncias', async () => {
      repositorioInstancia.buscarPorTabela.mockResolvedValue([]);

      const entrada = {
        nomeTabela: 'TABELA_INEXISTENTE',
        tokenUsuario: 'token-valido',
      };

      const resultado = await useCase.executar(entrada);

      expect(resultado.instancias).toHaveLength(0);
      expect(resultado.total).toBe(0);
    });

    it('deve lançar BadRequestException quando nome da tabela vazio', async () => {
      const entrada = {
        nomeTabela: '',
        tokenUsuario: 'token-valido',
      };

      await expect(useCase.executar(entrada)).rejects.toThrow(BadRequestException);
      await expect(useCase.executar(entrada)).rejects.toThrow('Nome da tabela é obrigatório');
    });

    it('deve lançar BadRequestException quando token vazio', async () => {
      const entrada = {
        nomeTabela: 'TGFPAR',
        tokenUsuario: '',
      };

      await expect(useCase.executar(entrada)).rejects.toThrow(BadRequestException);
      await expect(useCase.executar(entrada)).rejects.toThrow('Token de usuário é obrigatório');
    });
  });
});
