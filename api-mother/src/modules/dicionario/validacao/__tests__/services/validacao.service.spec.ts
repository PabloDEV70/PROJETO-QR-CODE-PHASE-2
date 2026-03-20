import { Test, TestingModule } from '@nestjs/testing';
import { ValidacaoService } from '../../application/services/validacao.service';
import { VALIDADOR_CAMPO } from '../../domain/interfaces/validador-campo.interface';
import { PROVEDOR_SCHEMA_TABELA, SchemaTabela } from '../../domain/interfaces/schema-tabela.interface';
import { Resultado } from '../../../shared/resultado';
import { Campo } from '../../../domain/entities/campo.entity';

describe('ValidacaoService', () => {
  let service: ValidacaoService;

  const mockValidadorCampo = {
    validarValor: jest.fn(),
  };

  const mockProvedorSchema = {
    obterSchema: jest.fn(),
    limparCache: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidacaoService,
        { provide: VALIDADOR_CAMPO, useValue: mockValidadorCampo },
        { provide: PROVEDOR_SCHEMA_TABELA, useValue: mockProvedorSchema },
      ],
    }).compile();

    service = module.get<ValidacaoService>(ValidacaoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const criarCampoMock = (nome: string, obrigatorio: boolean = false): Campo => {
    return Campo.criar({
      nomeTabela: 'TGFPRO',
      nomeCampo: nome,
      tipo: 'C',
      obrigatorio: obrigatorio ? 'S' : 'N',
    }).obterValor();
  };

  const criarSchemaMock = (): SchemaTabela => {
    const campoCodProd = criarCampoMock('CODPROD', true);
    const campoDescrProd = criarCampoMock('DESCRPROD', true);
    const campoReferencia = criarCampoMock('REFERENCIA', false);

    return {
      nomeTabela: 'TGFPRO',
      campos: new Map([
        ['CODPROD', campoCodProd],
        ['DESCRPROD', campoDescrProd],
        ['REFERENCIA', campoReferencia],
      ]),
      camposObrigatorios: ['CODPROD', 'DESCRPROD'],
      camposChavePrimaria: ['CODPROD'],
    };
  };

  describe('validarDados', () => {
    it('deve validar dados corretamente', async () => {
      const schema = criarSchemaMock();
      mockProvedorSchema.obterSchema.mockResolvedValue(schema);
      mockValidadorCampo.validarValor.mockReturnValue(Resultado.ok<void>());

      const dados = {
        CODPROD: 123,
        DESCRPROD: 'Produto Teste',
        REFERENCIA: 'REF001',
      };

      const resultado = await service.validarDados('TGFPRO', dados);

      expect(resultado.sucesso).toBe(true);
      expect(mockProvedorSchema.obterSchema).toHaveBeenCalledWith('TGFPRO');
      expect(mockValidadorCampo.validarValor).toHaveBeenCalledTimes(3);
    });

    it('deve falhar quando campo não existe na tabela', async () => {
      const schema = criarSchemaMock();
      mockProvedorSchema.obterSchema.mockResolvedValue(schema);

      const dados = {
        CODPROD: 123,
        CAMPO_INVALIDO: 'Valor',
      };

      const resultado = await service.validarDados('TGFPRO', dados);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('CAMPO_INVALIDO');
      expect(resultado.erro).toContain('não existe na tabela');
    });

    it('deve falhar quando campo obrigatório ausente', async () => {
      const schema = criarSchemaMock();
      mockProvedorSchema.obterSchema.mockResolvedValue(schema);

      const dados = {
        CODPROD: 123,
        // DESCRPROD ausente (obrigatório)
      };

      const resultado = await service.validarDados('TGFPRO', dados);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('Campos obrigatórios ausentes');
      expect(resultado.erro).toContain('DESCRPROD');
    });

    it('deve falhar quando validação de campo falha', async () => {
      const schema = criarSchemaMock();
      mockProvedorSchema.obterSchema.mockResolvedValue(schema);
      mockValidadorCampo.validarValor.mockReturnValue(Resultado.falhar('Valor inválido para CODPROD'));

      const dados = {
        CODPROD: 'abc', // Deveria ser número
        DESCRPROD: 'Produto',
      };

      const resultado = await service.validarDados('TGFPRO', dados);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('Valor inválido');
    });
  });

  describe('validarCampo', () => {
    it('deve validar campo individual', async () => {
      const schema = criarSchemaMock();
      mockProvedorSchema.obterSchema.mockResolvedValue(schema);
      mockValidadorCampo.validarValor.mockReturnValue(Resultado.ok<void>());

      const resultado = await service.validarCampo('TGFPRO', 'CODPROD', 123);

      expect(resultado.sucesso).toBe(true);
      expect(mockValidadorCampo.validarValor).toHaveBeenCalled();
    });

    it('deve falhar quando campo não existe', async () => {
      const schema = criarSchemaMock();
      mockProvedorSchema.obterSchema.mockResolvedValue(schema);

      const resultado = await service.validarCampo('TGFPRO', 'CAMPO_INEXISTENTE', 'valor');

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('não existe na tabela');
    });
  });

  describe('limparCacheSchemas', () => {
    it('deve limpar cache de tabela específica', () => {
      service.limparCacheSchemas('TGFPRO');

      expect(mockProvedorSchema.limparCache).toHaveBeenCalledWith('TGFPRO');
    });

    it('deve limpar cache de todas as tabelas', () => {
      service.limparCacheSchemas();

      expect(mockProvedorSchema.limparCache).toHaveBeenCalledWith(undefined);
    });
  });
});
