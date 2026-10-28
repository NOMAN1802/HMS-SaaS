import { describe, expect, it } from 'vitest';
import { DomainError } from '@hms/domain-kernel';
import { createConcurrencyLimiter } from './concurrency-limiter.js';
import { InMemoryRateLimiter } from './rate-limiter.js';

const t0 = new Date('2026-10-28T08:00:00.000Z');
const later = (ms: number) => new Date(t0.getTime() + ms);

describe('InMemoryRateLimiter (fixed window)', () => {
  it('allows up to the limit in one window, then refuses with the seconds left', async () => {
    const limiter = new InMemoryRateLimiter({ limit: 2, windowMs: 60_000 });
    expect((await limiter.consume('k', t0)).allowed).toBe(true);
    expect((await limiter.consume('k', later(1_000))).allowed).toBe(true);
    const refused = await limiter.consume('k', later(20_000));
    expect(refused).toEqual({ allowed: false, retryAfterSeconds: 40 });
  });

  it('starts a new window once the old one ends', async () => {
    const limiter = new InMemoryRateLimiter({ limit: 1, windowMs: 60_000 });
    await limiter.consume('k', t0);
    expect((await limiter.consume('k', later(60_000))).allowed).toBe(true);
  });

  it('counts keys separately', async () => {
    const limiter = new InMemoryRateLimiter({ limit: 1, windowMs: 60_000 });
    await limiter.consume('a', t0);
    expect((await limiter.consume('b', t0)).allowed).toBe(true);
  });

  it('never holds more keys than its bound', async () => {
    const limiter = new InMemoryRateLimiter({ limit: 1, windowMs: 60_000 }, 3);
    for (const key of ['a', 'b', 'c', 'd']) await limiter.consume(key, t0);
    expect(limiter.size).toBeLessThanOrEqual(3);
  });
});

describe('createConcurrencyLimiter', () => {
  it('runs at most maxConcurrent tasks at once and queues the rest', async () => {
    const run = createConcurrencyLimiter({ maxConcurrent: 2, maxQueued: 10 });
    let active = 0;
    let peak = 0;
    const task = async () => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return 'done';
    };
    const results = await Promise.all(Array.from({ length: 6 }, () => run(task)));
    expect(results).toEqual(Array(6).fill('done'));
    expect(peak).toBe(2);
  });

  it('refuses with SERVICE_UNAVAILABLE when the queue is full', async () => {
    const run = createConcurrencyLimiter({ maxConcurrent: 1, maxQueued: 1 });
    let release!: () => void;
    const blocker = new Promise<void>((resolve) => (release = resolve));
    const first = run(() => blocker);
    const second = run(() => Promise.resolve());
    await expect(run(() => Promise.resolve())).rejects.toSatisfy(
      (error) => error instanceof DomainError && error.code === 'SERVICE_UNAVAILABLE',
    );
    release();
    await Promise.all([first, second]);
  });

  it('frees the slot when a task fails', async () => {
    const run = createConcurrencyLimiter({ maxConcurrent: 1, maxQueued: 0 });
    await expect(run(() => Promise.reject(new Error('boom')))).rejects.toThrow('boom');
    await expect(run(() => Promise.resolve(1))).resolves.toBe(1);
  });
});
