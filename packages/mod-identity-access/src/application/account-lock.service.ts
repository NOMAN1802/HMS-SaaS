// Administrator lock, unlock and lock diagnostics for one account (T-ACC-03; UC-ACC-02;
// FR-ACC-004, FR-ACC-010, FR-SUP-003; AT-ACC-006, AT-ACC-008). Only accounts with a membership
// in the administrator's hospital are visible; any other account answers NOT_FOUND.
import { Inject, Injectable } from '@nestjs/common';
import type { AccountLockStatus } from '@hms/contracts';
import type { PrismaClient } from '@hms/database';
import { DomainError, type Clock } from '@hms/domain-kernel';
import { PRISMA } from '@hms/platform';
import {
  ADMIN_LOCK_FROM,
  adminLockState,
  assertNotSelf,
  UNLOCK_FROM,
  unlockedState,
} from '../domain/lockout-policy.js';
import {
  changeLock,
  findAccountInHospital,
  listRecentLoginAttempts,
  type AdminRef,
  type LockChange,
  type LockedAccountRow,
  type LoginAttemptRow,
} from '../infrastructure/account-lock.repository.js';
import { CLOCK } from './auth.config.js';

@Injectable()
export class AccountLockService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async status(admin: AdminRef, targetUserId: string): Promise<AccountLockStatus> {
    const account = await findAccountInHospital(this.prisma, admin, targetUserId);
    if (!account) throw notFound();
    const attempts = await listRecentLoginAttempts(this.prisma, targetUserId);
    return toStatus(account, attempts);
  }

  lock(
    admin: AdminRef,
    targetUserId: string,
    reason: string,
    correlationId?: string,
  ): Promise<AccountLockStatus> {
    return this.change({
      admin,
      targetUserId,
      state: adminLockState(admin.userId, reason, this.clock.now()),
      allowedFrom: ADMIN_LOCK_FROM,
      action: 'admin.user.locked',
      note: reason,
      ...(correlationId ? { correlationId } : {}),
    });
  }

  unlock(
    admin: AdminRef,
    targetUserId: string,
    reason: string,
    correlationId?: string,
  ): Promise<AccountLockStatus> {
    return this.change({
      admin,
      targetUserId,
      state: unlockedState(),
      allowedFrom: UNLOCK_FROM,
      action: 'admin.user.unlocked',
      note: reason,
      ...(correlationId ? { correlationId } : {}),
    });
  }

  private async change(change: LockChange): Promise<AccountLockStatus> {
    assertNotSelf(change.admin.userId, change.targetUserId);
    const result = await changeLock(this.prisma, change);
    if (result === 'NOT_FOUND') throw notFound();
    if (result === 'INVALID_TRANSITION') {
      throw new DomainError('INVALID_TRANSITION', 'The account is not in a state that allows this');
    }
    return this.status(change.admin, change.targetUserId);
  }
}

function notFound(): DomainError {
  return new DomainError('NOT_FOUND', 'User not found');
}

function toStatus(account: LockedAccountRow, attempts: LoginAttemptRow[]): AccountLockStatus {
  return {
    userId: account.id,
    username: account.username,
    status: account.status,
    failedAttempts: account.failedAttempts,
    lockedAt: account.lockedAt?.toISOString() ?? null,
    lockedUntil: account.lockedUntil?.toISOString() ?? null,
    lockReason: account.lockReason,
    lockNote: account.lockNote,
    lockedByUserId: account.lockedByUserId,
    recentAttempts: attempts.map((attempt) => ({
      ...attempt,
      occurredAt: attempt.occurredAt.toISOString(),
    })),
  };
}
