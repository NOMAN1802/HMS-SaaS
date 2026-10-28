import { describe, expect, it } from 'vitest';
import { DomainError } from '@hms/domain-kernel';
import {
  assertMembershipTransition,
  assertNotOwnAccount,
  assertNoSelfLockout,
  assertPasswordAcceptable,
} from './user-admin-policy.js';

function codeOf(fn: () => void): string | undefined {
  try {
    fn();
  } catch (error) {
    return error instanceof DomainError ? error.code : 'OTHER';
  }
  return undefined;
}

describe('assertPasswordAcceptable (FR-ACC-007)', () => {
  it('accepts a long password that is not the username', () => {
    expect(
      codeOf(() => assertPasswordAcceptable('correct horse battery', 'rahim')),
    ).toBeUndefined();
  });

  it('refuses the username, in any case or with spaces around it', () => {
    expect(codeOf(() => assertPasswordAcceptable('  RahimUddin1 ', 'rahimuddin1'))).toBe(
      'VALIDATION_FAILED',
    );
  });

  it('refuses the current password as the new one', () => {
    expect(
      codeOf(() => assertPasswordAcceptable('same password 1', 'rahim', 'same password 1')),
    ).toBe('VALIDATION_FAILED');
  });
});

describe('assertMembershipTransition (FR-ACC-010)', () => {
  it('allows suspend, reactivate and revoke', () => {
    expect(codeOf(() => assertMembershipTransition('ACTIVE', 'SUSPENDED'))).toBeUndefined();
    expect(codeOf(() => assertMembershipTransition('SUSPENDED', 'ACTIVE'))).toBeUndefined();
    expect(codeOf(() => assertMembershipTransition('ACTIVE', 'REVOKED'))).toBeUndefined();
  });

  it('treats revoked as final and refuses no-op changes', () => {
    expect(codeOf(() => assertMembershipTransition('REVOKED', 'ACTIVE'))).toBe(
      'INVALID_TRANSITION',
    );
    expect(codeOf(() => assertMembershipTransition('ACTIVE', 'ACTIVE'))).toBe('INVALID_TRANSITION');
  });
});

describe('self-protection', () => {
  it("refuses changes to the administrator's own account", () => {
    expect(codeOf(() => assertNotOwnAccount('u1', 'u1'))).toBe('PERMISSION_DENIED');
    expect(codeOf(() => assertNotOwnAccount('u1', 'u2'))).toBeUndefined();
  });

  it('refuses removing user or role administration from a role the administrator holds', () => {
    const before = ['admin.user.manage', 'admin.role.manage', 'audit.view'] as const;
    expect(codeOf(() => assertNoSelfLockout(true, before, ['admin.user.manage']))).toBe(
      'PERMISSION_DENIED',
    );
    expect(codeOf(() => assertNoSelfLockout(false, before, []))).toBeUndefined();
    expect(
      codeOf(() => assertNoSelfLockout(true, before, ['admin.user.manage', 'admin.role.manage'])),
    ).toBeUndefined();
  });
});
