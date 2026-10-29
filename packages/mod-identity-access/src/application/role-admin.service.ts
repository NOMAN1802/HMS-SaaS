// Role administration for hospital administrators (T-ACC-05; FR-ACC-008; C-045; SCR-22): roles
// start as copies of the product templates and their permissions can be changed. An
// administrator may not remove user or role administration from a role they hold.
import { Inject, Injectable } from '@nestjs/common';
import { roleTemplates } from '@hms/authz';
import type { AdminRole, AdminRoleList, CreateRoleRequest, PermissionCode } from '@hms/contracts';
import type { PrismaClient } from '@hms/database';
import { DomainError } from '@hms/domain-kernel';
import { PRISMA } from '@hms/platform';
import { assertNoSelfLockout } from '../domain/user-admin-policy.js';
import type { AdminRef } from '../infrastructure/account-lock.repository.js';
import {
  createRole,
  listRoles,
  setRolePermissions,
} from '../infrastructure/role-admin.repository.js';

const TEMPLATES = Object.values(roleTemplates).map((template) => ({
  code: template.code,
  nameEn: template.nameEn,
  permissions: [...template.permissions],
}));

@Injectable()
export class RoleAdminService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async list(admin: AdminRef): Promise<AdminRoleList> {
    return { roles: await listRoles(this.prisma, admin), templates: TEMPLATES };
  }

  async create(
    admin: AdminRef,
    input: CreateRoleRequest,
    correlationId?: string,
  ): Promise<AdminRole> {
    if (input.templateCode && !TEMPLATES.some((t) => t.code === input.templateCode)) {
      throw new DomainError('VALIDATION_FAILED', 'Unknown template', {
        fields: [{ path: 'templateCode', message: 'Not a product template' }],
      });
    }
    const result = await createRole(
      this.prisma,
      admin,
      {
        code: input.code,
        nameEn: input.nameEn,
        nameBn: input.nameBn || null,
        templateCode: input.templateCode ?? null,
        permissions: input.permissions,
      },
      { ...(correlationId ? { correlationId } : {}) },
    );
    if (result.kind === 'CODE_TAKEN') {
      throw new DomainError('VALIDATION_FAILED', 'Role code already used', {
        fields: [{ path: 'code', message: 'Another role in this hospital has this code' }],
      });
    }
    return this.one(admin, result.roleId);
  }

  async setPermissions(
    admin: AdminRef,
    roleId: string,
    permissions: PermissionCode[],
    correlationId?: string,
  ): Promise<AdminRole> {
    const done = await setRolePermissions(
      this.prisma,
      admin,
      roleId,
      permissions,
      (before, actorHoldsRole) => assertNoSelfLockout(actorHoldsRole, before, permissions),
      { ...(correlationId ? { correlationId } : {}) },
    );
    if (!done) throw new DomainError('NOT_FOUND', 'Role not found');
    return this.one(admin, roleId);
  }

  private async one(admin: AdminRef, roleId: string): Promise<AdminRole> {
    const role = (await listRoles(this.prisma, admin)).find((r) => r.id === roleId);
    if (!role) throw new DomainError('NOT_FOUND', 'Role not found');
    return role;
  }
}
