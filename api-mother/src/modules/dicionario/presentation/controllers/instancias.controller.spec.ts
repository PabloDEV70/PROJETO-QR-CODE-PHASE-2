import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InstanciasController } from './instancias.controller';
import { ListarInstanciasTabelaUseCase } from '../../application/use-cases/listar-instancias-tabela';
import { ObterInstanciaUseCase } from '../../application/use-cases/obter-instancia';
import { ObterInstanciaCompletaUseCase } from '../../application/use-cases/obter-instancia-completa';
import { ObterHierarquiaInstanciasUseCase } from '../../application/use-cases/obter-hierarquia-instancias';

describe('InstanciasController', () => {
  let controller: InstanciasController;
  let listarInstanciasTabelaUseCase: any;
  let obterInstanciaUseCase: any;
  let obterInstanciaCompletaUseCase: any;
  let obterHierarquiaInstanciasUseCase: any;

  const mockReq = {
    headers: {
      authorization: 'Bearer token-valido',
    },
  };

  beforeEach(async () => {
    listarInstanciasTabelaUseCase = {
      executar: jest.fn().mockResolvedValue({
        instancias: [
          {
            nomeInstancia: 'Parceiro',
            nomeTabela: 'TGFPAR',
            descricao: 'Cadastro de Parceiros',
            ordem: 1,
            ativa: true,
          },
        ],
        total: 1,
      }),
    };

    obterInstanciaUseCase = {
      executar: jest.fn().mockResolvedValue({
        instancia: {
          nomeInstancia: 'Parceiro',
          nomeTabela: 'TGFPAR',
          descricao: 'Cadastro de Parceiros',
          ordem: 1,
          ativa: true,
        },
      }),
    };

    obterInstanciaCompletaUseCase = {
      executar: jest.fn().mockResolvedValue({
        instancia: {
          nomeInstancia: 'Parceiro',
          nomeTabela: 'TGFPAR',
          descricao: 'Cadastro de Parceiros',
          ordem: 1,
          ativa: true,
          relacionamentosPai: [],
          relacionamentosFilho: [],
          totalRelacionamentos: 0,
        },
      }),
    };

    obterHierarquiaInstanciasUseCase = {
      executar: jest.fn().mockResolvedValue({
        hierarquia: {
          instancia: {
            nomeInstancia: 'Parceiro',
            nomeTabela: 'TGFPAR',
          },
          nivel: 0,
          filhos: [],
        },
        totalInstancias: 1,
        profundidade: 0,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstanciasController],
      providers: [
        { provide: ListarInstanciasTabelaUseCase, useValue: listarInstanciasTabelaUseCase },
        { provide: ObterInstanciaUseCase, useValue: obterInstanciaUseCase },
        { provide: ObterInstanciaCompletaUseCase, useValue: obterInstanciaCompletaUseCase },
        { provide: ObterHierarquiaInstanciasUseCase, useValue: obterHierarquiaInstanciasUseCase },
      ],
    }).compile();

    controller = module.get<InstanciasController>(InstanciasController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listarInstanciasTabela', () => {
    it('deve retornar lista de instâncias da tabela', async () => {
      const resultado = await controller.listarInstanciasTabela('TGFPAR', mockReq);

      expect(resultado.instancias).toHaveLength(1);
      expect(resultado.total).toBe(1);
      expect(listarInstanciasTabelaUseCase.executar).toHaveBeenCalledWith({
        nomeTabela: 'TGFPAR',
        tokenUsuario: 'token-valido',
      });
    });
  });

  describe('obterInstancia', () => {
    it('deve retornar instância quando encontrada', async () => {
      const resultado = await controller.obterInstancia('Parceiro', mockReq);

      expect(resultado.nomeInstancia).toBe('Parceiro');
    });

    it('deve lançar NotFoundException quando instância não encontrada', async () => {
      obterInstanciaUseCase.executar.mockResolvedValue({ instancia: null });

      await expect(controller.obterInstancia('Inexistente', mockReq)).rejects.toThrow(NotFoundException);
    });
  });

  describe('obterInstanciaCompleta', () => {
    it('deve retornar instância completa com relacionamentos', async () => {
      const resultado = await controller.obterInstanciaCompleta('Parceiro', mockReq);

      expect(resultado.nomeInstancia).toBe('Parceiro');
      expect(resultado.relacionamentosPai).toBeDefined();
      expect(resultado.relacionamentosFilho).toBeDefined();
    });

    it('deve lançar NotFoundException quando instância não encontrada', async () => {
      obterInstanciaCompletaUseCase.executar.mockResolvedValue({ instancia: null });

      await expect(controller.obterInstanciaCompleta('Inexistente', mockReq)).rejects.toThrow(NotFoundException);
    });
  });

  describe('obterHierarquiaInstancias', () => {
    it('deve retornar hierarquia de instâncias', async () => {
      const resultado = await controller.obterHierarquiaInstancias('Parceiro', 3, mockReq);

      expect(resultado.hierarquia).not.toBeNull();
      expect(resultado.totalInstancias).toBe(1);
    });

    it('deve lançar NotFoundException quando instância não encontrada', async () => {
      obterHierarquiaInstanciasUseCase.executar.mockResolvedValue({ hierarquia: null });

      await expect(controller.obterHierarquiaInstancias('Inexistente', 3, mockReq)).rejects.toThrow(NotFoundException);
    });
  });
});
