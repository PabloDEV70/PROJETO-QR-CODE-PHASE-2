import { Test, TestingModule } from '@nestjs/testing';
import { SankhyaPermissionValidatorService } from './sankhya-permission-validator.service';
import { SqlServerService } from '../../../database/sqlserver.service';
import { DatabaseContextService } from '../../../database/database-context.service';
import { DatabaseModule } from '../../../database/database.module';

/**
 * Testes de integração com banco TESTE
 *
 * IMPORTANTE: Estes testes requerem conexão com o banco TESTE
 * Para executar: npm test -- sankhya-permission-validator.integration.spec.ts
 *
 * Usuário de teste: CONVIDADO (CODUSU=311)
 */
describe('SankhyaPermissionValidatorService (Integration)', () => {
  let service: SankhyaPermissionValidatorService;
  let sqlServerService: SqlServerService;
  let databaseContext: DatabaseContextService;
  let module: TestingModule;

  const CONVIDADO_USER_ID = 311;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [SankhyaPermissionValidatorService],
    }).compile();

    service = module.get<SankhyaPermissionValidatorService>(SankhyaPermissionValidatorService);
    sqlServerService = module.get<SqlServerService>(SqlServerService);
    databaseContext = module.get<DatabaseContextService>(DatabaseContextService);
  });

  afterAll(async () => {
    await module.close();
  });

  afterEach(() => {
    service.limparCache();
  });

  describe('Verificação com banco TESTE', () => {
    it('deve conectar com sucesso no banco TESTE', async () => {
      // Act
      const ping = await databaseContext.run('TESTE', () => sqlServerService.ping());

      // Assert
      expect(ping.connected).toBe(true);
      expect(ping.database).toBe('TESTE');
    });

    it('deve retornar permissões do usuário CONVIDADO (311)', async () => {
      // Act
      const tabelas = await databaseContext.run('TESTE', async () => {
        return await service.obterTabelasPermitidas(CONVIDADO_USER_ID);
      });

      // Assert
      expect(Array.isArray(tabelas)).toBe(true);
      expect(tabelas.length).toBeGreaterThan(0);
      expect(tabelas.length).toBeLessThan(3339); // Não deve ter acesso a TODAS as tabelas

      console.log(`Usuário CONVIDADO tem acesso a ${tabelas.length} tabelas`);
    });

    it('CONVIDADO não deve ter acesso a todas as 3.339 tabelas', async () => {
      // Arrange - Contar total de tabelas
      const totalTabelas = await databaseContext.run('TESTE', async () => {
        const result = await sqlServerService.executeSQL('SELECT COUNT(*) as TOTAL FROM TSITAB', []);
        return result[0].TOTAL;
      });

      // Act - Obter tabelas permitidas para CONVIDADO
      const tabelasPermitidas = await databaseContext.run('TESTE', async () => {
        return await service.obterTabelasPermitidas(CONVIDADO_USER_ID);
      });

      // Assert
      expect(totalTabelas).toBeGreaterThan(3000);
      expect(tabelasPermitidas.length).toBeLessThan(totalTabelas);

      console.log(`Total de tabelas: ${totalTabelas}`);
      console.log(`Tabelas permitidas para CONVIDADO: ${tabelasPermitidas.length}`);
    });

    it('deve verificar permissão CONSULTAR para tabela específica', async () => {
      // Arrange - Primeiro obter uma tabela que o usuário tem acesso
      const tabelas = await databaseContext.run('TESTE', async () => {
        return await service.obterTabelasPermitidas(CONVIDADO_USER_ID);
      });

      expect(tabelas.length).toBeGreaterThan(0);
      const tabelaTeste = tabelas[0];

      // Act
      const temPermissao = await databaseContext.run('TESTE', async () => {
        return await service.verificarPermissaoTabela(CONVIDADO_USER_ID, tabelaTeste, 'CONSULTAR');
      });

      // Assert
      expect(temPermissao).toBe(true);
      console.log(`CONVIDADO tem permissão CONSULTAR em ${tabelaTeste}: ${temPermissao}`);
    });

    it('deve negar acesso a tabela sem permissão', async () => {
      // Arrange - Encontrar uma tabela que o usuário NÃO tem acesso
      const todasTabelas = await databaseContext.run('TESTE', async () => {
        const result = await sqlServerService.executeSQL('SELECT TOP 100 NOMETAB FROM TSITAB ORDER BY NOMETAB', []);
        return result.map((r) => r.NOMETAB);
      });

      const tabelasPermitidas = await databaseContext.run('TESTE', async () => {
        return await service.obterTabelasPermitidas(CONVIDADO_USER_ID);
      });

      const tabelaSemPermissao = todasTabelas.find((t) => !tabelasPermitidas.includes(t));

      if (!tabelaSemPermissao) {
        console.log('AVISO: Não foi encontrada tabela sem permissão para testar');
        return;
      }

      // Act
      const temPermissao = await databaseContext.run('TESTE', async () => {
        return await service.verificarPermissaoTabela(CONVIDADO_USER_ID, tabelaSemPermissao, 'CONSULTAR');
      });

      // Assert
      expect(temPermissao).toBe(false);
      console.log(`CONVIDADO NÃO tem permissão para ${tabelaSemPermissao}: correto`);
    });

    it('deve obter detalhes completos de permissão', async () => {
      // Arrange
      const tabelas = await databaseContext.run('TESTE', async () => {
        return await service.obterTabelasPermitidas(CONVIDADO_USER_ID);
      });

      expect(tabelas.length).toBeGreaterThan(0);
      const tabelaTeste = tabelas[0];

      // Act
      const detalhes = await databaseContext.run('TESTE', async () => {
        return await service.obterDetalhesPermissao(CONVIDADO_USER_ID, tabelaTeste);
      });

      // Assert
      expect(detalhes).not.toBeNull();
      expect(detalhes?.nomeTabela).toBe(tabelaTeste);
      expect(typeof detalhes?.consultar).toBe('boolean');
      expect(typeof detalhes?.inserir).toBe('boolean');
      expect(typeof detalhes?.alterar).toBe('boolean');
      expect(typeof detalhes?.excluir).toBe('boolean');

      console.log(`Detalhes de permissão para ${tabelaTeste}:`, detalhes);
    });

    it('deve usar cache e manter performance', async () => {
      // Arrange
      const tabelas = await databaseContext.run('TESTE', async () => {
        return await service.obterTabelasPermitidas(CONVIDADO_USER_ID);
      });

      expect(tabelas.length).toBeGreaterThan(0);
      const tabelaTeste = tabelas[0];

      // Act - Primeira chamada (sem cache)
      const start1 = Date.now();
      await databaseContext.run('TESTE', async () => {
        return await service.verificarPermissaoTabela(CONVIDADO_USER_ID, tabelaTeste, 'CONSULTAR');
      });
      const duration1 = Date.now() - start1;

      // Act - Segunda chamada (com cache)
      const start2 = Date.now();
      await databaseContext.run('TESTE', async () => {
        return await service.verificarPermissaoTabela(CONVIDADO_USER_ID, tabelaTeste, 'CONSULTAR');
      });
      const duration2 = Date.now() - start2;

      // Assert
      expect(duration2).toBeLessThan(duration1); // Cache deve ser mais rápido
      expect(duration2).toBeLessThan(50); // Com cache deve ser < 50ms

      console.log(`Primeira chamada (sem cache): ${duration1}ms`);
      console.log(`Segunda chamada (com cache): ${duration2}ms`);
    });

    it('deve verificar estrutura da query de permissões', async () => {
      // Act - Executar query manualmente para validar estrutura
      const result = await databaseContext.run('TESTE', async () => {
        return await sqlServerService.executeSQL(
          `
          SELECT
            t.NOMETAB,
            ISNULL(uac.CONSULTAR, 'N') AS CONSULTAR,
            ISNULL(uac.INSERIR, 'N') AS INSERIR,
            ISNULL(uac.ALTERAR, 'N') AS ALTERAR,
            ISNULL(uac.EXCLUIR, 'N') AS EXCLUIR,
            t.CODTAB,
            t.NOMEADT
          FROM TSITAB t
          LEFT JOIN TSIUAC uac ON uac.CODTAB = t.CODTAB AND uac.CODUSU = @param1
          WHERE uac.CODUSU IS NOT NULL
            AND (
              uac.CONSULTAR = 'S'
              OR uac.INSERIR = 'S'
              OR uac.ALTERAR = 'S'
              OR uac.EXCLUIR = 'S'
            )
          ORDER BY t.NOMETAB
          `,
          [CONVIDADO_USER_ID],
        );
      });

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Validar estrutura de cada registro
      result.forEach((row) => {
        expect(row).toHaveProperty('NOMETAB');
        expect(row).toHaveProperty('CONSULTAR');
        expect(row).toHaveProperty('INSERIR');
        expect(row).toHaveProperty('ALTERAR');
        expect(row).toHaveProperty('EXCLUIR');
        expect(row).toHaveProperty('CODTAB');
        expect(['S', 'N']).toContain(row.CONSULTAR);
        expect(['S', 'N']).toContain(row.INSERIR);
        expect(['S', 'N']).toContain(row.ALTERAR);
        expect(['S', 'N']).toContain(row.EXCLUIR);
      });

      console.log(`Query retornou ${result.length} registros com estrutura válida`);
    });
  });

  describe('Casos extremos', () => {
    it('deve lidar com usuário inexistente', async () => {
      // Act
      const tabelas = await databaseContext.run('TESTE', async () => {
        return await service.obterTabelasPermitidas(999999);
      });

      // Assert
      expect(tabelas).toEqual([]);
    });

    it('deve lidar com tabela inexistente', async () => {
      // Act
      const temPermissao = await databaseContext.run('TESTE', async () => {
        return await service.verificarPermissaoTabela(CONVIDADO_USER_ID, 'TABELA_QUE_NAO_EXISTE', 'CONSULTAR');
      });

      // Assert
      expect(temPermissao).toBe(false);
    });

    it('deve normalizar nome de tabela corretamente', async () => {
      // Arrange
      const tabelas = await databaseContext.run('TESTE', async () => {
        return await service.obterTabelasPermitidas(CONVIDADO_USER_ID);
      });

      if (tabelas.length === 0) return;

      const tabelaTeste = tabelas[0];

      // Act - Testar com lowercase
      const result1 = await databaseContext.run('TESTE', async () => {
        return await service.verificarPermissaoTabela(CONVIDADO_USER_ID, tabelaTeste.toLowerCase(), 'CONSULTAR');
      });

      // Act - Testar com uppercase
      const result2 = await databaseContext.run('TESTE', async () => {
        return await service.verificarPermissaoTabela(CONVIDADO_USER_ID, tabelaTeste.toUpperCase(), 'CONSULTAR');
      });

      // Assert
      expect(result1).toBe(result2);
    });
  });
});
