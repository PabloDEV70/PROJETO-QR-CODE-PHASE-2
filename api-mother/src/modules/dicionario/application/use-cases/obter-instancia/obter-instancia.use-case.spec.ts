import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ObterInstanciaUseCase } from './obter-instancia.use-case';
import { REPOSITORIO_INSTANCIA } from '../../../domain/repositories/instancia.repository.interface';
import { InstanciaMapper } from '../../mappers/instancia.mapper';
import { Instancia } from '../../../domain/entities/instancia.entity';

describe('ObterInstanciaUseCase', () => {
  let useCase: ObterInstanciaUseCase;
  let repositorioInstancia: any;

  const mockInstancia = Instancia.criar({
    nomeInstancia: 'Parceiro',
    nomeTabela: 'TGFPAR',
    descricao: 'Cadastro de Parceiros',
    ordem: 1,
    ativa: 'S',
  }).obterValor();

  beforeEach(async () => {
    repositorioInstancia = {
      buscarPorNome: jest.fn().mockResolvedValue(mockInstancia),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObterInstanciaUseCase,
        { provide: REPOSITORIO_INSTANCIA, useValue: repositorioInstancia },
        InstanciaMapper,
      ],
    }).compile();

    useCase = module.get<ObterInstanciaUseCase>(ObterInstanciaUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executar', () => {
    it('deve retornar instância quando encontrada', async () => {
      const entrada = {
        nomeInstancia: 'Parceiro',
        tokenUsuario: 'token-valido',
      };

      const resultado = await useCase.executar(entrada);

      expect(resultado.instancia).not.toBeNull();
      expect(resultado.instancia?.nomeInstancia).toBe('Parceiro');
      expect(resultado.instancia?.nomeTabela).toBe('TGFPAR');
      expect(repositorioInstancia.buscarPorNome).toHaveBeenCalledWith('Parceiro', 'token-valido');
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

    it('deve lançar BadRequestException quando nome vazio', async () => {
      const entrada = {
        nomeInstancia: '',
        tokenUsuario: 'token-valido',
      };

      await expect(useCase.executar(entrada)).rejects.toThrow(BadRequestException);
      await expect(useCase.executar(entrada)).rejects.toThrow('Nome da instância é obrigatório');
    });

    it('deve lançar BadRequestException quando token vazio', async () => {
      const entrada = {
        nomeInstancia: 'Parceiro',
        tokenUsuario: '',
      };

      await expect(useCase.executar(entrada)).rejects.toThrow(BadRequestException);
      await expect(useCase.executar(entrada)).rejects.toThrow('Token de usuário é obrigatório');
    });
  });
});
