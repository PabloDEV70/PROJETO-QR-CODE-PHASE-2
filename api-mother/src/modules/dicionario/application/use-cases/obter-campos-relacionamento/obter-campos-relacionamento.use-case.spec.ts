import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ObterCamposRelacionamentoUseCase } from './obter-campos-relacionamento.use-case';
import { REPOSITORIO_RELACIONAMENTO } from '../../../domain/repositories/relacionamento.repository.interface';
import { RelacionamentoMapper } from '../../mappers/relacionamento.mapper';
import { Relacionamento } from '../../../domain/entities/relacionamento.entity';
import { LinkCampo } from '../../../domain/entities/link-campo.entity';

describe('ObterCamposRelacionamentoUseCase', () => {
  let useCase: ObterCamposRelacionamentoUseCase;
  let repositorioRelacionamento: any;

  const mockRelacionamento = Relacionamento.criar({
    nomeInstanciaPai: 'Parceiro',
    nomeInstanciaFilho: 'Contato',
    tipoLigacao: 'M',
    ordem: 1,
    ativo: 'S',
  }).obterValor();

  const mockLinksCampos = [
    LinkCampo.criar({
      nomeInstanciaPai: 'Parceiro',
      nomeInstanciaFilho: 'Contato',
      campoOrigem: 'CODPARC',
      campoDestino: 'CODPARC',
      ordem: 1,
    }).obterValor(),
  ];

  beforeEach(async () => {
    repositorioRelacionamento = {
      buscarPorInstanciaPai: jest.fn().mockResolvedValue([mockRelacionamento]),
      buscarLinksCampos: jest.fn().mockResolvedValue(mockLinksCampos),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObterCamposRelacionamentoUseCase,
        { provide: REPOSITORIO_RELACIONAMENTO, useValue: repositorioRelacionamento },
        RelacionamentoMapper,
      ],
    }).compile();

    useCase = module.get<ObterCamposRelacionamentoUseCase>(ObterCamposRelacionamentoUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executar', () => {
    it('deve retornar campos de ligação do relacionamento', async () => {
      const entrada = {
        nomeInstanciaPai: 'Parceiro',
        nomeInstanciaFilho: 'Contato',
        tokenUsuario: 'token-valido',
      };

      const resultado = await useCase.executar(entrada);

      expect(resultado.relacionamento).not.toBeNull();
      expect(resultado.camposLigacao).toHaveLength(1);
      expect(resultado.camposLigacao[0].campoOrigem).toBe('CODPARC');
      expect(resultado.expressaoJoin).toContain('JOIN');
      expect(resultado.total).toBe(1);
    });

    it('deve retornar expressão JOIN vazia quando não há campos', async () => {
      repositorioRelacionamento.buscarLinksCampos.mockResolvedValue([]);

      const entrada = {
        nomeInstanciaPai: 'Parceiro',
        nomeInstanciaFilho: 'Contato',
        tokenUsuario: 'token-valido',
      };

      const resultado = await useCase.executar(entrada);

      expect(resultado.expressaoJoin).toBe('');
      expect(resultado.total).toBe(0);
    });

    it('deve lançar BadRequestException quando instância pai vazia', async () => {
      const entrada = {
        nomeInstanciaPai: '',
        nomeInstanciaFilho: 'Contato',
        tokenUsuario: 'token-valido',
      };

      await expect(useCase.executar(entrada)).rejects.toThrow(BadRequestException);
      await expect(useCase.executar(entrada)).rejects.toThrow('Nome da instância pai é obrigatório');
    });

    it('deve lançar BadRequestException quando instância filho vazia', async () => {
      const entrada = {
        nomeInstanciaPai: 'Parceiro',
        nomeInstanciaFilho: '',
        tokenUsuario: 'token-valido',
      };

      await expect(useCase.executar(entrada)).rejects.toThrow(BadRequestException);
      await expect(useCase.executar(entrada)).rejects.toThrow('Nome da instância filho é obrigatório');
    });
  });
});
