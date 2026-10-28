// Caps how many expensive tasks run at once, with a bounded wait queue. T-ACC-03 uses it for
// argon2 password checks: each takes about 19 MiB and one CPU core, so a burst of parallel
// logins must queue instead of exhausting the 2 vCPU server. A full queue is refused with
// SERVICE_UNAVAILABLE rather than growing without bound.
import { DomainError } from '@hms/domain-kernel';

export interface ConcurrencyLimit {
  maxConcurrent: number;
  maxQueued: number;
}

export type ConcurrencyLimiter = <T>(task: () => Promise<T>) => Promise<T>;

export function createConcurrencyLimiter(limit: ConcurrencyLimit): ConcurrencyLimiter {
  let active = 0;
  const waiting: (() => void)[] = [];

  const release = () => {
    const next = waiting.shift();
    if (next) next();
    else active -= 1;
  };

  return async <T>(task: () => Promise<T>): Promise<T> => {
    if (active < limit.maxConcurrent) {
      active += 1;
    } else {
      if (waiting.length >= limit.maxQueued) {
        throw new DomainError('SERVICE_UNAVAILABLE', 'Server is busy, try again shortly');
      }
      // The releasing task hands its slot over directly, so `active` stays unchanged.
      await new Promise<void>((resolve) => waiting.push(resolve));
    }
    try {
      return await task();
    } finally {
      release();
    }
  };
}
