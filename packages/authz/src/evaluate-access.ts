// Route-level access decision: module entitlement, then permission codes (D section 7.2 steps 3
// and 4). T-ACC-02, FR-ACC-009, FR-SAA-004. Pure: the caller loads the hospital's entitled
// modules and the membership's permissions. Scope and record-state checks (steps 5 and 6) need
// the loaded record and stay in the application layer.
import { coreModules, moduleOf, type ModuleCode, type PermissionCode } from '@hms/contracts';

export interface AccessInput {
  /** Every code is required (a route marked with several codes needs all of them). */
  required: readonly PermissionCode[];
  granted: ReadonlySet<PermissionCode>;
  entitledModules: ReadonlySet<ModuleCode>;
}

export type AccessDecision =
  | { allowed: true }
  | { allowed: false; code: 'ENTITLEMENT_MISSING'; missingModules: ModuleCode[] }
  | { allowed: false; code: 'PERMISSION_DENIED'; missingPermissions: PermissionCode[] };

export function evaluateAccess(input: AccessInput): AccessDecision {
  // Entitlement first: an entitlement never grants a permission, and a permission is useless
  // when the hospital does not have the module (FR-SAA-004).
  const missingModules = unique(
    input.required
      .map(moduleOf)
      .filter((module) => !coreModules.has(module) && !input.entitledModules.has(module)),
  );
  if (missingModules.length > 0) {
    return { allowed: false, code: 'ENTITLEMENT_MISSING', missingModules };
  }
  const missingPermissions = unique(input.required.filter((code) => !input.granted.has(code)));
  if (missingPermissions.length > 0) {
    return { allowed: false, code: 'PERMISSION_DENIED', missingPermissions };
  }
  return { allowed: true };
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
