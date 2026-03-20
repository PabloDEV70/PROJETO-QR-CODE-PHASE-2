import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TablePermissionService } from './table-permission.service';

describe('TablePermissionService', () => {
  let service: TablePermissionService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TablePermissionService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TablePermissionService>(TablePermissionService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isWriteAllowed', () => {
    describe('PROD environment', () => {
      it('deve permitir INSERT em tabela da allowlist', () => {
        const allowed = service.isWriteAllowed('AD_RDOAPONTAMENTOS', 'PROD', 'INSERT');
        expect(allowed).toBe(true);
      });

      it('deve permitir UPDATE em tabela da allowlist', () => {
        const allowed = service.isWriteAllowed('AD_RDOAPONDETALHES', 'PROD', 'UPDATE');
        expect(allowed).toBe(true);
      });

      it('deve permitir DELETE em tabela da allowlist', () => {
        const allowed = service.isWriteAllowed('AD_RDOMOTIVOS', 'PROD', 'DELETE');
        expect(allowed).toBe(true);
      });

      it('deve bloquear INSERT em tabela TSI* (sistema)', () => {
        const allowed = service.isWriteAllowed('TSIUSU', 'PROD', 'INSERT');
        expect(allowed).toBe(false);
      });

      it('deve bloquear INSERT em tabela TDD* (dicionário)', () => {
        const allowed = service.isWriteAllowed('TDDCAM', 'PROD', 'INSERT');
        expect(allowed).toBe(false);
      });

      it('deve bloquear INSERT em tabela TRD* (metadata UI)', () => {
        const allowed = service.isWriteAllowed('TRDCMP', 'PROD', 'INSERT');
        expect(allowed).toBe(false);
      });

      it('deve bloquear INSERT em tabela não autorizada (TGFVEI)', () => {
        const allowed = service.isWriteAllowed('TGFVEI', 'PROD', 'INSERT');
        expect(allowed).toBe(false);
      });

      it('deve bloquear INSERT em tabela AD_* não autorizada', () => {
        const allowed = service.isWriteAllowed('AD_CUSTOMTABLE', 'PROD', 'INSERT');
        expect(allowed).toBe(false);
      });

      it('deve ser case-insensitive na validação', () => {
        expect(service.isWriteAllowed('ad_rdoapontamentos', 'PROD', 'INSERT')).toBe(true);
        expect(service.isWriteAllowed('AD_RDOAPONTAMENTOS', 'PROD', 'INSERT')).toBe(true);
        expect(service.isWriteAllowed('Ad_RdoApontamentos', 'PROD', 'INSERT')).toBe(true);
      });
    });

    describe('TESTE environment', () => {
      it('deve permitir INSERT em qualquer tabela', () => {
        expect(service.isWriteAllowed('TSIUSU', 'TESTE', 'INSERT')).toBe(true);
        expect(service.isWriteAllowed('TDDCAM', 'TESTE', 'INSERT')).toBe(true);
        expect(service.isWriteAllowed('TGFVEI', 'TESTE', 'INSERT')).toBe(true);
        expect(service.isWriteAllowed('AD_QUALQUER', 'TESTE', 'INSERT')).toBe(true);
      });

      it('deve permitir UPDATE em qualquer tabela', () => {
        expect(service.isWriteAllowed('TSIUSU', 'TESTE', 'UPDATE')).toBe(true);
      });

      it('deve permitir DELETE em qualquer tabela', () => {
        expect(service.isWriteAllowed('TSIUSU', 'TESTE', 'DELETE')).toBe(true);
      });
    });

    describe('TREINA environment', () => {
      it('deve bloquear INSERT em qualquer tabela', () => {
        expect(service.isWriteAllowed('AD_RDOAPONTAMENTOS', 'TREINA', 'INSERT')).toBe(false);
        expect(service.isWriteAllowed('TSIUSU', 'TREINA', 'INSERT')).toBe(false);
        expect(service.isWriteAllowed('TGFVEI', 'TREINA', 'INSERT')).toBe(false);
      });

      it('deve bloquear UPDATE em qualquer tabela', () => {
        expect(service.isWriteAllowed('AD_RDOAPONTAMENTOS', 'TREINA', 'UPDATE')).toBe(false);
      });

      it('deve bloquear DELETE em qualquer tabela', () => {
        expect(service.isWriteAllowed('AD_RDOAPONTAMENTOS', 'TREINA', 'DELETE')).toBe(false);
      });
    });

    describe('Validação de parâmetros', () => {
      it('deve retornar false quando tableName é vazio', () => {
        const allowed = service.isWriteAllowed('', 'PROD', 'INSERT');
        expect(allowed).toBe(false);
      });

      it('deve retornar false quando tableName é null', () => {
        const allowed = service.isWriteAllowed(null as any, 'PROD', 'INSERT');
        expect(allowed).toBe(false);
      });

      it('deve retornar false quando database é null', () => {
        const allowed = service.isWriteAllowed('AD_RDOAPONTAMENTOS', null as any, 'INSERT');
        expect(allowed).toBe(false);
      });

      it('deve retornar false quando operation é null', () => {
        const allowed = service.isWriteAllowed('AD_RDOAPONTAMENTOS', 'PROD', null as any);
        expect(allowed).toBe(false);
      });
    });
  });

  describe('requiresBossApproval', () => {
    it('deve retornar true para PROD', () => {
      const required = service.requiresBossApproval('AD_RDOAPONTAMENTOS', 'PROD');
      expect(required).toBe(true);
    });

    it('deve retornar false para TESTE', () => {
      const required = service.requiresBossApproval('AD_RDOAPONTAMENTOS', 'TESTE');
      expect(required).toBe(false);
    });

    it('deve retornar false para TREINA', () => {
      const required = service.requiresBossApproval('AD_RDOAPONTAMENTOS', 'TREINA');
      expect(required).toBe(false);
    });

    it('deve retornar false para database desconhecido', () => {
      const required = service.requiresBossApproval('AD_RDOAPONTAMENTOS', 'UNKNOWN');
      expect(required).toBe(false);
    });
  });

  describe('getAllowedTables', () => {
    it('deve retornar lista de tabelas permitidas para PROD', () => {
      const tables = service.getAllowedTables('PROD');
      expect(tables).toContain('AD_RDOAPONTAMENTOS');
      expect(tables).toContain('AD_RDOAPONDETALHES');
      expect(tables).toContain('AD_RDOMOTIVOS');
    });

    it('deve retornar * para TESTE', () => {
      const tables = service.getAllowedTables('TESTE');
      expect(tables).toContain('*');
    });

    it('deve retornar lista vazia para TREINA', () => {
      const tables = service.getAllowedTables('TREINA');
      expect(tables).toEqual([]);
    });

    it('deve retornar array vazio para database desconhecido', () => {
      const tables = service.getAllowedTables('UNKNOWN');
      expect(tables).toEqual([]);
    });
  });

  describe('Environment variable overrides', () => {
    it('deve respeitar env override específico para tabela (true)', () => {
      (configService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'WRITE_ALLOWED_PROD_TGFVEI') return 'true';
        return undefined;
      });

      const allowed = service.isWriteAllowed('TGFVEI', 'PROD', 'INSERT');
      expect(allowed).toBe(true);
    });

    it('deve respeitar env override específico para tabela (false)', () => {
      (configService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'WRITE_ALLOWED_PROD_AD_RDOAPONTAMENTOS') return 'false';
        return undefined;
      });

      const allowed = service.isWriteAllowed('AD_RDOAPONTAMENTOS', 'PROD', 'INSERT');
      expect(allowed).toBe(false);
    });

    it('deve respeitar env override de lista para database', () => {
      (configService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'WRITE_ALLOWED_PROD_TGFVEI') return undefined;
        if (key === 'WRITE_ALLOWED_TABLES_PROD') {
          return 'TGFVEI,TCFOSCAB,AD_RDOAPONTAMENTOS';
        }
        return undefined;
      });

      expect(service.isWriteAllowed('TGFVEI', 'PROD', 'INSERT')).toBe(true);
      expect(service.isWriteAllowed('TCFOSCAB', 'PROD', 'INSERT')).toBe(true);
      expect(service.isWriteAllowed('AD_RDOAPONTAMENTOS', 'PROD', 'INSERT')).toBe(true);
      expect(service.isWriteAllowed('TSIUSU', 'PROD', 'INSERT')).toBe(false);
    });

    it('deve processar valores booleanos variados (true)', () => {
      (configService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'WRITE_ALLOWED_PROD_TGFVEI') return '1'; // Numeral
        return undefined;
      });
      expect(service.isWriteAllowed('TGFVEI', 'PROD', 'INSERT')).toBe(true);

      (configService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'WRITE_ALLOWED_PROD_TGFVEI') return 'S'; // Português
        return undefined;
      });
      expect(service.isWriteAllowed('TGFVEI', 'PROD', 'INSERT')).toBe(true);

      (configService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'WRITE_ALLOWED_PROD_TGFVEI') return 'yes'; // English
        return undefined;
      });
      expect(service.isWriteAllowed('TGFVEI', 'PROD', 'INSERT')).toBe(true);
    });

    it('deve processar valores booleanos variados (false)', () => {
      (configService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'WRITE_ALLOWED_PROD_TGFVEI') return '0'; // Numeral
        return undefined;
      });
      expect(service.isWriteAllowed('TGFVEI', 'PROD', 'INSERT')).toBe(false);

      (configService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'WRITE_ALLOWED_PROD_TGFVEI') return 'N'; // Português
        return undefined;
      });
      expect(service.isWriteAllowed('TGFVEI', 'PROD', 'INSERT')).toBe(false);

      (configService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'WRITE_ALLOWED_PROD_TGFVEI') return 'no'; // English
        return undefined;
      });
      expect(service.isWriteAllowed('TGFVEI', 'PROD', 'INSERT')).toBe(false);
    });

    it('deve priorizar env override sobre config file', () => {
      // Config file tem TGFVEI bloqueado
      // Mas env override permite
      (configService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'WRITE_ALLOWED_PROD_TGFVEI') return 'true';
        return undefined;
      });

      const allowed = service.isWriteAllowed('TGFVEI', 'PROD', 'INSERT');
      expect(allowed).toBe(true);
    });
  });

  describe('Wildcard patterns', () => {
    it('deve entender pattern TSI*', () => {
      expect(service.isWriteAllowed('TSIUSU', 'PROD', 'INSERT')).toBe(false);
      expect(service.isWriteAllowed('TSIEMF', 'PROD', 'INSERT')).toBe(false);
      expect(service.isWriteAllowed('TSIALIAS', 'PROD', 'INSERT')).toBe(false);
    });

    it('deve entender pattern TDD*', () => {
      expect(service.isWriteAllowed('TDDCAM', 'PROD', 'INSERT')).toBe(false);
      expect(service.isWriteAllowed('TDDTAB', 'PROD', 'INSERT')).toBe(false);
    });

    it('deve entender pattern AD_*', () => {
      // Qualquer coisa que começa com AD_ é bloqueada
      // EXCETO as que estão na allowlist
      expect(service.isWriteAllowed('AD_RDOAPONTAMENTOS', 'PROD', 'INSERT')).toBe(true); // Na allowlist
      expect(service.isWriteAllowed('AD_OUTRA', 'PROD', 'INSERT')).toBe(false); // Bloqueado pelo pattern
    });

    it('deve entender wildcard *', () => {
      // * em blockedPatterns bloqueia tudo
      // * em allowedTables permite tudo
      const testeAllowed = service.isWriteAllowed('QUALQUER_TABELA', 'TESTE', 'INSERT');
      expect(testeAllowed).toBe(true);

      const trainaAllowed = service.isWriteAllowed('QUALQUER_TABELA', 'TREINA', 'INSERT');
      expect(trainaAllowed).toBe(false);
    });

    it('deve ser case-insensitive em patterns', () => {
      expect(service.isWriteAllowed('tsiusu', 'PROD', 'INSERT')).toBe(false);
      expect(service.isWriteAllowed('TsiUsu', 'PROD', 'INSERT')).toBe(false);
      expect(service.isWriteAllowed('TSIUSU', 'PROD', 'INSERT')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('deve ignorar whitespace em table names', () => {
      expect(service.isWriteAllowed('  AD_RDOAPONTAMENTOS  ', 'PROD', 'INSERT')).toBe(true);
      expect(service.isWriteAllowed('\tTSIUSU\t', 'PROD', 'INSERT')).toBe(false);
    });

    it('deve lidar com configuration ausente', () => {
      // Database com configuração ausente
      const allowed = service.isWriteAllowed('TGFVEI', 'INVALID_DB' as any, 'INSERT');
      expect(allowed).toBe(false);
    });

    it('deve retornar false para operação desconhecida', () => {
      // Mesmo que a chamada seja inválida
      const allowed = service.isWriteAllowed('AD_RDOAPONTAMENTOS', 'PROD', null as any);
      expect(allowed).toBe(false);
    });
  });

  describe('getConfiguration', () => {
    it('deve retornar configuração para PROD', () => {
      const config = service.getConfiguration('PROD');
      expect(config).toBeDefined();
      expect(config?.allowedTables).toContain('AD_RDOAPONTAMENTOS');
      expect(config?.requireBossApproval).toBe(true);
    });

    it('deve retornar configuração para TESTE', () => {
      const config = service.getConfiguration('TESTE');
      expect(config).toBeDefined();
      expect(config?.allowedTables).toContain('*');
      expect(config?.requireBossApproval).toBe(false);
    });

    it('deve retornar configuração para TREINA', () => {
      const config = service.getConfiguration('TREINA');
      expect(config).toBeDefined();
      expect(config?.allowedTables).toEqual([]);
      expect(config?.blockedPatterns).toContain('*');
    });

    it('deve retornar undefined para database desconhecido', () => {
      const config = service.getConfiguration('UNKNOWN');
      expect(config).toBeUndefined();
    });
  });
});
