import Mmry from '../src';

describe('Mmry', () => {
  let cache: Mmry<string>;

  beforeEach(() => {
    cache = new Mmry<string>();
  });

  afterEach(() => {
    jest.useRealTimers();
    cache?.clearAll;
  });

  it('should store and retrieve a value', () => {
    cache.put('key', 'value');
    const result = cache.get('key');
    expect(result).toBe('value');
  });
  it('should store and retrieve even objects', () => {
    const cache = new Mmry<{ name: string }>();
    cache.put('key', { name: 'value' });
    const result = cache.get('key');
    expect(result).toMatchObject({ name: 'value' });
  });
  it('should return undefined for a non-existent key', () => {
    const result = cache.get('nonexistent');
    expect(result).toBeUndefined();
  });

  it('should expire a cached value after the specified TTL', () => {
    jest.useFakeTimers();
    cache.put('key', 'value', '1 seconds');
    jest.advanceTimersByTime(1000);
    const result = cache.get('key');
    expect(result).toBeUndefined();
  });

  it('should not expire a cached value before the TTL', () => {
    jest.useFakeTimers();
    cache.put('key', 'value', '5 minutes');
    jest.advanceTimersByTime(1000);
    const result = cache.get('key');
    expect(result).toBe('value');
  });

  it('should delete a cached value', () => {
    cache.put('key', 'value');
    cache.del('key');
    const result = cache.get('key');
    expect(result).toBeUndefined();
  });

  it('should set a value without TTL when TTL string is not provided', () => {
    cache.put('key', 'value');
    const result = cache.get('key');
    expect(result).toBe('value');
  });

  it('should set multiple key-value pairs with a specified TTL', () => {
    cache.put('key1', 'value1', '1 minutes');
    cache.put('key2', 'value2', '30 seconds');
    const result1 = cache.get('key1');
    const result2 = cache.get('key2');
    expect(result1).toBe('value1');
    expect(result2).toBe('value2');
  });

  it('should return all key-value pairs in the cache', () => {
    cache.put('key1', 'value1');
    cache.put('key2', 'value2');
    const result = cache.getAll();
    expect(result).toEqual({ key1: 'value1', key2: 'value2' });
  });
});
