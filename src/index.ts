type CacheItemOptions<T> = {
  value: T;
  timeoutId?: NodeJS.Timeout;
};

class Mmry<T> {
  private cache: Map<string, CacheItemOptions<T>> = new Map();
  private hits: number = 0;
  private misses: number = 0;
  /**
   * Retrieves the cache statistics.
   * @returns An object containing cache statistics (hits, misses, and size).
   */
  public getStats(): { hits: number; misses: number; size: number } {
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
    };
  }
  /**
   * Retrieves the cache hit rate (hits / (hits + misses)).
   * @returns The cache hit rate as a percentage (0-100).
   */
  public getHitRate(): number {
    const totalRequests = this.hits + this.misses;
    if (totalRequests === 0) {
      return 0;
    }
    return (this.hits / totalRequests) * 100;
  }

  /**
   * Retrieves the cache miss rate (misses / (hits + misses)).
   * @returns The cache miss rate as a percentage (0-100).
   */
  public getMissRate(): number {
    const totalRequests = this.hits + this.misses;
    if (totalRequests === 0) {
      return 0;
    }
    return (this.misses / totalRequests) * 100;
  }
  /**
   * Adds a value to the cache with a specified TTL.
   * @param key The key associated with the value.
   * @param value The value to be cached.
   * @param ttlString The TTL string in the format "<amount> <unit>", e.g., "5 minutes", "5234 seconds".
   */
  public put(key: string, value: T, ttlString?: string): void {
    if (!ttlString) {
      this.cache.set(key, { value });
      return;
    }
    const ttl = this.parseTTLString(ttlString);
    const timeoutId = setTimeout(() => {
      this.del(key);
    }, ttl);

    const cacheItem: CacheItemOptions<T> = {
      value,
      timeoutId,
    };

    this.cache.set(key, cacheItem);
  }

  /**
   * Retrieves a value from the cache.
   * @param key The key associated with the value.
   * @returns The cached value, or undefined if the key does not exist or has expired.
   */
  public get(key: string): T | undefined {
    const cacheItem = this.cache.get(key);
    if (cacheItem) {
      this.hits++;
      return cacheItem.value;
    } else {
      this.misses++;
      return undefined;
    }
  }

  /**
   * Removes a value from the cache.
   * @param key The key associated with the value.
   */
  public del(key: string): void {
    const cacheItem = this.cache.get(key);
    if (cacheItem) {
      clearTimeout(cacheItem.timeoutId);
      this.cache.delete(key);
    }
  }
  /**
   * Retrieves all key-value pairs from the cache.
   * @returns An object containing all cached key-value pairs.
   */
  public getAll(): { [key: string]: T } {
    const allItems: { [key: string]: T } = {};
    for (const [key, cacheItem] of this.cache.entries()) {
      allItems[key] = cacheItem.value;
    }
    return allItems;
  }
  /**
   * Removes all values from the cache.
   */
  public clearAll(): void {
    for (const cacheItem of this.cache.values()) {
      clearTimeout(cacheItem.timeoutId);
    }
    this.cache.clear();
  }

  /**
   * Parses the TTL string into milliseconds.
   * @param ttlString The TTL string in the format "<amount> <unit>", e.g., "5 minutes", "5234 seconds".
   * @returns The TTL in milliseconds.
   */
  private parseTTLString(ttlString: string): number {
    const [amount, unit] = ttlString.split(' ');
    const ttl = parseInt(amount);

    switch (unit.toLowerCase()) {
      case 'seconds':
      case 'second':
        return ttl * 1000;
      case 'minutes':
      case 'minute':
        return ttl * 1000 * 60;
      case 'hours':
      case 'hour':
        return ttl * 1000 * 60 * 60;
      case 'days':
      case 'day':
        return ttl * 1000 * 60 * 60 * 24;
      default:
        throw new Error('Invalid TTL unit');
    }
  }
}
export default Mmry;
