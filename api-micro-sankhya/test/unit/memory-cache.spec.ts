import { cache } from '../../src/shared/cache/memory-cache';
import { cacheKey } from '../../src/shared/cache/cache-keys';

afterEach(() => {
  cache.clear();
});

describe('MemoryCache', () => {
  it('should store and retrieve a value', () => {
    cache.set('key1', 'hello', 60000);
    expect(cache.get<string>('key1')).toBe('hello');
  });

  it('should return undefined for missing key', () => {
    expect(cache.get('nope')).toBeUndefined();
  });

  it('should return undefined for expired key', () => {
    cache.set('key1', 'hello', 1); // 1ms TTL
    // Advance past TTL
    const realNow = Date.now;
    Date.now = () => realNow() + 10;
    expect(cache.get('key1')).toBeUndefined();
    Date.now = realNow;
  });

  it('should delete a key', () => {
    cache.set('key1', 'hello', 60000);
    cache.delete('key1');
    expect(cache.get('key1')).toBeUndefined();
  });

  it('should clear all keys', () => {
    cache.set('a', 1, 60000);
    cache.set('b', 2, 60000);
    expect(cache.size).toBe(2);
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it('should overwrite existing key', () => {
    cache.set('key1', 'first', 60000);
    cache.set('key1', 'second', 60000);
    expect(cache.get<string>('key1')).toBe('second');
  });

  it('should handle complex objects', () => {
    const data = { items: [1, 2, 3], nested: { a: true } };
    cache.set('obj', data, 60000);
    expect(cache.get('obj')).toEqual(data);
  });
});

describe('cacheKey', () => {
  it('should return prefix alone when no params', () => {
    expect(cacheKey('test')).toBe('test');
  });

  it('should return prefix alone when params is undefined', () => {
    expect(cacheKey('test', undefined)).toBe('test');
  });

  it('should sort params alphabetically', () => {
    const result = cacheKey('test', { z: 1, a: 2 });
    expect(result).toBe('test:a=2&z=1');
  });

  it('should filter null and undefined values', () => {
    const result = cacheKey('test', { a: 1, b: null, c: undefined, d: 'ok' });
    expect(result).toBe('test:a=1&d=ok');
  });

  it('should return prefix only if all params filtered out', () => {
    const result = cacheKey('test', { a: null, b: undefined });
    expect(result).toBe('test');
  });

  it('should handle empty params object', () => {
    expect(cacheKey('test', {})).toBe('test');
  });
});
