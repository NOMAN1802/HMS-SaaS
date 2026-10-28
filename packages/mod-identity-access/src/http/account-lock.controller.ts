// /api/v1/admin/users/{userId}/lock and /unlock (T-ACC-03; UC-ACC-02; FR-ACC-004, FR-SUP-003).
// Hospital administrators only (admin.user.manage, C01 section 5); every change is audited.
import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import {
  accountLockRequestSchema,
  type AccountLockRequest,
  type AccountLockStatus,
} from '@hms/contracts';
import { DomainError } from '@hms/domain-kernel';
import { ZodBodyPipe, type CorrelatedRequest } from '@hms/platform';
import { AccountLockService } from '../application/account-lock.service.js';
import type { AdminRef } from '../infrastructure/account-lock.repository.js';
import { RequirePermission } from './decorators.js';
import { getAuthContext, type AuthenticatedRequest } from './request-context.js';

type AdminRequest = AuthenticatedRequest & CorrelatedRequest;

// A malformed ID is NOT_FOUND, like any other user the administrator cannot see.
const userIdPipe = new ParseUUIDPipe({
  exceptionFactory: () => new DomainError('NOT_FOUND', 'User not found'),
});

function adminOf(request: AdminRequest): AdminRef {
  const auth = getAuthContext(request);
  // PermissionGuard has already refused a session without a hospital; this narrows the types.
  if (!auth.tenantId || !auth.membershipId) {
    throw new DomainError('TENANT_NOT_SELECTED', 'Choose a hospital first');
  }
  return { tenantId: auth.tenantId, userId: auth.userId, membershipId: auth.membershipId };
}

@RequirePermission('admin.user.manage')
@Controller('admin/users/:userId')
export class AccountLockController {
  constructor(private readonly locks: AccountLockService) {}

  @Get('lock')
  status(
    @Param('userId', userIdPipe) userId: string,
    @Req() request: AdminRequest,
  ): Promise<AccountLockStatus> {
    return this.locks.status(adminOf(request), userId);
  }

  @Post('lock')
  @HttpCode(200)
  lock(
    @Param('userId', userIdPipe) userId: string,
    @Body(new ZodBodyPipe(accountLockRequestSchema)) body: AccountLockRequest,
    @Req() request: AdminRequest,
  ): Promise<AccountLockStatus> {
    return this.locks.lock(adminOf(request), userId, body.reason, request.correlationId);
  }

  @Post('unlock')
  @HttpCode(200)
  unlock(
    @Param('userId', userIdPipe) userId: string,
    @Body(new ZodBodyPipe(accountLockRequestSchema)) body: AccountLockRequest,
    @Req() request: AdminRequest,
  ): Promise<AccountLockStatus> {
    return this.locks.unlock(adminOf(request), userId, body.reason, request.correlationId);
  }
}
