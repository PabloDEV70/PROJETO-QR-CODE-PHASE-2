/**
 * Testes de integracao para SankhyaCampoRepository.
 *
 * Estes testes validam o comportamento do repositorio de campos
 * utilizando mocks do DatabaseService para simular respostas do banco TESTE.
 *
 * IMPORTANTE: Sempre usar banco TESTE em desenvolvimento, NUNCA PROD.
 *
 * @module Dicionario
 * @tabela TDDCAM
 */
import { Test, TestingModule } from '@nestjs/testing';
import { SankhyaCampoRepository } from '../sankhya-campo.repository';
import { CampoMapper, CampoCru } from '../../../application/mappers/campo.mapper';
import { SqlServerService } from '../../../../../database/sqlserver.service';
import { Campo } from '../../../domain/entities/campo.entity';

describe('SankhyaCampoRepository (Integration)', () => {
  let repositorio: SankhyaCampoRepository;
  let sqlServerMock: jest.Mocked<SqlServerService>;

  // Dados de teste simulando retorno do banco TESTE
  const campoCruMock: CampoCru = {
    NOMETAB: 'TGFPRO',
    NOMECAMPO: 'CODPROD',
    DESCRICAO: 'Codigo do Produto',
    TIPO: 'I',
    TAMANHO: 10,
    DECIMAIS: 0,
    OBRIGATORIO: 'S',
    CHAVEPRIMARIA: 'S',
    CHAVEESTRANGEIRA: 'N',
    APRESENTACAO: 'E',
    VALORPADRAO: '',
  };

  const listaCamposCruMock: CampoCru[] = [
    {
      NOMETAB: 'TGFPRO',
      NOMECAMPO: 'CODPROD',
      DESCRICAO: 'Codigo do Produto',
      TIPO: 'I',
      TAMANHO: 10,
      DECIMAIS: 0,
      OBRIGATORIO: 'S',
      CHAVEPRIMARIA: 'S',
      CHAVEESTRANGEIRA: 'N',
      APRESENTACAO: 'E',
      VALORPADRAO: '',
    },
    {
      NOMETAB: 'TGFPRO',
      NOMECAMPO: 'DESCRPROD',
      DESCRICAO: 'Descricao do Produto',
      TIPO: 'S',
      TAMANHO: 200,
      DECIMAIS: 0,
      OBRIGATORIO: 'S',
      CHAVEPRIMARIA: 'N',
      CHAVEESTRANGEIRA: 'N',
      APRESENTACAO: 'T',
      VALORPADRAO: '',
    },
    {
      NOMETAB: 'TGFPRO',
      NOMECAMPO: 'CODGRUPOPROD',
      DESCRICAO: 'Codigo do Grupo de Produto',
      TIPO: 'I',
      TAMANHO: 10,
      DECIMAIS: 0,
      OBRIGATORIO: 'N',
      CHAVEPRIMARIA: 'N',
      CHAVEESTRANGEIRA: 'S',
      APRESENTACAO: 'C',
      VALORPADRAO: '',
    },
    {
      NOMETAB: 'TGFPRO',
      NOMECAMPO: 'VLRVENDA',
      DESCRICAO: 'Valor de Venda',
      TIPO: 'F',
      TAMANHO: 15,
      DECIMAIS: 2,
      OBRIGATORIO: 'N',
      CHAVEPRIMARIA: 'N',
      CHAVEESTRANGEIRA: 'N',
      APRESENTACAO: 'M',
      VALORPADRAO: '0',
    },
  ];

  const tokenUsuarioTeste = 'token-teste-123';

  beforeEach(async () => {
    // Criar mock do SqlServerService
    sqlServerMock = {
      executeSQL: jest.fn(),
    } as unknown as jest.Mocked<SqlServerService>;

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        SankhyaCampoRepository,
        CampoMapper,
        {
          provide: SqlServerService,
          useValue: sqlServerMock,
        },
      ],
    }).compile();

    repositorio = modulo.get<SankhyaCampoRepository>(SankhyaCampoRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buscarPorTabela', () => {
    it('deve retornar lista de campos da tabela', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue(listaCamposCruMock);

      // Act
      const resultado = await repositorio.buscarPorTabela('TGFPRO', tokenUsuarioTeste);

      // Assert
      expect(resultado).toHaveLength(4);
      expect(resultado[0]).toBeInstanceOf(Campo);
      expect(resultado[0].nomeCampo).toBe('CODPROD');
      expect(resultado[1].nomeCampo).toBe('DESCRPROD');
    });

    it('deve retornar array vazio quando tabela nao tiver campos', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([]);

      // Act
      const resultado = await repositorio.buscarPorTabela('TABELA_SEM_CAMPOS', tokenUsuarioTeste);

      // Assert
      expect(resultado).toEqual([]);
      expect(resultado).toHaveLength(0);
    });

    it('deve passar o nome da tabela como parametro', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([]);

      // Act
      await repositorio.buscarPorTabela('TGFVEI', tokenUsuarioTeste);

      // Assert
      expect(sqlServerMock.executeSQL).toHaveBeenCalledWith(expect.stringContaining('NOMETAB = @param1'), ['TGFVEI']);
    });

    it('deve ordenar campos por nome', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([]);

      // Act
      await repositorio.buscarPorTabela('TGFPRO', tokenUsuarioTeste);

      // Assert
      expect(sqlServerMock.executeSQL).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY NOMECAMPO'),
        expect.any(Array),
      );
    });

    it('deve mapear todos os tipos de campos corretamente', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue(listaCamposCruMock);

      // Act
      const resultado = await repositorio.buscarPorTabela('TGFPRO', tokenUsuarioTeste);

      // Assert
      // Campo inteiro (PK)
      expect(resultado[0].tipo.valor).toBe('I');
      expect(resultado[0].chavePrimaria).toBe(true);

      // Campo string
      expect(resultado[1].tipo.valor).toBe('S');
      expect(resultado[1].tamanho).toBe(200);

      // Campo FK
      expect(resultado[2].chaveEstrangeira).toBe(true);

      // Campo decimal
      expect(resultado[3].tipo.valor).toBe('F');
      expect(resultado[3].decimais).toBe(2);
    });
  });

  describe('buscarPorNome', () => {
    it('deve retornar campo quando existir', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([campoCruMock]);

      // Act
      const resultado = await repositorio.buscarPorNome('TGFPRO', 'CODPROD', tokenUsuarioTeste);

      // Assert
      expect(resultado).not.toBeNull();
      expect(resultado).toBeInstanceOf(Campo);
      expect(resultado?.nomeCampo).toBe('CODPROD');
      expect(resultado?.nomeTabela).toBe('TGFPRO');
    });

    it('deve retornar null quando campo nao existir', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([]);

      // Act
      const resultado = await repositorio.buscarPorNome('TGFPRO', 'CAMPO_INEXISTENTE', tokenUsuarioTeste);

      // Assert
      expect(resultado).toBeNull();
    });

    it('deve retornar null quando resultado for undefined', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue(undefined as any);

      // Act
      const resultado = await repositorio.buscarPorNome('TGFPRO', 'CODPROD', tokenUsuarioTeste);

      // Assert
      expect(resultado).toBeNull();
    });

    it('deve passar tabela e campo como parametros', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([campoCruMock]);

      // Act
      await repositorio.buscarPorNome('TGFVEI', 'CODVEICULO', tokenUsuarioTeste);

      // Assert
      expect(sqlServerMock.executeSQL).toHaveBeenCalledWith(expect.stringContaining('NOMETAB = @param1'), [
        'TGFVEI',
        'CODVEICULO',
      ]);
      expect(sqlServerMock.executeSQL).toHaveBeenCalledWith(
        expect.stringContaining('NOMECAMPO = @param2'),
        expect.any(Array),
      );
    });

    it('deve mapear campo completo corretamente', async () => {
      // Arrange
      const campoDadosMock: CampoCru = {
        NOMETAB: 'TCFOSCAB',
        NOMECAMPO: 'DTABERTURA',
        DESCRICAO: 'Data de Abertura',
        TIPO: 'D',
        TAMANHO: 0,
        DECIMAIS: 0,
        OBRIGATORIO: 'S',
        CHAVEPRIMARIA: 'N',
        CHAVEESTRANGEIRA: 'N',
        APRESENTACAO: 'D',
        VALORPADRAO: 'SYSDATE',
      };
      sqlServerMock.executeSQL.mockResolvedValue([campoDadosMock]);

      // Act
      const resultado = await repositorio.buscarPorNome('TCFOSCAB', 'DTABERTURA', tokenUsuarioTeste);

      // Assert
      expect(resultado?.tipo.ehData()).toBe(true);
      expect(resultado?.obrigatorio).toBe(true);
      expect(resultado?.valorPadrao).toBe('SYSDATE');
    });
  });

  describe('buscarChavesPrimarias', () => {
    it('deve retornar apenas campos que sao chave primaria', async () => {
      // Arrange
      const chavesPrimariasMock = listaCamposCruMock.filter((c) => c.CHAVEPRIMARIA === 'S');
      sqlServerMock.executeSQL.mockResolvedValue(chavesPrimariasMock);

      // Act
      const resultado = await repositorio.buscarChavesPrimarias('TGFPRO', tokenUsuarioTeste);

      // Assert
      expect(resultado).toHaveLength(1);
      expect(resultado[0].chavePrimaria).toBe(true);
      expect(resultado[0].nomeCampo).toBe('CODPROD');
    });

    it('deve incluir clausula WHERE CHAVEPRIMARIA = S', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([]);

      // Act
      await repositorio.buscarChavesPrimarias('TGFPRO', tokenUsuarioTeste);

      // Assert
      expect(sqlServerMock.executeSQL).toHaveBeenCalledWith(expect.stringContaining("CHAVEPRIMARIA = 'S'"), ['TGFPRO']);
    });

    it('deve retornar array vazio quando tabela nao tiver PK', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([]);

      // Act
      const resultado = await repositorio.buscarChavesPrimarias('TABELA_SEM_PK', tokenUsuarioTeste);

      // Assert
      expect(resultado).toEqual([]);
    });

    it('deve retornar multiplas PKs para tabelas compostas', async () => {
      // Arrange
      const pksCompostasMock: CampoCru[] = [
        {
          NOMETAB: 'TGFITE',
          NOMECAMPO: 'NUNOTA',
          DESCRICAO: 'Numero da Nota',
          TIPO: 'I',
          TAMANHO: 10,
          DECIMAIS: 0,
          OBRIGATORIO: 'S',
          CHAVEPRIMARIA: 'S',
          CHAVEESTRANGEIRA: 'N',
          APRESENTACAO: 'E',
          VALORPADRAO: '',
        },
        {
          NOMETAB: 'TGFITE',
          NOMECAMPO: 'SEQUENCIA',
          DESCRICAO: 'Sequencia do Item',
          TIPO: 'I',
          TAMANHO: 5,
          DECIMAIS: 0,
          OBRIGATORIO: 'S',
          CHAVEPRIMARIA: 'S',
          CHAVEESTRANGEIRA: 'N',
          APRESENTACAO: 'E',
          VALORPADRAO: '',
        },
      ];
      sqlServerMock.executeSQL.mockResolvedValue(pksCompostasMock);

      // Act
      const resultado = await repositorio.buscarChavesPrimarias('TGFITE', tokenUsuarioTeste);

      // Assert
      expect(resultado).toHaveLength(2);
      resultado.forEach((campo) => {
        expect(campo.chavePrimaria).toBe(true);
      });
    });
  });

  describe('buscarChavesEstrangeiras', () => {
    it('deve retornar apenas campos que sao chave estrangeira', async () => {
      // Arrange
      const chavesEstrangeirasMock = listaCamposCruMock.filter((c) => c.CHAVEESTRANGEIRA === 'S');
      sqlServerMock.executeSQL.mockResolvedValue(chavesEstrangeirasMock);

      // Act
      const resultado = await repositorio.buscarChavesEstrangeiras('TGFPRO', tokenUsuarioTeste);

      // Assert
      expect(resultado).toHaveLength(1);
      expect(resultado[0].chaveEstrangeira).toBe(true);
      expect(resultado[0].nomeCampo).toBe('CODGRUPOPROD');
    });

    it('deve incluir clausula WHERE CHAVEESTRANGEIRA = S', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([]);

      // Act
      await repositorio.buscarChavesEstrangeiras('TGFPRO', tokenUsuarioTeste);

      // Assert
      expect(sqlServerMock.executeSQL).toHaveBeenCalledWith(expect.stringContaining("CHAVEESTRANGEIRA = 'S'"), [
        'TGFPRO',
      ]);
    });

    it('deve retornar array vazio quando tabela nao tiver FKs', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([]);

      // Act
      const resultado = await repositorio.buscarChavesEstrangeiras('TABELA_SEM_FK', tokenUsuarioTeste);

      // Assert
      expect(resultado).toEqual([]);
    });

    it('deve retornar multiplas FKs quando existirem', async () => {
      // Arrange
      const fksMock: CampoCru[] = [
        {
          NOMETAB: 'TCFOSCAB',
          NOMECAMPO: 'CODVEICULO',
          DESCRICAO: 'Codigo do Veiculo',
          TIPO: 'I',
          TAMANHO: 10,
          DECIMAIS: 0,
          OBRIGATORIO: 'N',
          CHAVEPRIMARIA: 'N',
          CHAVEESTRANGEIRA: 'S',
          APRESENTACAO: 'C',
          VALORPADRAO: '',
        },
        {
          NOMETAB: 'TCFOSCAB',
          NOMECAMPO: 'CODPARC',
          DESCRICAO: 'Codigo do Parceiro',
          TIPO: 'I',
          TAMANHO: 10,
          DECIMAIS: 0,
          OBRIGATORIO: 'N',
          CHAVEPRIMARIA: 'N',
          CHAVEESTRANGEIRA: 'S',
          APRESENTACAO: 'C',
          VALORPADRAO: '',
        },
      ];
      sqlServerMock.executeSQL.mockResolvedValue(fksMock);

      // Act
      const resultado = await repositorio.buscarChavesEstrangeiras('TCFOSCAB', tokenUsuarioTeste);

      // Assert
      expect(resultado).toHaveLength(2);
      resultado.forEach((campo) => {
        expect(campo.chaveEstrangeira).toBe(true);
        expect(campo.ehChave()).toBe(true);
      });
    });
  });

  describe('buscarObrigatorios', () => {
    it('deve retornar apenas campos obrigatorios', async () => {
      // Arrange
      const camposObrigatoriosMock = listaCamposCruMock.filter((c) => c.OBRIGATORIO === 'S');
      sqlServerMock.executeSQL.mockResolvedValue(camposObrigatoriosMock);

      // Act
      const resultado = await repositorio.buscarObrigatorios('TGFPRO', tokenUsuarioTeste);

      // Assert
      expect(resultado).toHaveLength(2);
      resultado.forEach((campo) => {
        expect(campo.obrigatorio).toBe(true);
      });
    });

    it('deve incluir clausula WHERE OBRIGATORIO = S', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([]);

      // Act
      await repositorio.buscarObrigatorios('TGFPRO', tokenUsuarioTeste);

      // Assert
      expect(sqlServerMock.executeSQL).toHaveBeenCalledWith(expect.stringContaining("OBRIGATORIO = 'S'"), ['TGFPRO']);
    });

    it('deve retornar array vazio quando tabela nao tiver campos obrigatorios', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([]);

      // Act
      const resultado = await repositorio.buscarObrigatorios('TABELA_SEM_OBRIGATORIOS', tokenUsuarioTeste);

      // Assert
      expect(resultado).toEqual([]);
    });
  });

  describe('tratamento de erros', () => {
    it('deve propagar erro quando SqlServerService falhar em buscarPorTabela', async () => {
      // Arrange
      const erroMock = new Error('Erro de conexao com banco TESTE');
      sqlServerMock.executeSQL.mockRejectedValue(erroMock);

      // Act & Assert
      await expect(repositorio.buscarPorTabela('TGFPRO', tokenUsuarioTeste)).rejects.toThrow(
        'Erro de conexao com banco TESTE',
      );
    });

    it('deve propagar erro quando SqlServerService falhar em buscarPorNome', async () => {
      // Arrange
      const erroMock = new Error('Timeout na query');
      sqlServerMock.executeSQL.mockRejectedValue(erroMock);

      // Act & Assert
      await expect(repositorio.buscarPorNome('TGFPRO', 'CODPROD', tokenUsuarioTeste)).rejects.toThrow(
        'Timeout na query',
      );
    });

    it('deve propagar erro quando SqlServerService falhar em buscarChavesPrimarias', async () => {
      // Arrange
      const erroMock = new Error('Permissao negada');
      sqlServerMock.executeSQL.mockRejectedValue(erroMock);

      // Act & Assert
      await expect(repositorio.buscarChavesPrimarias('TGFPRO', tokenUsuarioTeste)).rejects.toThrow('Permissao negada');
    });
  });

  describe('mapeamento de tipos de campo', () => {
    it('deve mapear campo tipo texto (S) corretamente', async () => {
      // Arrange
      const campoTextoMock: CampoCru = {
        NOMETAB: 'TGFPRO',
        NOMECAMPO: 'DESCRPROD',
        DESCRICAO: 'Descricao',
        TIPO: 'S',
        TAMANHO: 200,
        DECIMAIS: 0,
        OBRIGATORIO: 'N',
        CHAVEPRIMARIA: 'N',
        CHAVEESTRANGEIRA: 'N',
        APRESENTACAO: 'T',
        VALORPADRAO: '',
      };
      sqlServerMock.executeSQL.mockResolvedValue([campoTextoMock]);

      // Act
      const resultado = await repositorio.buscarPorNome('TGFPRO', 'DESCRPROD', tokenUsuarioTeste);

      // Assert
      expect(resultado?.tipo.ehTexto()).toBe(true);
      expect(resultado?.tipo.ehNumerico()).toBe(false);
    });

    it('deve mapear campo tipo inteiro (I) corretamente', async () => {
      // Arrange
      const campoInteiroMock: CampoCru = {
        NOMETAB: 'TGFPRO',
        NOMECAMPO: 'CODPROD',
        DESCRICAO: 'Codigo',
        TIPO: 'I',
        TAMANHO: 10,
        DECIMAIS: 0,
        OBRIGATORIO: 'S',
        CHAVEPRIMARIA: 'S',
        CHAVEESTRANGEIRA: 'N',
        APRESENTACAO: 'E',
        VALORPADRAO: '',
      };
      sqlServerMock.executeSQL.mockResolvedValue([campoInteiroMock]);

      // Act
      const resultado = await repositorio.buscarPorNome('TGFPRO', 'CODPROD', tokenUsuarioTeste);

      // Assert
      expect(resultado?.tipo.ehNumerico()).toBe(true);
      expect(resultado?.tipo.ehTexto()).toBe(false);
    });

    it('deve mapear campo tipo decimal (F) corretamente', async () => {
      // Arrange
      const campoDecimalMock: CampoCru = {
        NOMETAB: 'TGFPRO',
        NOMECAMPO: 'VLRVENDA',
        DESCRICAO: 'Valor Venda',
        TIPO: 'F',
        TAMANHO: 15,
        DECIMAIS: 2,
        OBRIGATORIO: 'N',
        CHAVEPRIMARIA: 'N',
        CHAVEESTRANGEIRA: 'N',
        APRESENTACAO: 'M',
        VALORPADRAO: '0',
      };
      sqlServerMock.executeSQL.mockResolvedValue([campoDecimalMock]);

      // Act
      const resultado = await repositorio.buscarPorNome('TGFPRO', 'VLRVENDA', tokenUsuarioTeste);

      // Assert
      expect(resultado?.tipo.ehNumerico()).toBe(true);
      expect(resultado?.decimais).toBe(2);
    });

    it('deve mapear campo tipo data (D) corretamente', async () => {
      // Arrange
      const campoDataMock: CampoCru = {
        NOMETAB: 'TCFOSCAB',
        NOMECAMPO: 'DTABERTURA',
        DESCRICAO: 'Data Abertura',
        TIPO: 'D',
        TAMANHO: 0,
        DECIMAIS: 0,
        OBRIGATORIO: 'S',
        CHAVEPRIMARIA: 'N',
        CHAVEESTRANGEIRA: 'N',
        APRESENTACAO: 'D',
        VALORPADRAO: '',
      };
      sqlServerMock.executeSQL.mockResolvedValue([campoDataMock]);

      // Act
      const resultado = await repositorio.buscarPorNome('TCFOSCAB', 'DTABERTURA', tokenUsuarioTeste);

      // Assert
      expect(resultado?.tipo.ehData()).toBe(true);
    });

    it('deve mapear campo tipo booleano (B) corretamente', async () => {
      // Arrange
      const campoBoolMock: CampoCru = {
        NOMETAB: 'TGFPRO',
        NOMECAMPO: 'ATIVO',
        DESCRICAO: 'Ativo',
        TIPO: 'B',
        TAMANHO: 1,
        DECIMAIS: 0,
        OBRIGATORIO: 'N',
        CHAVEPRIMARIA: 'N',
        CHAVEESTRANGEIRA: 'N',
        APRESENTACAO: 'B',
        VALORPADRAO: 'S',
      };
      sqlServerMock.executeSQL.mockResolvedValue([campoBoolMock]);

      // Act
      const resultado = await repositorio.buscarPorNome('TGFPRO', 'ATIVO', tokenUsuarioTeste);

      // Assert
      expect(resultado?.tipo.ehBooleano()).toBe(true);
    });
  });

  describe('verificacao de chaves', () => {
    it('deve identificar campo que eh chave (PK ou FK)', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([campoCruMock]);

      // Act
      const resultado = await repositorio.buscarPorNome('TGFPRO', 'CODPROD', tokenUsuarioTeste);

      // Assert
      expect(resultado?.ehChave()).toBe(true);
    });

    it('deve identificar campo que nao eh chave', async () => {
      // Arrange
      const campoNaoChaveMock: CampoCru = {
        NOMETAB: 'TGFPRO',
        NOMECAMPO: 'DESCRPROD',
        DESCRICAO: 'Descricao',
        TIPO: 'S',
        TAMANHO: 200,
        DECIMAIS: 0,
        OBRIGATORIO: 'S',
        CHAVEPRIMARIA: 'N',
        CHAVEESTRANGEIRA: 'N',
        APRESENTACAO: 'T',
        VALORPADRAO: '',
      };
      sqlServerMock.executeSQL.mockResolvedValue([campoNaoChaveMock]);

      // Act
      const resultado = await repositorio.buscarPorNome('TGFPRO', 'DESCRPROD', tokenUsuarioTeste);

      // Assert
      expect(resultado?.ehChave()).toBe(false);
      expect(resultado?.chavePrimaria).toBe(false);
      expect(resultado?.chaveEstrangeira).toBe(false);
    });
  });

  describe('nome completo do campo', () => {
    it('deve retornar nome completo no formato TABELA.CAMPO', async () => {
      // Arrange
      sqlServerMock.executeSQL.mockResolvedValue([campoCruMock]);

      // Act
      const resultado = await repositorio.buscarPorNome('TGFPRO', 'CODPROD', tokenUsuarioTeste);

      // Assert
      expect(resultado?.obterNomeCompleto()).toBe('TGFPRO.CODPROD');
    });
  });
});
