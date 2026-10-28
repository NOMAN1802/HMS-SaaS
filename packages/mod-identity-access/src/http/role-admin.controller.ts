// /api/v1/admin/roles endpoints (T-ACC-05; FR-ACC-008; C-045; SCR-22): list roles with the
// product templates, create a role (usually from a template) and replace a role's permissions.
// Hospital administrators only (admin.role.manage); every change is audited.
import { Body, Controller, Get, HttpCode, Param, Post, Put, Req } from '@nestjs/common';
import {
  createRoleRequestSchema,
  setRolePermissionsRequestSchema,
  type AdminRole,
  type AdminRoleList,
  type CreateRoleRequest,
  type SetRolePermissionsRequest,
} from '@hms/contracts';
import { ZodBodyPipe } from '@hms/platform';
import { RoleAdminService } from '../application/role-admin.service.js';
import { adminOf, idPipe, type AdminRequest } from './admin-request.js';
import { RequirePermission } from './decorators.js';

@RequirePermission('admin.role.manage')
@Controller('admin/roles')
export class RoleAdminController {
  constructor(private readonly roles: RoleAdminService) {}

  @Get()
  list(@Req() request: AdminRequest): Promise<AdminRoleList> {
    return this.roles.list(adminOf(request));
  }

  @Post()
  @HttpCode(201)
  create(
    @Body(new ZodBodyPipe(createRoleRequestSchema)) body: CreateRoleRequest,
    @Req() request: AdminRequest,
  ): Promise<AdminRole> {
    return this.roles.create(adminOf(request), body, request.correlationId);
  }

  @Put(':roleId/permissions')
  setPermissions(
    @Param('roleId', idPipe('Role')) roleId: string,
    @Body(new ZodBodyPipe(setRolePermissionsRequestSchema)) body: SetRolePermissionsRequest,
    @Req() request: AdminRequest,
  ): Promise<AdminRole> {
    return this.roles.setPermissions(
      adminOf(request),
      roleId,
      body.permissions,
      request.correlationId,
    );
  }
}
