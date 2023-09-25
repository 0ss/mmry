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

  it('should expire a cached value after the specified TTL (seconds)', () => {
    jest.useFakeTimers();
    cache.put('key', 'value', '1 seconds');
    jest.advanceTimersByTime(1000);
    const result = cache.get('key');
    expect(result).toBeUndefined();
  });
  it('should work with second/s minute/s hour/s day/s', () => {
    cache.put('key', 'value', '1 second');
    cache.put('key', 'value', '1 seconds');
    cache.put('key', 'value', '1 minute');
    cache.put('key', 'value', '1 minutes');
    cache.put('key', 'value', '1 hour');
    cache.put('key', 'value', '1 hours');
    cache.put('key', 'value', '1 day');
    cache.put('key', 'value', '1 days');
  });

  it('should fail to expire a cached value after the specified TTL (seconds)', () => {
    jest.useFakeTimers();
    cache.put('key', 'value', '1 seconds');
    jest.advanceTimersByTime(999);
    const result = cache.get('key');
    expect(result).toBe('value');
  });
  it('should expire a cached value after the specified TTL (minutes)', () => {
    jest.useFakeTimers();
    cache.put('key', 'value', '1 minutes');
    jest.advanceTimersByTime(60000);
    const result = cache.get('key');
    expect(result).toBeUndefined();
  });
  it('should fail to expire a cached value after the specified TTL (minutes)', () => {
    jest.useFakeTimers();
    cache.put('key', 'value', '1 minutes');
    jest.advanceTimersByTime(59999);
    const result = cache.get('key');
    expect(result).toBe('value');
  });
  it('should expire a cached value after the specified TTL (hours)', () => {
    jest.useFakeTimers();
    cache.put('key', 'value', '1 hours');
    jest.advanceTimersByTime(3600000);
    const result = cache.get('key');
    expect(result).toBeUndefined();
  });
  it('should fail to expire a cached value after the specified TTL (hours)', () => {
    jest.useFakeTimers();
    cache.put('key', 'value', '1 hours');
    jest.advanceTimersByTime(3599999);
    const result = cache.get('key');
    expect(result).toBe('value');
  });

  it('should expire a cached value after the specified TTL (days)', () => {
    jest.useFakeTimers();
    cache.put('key', 'value', '1 days');
    jest.advanceTimersByTime(86400000);
    const result = cache.get('key');
    expect(result).toBeUndefined();
  });
  it('should fail to expire a cached value after the specified TTL (days)', () => {
    jest.useFakeTimers();
    cache.put('key', 'value', '1 days');
    jest.advanceTimersByTime(86399999);
    const result = cache.get('key');
    expect(result).toBe('value');
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

  it('should track cache hits and misses', () => {
    cache.put('key1', 'value1');
    const result1 = cache.get('key1'); // This is a cache hit
    const result2 = cache.get('key2'); // This is a cache miss
    const stats = cache.getStats();

    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(result1).toBe('value1');
    expect(result2).toBeUndefined();
  });

  it('should calculate cache hit rate and miss rate correctly', () => {
    cache.put('key1', 'value1');
    const result1 = cache.get('key1'); // Cache hit
    const result2 = cache.get('key3'); // Cache miss

    // Cache hit rate: (1 hit / 2 total requests) * 100 = 50%
    expect(cache.getHitRate()).toBe(50);
    // Cache miss rate: (1 miss / 2 total requests) * 100 = 50%
    expect(cache.getMissRate()).toBe(50);
    expect(result1).toBe('value1');
    expect(result2).toBeUndefined();
  });

  it('should expose cache statistics', () => {
    cache.put('key1', 'value1');
    cache.put('key2', 'value2');
    const stats = cache.getStats();

    expect(stats.hits).toBe(0); // No hits yet
    expect(stats.misses).toBe(0); // No misses yet
    expect(stats.size).toBe(2); // Two items in the cache
  });
});
