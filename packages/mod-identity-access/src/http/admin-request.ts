// Shared pieces of the hospital administration routes (T-ACC-03, T-ACC-05): who the
// administrator is, and ID parsing that answers NOT_FOUND like any record they cannot see.
import { ParseUUIDPipe } from '@nestjs/common';
import { DomainError } from '@hms/domain-kernel';
import type { CorrelatedRequest } from '@hms/platform';
import type { AdminRef } from '../infrastructure/account-lock.repository.js';
import { getAuthContext, type AuthenticatedRequest } from './request-context.js';

export type AdminRequest = AuthenticatedRequest & CorrelatedRequest;

export function adminOf(request: AdminRequest): AdminRef {
  const auth = getAuthContext(request);
  // PermissionGuard has already refused a session without a hospital; this narrows the types.
  if (!auth.tenantId || !auth.membershipId) {
    throw new DomainError('TENANT_NOT_SELECTED', 'Choose a hospital first');
  }
  return { tenantId: auth.tenantId, userId: auth.userId, membershipId: auth.membershipId };
}

/** A malformed ID is NOT_FOUND, like any other record the administrator cannot see. */
export function idPipe(what: 'User' | 'Role'): ParseUUIDPipe {
  return new ParseUUIDPipe({
    exceptionFactory: () => new DomainError('NOT_FOUND', `${what} not found`),
  });
}
