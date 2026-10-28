// /api/v1/admin/users/{userId}/lock and /unlock (T-ACC-03; UC-ACC-02; FR-ACC-004, FR-SUP-003).
// Hospital administrators only (admin.user.manage, C01 section 5); every change is audited.
import { Body, Controller, Get, HttpCode, Param, Post, Req } from '@nestjs/common';
import {
  accountLockRequestSchema,
  type AccountLockRequest,
  type AccountLockStatus,
} from '@hms/contracts';
import { ZodBodyPipe } from '@hms/platform';
import { AccountLockService } from '../application/account-lock.service.js';
import { adminOf, idPipe, type AdminRequest } from './admin-request.js';
import { RequirePermission } from './decorators.js';

const userIdPipe = idPipe('User');

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
