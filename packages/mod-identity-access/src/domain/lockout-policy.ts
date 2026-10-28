// Account lock rules (T-ACC-03; UC-ACC-02; FR-ACC-004; C-032). Pure functions: the caller
// reads the account under a row lock, asks for the next state and writes it back.
// State machine: ACTIVE -> LOCKED_TEMPORARY (auto-unlock at lockedUntil) | LOCKED_ADMIN -> ACTIVE.
import { DomainError } from '@hms/domain-kernel';
import type { AccountStatus } from './account-policy.js';

export interface LockoutPolicy {
  maxFailedAttempts: number;
  lockMinutes: number;
}

/** Why an account is locked; shown to administrators and support only (UC-ACC-01 D2). */
export type LockReason = 'FAILED_LOGINS' | 'ADMIN_ACTION';

export interface LockState {
  status: AccountStatus;
  failedAttempts: number;
  lockedUntil: Date | null;
  lockedAt: Date | null;
  lockReason: LockReason | null;
  lockNote: string | null;
  /** Null when the system locked the account after failed logins. */
  lockedByUserId: string | null;
}

interface CurrentLock {
  status: AccountStatus;
  failedAttempts: number;
  lockedUntil: Date | null;
}

export function unlockedState(failedAttempts = 0): LockState {
  return {
    status: 'ACTIVE',
    failedAttempts,
    lockedUntil: null,
    lockedAt: null,
    lockReason: null,
    lockNote: null,
    lockedByUserId: null,
  };
}

/**
 * The state after a wrong password, or null when nothing changes. A running lock is not
 * extended, so an attacker cannot keep pushing the unlock time out; after it expires the
 * counter starts again from zero.
 */
export function stateAfterFailedLogin(
  account: CurrentLock,
  now: Date,
  policy: LockoutPolicy,
): LockState | null {
  const lockExpired =
    account.status === 'LOCKED_TEMPORARY' &&
    account.lockedUntil !== null &&
    account.lockedUntil.getTime() <= now.getTime();
  if (account.status !== 'ACTIVE' && !lockExpired) return null;

  const failedAttempts = (lockExpired ? 0 : account.failedAttempts) + 1;
  if (failedAttempts < policy.maxFailedAttempts) return unlockedState(failedAttempts);
  return {
    status: 'LOCKED_TEMPORARY',
    failedAttempts,
    lockedUntil: new Date(now.getTime() + policy.lockMinutes * 60_000),
    lockedAt: now,
    lockReason: 'FAILED_LOGINS',
    lockNote: null,
    lockedByUserId: null,
  };
}

/**
 * States an administrator may lock or unlock from (UC-ACC-02). A disabled account is neither:
 * an unlock must never bring a disabled account back.
 */
export const ADMIN_LOCK_FROM: readonly AccountStatus[] = ['ACTIVE', 'LOCKED_TEMPORARY'];
export const UNLOCK_FROM: readonly AccountStatus[] = ['LOCKED_TEMPORARY', 'LOCKED_ADMIN'];

/** An administrator's lock has no end time; only an unlock ends it. */
export function adminLockState(adminUserId: string, note: string, now: Date): LockState {
  return {
    status: 'LOCKED_ADMIN',
    failedAttempts: 0,
    lockedUntil: null,
    lockedAt: now,
    lockReason: 'ADMIN_ACTION',
    lockNote: note,
    lockedByUserId: adminUserId,
  };
}

/** UC-ACC-02: an administrator cannot unlock (or lock) their own account. */
export function assertNotSelf(actorUserId: string, targetUserId: string): void {
  if (actorUserId === targetUserId) {
    throw new DomainError('PERMISSION_DENIED', 'You cannot change the lock on your own account');
  }
}
