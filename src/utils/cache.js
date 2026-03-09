/**
 * Simple in-memory cache with TTL.
 */
class MemoryCache {
  constructor(ttl = 300000) { this.store = new Map(); this.ttl = ttl; }
  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) { this.store.delete(key); return null; }
    return item.value;
  }
  set(key, value, ttl) {
    this.store.set(key, { value, expiry: Date.now() + (ttl || this.ttl) });
  }
  delete(key) { this.store.delete(key); }
  clear() { this.store.clear(); }
  size() { return this.store.size; }
}
module.exports = new MemoryCache();
