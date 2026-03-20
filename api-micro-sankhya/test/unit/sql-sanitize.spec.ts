import { escapeSqlString, escapeSqlLike, escapeSqlDate, escapeSqlIdentifier } from '../../src/shared/sql-sanitize';

describe('escapeSqlString', () => {
  it('should double single quotes', () => {
    expect(escapeSqlString("O'Brien")).toBe("O''Brien");
  });

  it('should remove semicolons', () => {
    expect(escapeSqlString('DROP TABLE;')).toBe('DROP TABLE');
  });

  it('should remove SQL comment markers', () => {
    expect(escapeSqlString('hello -- comment')).toBe('hello  comment');
    expect(escapeSqlString('hello /* block */')).toBe('hello  block ');
  });

  it('should handle combined injection attempts', () => {
    expect(escapeSqlString("'; DROP TABLE--")).toBe("'' DROP TABLE");
  });

  it('should return empty string unchanged', () => {
    expect(escapeSqlString('')).toBe('');
  });

  it('should leave safe strings unchanged', () => {
    expect(escapeSqlString('TGFPAR')).toBe('TGFPAR');
  });
});

describe('escapeSqlLike', () => {
  it('should wrap with LIKE wildcards', () => {
    expect(escapeSqlLike('test')).toBe("'%test%'");
  });

  it('should sanitize before wrapping', () => {
    expect(escapeSqlLike("O'Brien")).toBe("'%O''Brien%'");
  });

  it('should handle empty string', () => {
    expect(escapeSqlLike('')).toBe("'%%'");
  });
});

describe('escapeSqlDate', () => {
  it('should accept valid YYYY-MM-DD', () => {
    expect(escapeSqlDate('2026-03-14')).toBe('2026-03-14');
  });

  it('should accept valid YYYY-MM-DD HH:MM:SS', () => {
    expect(escapeSqlDate('2026-03-14 08:30:00')).toBe('2026-03-14 08:30:00');
  });

  it('should accept YYYY-MM-DD HH:MM', () => {
    expect(escapeSqlDate('2026-03-14 08:30')).toBe('2026-03-14 08:30');
  });

  it('should trim whitespace', () => {
    expect(escapeSqlDate('  2026-03-14  ')).toBe('2026-03-14');
  });

  it('should throw on SQL injection attempt', () => {
    expect(() => escapeSqlDate("2026-03-14'; DROP TABLE--")).toThrow('Invalid date format');
  });

  it('should throw on random string', () => {
    expect(() => escapeSqlDate('not-a-date')).toThrow('Invalid date format');
  });

  it('should throw on empty string', () => {
    expect(() => escapeSqlDate('')).toThrow('Invalid date format');
  });
});

describe('escapeSqlIdentifier', () => {
  it('should accept valid table names', () => {
    expect(escapeSqlIdentifier('TGFPAR')).toBe('TGFPAR');
    expect(escapeSqlIdentifier('AD_RDOAPONTAMENTOS')).toBe('AD_RDOAPONTAMENTOS');
  });

  it('should accept names starting with underscore', () => {
    expect(escapeSqlIdentifier('_temp')).toBe('_temp');
  });

  it('should trim whitespace', () => {
    expect(escapeSqlIdentifier(' TGFPAR ')).toBe('TGFPAR');
  });

  it('should throw on SQL injection attempt', () => {
    expect(() => escapeSqlIdentifier("TGFPAR'; DROP TABLE--")).toThrow('Invalid SQL identifier');
  });

  it('should throw on spaces in name', () => {
    expect(() => escapeSqlIdentifier('TABLE NAME')).toThrow('Invalid SQL identifier');
  });

  it('should throw on empty string', () => {
    expect(() => escapeSqlIdentifier('')).toThrow('Invalid SQL identifier');
  });
});
