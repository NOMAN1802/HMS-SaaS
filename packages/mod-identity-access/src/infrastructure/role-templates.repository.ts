// Creates a hospital's roles as copies of the product templates (FR-ACC-008, C-045). T-ACC-02.
// Tenant provisioning (FR-SAA-002) calls this once per new hospital; the hospital then edits
// its own copies. Runs in the caller's withTenant transaction.
import { roleTemplates, type RoleTemplateCode } from '@hms/authz';
import type { TenantTx } from '@hms/database';

/** Returns the new role IDs by template code. */
export async function createRolesFromTemplates(
  tx: TenantTx,
  tenantId: string,
): Promise<Record<RoleTemplateCode, string>> {
  const ids = {} as Record<RoleTemplateCode, string>;
  for (const template of Object.values(roleTemplates)) {
    const role = await tx.role.create({
      data: {
        tenantId,
        code: template.code,
        nameEn: template.nameEn,
        templateCode: template.code,
        permissions: { create: template.permissions.map((permissionCode) => ({ permissionCode })) },
      },
    });
    ids[template.code] = role.id;
  }
  return ids;
}
