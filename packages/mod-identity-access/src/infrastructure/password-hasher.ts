// argon2id password hashing (ADR-004). Parameters follow the OWASP minimum for argon2id
// (19 MiB memory, 2 iterations, 1 lane), which keeps a login fast on the 2 vCPU server.
// T-ACC-03: every hash and verify goes through one process-wide cap, so a burst of parallel
// logins queues (and is refused once the queue is full) instead of exhausting CPU and memory.
import argon2 from 'argon2';
import { createConcurrencyLimiter } from '@hms/platform';

const OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

// One check per vCPU at a time; about 2 seconds of queued work before refusing.
const runLimited = createConcurrencyLimiter({ maxConcurrent: 2, maxQueued: 32 });

let dummyHash: Promise<string> | undefined;

export function hashPassword(plain: string): Promise<string> {
  return runLimited(() => argon2.hash(plain, OPTIONS));
}

export function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return runLimited(() => argon2.verify(hash, plain));
}

/**
 * Spends the same time as a real check when the username does not exist, so response time
 * does not reveal which usernames are valid.
 */
export async function verifyAgainstDummy(plain: string): Promise<void> {
  dummyHash ??= hashPassword('dummy-password-for-timing');
  const hash = await dummyHash;
  await runLimited(() => argon2.verify(hash, plain));
}
