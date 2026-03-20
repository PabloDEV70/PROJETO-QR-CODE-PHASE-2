import { Test, TestingModule } from '@nestjs/testing';
import { RelacionamentosController } from './relacionamentos.controller';
import { ListarRelacionamentosUseCase } from '../../application/use-cases/listar-relacionamentos';
import { ObterCamposRelacionamentoUseCase } from '../../application/use-cases/obter-campos-relacionamento';
import { ObterTabelasRelacionadasUseCase } from '../../application/use-cases/obter-tabelas-relacionadas';

describe('RelacionamentosController', () => {
  let controller: RelacionamentosController;
  let listarRelacionamentosUseCase: any;
  let obterCamposRelacionamentoUseCase: any;
  let obterTabelasRelacionadasUseCase: any;

  const mockReq = {
    headers: {
      authorization: 'Bearer token-valido',
    },
  };

  beforeEach(async () => {
    listarRelacionamentosUseCase = {
      executar: jest.fn().mockResolvedValue({
        relacionamentosPai: [
          {
            nomeInstanciaPai: 'Parceiro',
            nomeInstanciaFilho: 'Contato',
            tipoLigacao: 'M',
            tipoLigacaoDescricao: 'Master-Detail',
            ordem: 1,
            ativo: true,
            ehMasterDetail: true,
          },
        ],
        relacionamentosFilho: [],
        relacionamentos: [],
        total: 1,
        totalComoPai: 1,
        totalComoFilho: 0,
      }),
    };

    obterCamposRelacionamentoUseCase = {
      executar: jest.fn().mockResolvedValue({
        relacionamento: {
          nomeInstanciaPai: 'Parceiro',
          nomeInstanciaFilho: 'Contato',
        },
        camposLigacao: [
          {
            campoOrigem: 'CODPARC',
            campoDestino: 'CODPARC',
          },
        ],
        expressaoJoin: 'Parceiro JOIN Contato ON pai.CODPARC = filho.CODPARC',
        total: 1,
      }),
    };

    obterTabelasRelacionadasUseCase = {
      executar: jest.fn().mockResolvedValue({
        tabelaCentral: 'TGFPAR',
        nodos: [
          { nomeTabela: 'TGFPAR', descricao: 'Parceiros', nivel: 0 },
          { nomeTabela: 'TGFCON', descricao: 'Contatos', nivel: 1 },
        ],
        arestas: [
          {
            tabelaOrigem: 'TGFPAR',
            tabelaDestino: 'TGFCON',
            tipoLigacao: 'M',
          },
        ],
        totalTabelas: 2,
        totalRelacionamentos: 1,
        profundidade: 1,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RelacionamentosController],
      providers: [
        { provide: ListarRelacionamentosUseCase, useValue: listarRelacionamentosUseCase },
        { provide: ObterCamposRelacionamentoUseCase, useValue: obterCamposRelacionamentoUseCase },
        { provide: ObterTabelasRelacionadasUseCase, useValue: obterTabelasRelacionadasUseCase },
      ],
    }).compile();

    controller = module.get<RelacionamentosController>(RelacionamentosController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listarRelacionamentosTabela', () => {
    it('deve retornar relacionamentos categorizados', async () => {
      const resultado = await controller.listarRelacionamentosTabela('TGFPAR', true, mockReq);

      expect(resultado.relacionamentosPai).toHaveLength(1);
      expect(resultado.total).toBe(1);
      expect(listarRelacionamentosUseCase.executar).toHaveBeenCalledWith({
        nomeTabela: 'TGFPAR',
        tokenUsuario: 'token-valido',
        apenasAtivos: true,
      });
    });
  });

  describe('obterCamposRelacionamento', () => {
    it('deve retornar campos de ligação', async () => {
      const resultado = await controller.obterCamposRelacionamento('Parceiro', 'Contato', mockReq);

      expect(resultado.camposLigacao).toHaveLength(1);
      expect(resultado.expressaoJoin).toContain('JOIN');
    });
  });

  describe('obterGrafoTabelas', () => {
    it('deve retornar grafo de tabelas relacionadas', async () => {
      const resultado = await controller.obterGrafoTabelas('TGFPAR', 2, mockReq);

      expect(resultado.tabelaCentral).toBe('TGFPAR');
      expect(resultado.nodos).toHaveLength(2);
      expect(resultado.arestas).toHaveLength(1);
      expect(resultado.totalTabelas).toBe(2);
    });
  });
});
