import { describe, expect, it } from 'vitest';
import { DomainError } from '@hms/domain-kernel';
import {
  adminLockState,
  assertNotSelf,
  stateAfterFailedLogin,
  unlockedState,
} from './lockout-policy.js';

const policy = { maxFailedAttempts: 5, lockMinutes: 15 };
const t0 = new Date('2026-10-28T08:00:00.000Z');
const active = { status: 'ACTIVE' as const, failedAttempts: 0, lockedUntil: null };

describe('stateAfterFailedLogin (C-032, FR-ACC-004)', () => {
  it('counts failures below the threshold', () => {
    expect(stateAfterFailedLogin({ ...active, failedAttempts: 3 }, t0, policy)).toEqual({
      status: 'ACTIVE',
      failedAttempts: 4,
      lockedUntil: null,
      lockedAt: null,
      lockReason: null,
      lockNote: null,
      lockedByUserId: null,
    });
  });

  it('locks for 15 minutes on the fifth failure', () => {
    expect(stateAfterFailedLogin({ ...active, failedAttempts: 4 }, t0, policy)).toEqual({
      status: 'LOCKED_TEMPORARY',
      failedAttempts: 5,
      lockedUntil: new Date('2026-10-28T08:15:00.000Z'),
      lockedAt: t0,
      lockReason: 'FAILED_LOGINS',
      lockNote: null,
      lockedByUserId: null,
    });
  });

  it('does not extend a lock that is still running', () => {
    const locked = {
      status: 'LOCKED_TEMPORARY' as const,
      failedAttempts: 5,
      lockedUntil: new Date(t0.getTime() + 60_000),
    };
    expect(stateAfterFailedLogin(locked, t0, policy)).toBeNull();
  });

  it('starts counting again after an expired lock', () => {
    const expired = {
      status: 'LOCKED_TEMPORARY' as const,
      failedAttempts: 5,
      lockedUntil: new Date(t0.getTime() - 1),
    };
    expect(stateAfterFailedLogin(expired, t0, policy)).toMatchObject({
      status: 'ACTIVE',
      failedAttempts: 1,
      lockedUntil: null,
    });
  });

  it('leaves admin locks and disabled accounts alone', () => {
    expect(stateAfterFailedLogin({ ...active, status: 'LOCKED_ADMIN' }, t0, policy)).toBeNull();
    expect(stateAfterFailedLogin({ ...active, status: 'DISABLED' }, t0, policy)).toBeNull();
  });
});

describe('admin lock and unlock (UC-ACC-02)', () => {
  it('an admin lock has no end time and names the administrator', () => {
    expect(adminLockState('admin-1', 'Left the hospital', t0)).toEqual({
      status: 'LOCKED_ADMIN',
      failedAttempts: 0,
      lockedUntil: null,
      lockedAt: t0,
      lockReason: 'ADMIN_ACTION',
      lockNote: 'Left the hospital',
      lockedByUserId: 'admin-1',
    });
  });

  it('unlocking clears every lock field and the failure counter', () => {
    expect(unlockedState()).toEqual({
      status: 'ACTIVE',
      failedAttempts: 0,
      lockedUntil: null,
      lockedAt: null,
      lockReason: null,
      lockNote: null,
      lockedByUserId: null,
    });
  });

  it('an administrator cannot lock or unlock their own account', () => {
    expect(() => assertNotSelf('u1', 'u1')).toThrow(DomainError);
    expect(() => assertNotSelf('u1', 'u2')).not.toThrow();
  });
});
