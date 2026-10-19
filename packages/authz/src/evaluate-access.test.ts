import type { ModuleCode, PermissionCode } from '@hms/contracts';
import { describe, expect, it } from 'vitest';
import { evaluateAccess } from './evaluate-access.js';

function input(
  required: PermissionCode[],
  granted: PermissionCode[],
  entitled: ModuleCode[],
): Parameters<typeof evaluateAccess>[0] {
  return { required, granted: new Set(granted), entitledModules: new Set(entitled) };
}

describe('evaluateAccess', () => {
  it('allows when the module is entitled and the permission is granted', () => {
    const decision = evaluateAccess(
      input(['billing.payment.record'], ['billing.payment.record'], ['billing']),
    );
    expect(decision).toEqual({ allowed: true });
  });

  it('refuses a permission without the module entitlement (AT-SAA-002)', () => {
    const decision = evaluateAccess(
      input(['billing.payment.record'], ['billing.payment.record'], []),
    );
    expect(decision).toEqual({
      allowed: false,
      code: 'ENTITLEMENT_MISSING',
      missingModules: ['billing'],
    });
  });

  it('refuses an entitlement without the permission (AT-SAA-002)', () => {
    const decision = evaluateAccess(input(['billing.payment.record'], [], ['billing']));
    expect(decision).toEqual({
      allowed: false,
      code: 'PERMISSION_DENIED',
      missingPermissions: ['billing.payment.record'],
    });
  });

  it('requires every code when several are listed', () => {
    const decision = evaluateAccess(
      input(['lab.result.verify', 'lab.result.release'], ['lab.result.verify'], ['lab']),
    );
    expect(decision).toEqual({
      allowed: false,
      code: 'PERMISSION_DENIED',
      missingPermissions: ['lab.result.release'],
    });
  });

  it('needs no entitlement for core administration', () => {
    const decision = evaluateAccess(input(['admin.role.manage'], ['admin.role.manage'], []));
    expect(decision).toEqual({ allowed: true });
  });
});
