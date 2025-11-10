/**
 * Simple in-memory token bucket rate limiter per user.
 * Not suitable for multi-instance deployments. Replace with Redis or Supabase RLS + counters for production.
 */
const buckets = new Map();

/**
 * Create/consume tokens per key.
 * @param {string} key - user id or IP
 * @param {object} options
 * @param {number} [options.capacity=10]
 * @param {number} [options.refillIntervalMs=60000] - ms
 * @param {number} [options.refillAmount=10]
 * @returns {boolean} allowed
 */
export function consume(key, options = {}) {
  const capacity = options.capacity ?? 10;
  const refillIntervalMs = options.refillIntervalMs ?? 60_000;
  const refillAmount = options.refillAmount ?? capacity;
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: capacity, lastRefill: now };
    buckets.set(key, bucket);
  }

  // Refill
  if (now - bucket.lastRefill >= refillIntervalMs) {
    const intervals = Math.floor((now - bucket.lastRefill) / refillIntervalMs);
    bucket.tokens = Math.min(capacity, bucket.tokens + intervals * refillAmount);
    bucket.lastRefill = bucket.lastRefill + intervals * refillIntervalMs;
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return true;
  }
  return false;
}

export default { consume };
