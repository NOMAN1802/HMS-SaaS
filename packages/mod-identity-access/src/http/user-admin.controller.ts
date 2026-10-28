// /api/v1/admin/users endpoints (T-ACC-05; FR-ACC-007, FR-ACC-008, FR-ACC-010; SCR-22):
// list and create users, temporary password, membership status, roles and second-factor reset.
// Hospital administrators only (admin.user.manage); every change is audited.
import { Body, Controller, Get, HttpCode, Param, Post, Put, Req } from '@nestjs/common';
import {
  createUserRequestSchema,
  resetMfaRequestSchema,
  resetPasswordRequestSchema,
  setMembershipStatusRequestSchema,
  setUserRolesRequestSchema,
  type AdminUser,
  type AdminUserList,
  type CreateUserRequest,
  type ResetMfaRequest,
  type ResetPasswordRequest,
  type SetMembershipStatusRequest,
  type SetUserRolesRequest,
} from '@hms/contracts';
import { ZodBodyPipe } from '@hms/platform';
import { UserAdminService } from '../application/user-admin.service.js';
import { adminOf, idPipe, type AdminRequest } from './admin-request.js';
import { RequirePermission } from './decorators.js';

const userIdPipe = idPipe('User');

@RequirePermission('admin.user.manage')
@Controller('admin/users')
export class UserAdminController {
  constructor(private readonly users: UserAdminService) {}

  @Get()
  list(@Req() request: AdminRequest): Promise<AdminUserList> {
    return this.users.list(adminOf(request));
  }

  @Post()
  @HttpCode(201)
  create(
    @Body(new ZodBodyPipe(createUserRequestSchema)) body: CreateUserRequest,
    @Req() request: AdminRequest,
  ): Promise<AdminUser> {
    return this.users.create(adminOf(request), body, request.correlationId);
  }

  @Post(':userId/password')
  @HttpCode(200)
  resetPassword(
    @Param('userId', userIdPipe) userId: string,
    @Body(new ZodBodyPipe(resetPasswordRequestSchema)) body: ResetPasswordRequest,
    @Req() request: AdminRequest,
  ): Promise<AdminUser> {
    return this.users.resetPassword(
      adminOf(request),
      userId,
      body.temporaryPassword,
      body.reason,
      request.correlationId,
    );
  }

  @Post(':userId/membership')
  @HttpCode(200)
  setMembershipStatus(
    @Param('userId', userIdPipe) userId: string,
    @Body(new ZodBodyPipe(setMembershipStatusRequestSchema)) body: SetMembershipStatusRequest,
    @Req() request: AdminRequest,
  ): Promise<AdminUser> {
    return this.users.setMembershipStatus(adminOf(request), userId, body, request.correlationId);
  }

  @Put(':userId/roles')
  setRoles(
    @Param('userId', userIdPipe) userId: string,
    @Body(new ZodBodyPipe(setUserRolesRequestSchema)) body: SetUserRolesRequest,
    @Req() request: AdminRequest,
  ): Promise<AdminUser> {
    return this.users.setRoles(adminOf(request), userId, body.roleIds, request.correlationId);
  }

  @Post(':userId/mfa/reset')
  @HttpCode(200)
  resetMfa(
    @Param('userId', userIdPipe) userId: string,
    @Body(new ZodBodyPipe(resetMfaRequestSchema)) body: ResetMfaRequest,
    @Req() request: AdminRequest,
  ): Promise<AdminUser> {
    return this.users.resetMfa(adminOf(request), userId, body.reason, request.correlationId);
  }
}
