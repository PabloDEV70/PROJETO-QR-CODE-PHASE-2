import {
  parseIncludeExclude,
  buildFilterSql,
  ParsedFilter,
} from '../../src/shared/utils/filter-parser';

describe('parseIncludeExclude', () => {
  it('should parse single include value', () => {
    const result = parseIncludeExclude('3396');
    expect(result.mode).toBe('include');
    expect(result.values).toEqual([3396]);
  });

  it('should parse multiple include values', () => {
    const result = parseIncludeExclude('1,3,8');
    expect(result.mode).toBe('include');
    expect(result.values).toEqual([1, 3, 8]);
  });

  it('should parse single exclude value', () => {
    const result = parseIncludeExclude('!5');
    expect(result.mode).toBe('exclude');
    expect(result.values).toEqual([5]);
  });

  it('should parse multiple exclude values', () => {
    const result = parseIncludeExclude('!2,5');
    expect(result.mode).toBe('exclude');
    expect(result.values).toEqual([2, 5]);
  });

  it('should ignore NaN values', () => {
    const result = parseIncludeExclude('1,abc,3');
    expect(result.mode).toBe('include');
    expect(result.values).toEqual([1, 3]);
  });

  it('should handle spaces around values', () => {
    const result = parseIncludeExclude('1 , 3 , 8');
    expect(result.mode).toBe('include');
    expect(result.values).toEqual([1, 3, 8]);
  });

  it('should handle exclude with spaces', () => {
    const result = parseIncludeExclude('! 2, 5');
    expect(result.mode).toBe('exclude');
    expect(result.values).toEqual([2, 5]);
  });

  it('should return empty values for empty string after !', () => {
    const result = parseIncludeExclude('!');
    expect(result.mode).toBe('exclude');
    expect(result.values).toEqual([]);
  });
});

describe('buildFilterSql', () => {
  it('should build = for single include', () => {
    const filter: ParsedFilter = { mode: 'include', values: [1] };
    expect(buildFilterSql('col', filter)).toBe('col = 1');
  });

  it('should build <> for single exclude', () => {
    const filter: ParsedFilter = { mode: 'exclude', values: [5] };
    expect(buildFilterSql('col', filter)).toBe('col <> 5');
  });

  it('should build IN for multiple include', () => {
    const filter: ParsedFilter = { mode: 'include', values: [1, 3, 8] };
    expect(buildFilterSql('col', filter)).toBe('col IN (1, 3, 8)');
  });

  it('should build NOT IN for multiple exclude', () => {
    const filter: ParsedFilter = { mode: 'exclude', values: [2, 5] };
    expect(buildFilterSql('col', filter)).toBe('col NOT IN (2, 5)');
  });

  it('should return empty string for no values', () => {
    const filter: ParsedFilter = { mode: 'include', values: [] };
    expect(buildFilterSql('col', filter)).toBe('');
  });

  it('should use full column name with table prefix', () => {
    const filter: ParsedFilter = { mode: 'include', values: [10, 20] };
    expect(buildFilterSql('fun.CODDEP', filter)).toBe(
      'fun.CODDEP IN (10, 20)',
    );
  });
});
