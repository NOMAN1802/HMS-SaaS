// Prisma access for role administration (T-ACC-05; FR-ACC-008; C-045; SCR-22). Roles belong to
// the administrator's hospital (RLS through withTenant). A permission change applies on the next
// request of every holder, because PermissionGuard reads permissions on each request.
import { isPermissionCode, type PermissionCode } from '@hms/contracts';
import { withTenant, type PrismaClient } from '@hms/database';
import type { AdminRef } from './account-lock.repository.js';
import { auditAdminChange, type AuditNote } from './user-admin.repository.js';

export interface AdminRoleRow {
  id: string;
  code: string;
  nameEn: string;
  nameBn: string | null;
  templateCode: string | null;
  permissions: PermissionCode[];
  memberCount: number;
}

export async function listRoles(prisma: PrismaClient, admin: AdminRef): Promise<AdminRoleRow[]> {
  return withTenant(prisma, { tenantId: admin.tenantId, userId: admin.userId }, async (tx) => {
    const roles = await tx.role.findMany({
      orderBy: { code: 'asc' },
      select: {
        id: true,
        code: true,
        nameEn: true,
        nameBn: true,
        templateCode: true,
        permissions: { select: { permissionCode: true } },
        _count: { select: { memberships: true } },
      },
    });
    return roles.map(({ permissions, _count, ...role }) => ({
      ...role,
      // A stored code that left the catalogue grants nothing and is not shown (fail closed).
      permissions: permissions
        .map((p) => p.permissionCode)
        .filter(isPermissionCode)
        .sort(),
      memberCount: _count.memberships,
    }));
  });
}

export type CreateRoleResult = { kind: 'CREATED'; roleId: string } | { kind: 'CODE_TAKEN' };

export async function createRole(
  prisma: PrismaClient,
  admin: AdminRef,
  input: {
    code: string;
    nameEn: string;
    nameBn: string | null;
    templateCode: string | null;
    permissions: PermissionCode[];
  },
  note: AuditNote,
): Promise<CreateRoleResult> {
  return withTenant(prisma, { tenantId: admin.tenantId, userId: admin.userId }, async (tx) => {
    const taken = await tx.role.findFirst({ where: { code: input.code }, select: { id: true } });
    if (taken) return { kind: 'CODE_TAKEN' };
    const role = await tx.role.create({
      data: {
        tenantId: admin.tenantId,
        code: input.code,
        nameEn: input.nameEn,
        nameBn: input.nameBn,
        templateCode: input.templateCode,
        permissions: {
          create: [...new Set(input.permissions)].map((permissionCode) => ({ permissionCode })),
        },
      },
      select: { id: true },
    });
    await auditAdminChange(tx, admin, 'admin.role.created', 'role', role.id, {
      ...note,
      details: { code: input.code, permissions: input.permissions.join(',') },
    });
    return { kind: 'CREATED', roleId: role.id };
  });
}

/**
 * Replaces a role's permissions after `check` has seen the current set and whether the
 * administrator holds the role (self-lockout rule). Returns false when the role is not found.
 */
export async function setRolePermissions(
  prisma: PrismaClient,
  admin: AdminRef,
  roleId: string,
  permissions: PermissionCode[],
  check: (before: PermissionCode[], actorHoldsRole: boolean) => void,
  note: AuditNote,
): Promise<boolean> {
  return withTenant(prisma, { tenantId: admin.tenantId, userId: admin.userId }, async (tx) => {
    const role = await tx.role.findFirst({
      where: { id: roleId },
      select: { id: true, permissions: { select: { permissionCode: true } } },
    });
    if (!role) return false;
    const before = role.permissions.map((p) => p.permissionCode).filter(isPermissionCode);
    const held = await tx.membershipRole.findFirst({
      where: { membershipId: admin.membershipId, roleId },
      select: { roleId: true },
    });
    check(before, held !== null);

    const after = [...new Set(permissions)];
    await tx.rolePermission.deleteMany({ where: { roleId } });
    await tx.rolePermission.createMany({
      data: after.map((permissionCode) => ({ tenantId: admin.tenantId, roleId, permissionCode })),
    });
    await auditAdminChange(tx, admin, 'admin.role.permissions_changed', 'role', roleId, {
      ...note,
      details: {
        added: after.filter((code) => !before.includes(code)).join(','),
        removed: before.filter((code) => !after.includes(code)).join(','),
      },
    });
    return true;
  });
}
