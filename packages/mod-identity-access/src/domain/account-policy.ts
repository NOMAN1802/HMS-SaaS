// Account rules checked at login (UC-ACC-01 D1/D2). Locks are set by lockout-policy.ts
// (T-ACC-03); these functions decide what an existing lock means for a login or a session.
import { DomainError } from '@hms/domain-kernel';

export type AccountStatus = 'ACTIVE' | 'LOCKED_TEMPORARY' | 'LOCKED_ADMIN' | 'DISABLED';

/** Usernames are stored lower-case and compared that way ("Admin " logs in as "admin"). */
export function normalizeUsername(raw: string): string {
  return raw.normalize('NFKC').trim().toLowerCase();
}

export function assertAccountCanLogin(
  account: { status: AccountStatus; lockedUntil: Date | null },
  now: Date,
): void {
  switch (account.status) {
    case 'ACTIVE':
      return;
    case 'LOCKED_TEMPORARY':
      // A temporary lock with no end time is treated as still locked (fail closed).
      if (account.lockedUntil === null)
        throw new DomainError('ACCOUNT_LOCKED', 'Account is locked');
      if (account.lockedUntil.getTime() > now.getTime()) {
        throw new DomainError('ACCOUNT_LOCKED', 'Account is locked', {
          lockedUntil: account.lockedUntil.toISOString(),
        });
      }
      return;
    case 'LOCKED_ADMIN':
      throw new DomainError('ACCOUNT_LOCKED', 'Account is locked by an administrator');
    case 'DISABLED':
      // Same answer as a wrong password, so a disabled account cannot be told apart.
      throw new DomainError('INVALID_CREDENTIALS', 'Invalid username or password');
  }
}

/**
 * Whether an already-open session may keep working (FR-ACC-010): disabling or locking the
 * account takes effect on the user's next request, not at the next login.
 */
export function isAccountUsable(
  account: { status: AccountStatus; lockedUntil: Date | null },
  now: Date,
): boolean {
  if (account.status === 'ACTIVE') return true;
  if (account.status === 'LOCKED_TEMPORARY') {
    return account.lockedUntil !== null && account.lockedUntil.getTime() <= now.getTime();
  }
  return false;
}

const LOGGABLE_USERNAME = /^[a-z0-9._@-]{3,64}$/;

/**
 * A username typed by an unknown caller is stored in the append-only auth_event table only
 * when it looks like a username. People sometimes type a password into that field, and
 * append-only rows cannot be scrubbed later.
 */
export function safeUsernameForLog(normalizedUsername: string): string | null {
  return LOGGABLE_USERNAME.test(normalizedUsername) ? normalizedUsername : null;
}
