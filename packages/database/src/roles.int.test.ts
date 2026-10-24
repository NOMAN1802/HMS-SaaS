import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createPrismaClient, withTenant, type PrismaClient } from './index.js';

// RLS and constraints for roles, permissions and entitlements (T-ACC-02, ADR-003, FR-SAA-004).
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for database integration tests');

async function seedHospital(prisma: PrismaClient) {
  const tenantId = randomUUID();
  const suffix = tenantId.slice(0, 8);
  const user = await prisma.userAccount.create({
    data: { username: `roles-${suffix}`, displayName: 'Roles', passwordHash: 'x' },
  });
  return withTenant(prisma, { tenantId }, async (tx) => {
    await tx.tenant.create({ data: { id: tenantId, code: `test-${suffix}`, nameEn: 'Test' } });
    const membership = await tx.membership.create({ data: { tenantId, userId: user.id } });
    const role = await tx.role.create({
      data: {
        tenantId,
        code: 'CSH',
        nameEn: 'Cashier',
        permissions: { create: [{ permissionCode: 'billing.payment.record' }] },
      },
    });
    await tx.tenantEntitlement.create({ data: { tenantId, moduleCode: 'billing' } });
    return { tenantId, membershipId: membership.id, roleId: role.id };
  });
}

describe('role tables', () => {
  let prisma: PrismaClient;
  let alpha: Awaited<ReturnType<typeof seedHospital>>;
  let beta: Awaited<ReturnType<typeof seedHospital>>;

  beforeAll(async () => {
    prisma = createPrismaClient(databaseUrl);
    alpha = await seedHospital(prisma);
    beta = await seedHospital(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("shows only the current hospital's roles, grants and entitlements", async () => {
    const seen = await withTenant(prisma, { tenantId: alpha.tenantId }, async (tx) => ({
      roles: await tx.role.findMany({ select: { id: true } }),
      grants: await tx.rolePermission.findMany({ select: { roleId: true } }),
      entitlements: await tx.tenantEntitlement.findMany({ select: { tenantId: true } }),
    }));
    expect(seen.roles).toEqual([{ id: alpha.roleId }]);
    expect(seen.grants).toEqual([{ roleId: alpha.roleId }]);
    expect(seen.entitlements).toEqual([{ tenantId: alpha.tenantId }]);
  });

  it("cannot give a membership another hospital's role", async () => {
    await expect(
      withTenant(prisma, { tenantId: alpha.tenantId }, (tx) =>
        tx.membershipRole.create({
          data: { tenantId: alpha.tenantId, membershipId: alpha.membershipId, roleId: beta.roleId },
        }),
      ),
    ).rejects.toThrow();
  });

  it('refuses a malformed permission code', async () => {
    await expect(
      withTenant(prisma, { tenantId: alpha.tenantId }, (tx) =>
        tx.rolePermission.create({
          data: { tenantId: alpha.tenantId, roleId: alpha.roleId, permissionCode: 'Billing Pay' },
        }),
      ),
    ).rejects.toThrow(/role_permission_code_format/);
  });

  it('refuses a malformed module code', async () => {
    await expect(
      withTenant(prisma, { tenantId: alpha.tenantId }, (tx) =>
        tx.tenantEntitlement.create({ data: { tenantId: alpha.tenantId, moduleCode: 'lab-2' } }),
      ),
    ).rejects.toThrow(/tenant_entitlement_module_format/);
  });
});
