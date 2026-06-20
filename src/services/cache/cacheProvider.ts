export interface CacheProvider {
  /**
   * Retrieve a value from the cache.
   * Returns the parsed value, or null if key does not exist or has expired.
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Write a value to the cache with a Time-to-Live (TTL) in seconds.
   */
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;

  /**
   * Delete a key from the cache.
   */
  delete(key: string): Promise<void>;

  /**
   * Clear all items from the cache.
   */
  clear(): Promise<void>;
}
