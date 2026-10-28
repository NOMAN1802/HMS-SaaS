// Rules for administrators changing users, memberships and roles, and for passwords
// (T-ACC-05; FR-ACC-007, FR-ACC-008, FR-ACC-010; UC-ACC-02 "not on your own account"). Pure.
import type { MembershipStatusCode, PermissionCode } from '@hms/contracts';
import { DomainError } from '@hms/domain-kernel';

/**
 * Minimum length and character limits are in the contract schema; these are the checks that
 * need the account: not the username, and not the password being replaced.
 */
export function assertPasswordAcceptable(
  password: string,
  username: string,
  currentPassword?: string,
): void {
  const refuse = (message: string) => {
    throw new DomainError('VALIDATION_FAILED', 'Password is not acceptable', {
      fields: [{ path: 'newPassword', message }],
    });
  };
  if (password.trim().toLowerCase() === username.toLowerCase()) {
    refuse('The password must not be the username');
  }
  if (currentPassword !== undefined && password === currentPassword) {
    refuse('The new password must differ from the current one');
  }
}

/** REVOKED is final: access comes back only through a new membership (FR-ACC-010). */
export function assertMembershipTransition(
  from: MembershipStatusCode,
  to: Exclude<MembershipStatusCode, 'INVITED'>,
): void {
  if (from === 'REVOKED' || from === to) {
    throw new DomainError('INVALID_TRANSITION', `A ${from} membership cannot become ${to}`);
  }
}

/**
 * An administrator changes other people's access, never their own: no one can raise their own
 * roles, reset their own second factor, or lock themselves out by mistake (UC-ACC-02).
 */
export function assertNotOwnAccount(actorUserId: string, targetUserId: string): void {
  if (actorUserId === targetUserId) {
    throw new DomainError(
      'PERMISSION_DENIED',
      'Ask another administrator to change your own account',
    );
  }
}

const ADMINISTRATION: readonly PermissionCode[] = ['admin.user.manage', 'admin.role.manage'];

/**
 * Editing a role the administrator holds may not remove user or role administration from it,
 * so the last administrator cannot take away their own way back in.
 */
export function assertNoSelfLockout(
  actorHoldsRole: boolean,
  before: readonly PermissionCode[],
  after: readonly PermissionCode[],
): void {
  if (!actorHoldsRole) return;
  const removed = ADMINISTRATION.filter((code) => before.includes(code) && !after.includes(code));
  if (removed.length > 0) {
    throw new DomainError(
      'PERMISSION_DENIED',
      'You cannot remove user or role administration from your own role',
    );
  }
}
